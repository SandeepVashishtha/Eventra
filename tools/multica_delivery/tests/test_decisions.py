from dataclasses import replace
from pathlib import Path
from types import MappingProxyType
import unittest

from tools.multica_delivery.decisions import (
    DecisionKind,
    GateEvidence,
    ParentSnapshot,
    PullRequestEvidence,
    RepositoryEvidence,
    SmokeRead,
    decide_parent_action,
)
from tools.multica_delivery.manifest import load_manifest


FIXTURE = Path(__file__).parent / "fixtures" / "three-repository-delivery.yaml"
SHA = {
    "api": "a" * 40,
    "notifications": "b" * 40,
    "web": "c" * 40,
}


def implementation_for(repository: str, *, sha: str | None = None, result: str = "pass") -> RepositoryEvidence:
    return RepositoryEvidence(candidate_sha=sha or SHA[repository], result=result)


def gate_for(repository: str, *, sha: str | None = None, result: str = "pass") -> RepositoryEvidence:
    return RepositoryEvidence(candidate_sha=sha or SHA[repository], result=result)


def pr_for(repository: str, *, head_sha: str | None = None, **overrides: object) -> PullRequestEvidence:
    values = {
        "head_sha": head_sha or SHA[repository],
        "state": "open",
        "mergeable": True,
        "checks_pass": True,
        "merged_sha": None,
    }
    values.update(overrides)
    return PullRequestEvidence(**values)


def passing_snapshot(
    *,
    affected: tuple[str, ...] = ("api", "web"),
    shas: dict[str, str] | None = None,
    attempt: int = 0,
) -> ParentSnapshot:
    candidates = dict(shas or {repository: SHA[repository] for repository in affected})
    applicable_suites = {
        "web-api": GateEvidence(candidate_shas=candidates, result="pass")
    } if {"api", "web"} <= set(affected) else {}
    return ParentSnapshot(
        affected_repositories=affected,
        candidate_shas=candidates,
        children={
            repository: RepositoryEvidence(candidates[repository], "pass")
            for repository in affected
        },
        pull_requests={
            repository: PullRequestEvidence(candidates[repository], "open", True, True)
            for repository in affected
        },
        reviews={
            repository: RepositoryEvidence(candidates[repository], "pass")
            for repository in affected
        },
        qa={
            repository: RepositoryEvidence(candidates[repository], "pass")
            for repository in affected
        },
        integration_qa=applicable_suites,
        attempt=attempt,
    )


def passing_smoke_read(
    affected: tuple[str, ...] = ("api", "web"),
    *,
    shas: dict[str, str] | None = None,
    authoritative: bool = True,
) -> SmokeRead:
    candidates = dict(shas or {repository: SHA[repository] for repository in affected})
    suites = {"web-api": "pass"} if {"api", "web"} <= set(affected) else {}
    return SmokeRead(
        merged_shas=candidates,
        repository_results={repository: "pass" for repository in affected},
        integration_results=suites,
        authoritative=authoritative,
    )


def merged_snapshot(
    *,
    affected: tuple[str, ...] = ("api", "web"),
    smoke_reads: tuple[SmokeRead, ...] = (),
    attempt: int = 0,
) -> ParentSnapshot:
    base = passing_snapshot(affected=affected, attempt=attempt)
    return replace(
        base,
        merge_state="merged",
        merged_shas={repository: SHA[repository] for repository in affected},
        pull_requests={
            repository: pr_for(
                repository,
                state="merged",
                merged_sha=SHA[repository],
            )
            for repository in affected
        },
        smoke_reads=smoke_reads,
    )


