"""Behavior tests for deterministic Eventra Multica workflow transitions."""

import copy
import io
import unittest
from contextlib import redirect_stdout

from tools.multica.workflow import (
    ChildRunSnapshot,
    ParentDecision,
    ParentSnapshot,
    PhaseCompletion,
    PhaseSnapshot,
    PullRequestSnapshot,
    RecoveryDecision,
    WorkflowSnapshot,
    WatchResult,
    build_phase_metadata,
    build_workflow_parser,
    decide_parent_action,
    decide_recovery,
    finish_phase,
    load_parent_snapshot,
    print_phase_result,
    print_parent_decision,
    recover_once,
    watch_projects,
)


ISSUE_ID = "01a00000-0000-7000-8000-000000000002"
PARENT_ID = "01a00000-0000-7000-8000-000000000001"
AGENT_ID = "00000000-0000-4000-8000-000000000004"
PROJECT_ID = "00000000-0000-4000-8000-000000000003"
COMMENT_ID = "01a00000-0000-7000-8000-000000000010"
FRONTEND_SHA = "a" * 40
FRONTEND_PR = "https://github.com/codeExploreHub/Eventra/pull/6"


def raw_issue(**overrides):
    value = {
        "id": ISSUE_ID,
        "identifier": "PRO-36",
        "parent_issue_id": PARENT_ID,
        "stage": 1,
        "status": "in_review",
        "assignee_id": AGENT_ID,
        "assignee_type": "agent",
        "project_id": PROJECT_ID,
        "updated_at": "2026-08-25T08:50:06Z",
    }
    value.update(overrides)
    return value


class FakeWorkflowRunner:
    """Stateful argv fake at the Multica process boundary."""

    def __init__(self):
        self.issue = raw_issue()
        self.metadata = {}
        self.calls = []
        self.fail_metadata_key = None
        self.corrupt_metadata_key = None
        self.inject_metadata_after_sets = None
        self.freeze_status = False

    @property
    def mutation_count(self):
        return sum(call[0:3] in {
            ("issue", "metadata", "set"),
            ("issue", "status", "PRO-36"),
        } for call in self.calls)

    def run(self, args, *, stdin_json=None):
        if stdin_json is not None:
            raise AssertionError("workflow commands never accept stdin JSON")
        call = tuple(args)
        self.calls.append(call)
        if call == ("issue", "get", "PRO-36", "--output", "json"):
            return copy.deepcopy(self.issue)
        if call == (
            "issue", "metadata", "list", "PRO-36", "--output", "json"
        ):
            value = copy.deepcopy(self.metadata)
            if self.corrupt_metadata_key is not None and any(
                previous[:3] == ("issue", "metadata", "set")
                for previous in self.calls[:-1]
            ):
                value[self.corrupt_metadata_key] = "corrupt"
            if self.inject_metadata_after_sets is not None and any(
                previous[:3] == ("issue", "metadata", "set")
                for previous in self.calls[:-1]
            ):
                key, item = self.inject_metadata_after_sets
                value[key] = item
            return value
        if call[:3] == ("issue", "metadata", "set"):
            self.assert_metadata_set_grammar(call)
            key = call[5]
            if key == self.fail_metadata_key:
                raise RuntimeError("Multica command failed with exit 1")
            self.metadata[key] = call[7]
            return {"ignored": "mutation acknowledgement"}
        if call == (
            "issue", "status", "PRO-36", "done", "--no-start", "--output", "json"
        ):
            if not self.freeze_status:
                self.issue["status"] = "done"
                self.issue["updated_at"] = "2026-08-25T09:00:00Z"
            return {"ignored": "mutation acknowledgement"}
        raise AssertionError(f"unsupported argv: {call!r}")

    def assert_metadata_set_grammar(self, call):
        self.assertEqual(call[0:4], ("issue", "metadata", "set", "PRO-36"))
        self.assertEqual(call[4], "--key")
        self.assertEqual(call[6], "--value")
        self.assertEqual(call[8:12], ("--type", "string", "--output", "json"))

    def assertEqual(self, left, right):
        if left != right:
            raise AssertionError(f"{left!r} != {right!r}")


def implementation_completion(**overrides):
    values = {
        "kind": "implementation",
        "result": "pass",
        "attempt": 0,
        "evidence_comment": COMMENT_ID,
        "frontend_sha": FRONTEND_SHA,
        "backend_sha": None,
        "pr_url": FRONTEND_PR,
    }
    values.update(overrides)
    return PhaseCompletion(**values)


class PhaseCompletionTests(unittest.TestCase):
    def test_build_metadata_uses_exact_string_contract(self):
        self.assertEqual(
            build_phase_metadata(implementation_completion()),
            {
                "eventra.workflow.version": "1",
                "eventra.phase.kind": "implementation",
                "eventra.phase.result": "pass",
                "eventra.phase.attempt": "0",
                "eventra.phase.evidence_comment": COMMENT_ID,
                "eventra.phase.sha.frontend": FRONTEND_SHA,
                "eventra.phase.pr": FRONTEND_PR,
            },
        )

    def test_build_metadata_rejects_invalid_values_before_any_mutation(self):
        cases = (
            {"kind": "unknown"},
            {"result": "unknown"},
            {"attempt": -1},
            {"attempt": True},
            {"evidence_comment": "not-a-uuid"},
            {"frontend_sha": "abc"},
            {"frontend_sha": "A" * 40},
            {"frontend_sha": None},
            {"pr_url": "http://github.com/codeExploreHub/Eventra/pull/6"},
            {"pr_url": "https://github.com/Aprim-OPC/Eventra/pull/6"},
            {"pr_url": None},
        )
        for overrides in cases:
            with self.subTest(overrides=overrides):
                with self.assertRaisesRegex(ValueError, "invalid phase completion"):
                    build_phase_metadata(implementation_completion(**overrides))

    def test_implementation_pr_must_match_its_single_repository_sha(self):
        backend_pr = "https://github.com/codeExploreHub/Eventra-Backend/pull/7"
        cases = (
            {"backend_sha": "b" * 40},
            {
                "frontend_sha": None,
                "backend_sha": "b" * 40,
                "pr_url": FRONTEND_PR,
            },
            {"frontend_sha": FRONTEND_SHA, "pr_url": backend_pr},
        )
        for overrides in cases:
            with self.subTest(overrides=overrides):
                with self.assertRaisesRegex(ValueError, "invalid phase completion"):
                    build_phase_metadata(implementation_completion(**overrides))

        metadata = build_phase_metadata(
            implementation_completion(
                frontend_sha=None,
                backend_sha="b" * 40,
                pr_url=backend_pr,
            )
        )
        self.assertEqual(metadata["eventra.phase.sha.backend"], "b" * 40)
        self.assertNotIn("eventra.phase.sha.frontend", metadata)

    def test_finish_phase_writes_verified_metadata_before_done(self):
        runner = FakeWorkflowRunner()
        result = finish_phase(runner, "PRO-36", implementation_completion())

        self.assertEqual(result.issue_id, ISSUE_ID)
        self.assertEqual(result.issue_key, "PRO-36")
        self.assertEqual(result.status, "done")
        self.assertEqual(result.kind, "implementation")
        self.assertEqual(result.result, "pass")
        self.assertEqual(result.mutation_count, 8)
        self.assertEqual(runner.calls[-2][0:3], ("issue", "status", "PRO-36"))
        self.assertEqual(
            runner.metadata["eventra.phase.result"],
            "pass",
        )

    def test_finish_phase_is_idempotent_when_done_metadata_matches(self):
        runner = FakeWorkflowRunner()
        wanted = build_phase_metadata(implementation_completion())
        runner.issue["status"] = "done"
        runner.metadata.update(wanted)

        result = finish_phase(runner, "PRO-36", implementation_completion())

        self.assertEqual(result.mutation_count, 0)
        self.assertFalse(any(call[:3] == ("issue", "metadata", "set") for call in runner.calls))
        self.assertFalse(any(call[:2] == ("issue", "status") for call in runner.calls))

    def test_terminal_conflicting_metadata_fails_closed(self):
        runner = FakeWorkflowRunner()
        runner.issue["status"] = "done"
        runner.metadata.update(build_phase_metadata(implementation_completion()))
        runner.metadata["eventra.phase.result"] = "blocked"

        with self.assertRaisesRegex(RuntimeError, "terminal phase metadata conflicts"):
            finish_phase(runner, "PRO-36", implementation_completion())
        self.assertEqual(runner.mutation_count, 0)

    def test_partial_metadata_failure_leaves_issue_nonterminal(self):
        runner = FakeWorkflowRunner()
        runner.fail_metadata_key = "eventra.phase.result"

        with self.assertRaisesRegex(RuntimeError, "Multica command failed"):
            finish_phase(runner, "PRO-36", implementation_completion())
        self.assertEqual(runner.issue["status"], "in_review")
        self.assertFalse(any(call[:2] == ("issue", "status") for call in runner.calls))

    def test_read_after_write_mismatch_leaves_issue_nonterminal(self):
        runner = FakeWorkflowRunner()
        runner.corrupt_metadata_key = "eventra.phase.result"

        with self.assertRaisesRegex(RuntimeError, "phase metadata reconciliation failed"):
            finish_phase(runner, "PRO-36", implementation_completion())
        self.assertEqual(runner.issue["status"], "in_review")

    def test_read_after_write_rejects_unexpected_controlled_metadata(self):
        runner = FakeWorkflowRunner()
        runner.inject_metadata_after_sets = (
            "eventra.phase.sha.backend",
            "b" * 40,
        )

        with self.assertRaisesRegex(RuntimeError, "phase metadata reconciliation failed"):
            finish_phase(runner, "PRO-36", implementation_completion())
        self.assertEqual(runner.issue["status"], "in_review")

    def test_status_read_after_write_is_authoritative(self):
        runner = FakeWorkflowRunner()
        runner.freeze_status = True

        with self.assertRaisesRegex(RuntimeError, "phase completion failed"):
            finish_phase(runner, "PRO-36", implementation_completion())

    def test_nonchild_unstaged_and_terminal_blocked_issue_are_rejected(self):
        cases = (
            {"parent_issue_id": None},
            {"stage": None},
            {"status": "blocked"},
            {"status": "cancelled"},
        )
        for overrides in cases:
            runner = FakeWorkflowRunner()
            runner.issue.update(overrides)
            with self.subTest(overrides=overrides):
                with self.assertRaises(RuntimeError):
                    finish_phase(runner, "PRO-36", implementation_completion())
                self.assertEqual(runner.mutation_count, 0)

    def test_parser_accepts_only_phase_arguments_and_prints_scalar_summary(self):
        parser = build_workflow_parser()
        args = parser.parse_args(
            [
                "finish-phase", "PRO-36",
                "--kind", "implementation",
                "--result", "pass",
                "--attempt", "0",
                "--frontend-sha", FRONTEND_SHA,
                "--evidence-comment", COMMENT_ID,
                "--pr", FRONTEND_PR,
            ]
        )
        self.assertEqual(args.command, "finish-phase")
        self.assertFalse(hasattr(args, "jwt_secret"))

        runner = FakeWorkflowRunner()
        result = finish_phase(runner, "PRO-36", implementation_completion())
        output = io.StringIO()
        with redirect_stdout(output):
            print_phase_result(result)
        self.assertEqual(
            output.getvalue(),
            "issue=PRO-36 status=done kind=implementation result=pass mutations=8\n",
        )
        self.assertNotIn(FRONTEND_SHA, output.getvalue())
        self.assertNotIn(FRONTEND_PR, output.getvalue())