class ParentDecisionTests(unittest.TestCase):
    def setUp(self) -> None:
        loaded = load_manifest(FIXTURE)
        self.manifest = replace(loaded, merge_order=("api", "notifications", "web"))

    def test_merge_only_after_all_exact_sha_gates_pass(self):
        decision = decide_parent_action(
            self.manifest,
            passing_snapshot(
                affected=("api", "notifications", "web"),
                shas=SHA,
            ),
        )
        self.assertEqual(decision.kind, DecisionKind.MERGE)
        self.assertEqual(decision.repositories, ("api", "notifications", "web"))

    def test_stale_review_sha_repairs_instead_of_merging(self):
        snapshot = passing_snapshot()
        snapshot = replace(snapshot, reviews={**snapshot.reviews, "web": gate_for("web", sha="d" * 40)})
        decision = decide_parent_action(self.manifest, snapshot)
        self.assertEqual(decision.kind, DecisionKind.REPAIR)
        self.assertEqual(decision.reason, "web review evidence does not match candidate SHA")
        self.assertEqual(decision.next_attempt, 1)

    def test_failed_qa_uses_one_shared_next_attempt(self):
        snapshot = passing_snapshot(attempt=1)
        snapshot = replace(snapshot, qa={**snapshot.qa, "api": gate_for("api", result="fail")})
        decision = decide_parent_action(self.manifest, snapshot)
        self.assertEqual(decision.kind, DecisionKind.REPAIR)
        self.assertEqual(decision.repositories, ("api",))
        self.assertEqual(decision.next_attempt, 2)

    def test_third_failure_blocks_parent(self):
        snapshot = passing_snapshot(attempt=2)
        snapshot = replace(snapshot, reviews={**snapshot.reviews, "web": gate_for("web", result="fail")})
        decision = decide_parent_action(self.manifest, snapshot)
        self.assertEqual(decision.kind, DecisionKind.BLOCK)
        self.assertIsNone(decision.next_attempt)

    def test_production_never_returns_merge(self):
        production = replace(
            self.manifest,
            policy=replace(self.manifest.policy, environment="production"),
        )
        self.assertEqual(
            decide_parent_action(production, passing_snapshot()).kind,
            DecisionKind.WAIT,
        )

    def test_disabled_automatic_merge_waits(self):
        manual = replace(
            self.manifest,
            policy=replace(self.manifest.policy, automatic_merge=False),
        )
        self.assertEqual(decide_parent_action(manual, passing_snapshot()).kind, DecisionKind.WAIT)

    def test_policy_cannot_expand_repair_or_deployment_authority(self):
        expanded_repairs = replace(
            self.manifest,
            policy=replace(self.manifest.policy, max_repair_attempts=3),
        )
        deploy_enabled = replace(
            self.manifest,
            policy=replace(self.manifest.policy, deployment="automatic"),
        )
        self.assertEqual(decide_parent_action(expanded_repairs, passing_snapshot()).kind, DecisionKind.BLOCK)
        self.assertEqual(decide_parent_action(deploy_enabled, passing_snapshot()).kind, DecisionKind.BLOCK)

    def test_any_merged_subset_blocks_atomic_delivery(self):
        snapshot = passing_snapshot()
        snapshot = replace(
            snapshot,
            merge_state="partial",
            merged_shas={"api": SHA["api"]},
            pull_requests={
                "api": pr_for("api", state="merged", merged_sha=SHA["api"]),
                "web": pr_for("web"),
            },
        )
        decision = decide_parent_action(self.manifest, snapshot)
        self.assertEqual(decision.kind, DecisionKind.BLOCK)

    def test_merged_subset_blocks_even_when_merge_state_was_not_updated(self):
        snapshot = passing_snapshot()
        snapshot = replace(
            snapshot,
            pull_requests={
                "api": pr_for("api", state="merged", merged_sha=SHA["api"]),
                "web": pr_for("web"),
            },
        )
        self.assertEqual(decide_parent_action(self.manifest, snapshot).kind, DecisionKind.BLOCK)

    def test_second_stall_does_not_recover_again(self):
        pending = ParentSnapshot(
            affected_repositories=("api",),
            candidate_shas={},
            children={"api": RepositoryEvidence("", "pending")},
            stalled=True,
            stalled_repository="api",
            recovery_count=1,
        )
        decision = decide_parent_action(self.manifest, pending)
        self.assertEqual(decision.kind, DecisionKind.BLOCK)

    def test_first_stall_reruns_only_the_recorded_existing_child(self):
        pending = ParentSnapshot(
            affected_repositories=("api",),
            candidate_shas={},
            children={"api": RepositoryEvidence("", "pending")},
            stalled=True,
            stalled_repository="api",
        )
        decision = decide_parent_action(self.manifest, pending)
        self.assertEqual(decision.kind, DecisionKind.DISPATCH)
        self.assertEqual(decision.repositories, ("api",))

    def test_missing_children_dispatch_only_dependency_ready_wave(self):
        snapshot = ParentSnapshot(
            affected_repositories=("api", "notifications", "web"),
            candidate_shas={},
        )
        decision = decide_parent_action(self.manifest, snapshot)
        self.assertEqual(decision.kind, DecisionKind.DISPATCH)
        self.assertEqual(decision.repositories, ("api",))

    def test_dependent_children_wait_for_exact_dependency_implementation(self):
        snapshot = ParentSnapshot(
            affected_repositories=("api", "web"),
            candidate_shas={"api": SHA["api"]},
            children={"api": implementation_for("api", result="pending")},
        )
        self.assertEqual(decide_parent_action(self.manifest, snapshot).kind, DecisionKind.WAIT)

    def test_passing_dependency_dispatches_next_wave(self):
        snapshot = ParentSnapshot(
            affected_repositories=("api", "notifications", "web"),
            candidate_shas={"api": SHA["api"]},
            children={"api": implementation_for("api")},
        )
        decision = decide_parent_action(self.manifest, snapshot)
        self.assertEqual(decision.kind, DecisionKind.DISPATCH)
        self.assertEqual(decision.repositories, ("notifications", "web"))

    def test_frozen_dependency_contract_allows_parallel_dispatch(self):
        snapshot = ParentSnapshot(
            affected_repositories=("api", "web"),
            candidate_shas={},
            satisfied_dependencies=frozenset({("web", "api")}),
        )
        self.assertEqual(
            decide_parent_action(self.manifest, snapshot).repositories,
            ("api", "web"),
        )

    def test_missing_pull_request_waits_without_waiving_gates(self):
        snapshot = passing_snapshot()
        snapshot = replace(snapshot, pull_requests={"api": snapshot.pull_requests["api"]})
        self.assertEqual(decide_parent_action(self.manifest, snapshot).kind, DecisionKind.WAIT)

    def test_missing_required_check_read_waits(self):
        snapshot = passing_snapshot()
        snapshot = replace(
            snapshot,
            pull_requests={**snapshot.pull_requests, "web": pr_for("web", checks_pass=None)},
        )
        self.assertEqual(decide_parent_action(self.manifest, snapshot).kind, DecisionKind.WAIT)

    def test_non_boolean_pr_gate_values_are_malformed(self):
        snapshot = passing_snapshot()
        snapshot = replace(
            snapshot,
            pull_requests={**snapshot.pull_requests, "web": pr_for("web", checks_pass=1)},
        )
        self.assertEqual(decide_parent_action(self.manifest, snapshot).kind, DecisionKind.BLOCK)

    def test_changed_pr_head_blocks_before_any_merge(self):
        snapshot = passing_snapshot()
        snapshot = replace(
            snapshot,
            pull_requests={**snapshot.pull_requests, "web": pr_for("web", head_sha="d" * 40)},
        )
        decision = decide_parent_action(self.manifest, snapshot)
        self.assertEqual(decision.kind, DecisionKind.BLOCK)
        self.assertEqual(decision.repositories, ())

    def test_missing_review_and_qa_dispatches_exact_gate_work(self):
        snapshot = passing_snapshot()
        snapshot = replace(snapshot, reviews={}, qa={}, integration_qa={})
        decision = decide_parent_action(self.manifest, snapshot)
        self.assertEqual(decision.kind, DecisionKind.DISPATCH)
        self.assertEqual(decision.repositories, ("api", "web"))

    def test_stale_integration_qa_sha_map_repairs(self):
        snapshot = passing_snapshot()
        snapshot = replace(
            snapshot,
            integration_qa={
                "web-api": GateEvidence(
                    candidate_shas={"api": SHA["api"], "web": "d" * 40},
                    result="pass",
                )
            },
        )
        self.assertEqual(decide_parent_action(self.manifest, snapshot).kind, DecisionKind.REPAIR)

    def test_non_applicable_integration_qa_evidence_is_malformed(self):
        snapshot = passing_snapshot(affected=("api",))
        snapshot = replace(
            snapshot,
            integration_qa={
                "web-api": GateEvidence(candidate_shas={"api": SHA["api"]}, result="pass")
            },
        )
        self.assertEqual(decide_parent_action(self.manifest, snapshot).kind, DecisionKind.BLOCK)

    def test_merged_exact_shas_require_two_stable_smoke_reads(self):
        once = merged_snapshot(smoke_reads=(passing_smoke_read(),))
        twice = merged_snapshot(smoke_reads=(passing_smoke_read(), passing_smoke_read()))
        self.assertEqual(decide_parent_action(self.manifest, once).kind, DecisionKind.SMOKE)
        self.assertEqual(decide_parent_action(self.manifest, twice).kind, DecisionKind.COMPLETE)

    def test_non_authoritative_smoke_read_cannot_complete(self):
        read = passing_smoke_read(authoritative=False)
        decision = decide_parent_action(self.manifest, merged_snapshot(smoke_reads=(read, read)))
        self.assertEqual(decision.kind, DecisionKind.SMOKE)

    def test_replacement_sha_invalidates_prior_smoke_passes(self):
        stale = passing_smoke_read()
        replacement = merged_snapshot()
        replacement = replace(
            replacement,
            candidate_shas={"api": SHA["api"], "web": "d" * 40},
            merged_shas={"api": SHA["api"], "web": "d" * 40},
            pull_requests={
                "api": pr_for("api", state="merged", merged_sha=SHA["api"]),
                "web": pr_for("web", head_sha="d" * 40, state="merged", merged_sha="d" * 40),
            },
            reviews={**replacement.reviews, "web": gate_for("web", sha="d" * 40)},
            qa={**replacement.qa, "web": gate_for("web", sha="d" * 40)},
            integration_qa={
                "web-api": GateEvidence(
                    candidate_shas={"api": SHA["api"], "web": "d" * 40},
                    result="pass",
                )
            },
            smoke_reads=(stale, stale),
        )
        self.assertEqual(decide_parent_action(self.manifest, replacement).kind, DecisionKind.REPAIR)

    def test_failed_smoke_repairs_until_budget_is_exhausted(self):
        failed = replace(
            passing_smoke_read(),
            repository_results={"api": "pass", "web": "fail"},
        )
        first = decide_parent_action(self.manifest, merged_snapshot(smoke_reads=(failed,), attempt=1))
        final = decide_parent_action(self.manifest, merged_snapshot(smoke_reads=(failed,), attempt=2))
        self.assertEqual((first.kind, first.next_attempt), (DecisionKind.REPAIR, 2))
        self.assertEqual(final.kind, DecisionKind.BLOCK)

    def test_snapshot_copies_input_mappings_to_preserve_immutability(self):
        candidates = {"api": SHA["api"]}
        snapshot = ParentSnapshot(affected_repositories=("api",), candidate_shas=candidates)
        candidates["api"] = "f" * 40
        self.assertEqual(snapshot.candidate_shas["api"], SHA["api"])
        self.assertIsInstance(snapshot.candidate_shas, MappingProxyType)

    def test_unknown_or_dependency_incomplete_scope_blocks(self):
        unknown = ParentSnapshot(affected_repositories=("billing",))
        incomplete = ParentSnapshot(affected_repositories=("web",))
        self.assertEqual(decide_parent_action(self.manifest, unknown).kind, DecisionKind.BLOCK)
        self.assertEqual(decide_parent_action(self.manifest, incomplete).kind, DecisionKind.BLOCK)


if __name__ == "__main__":
    unittest.main()