def phase(
    issue_key,
    stage,
    kind,
    result="pass",
    attempt=0,
    frontend_sha=FRONTEND_SHA,
    backend_sha=None,
):
    return PhaseSnapshot(
        issue_key=issue_key,
        stage=stage,
        kind=kind,
        result=result,
        attempt=attempt,
        status="done",
        frontend_sha=frontend_sha,
        backend_sha=backend_sha,
    )


def frontend_pr(**overrides):
    values = {
        "repository": "frontend",
        "url": FRONTEND_PR,
        "head_sha": FRONTEND_SHA,
        "state": "open",
        "mergeable": True,
        "checks_pass": True,
    }
    values.update(overrides)
    return PullRequestSnapshot(**values)


def parent_snapshot(**overrides):
    values = {
        "identifier": "PRO-35",
        "classification": "frontend-only",
        "attempt": 0,
        "last_action": None,
        "merge_state": "not_ready",
        "candidate_frontend_sha": FRONTEND_SHA,
        "candidate_backend_sha": None,
        "children": (phase("PRO-36", 1, "implementation"),),
        "pull_requests": (frontend_pr(),),
    }
    values.update(overrides)
    return ParentSnapshot(**values)


class ParentDecisionTests(unittest.TestCase):
    def test_finished_implementation_creates_one_exact_sha_gate_stage(self):
        decision = decide_parent_action(parent_snapshot())
        self.assertEqual(
            decision,
            ParentDecision(
                "create_gate_stage",
                f"1:PRO-35:create_gate_stage:0:frontend:{FRONTEND_SHA}:-",
                "implementation evidence is ready for exact-SHA gates",
            ),
        )

    def test_cross_stack_implementation_requires_exact_repository_coverage(self):
        backend_sha = "b" * 40
        snapshot = parent_snapshot(
            classification="cross-stack",
            candidate_backend_sha=backend_sha,
            children=(phase("PRO-36", 1, "implementation"),),
        )
        self.assertEqual(decide_parent_action(snapshot).kind, "block_parent")

        backend_implementation = phase(
            "PRO-37",
            1,
            "implementation",
            frontend_sha=None,
            backend_sha=backend_sha,
        )
        complete = ParentSnapshot(
            **{
                **snapshot.__dict__,
                "children": snapshot.children + (backend_implementation,),
            }
        )
        self.assertEqual(
            decide_parent_action(complete).kind,
            "create_gate_stage",
        )

    def test_gate_failure_routes_bounded_repair_and_never_merge(self):
        children = (
            phase("PRO-36", 1, "implementation"),
            phase("PRO-37", 2, "review", result="fail"),
            phase("PRO-38", 2, "qa"),
        )
        decision = decide_parent_action(parent_snapshot(children=children))
        self.assertEqual(decision.kind, "create_repair_stage")
        self.assertIn(":1:frontend:", decision.action_key)

    def test_cross_stack_repair_may_target_only_affected_repository(self):
        backend_sha = "b" * 40
        children = (
            phase("PRO-36", 1, "implementation"),
            phase(
                "PRO-37",
                1,
                "implementation",
                frontend_sha=None,
                backend_sha=backend_sha,
            ),
            phase("PRO-38", 2, "review", result="fail"),
            phase(
                "PRO-39",
                2,
                "review",
                frontend_sha=None,
                backend_sha=backend_sha,
            ),
            phase("PRO-40", 2, "qa", backend_sha=backend_sha),
            phase("PRO-41", 3, "repair", attempt=1),
        )
        decision = decide_parent_action(
            parent_snapshot(
                classification="cross-stack",
                attempt=1,
                candidate_backend_sha=backend_sha,
                children=children,
            )
        )
        self.assertEqual(decision.kind, "create_gate_stage")

    def test_second_failed_complete_repair_cycle_blocks_without_third(self):
        children = (
            phase("PRO-36", 1, "implementation"),
            phase("PRO-37", 2, "review", result="fail"),
            phase("PRO-38", 2, "qa"),
            phase("PRO-39", 3, "repair", attempt=1),
            phase("PRO-40", 4, "review", result="fail", attempt=1),
            phase("PRO-41", 4, "qa", attempt=1),
            phase("PRO-42", 5, "repair", attempt=2),
            phase("PRO-43", 6, "review", result="fail", attempt=2),
            phase("PRO-44", 6, "qa", attempt=2),
        )
        decision = decide_parent_action(
            parent_snapshot(attempt=2, children=children)
        )
        self.assertEqual(decision.kind, "block_parent")
        self.assertNotIn("repair", decision.reason)

    def test_attempt_metadata_cannot_reset_completed_repair_history(self):
        children = (
            phase("PRO-36", 1, "implementation"),
            phase("PRO-37", 2, "review", result="fail"),
            phase("PRO-38", 2, "qa"),
            phase("PRO-39", 3, "repair", attempt=1),
            phase("PRO-40", 4, "review", result="fail", attempt=1),
            phase("PRO-41", 4, "qa", attempt=1),
            phase("PRO-42", 5, "repair", attempt=2),
            phase("PRO-43", 6, "review", result="fail", attempt=2),
            phase("PRO-44", 6, "qa", attempt=2),
        )
        decision = decide_parent_action(
            parent_snapshot(attempt=0, children=children)
        )
        self.assertEqual(decision.kind, "block_parent")
        self.assertIn("attempt", decision.reason)

    def test_replacement_sha_invalidates_old_pass_and_creates_fresh_gates(self):
        replacement = "c" * 40
        children = (
            phase("PRO-37", 2, "review"),
            phase("PRO-38", 2, "qa"),
        )
        decision = decide_parent_action(
            parent_snapshot(
                candidate_frontend_sha=replacement,
                children=children,
                pull_requests=(frontend_pr(head_sha=replacement),),
            )
        )
        self.assertEqual(decision.kind, "create_gate_stage")
        self.assertIn(replacement, decision.action_key)

    def test_exact_sha_gates_merge_only_with_current_ready_pr(self):
        children = (
            phase("PRO-37", 2, "review"),
            phase("PRO-38", 2, "qa"),
        )
        self.assertEqual(
            decide_parent_action(parent_snapshot(children=children)).kind,
            "merge",
        )
        for pr in (
            frontend_pr(head_sha="d" * 40),
            frontend_pr(mergeable=False),
            frontend_pr(checks_pass=False),
            frontend_pr(state="merged"),
        ):
            with self.subTest(pr=pr):
                self.assertEqual(
                    decide_parent_action(
                        parent_snapshot(children=children, pull_requests=(pr,))
                    ).kind,
                    "block_parent",
                )

    def test_cross_stack_requires_review_coverage_for_each_repository(self):
        backend_sha = "b" * 40
        backend_pr = PullRequestSnapshot(
            repository="backend",
            url="https://github.com/codeExploreHub/Eventra-Backend/pull/7",
            head_sha=backend_sha,
            state="open",
            mergeable=True,
            checks_pass=True,
        )
        frontend_review = phase("PRO-60", 2, "review")
        combined_qa = phase(
            "PRO-61", 2, "qa", backend_sha=backend_sha
        )
        snapshot = parent_snapshot(
            classification="cross-stack",
            candidate_backend_sha=backend_sha,
            children=(frontend_review, combined_qa),
            pull_requests=(frontend_pr(), backend_pr),
        )
        self.assertEqual(decide_parent_action(snapshot).kind, "block_parent")

        backend_review = phase(
            "PRO-62",
            2,
            "review",
            frontend_sha=None,
            backend_sha=backend_sha,
        )
        self.assertEqual(
            decide_parent_action(
                ParentSnapshot(
                    **{
                        **snapshot.__dict__,
                        "children": (frontend_review, backend_review, combined_qa),
                    }
                )
            ).kind,
            "merge",
        )

    def test_partial_merge_blocks_while_merged_state_routes_smoke_then_done(self):
        self.assertEqual(
            decide_parent_action(parent_snapshot(merge_state="partial")).kind,
            "block_parent",
        )
        self.assertEqual(
            decide_parent_action(parent_snapshot(merge_state="merged")).kind,
            "create_smoke_stage",
        )
        smoke = (phase("PRO-50", 4, "smoke"),)
        self.assertEqual(
            decide_parent_action(
                parent_snapshot(merge_state="merged", children=smoke)
            ).kind,
            "complete_parent",
        )

    def test_merged_smoke_failure_cannot_bypass_completed_attempt_history(self):
        children = (
            phase("PRO-36", 1, "implementation"),
            phase("PRO-37", 2, "review", result="fail"),
            phase("PRO-38", 2, "qa"),
            phase("PRO-39", 3, "repair", attempt=1),
            phase("PRO-40", 4, "review", result="fail", attempt=1),
            phase("PRO-41", 4, "qa", attempt=1),
            phase("PRO-42", 5, "repair", attempt=2),
            phase("PRO-43", 6, "review", attempt=2),
            phase("PRO-44", 6, "qa", attempt=2),
            phase("PRO-45", 7, "smoke", result="fail", attempt=2),
        )
        decision = decide_parent_action(
            parent_snapshot(
                attempt=0,
                merge_state="merged",
                children=children,
            )
        )
        self.assertEqual(decision.kind, "block_parent")
        self.assertIn("attempt", decision.reason)

    def test_incomplete_stage_and_recorded_action_are_noops(self):
        incomplete = (
            PhaseSnapshot(
                issue_key="PRO-36",
                stage=1,
                kind="implementation",
                result=None,
                attempt=0,
                status="in_review",
                frontend_sha=FRONTEND_SHA,
                backend_sha=None,
            ),
        )
        self.assertEqual(
            decide_parent_action(parent_snapshot(children=incomplete)).kind,
            "noop",
        )
        first = decide_parent_action(parent_snapshot())
        second = decide_parent_action(parent_snapshot(last_action=first.action_key))
        self.assertEqual(second.kind, "noop")


def stalled_workflow(**overrides):
    child = ChildRunSnapshot(
        issue_id=ISSUE_ID,
        identifier="PRO-36",
        stage=1,
        issue_status="in_review",
        latest_run_status="completed",
        latest_run_activity_at="2026-08-25T08:50:28Z",
        has_active_run=False,
        has_phase_completion=False,
    )
    values = {
        "parent_issue_id": PARENT_ID,
        "parent_identifier": "PRO-35",
        "has_human_approval_wait": False,
        "has_malformed_state": False,
        "latest_stage_finished": False,
        "has_later_parent_run": False,
        "active_parent_has_no_executable_successor": False,
        "children": (child,),
    }
    values.update(overrides)
    return WorkflowSnapshot(**values)


class RecoveryDecisionTests(unittest.TestCase):
    def test_completed_child_run_left_in_review_recovers_oldest_child(self):
        newer = ChildRunSnapshot(
            issue_id="01a00000-0000-7000-8000-000000000020",
            identifier="PRO-40",
            stage=1,
            issue_status="in_review",
            latest_run_status="completed",
            latest_run_activity_at="2026-08-25T09:50:28Z",
            has_active_run=False,
            has_phase_completion=False,
        )
        snapshot = stalled_workflow(
            children=stalled_workflow().children + (newer,)
        )
        self.assertEqual(
            decide_recovery(snapshot),
            RecoveryDecision(
                "rerun_child",
                "PRO-36",
                "terminal run without terminal phase transition",
            ),
        )

    def test_finished_stage_without_successor_recovers_parent_once(self):
        decision = decide_recovery(
            stalled_workflow(
                latest_stage_finished=True,
                children=(),
            )
        )
        self.assertEqual(decision.kind, "rerun_parent")
        self.assertEqual(decision.issue_key, "PRO-35")

    def test_verified_phase_metadata_with_nonterminal_issue_is_recovered(self):
        child = ChildRunSnapshot(
            issue_id=ISSUE_ID,
            identifier="PRO-36",
            stage=1,
            issue_status="in_review",
            latest_run_status="completed",
            latest_run_activity_at="2026-08-25T08:50:28Z",
            has_active_run=False,
            has_phase_completion=True,
        )
        decision = decide_recovery(stalled_workflow(children=(child,)))
        self.assertEqual(decision.kind, "rerun_child")
        self.assertEqual(decision.issue_key, "PRO-36")

    def test_nonterminal_agent_child_without_any_run_is_recovered(self):
        child = ChildRunSnapshot(
            issue_id=ISSUE_ID,
            identifier="PRO-36",
            stage=1,
            issue_status="todo",
            latest_run_status=None,
            latest_run_activity_at=None,
            has_active_run=False,
            has_phase_completion=False,
        )
        decision = decide_recovery(stalled_workflow(children=(child,)))
        self.assertEqual(decision.kind, "rerun_child")
        self.assertEqual(decision.issue_key, "PRO-36")

    def test_human_wait_malformed_and_active_work_are_noops(self):
        active_child = ChildRunSnapshot(
            issue_id=ISSUE_ID,
            identifier="PRO-36",
            stage=1,
            issue_status="in_progress",
            latest_run_status="running",
            latest_run_activity_at="2026-08-25T08:50:28Z",
            has_active_run=True,
            has_phase_completion=False,
        )
        for snapshot in (
            stalled_workflow(has_human_approval_wait=True),
            stalled_workflow(has_malformed_state=True),
            stalled_workflow(children=(active_child,)),
            stalled_workflow(
                children=(),
                latest_stage_finished=True,
                has_later_parent_run=True,
            ),
        ):
            with self.subTest(snapshot=snapshot):
                self.assertEqual(decide_recovery(snapshot).kind, "noop")


class FakeRecoveryRunner:
    def __init__(self):
        self.issue = raw_issue()
        self.runs = [
            {
                "id": "01a00000-0000-7000-8000-000000000030",
                "issue_id": ISSUE_ID,
                "status": "completed",
                "created_at": "2026-08-25T08:33:39Z",
                "dispatched_at": "2026-08-25T08:33:39Z",
                "started_at": "2026-08-25T08:34:04Z",
                "completed_at": "2026-08-25T08:50:28Z",
            }
        ]
        self.calls = []
        self.freeze_rerun = False

    def run(self, args, *, stdin_json=None):
        call = tuple(args)
        self.calls.append(call)
        if call == ("issue", "get", "PRO-36", "--output", "json"):
            return copy.deepcopy(self.issue)
        if call == ("issue", "runs", "PRO-36", "--output", "json"):
            return copy.deepcopy(self.runs)
        if call == ("issue", "rerun", "PRO-36", "--output", "json"):
            if not self.freeze_rerun:
                self.runs.append(
                    {
                        "id": "01a00000-0000-7000-8000-000000000031",
                        "issue_id": ISSUE_ID,
                        "status": "queued",
                        "created_at": "2026-08-25T10:00:00Z",
                        "dispatched_at": None,
                        "started_at": None,
                        "completed_at": None,
                    }
                )
            return {"ignored": "ack"}
        raise AssertionError(f"unsupported argv: {call!r}")


class RecoveryMutationTests(unittest.TestCase):
    def test_recover_once_rereads_then_verifies_new_active_task(self):
        runner = FakeRecoveryRunner()
        snapshots = [stalled_workflow(), stalled_workflow()]

        result = recover_once(runner, lambda: snapshots.pop(0))

        self.assertEqual(result.decision.kind, "rerun_child")
        self.assertEqual(result.mutation_count, 1)
        self.assertEqual(runner.calls[-2], ("issue", "rerun", "PRO-36", "--output", "json"))
        self.assertEqual(runner.calls[-1], ("issue", "runs", "PRO-36", "--output", "json"))

    def test_recover_once_fails_when_rerun_has_no_new_active_task(self):
        runner = FakeRecoveryRunner()
        runner.freeze_rerun = True
        snapshots = [stalled_workflow(), stalled_workflow()]
        with self.assertRaisesRegex(RuntimeError, "recovery verification failed"):
            recover_once(runner, lambda: snapshots.pop(0))

    def test_recover_once_stops_when_authoritative_reread_changes_decision(self):
        runner = FakeRecoveryRunner()
        healthy = stalled_workflow(
            has_human_approval_wait=True,
        )
        result = recover_once(runner, iter((stalled_workflow(), healthy)).__next__)
        self.assertEqual(result.decision.kind, "noop")
        self.assertEqual(result.mutation_count, 0)
        self.assertFalse(any(call[:2] == ("issue", "rerun") for call in runner.calls))

    def test_recover_once_stops_if_native_wakeup_appears_before_rerun(self):
        runner = FakeRecoveryRunner()
        runner.runs.append(
            {
                "id": "01a00000-0000-7000-8000-000000000032",
                "issue_id": ISSUE_ID,
                "status": "queued",
                "created_at": "2026-08-25T09:59:59Z",
                "dispatched_at": None,
                "started_at": None,
                "completed_at": None,
            }
        )
        snapshots = [stalled_workflow(), stalled_workflow()]

        result = recover_once(runner, lambda: snapshots.pop(0))

        self.assertEqual(result.decision.kind, "noop")
        self.assertEqual(result.mutation_count, 0)
        self.assertFalse(any(call[:2] == ("issue", "rerun") for call in runner.calls))


class FakeWatchRunner:
    PROJECTS = (PROJECT_ID, "00000000-0000-4000-8000-000000000040")

    def __init__(self):
        self.parent = raw_issue(
            id=PARENT_ID,
            identifier="PRO-35",
            parent_issue_id=None,
            stage=None,
            status="in_progress",
            assignee_type="squad",
            updated_at="2026-08-25T08:33:49Z",
        )
        self.child = raw_issue()
        self.metadata = {
            "PRO-35": {"eventra.workflow.version": "1"},
            "PRO-36": {},
        }
        self.runs = {
            "PRO-35": [
                {
                    "id": "01a00000-0000-7000-8000-000000000050",
                    "issue_id": PARENT_ID,
                    "status": "completed",
                    "created_at": "2026-08-25T08:31:59Z",
                    "dispatched_at": "2026-08-25T08:32:00Z",
                    "started_at": "2026-08-25T08:32:17Z",
                    "completed_at": "2026-08-25T08:34:02Z",
                }
            ],
            "PRO-36": copy.deepcopy(FakeRecoveryRunner().runs),
        }
        self.calls = []

    def run(self, args, *, stdin_json=None):
        call = tuple(args)
        self.calls.append(call)
        if call[:2] == ("issue", "list"):
            flags = dict(zip(call[2::2], call[3::2]))
            self._assert_list_flags(flags)
            issues = (
                [self.parent]
                if flags["--project"] == PROJECT_ID
                and flags["--status"] == "in_progress"
                else []
            )
            return {
                "has_more": False,
                "issues": copy.deepcopy(issues),
                "limit": 50,
                "offset": 0,
                "total": len(issues),
            }
        if call[:2] == ("issue", "get"):
            return copy.deepcopy(self.parent if call[2] == "PRO-35" else self.child)
        if call == ("issue", "children", "PRO-35", "--output", "json"):
            child_done = int(self.child["status"] == "done")
            return {
                "stages": [
                    {
                        "stage": 1,
                        "total": 1,
                        "done": child_done,
                        "issues": [copy.deepcopy(self.child)],
                    }
                ],
                "total": 1,
                "unstaged": [],
            }
        if call[:3] == ("issue", "metadata", "list"):
            return copy.deepcopy(self.metadata[call[3]])
        if call[:2] == ("issue", "runs"):
            return copy.deepcopy(self.runs[call[2]])
        if call == ("issue", "rerun", "PRO-36", "--output", "json"):
            self.runs["PRO-36"].append(
                {
                    "id": "01a00000-0000-7000-8000-000000000051",
                    "issue_id": ISSUE_ID,
                    "status": "queued",
                    "created_at": "2026-08-25T10:00:00Z",
                    "dispatched_at": None,
                    "started_at": None,
                    "completed_at": None,
                }
            )
            return {"ignored": "ack"}
        raise AssertionError(f"unsupported argv: {call!r}")

    def _assert_list_flags(self, flags):
        expected = {
            "--metadata": 'eventra.workflow.version="1"',
            "--limit": "50",
            "--offset": "0",
            "--output": "json",
        }
        for key, item in expected.items():
            if flags.get(key) != item:
                raise AssertionError(f"wrong list flag {key}")
        if flags.get("--project") not in self.PROJECTS:
            raise AssertionError("foreign project")
        if flags.get("--status") not in {"in_progress", "in_review"}:
            raise AssertionError("foreign status")


class WatchWorkflowTests(unittest.TestCase):
    def test_watch_dry_run_detects_but_does_not_mutate_stalled_pro_35(self):
        runner = FakeWatchRunner()
        result = watch_projects(runner, runner.PROJECTS, apply=False)
        self.assertEqual(result, WatchResult(1, 1, 0, "rerun_child"))
        self.assertFalse(any(call[:2] == ("issue", "rerun") for call in runner.calls))

    def test_watch_apply_recovers_at_most_once_and_second_apply_is_noop(self):
        runner = FakeWatchRunner()
        first = watch_projects(runner, runner.PROJECTS, apply=True)
        second = watch_projects(runner, runner.PROJECTS, apply=True)
        self.assertEqual(first.applied, 1)
        self.assertEqual(second.applied, 0)
        self.assertEqual(
            sum(call[:2] == ("issue", "rerun") for call in runner.calls),
            1,
        )

    def test_watch_parser_requires_two_project_ids_and_defaults_to_dry_run(self):
        args = build_workflow_parser().parse_args(
            [
                "watch",
                "--project-id", PROJECT_ID,
                "--backend-project-id", FakeWatchRunner.PROJECTS[1],
            ]
        )
        self.assertEqual(args.command, "watch")
        self.assertFalse(args.apply)

    def test_historical_member_child_does_not_suppress_recovery(self):
        runner = FakeWatchRunner()
        runner.child["assignee_type"] = "member"
        runner.child["status"] = "done"
        runner.metadata["PRO-36"] = build_phase_metadata(
            implementation_completion()
        )
        runner.child["updated_at"] = "2026-08-25T08:51:00Z"

        result = watch_projects(runner, runner.PROJECTS, apply=False)

        self.assertEqual(result.decision, "rerun_parent")

    def test_active_member_assignment_suppresses_recovery_without_metadata(self):
        runner = FakeWatchRunner()
        runner.child["assignee_type"] = "member"

        result = watch_projects(runner, runner.PROJECTS, apply=False)

        self.assertEqual(result, WatchResult(1, 0, 0, "noop"))


class FakeParentRunner(FakeWatchRunner):
    def __init__(self):
        super().__init__()
        self.metadata["PRO-35"] = {
            "eventra.workflow.version": "1",
            "eventra.workflow.classification": "frontend-only",
            "eventra.workflow.next_stage": "2",
            "eventra.workflow.attempt": "0",
            "eventra.workflow.frontend_sha": FRONTEND_SHA,
            "eventra.workflow.merge_state": "not_ready",
            "eventra.workflow.last_action": "",
        }
        self.metadata["PRO-36"] = build_phase_metadata(
            implementation_completion()
        )
        self.child["status"] = "done"

    def run(self, args, *, stdin_json=None):
        call = tuple(args)
        if call == ("issue", "children", "PRO-35", "--output", "json"):
            self.calls.append(call)
            return {
                "stages": [
                    {"stage": 1, "total": 1, "done": 1, "issues": [copy.deepcopy(self.child)]}
                ],
                "total": 1,
                "unstaged": [],
            }
        return super().run(args, stdin_json=stdin_json)


class FakeGitHubRunner:
    def __init__(self):
        self.calls = []

    def run(self, args):
        self.calls.append(tuple(args))
        if tuple(args) != (
            "pr", "view", FRONTEND_PR,
            "--json", "url,headRefOid,state,mergeable,mergeStateStatus,statusCheckRollup",
        ):
            raise AssertionError(f"unsupported gh argv: {args!r}")
        return {
            "url": FRONTEND_PR,
            "headRefOid": FRONTEND_SHA,
            "state": "OPEN",
            "mergeable": "MERGEABLE",
            "mergeStateStatus": "CLEAN",
            "statusCheckRollup": [],
        }


class ParentSnapshotReadTests(unittest.TestCase):
    def test_load_parent_snapshot_reads_exact_metadata_and_current_pr_state(self):
        runner = FakeParentRunner()
        github = FakeGitHubRunner()
        snapshot = load_parent_snapshot(runner, github, "PRO-35")
        self.assertEqual(snapshot.classification, "frontend-only")
        self.assertEqual(snapshot.candidate_frontend_sha, FRONTEND_SHA)
        self.assertEqual(snapshot.children[0].kind, "implementation")
        self.assertEqual(snapshot.pull_requests[0].head_sha, FRONTEND_SHA)
        self.assertEqual(decide_parent_action(snapshot).kind, "create_gate_stage")

    def test_plan_parent_parser_is_read_only_and_prints_only_decision_fields(self):
        args = build_workflow_parser().parse_args(["plan-parent", "PRO-35"])
        self.assertEqual(args.command, "plan-parent")
        decision = decide_parent_action(
            load_parent_snapshot(FakeParentRunner(), FakeGitHubRunner(), "PRO-35")
        )
        output = io.StringIO()
        with redirect_stdout(output):
            print_parent_decision(decision)
        self.assertIn("decision=create_gate_stage", output.getvalue())
        self.assertNotIn(FRONTEND_PR, output.getvalue())

    def test_malformed_parent_metadata_fails_closed_without_github_read(self):
        runner = FakeParentRunner()
        runner.metadata["PRO-35"]["eventra.workflow.attempt"] = "two"
        github = FakeGitHubRunner()
        with self.assertRaisesRegex(RuntimeError, "malformed parent workflow metadata"):
            load_parent_snapshot(runner, github, "PRO-35")
        self.assertEqual(github.calls, [])

    def test_empty_check_rollup_requires_clean_merge_state(self):
        github = FakeGitHubRunner()
        original_run = github.run

        def blocked(args):
            value = original_run(args)
            value["mergeStateStatus"] = "BLOCKED"
            return value

        github.run = blocked
        snapshot = load_parent_snapshot(FakeParentRunner(), github, "PRO-35")
        self.assertFalse(snapshot.pull_requests[0].checks_pass)


if __name__ == "__main__":
    unittest.main()
