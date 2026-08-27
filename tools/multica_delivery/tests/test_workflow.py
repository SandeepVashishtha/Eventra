from dataclasses import replace
from datetime import datetime, timezone
from pathlib import Path
from types import MappingProxyType
import unittest
import uuid
from unittest.mock import patch

from tools.multica_delivery.decisions import (
    DecisionKind,
    DispatchKind,
    GateEvidence,
    ParentDecision,
    ParentSnapshot,
    PullRequestEvidence,
    RepositoryEvidence,
    SmokeRead,
)
from tools.multica_delivery.github_client import (
    GitHubBoundaryError,
    MergeResult,
    PullRequestInfo,
    RequiredStatusChecks,
)
from tools.multica_delivery.exact_sha import (
    ClosedCommandResult,
    ExactShaCommandResult,
    ExactShaVerification,
    LocalExactShaCommandRunner,
)
from tools.multica_delivery.manifest import load_manifest
from tools.multica_delivery.metadata import ParentMetadata
from tools.multica_delivery.model import ServiceSpec
from tools.multica_delivery.processes import OwnedProcess
from tools.multica_delivery.workflow import (
    ChildRequest,
    GenericWorkflow,
    OwnedSmokeExecutor,
    PhaseCompletion,
    PullRequestTarget,
    ScopeResolution,
    StatusTransition,
    WorkflowChild,
    WorkflowError,
    WorkflowState,
    coordinator_action_key,
)


FIXTURE = Path(__file__).parent / "fixtures" / "three-repository-delivery.yaml"
SHA = {
    "api": "a" * 40,
    "notifications": "b" * 40,
    "web": "c" * 40,
}
REPLACEMENT_SHA = "d" * 40
SMOKE_OBSERVATION = {
    "first": "smoke:" + "1" * 64,
    "second": "smoke:" + "2" * 64,
    "third": "smoke:" + "3" * 64,
}


def evidence_uuid(label: str) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_URL, f"https://example.test/{label}"))


def completion_for(
    repository: str,
    *,
    phase: str = "implementation",
    result: str = "pass",
    attempt: int = 0,
    sha: str | None = None,
    parent: str = "PRO-101",
    suite_key: str = "",
    candidate_shas: dict[str, str] | None = None,
) -> PhaseCompletion:
    comment_uuid = evidence_uuid(
        f"{parent}-{repository}-{phase}-{result}-{attempt}-{sha or SHA.get(repository, 'suite')}"
    )
    pull_request_url = ""
    if repository in SHA:
        number = {"api": 12, "notifications": 13, "web": 14}[repository]
        slug = {
            "api": "sample-commerce-api",
            "notifications": "sample-commerce-notifications",
            "web": "sample-commerce-web",
        }[repository]
        pull_request_url = f"https://github.com/codeExploreHub/{slug}/pull/{number}"
    return PhaseCompletion(
        parent_identifier=parent,
        repository_key=repository,
        phase=phase,
        result=result,
        attempt=attempt,
        candidate_sha=sha or SHA.get(repository, "e" * 40),
        pull_request_url=pull_request_url,
        evidence_comment_uuid=comment_uuid,
        evidence_comment_url=f"https://example.test/evidence/{comment_uuid}",
        suite_key=suite_key,
        candidate_shas=candidate_shas or {},
    )


def passing_smoke(
    *,
    observation_id: str,
    shas: dict[str, str] | None = None,
    authoritative: bool = True,
) -> SmokeRead:
    exact = dict(shas or {"api": SHA["api"], "web": SHA["web"]})
    return SmokeRead(
        observation_id=observation_id,
        merged_shas=exact,
        checkout_shas=exact,
        repository_results={repository: "pass" for repository in exact},
        integration_results={"web-api": "pass"} if set(exact) == {"api", "web"} else {},
        authoritative=authoritative,
    )


def passing_snapshot() -> ParentSnapshot:
    candidates = {"api": SHA["api"], "web": SHA["web"]}
    return ParentSnapshot(
        affected_repositories=("api", "web"),
        candidate_shas=candidates,
        children={
            repository: RepositoryEvidence(candidate_sha=sha, result="pass")
            for repository, sha in candidates.items()
        },
        pull_requests={
            repository: PullRequestEvidence(sha, "open", True, True)
            for repository, sha in candidates.items()
        },
        reviews={
            repository: RepositoryEvidence(candidate_sha=sha, result="pass")
            for repository, sha in candidates.items()
        },
        qa={
            repository: RepositoryEvidence(candidate_sha=sha, result="pass")
            for repository, sha in candidates.items()
        },
        integration_qa={
            "web-api": GateEvidence(candidate_shas=candidates, result="pass")
        },
    )


def merging_snapshot(
    merged_shas: dict[str, str] | None = None,
) -> ParentSnapshot:
    snapshot = passing_snapshot()
    merged = dict(merged_shas or {})
    return replace(
        snapshot,
        merge_state="merging",
        merged_shas=merged,
        pull_requests={
            repository: PullRequestEvidence(
                sha,
                "merged" if repository in merged else "open",
                True,
                True,
                merged.get(repository),
            )
            for repository, sha in snapshot.candidate_shas.items()
        },
    )


def metadata_for(snapshot: ParentSnapshot, *, stage_ordinal: int = 5) -> ParentMetadata:
    affected = snapshot.affected_repositories
    merge_plan = (
        tuple(repository for repository in ("api", "web", "notifications") if repository in affected)
        if snapshot.merge_state in {"ready", "merging", "merged"}
        else ()
    )
    return ParentMetadata(
        workflow_version=1,
        metadata_version=1,
        instance_key="sample-commerce",
        affected_repositories=affected,
        repository_dag={
            repository: tuple(
                dependency
                for dependency in ({"web": ("api",)}.get(repository, ()))
                if dependency in affected
            )
            for repository in affected
        },
        candidate_shas=snapshot.candidate_shas,
        contract_hashes={},
        stage_ordinal=stage_ordinal,
        merge_plan=merge_plan,
        merge_state=snapshot.merge_state,
        attempt=snapshot.attempt,
        last_action="resume",
    )


def pull_request_targets() -> dict[str, PullRequestTarget]:
    return {
        "api": PullRequestTarget(
            "api",
            12,
            "https://github.com/codeExploreHub/sample-commerce-api/pull/12",
        ),
        "web": PullRequestTarget(
            "web",
            14,
            "https://github.com/codeExploreHub/sample-commerce-web/pull/14",
        ),
    }


class FakeWorkflowStore:
    def __init__(self, manifest) -> None:
        self.manifest = manifest
        self.states: dict[str, WorkflowState] = {}
        self.completions: dict[tuple[str, str], PhaseCompletion] = {}
        self.events: list[tuple[object, ...]] = []
        self.rollback_calls: list[object] = []
        self.corrupt_completion_read = False
        self.change_after_completion_read = False
        self.retain_gates_on_replacement = False
        self.change_on_recovery_reread = False
        self.activate_on_rerun = False
        self.mutate_gate_on_rerun = False
        self.fail_reads_after_first_merge_progress = 0
        self.failed_merge_progress_read = False
        self.inject_merge_progress_read_failure = False
        self.read_parent_identifier_override: str | None = None
        self.override_parent_after_rerun = False
        self.parent_read_failures_remaining = 0
        self.fail_reads_after_create = False
        self.fail_reads_after_done = False
        self.fail_reads_after_rerun = False
        self.write_smoke_evidence_without_transition = False
        self.fail_parent_reads_after_smoke_write = False
        self.fail_parent_reads_after_parent_done = False
        self.write_incomplete_parent_done = False
        self.read_counts: dict[str, int] = {}
        self.list_arguments: tuple[object, ...] | None = None
        self.intake_transitions: dict[str, StatusTransition] = {}

    def add_blank(
        self,
        identifier: str,
        *,
        status: str = "todo",
        authorized: bool = True,
    ) -> None:
        self.states[identifier] = WorkflowState(
            parent_identifier=identifier,
            parent_status=status,
            project_key=self.manifest.instance.control_project,
            metadata=None,
            snapshot=ParentSnapshot(affected_repositories=()),
        )
        if authorized:
            key = coordinator_action_key(
                workflow_version=1,
                instance_key=self.manifest.instance.key,
                parent_identifier=identifier,
                stage_kind="intake-transition",
                stage_ordinal=0,
                attempt=0,
                affected_repositories=frozenset(),
                candidate_shas={},
                contract_hashes={},
            )
            self.intake_transitions[identifier] = StatusTransition(
                identifier,
                "backlog",
                "todo",
                key,
            )

    def read_intake_transition(self, parent_identifier: str) -> StatusTransition | None:
        self.events.append(("read-intake-transition", parent_identifier))
        return self.intake_transitions.get(parent_identifier)

    def record_intake_transition(
        self,
        parent_identifier: str,
        old_status: str,
        new_status: str,
        *,
        action_key: str,
    ) -> None:
        self.events.append(
            ("record-intake-transition", parent_identifier, old_status, new_status, action_key)
        )
        self.intake_transitions[parent_identifier] = StatusTransition(
            parent_identifier,
            old_status,
            new_status,
            action_key,
        )
        state = self.states[parent_identifier]
        self.states[parent_identifier] = replace(
            state,
            applied_action_keys=state.applied_action_keys | {action_key},
        )

    def add_state(
        self,
        identifier: str,
        snapshot: ParentSnapshot,
        *,
        status: str = "in_progress",
        children: tuple[WorkflowChild, ...] = (),
        pull_requests: dict[str, PullRequestTarget] | None = None,
        human_wait: bool = False,
        active_work: bool = False,
        workflow_version: int = 1,
        project_key: str | None = None,
    ) -> None:
        metadata = metadata_for(snapshot)
        if workflow_version != metadata.workflow_version:
            metadata = replace(metadata, workflow_version=workflow_version)
        self.states[identifier] = WorkflowState(
            parent_identifier=identifier,
            parent_status=status,
            project_key=project_key or self.manifest.instance.control_project,
            metadata=metadata,
            snapshot=snapshot,
            children=children,
            pull_requests=pull_requests or {},
            human_wait=human_wait,
            active_work=active_work,
        )

    def read(self, parent_identifier: str) -> WorkflowState:
        self.events.append(("read-parent", parent_identifier))
        if self.parent_read_failures_remaining:
            self.parent_read_failures_remaining -= 1
            raise RuntimeError("authoritative parent read temporarily unavailable")
        if self.fail_reads_after_first_merge_progress:
            self.fail_reads_after_first_merge_progress -= 1
            raise RuntimeError("authoritative read temporarily unavailable")
        count = self.read_counts.get(parent_identifier, 0) + 1
        self.read_counts[parent_identifier] = count
        state = self.states[parent_identifier]
        if self.change_on_recovery_reread and count == 2:
            state = replace(state, active_work=True)
            self.states[parent_identifier] = state
        if self.read_parent_identifier_override is not None:
            state = replace(
                state,
                parent_identifier=self.read_parent_identifier_override,
            )
        return state

    def list_active_parents(
        self,
        *,
        instance_key: str,
        project_keys: frozenset[str],
        workflow_versions: frozenset[int],
    ) -> tuple[str, ...]:
        self.list_arguments = (instance_key, project_keys, workflow_versions)
        return tuple(
            identifier
            for identifier, state in self.states.items()
            if state.parent_status in {"todo", "in_progress", "in_review"}
            and state.project_key in project_keys
            and state.metadata is not None
            and state.metadata.instance_key == instance_key
            and state.metadata.workflow_version in workflow_versions
        )

    def initialize_parent(
        self,
        parent_identifier: str,
        metadata: ParentMetadata,
        *,
        action_key: str,
    ) -> None:
        self.events.append(("initialize", parent_identifier, action_key))
        state = self.states[parent_identifier]
        snapshot = ParentSnapshot(
            affected_repositories=metadata.affected_repositories,
        )
        self.states[parent_identifier] = replace(
            state,
            parent_status="in_progress",
            metadata=metadata,
            snapshot=snapshot,
            applied_action_keys=state.applied_action_keys | {action_key},
        )

    def request_human_clarification(
        self,
        parent_identifier: str,
        reason: str,
        *,
        action_key: str,
    ) -> None:
        self.events.append(("human", parent_identifier, reason, action_key))
        state = self.states[parent_identifier]
        self.states[parent_identifier] = replace(
            state,
            human_wait=True,
            applied_action_keys=state.applied_action_keys | {action_key},
        )

    def create_children(
        self,
        parent_identifier: str,
        children: tuple[ChildRequest, ...],
        metadata: ParentMetadata,
        *,
        action_key: str,
    ) -> None:
        self.events.append(("create", parent_identifier, children, action_key))
        state = self.states[parent_identifier]
        snapshot = state.snapshot
        implementation = dict(snapshot.children)
        reviews = dict(snapshot.reviews)
        qa = dict(snapshot.qa)
        integration = dict(snapshot.integration_qa)
        workflow_children = list(state.children)
        for index, request in enumerate(children, start=1):
            workflow_children.append(
                WorkflowChild(
                    identifier=f"{parent_identifier}-CH-{len(workflow_children) + index}",
                    target_key=request.target_key,
                    repository_key=request.repository_key,
                    suite_key=request.suite_key,
                    phase=request.phase,
                    stage_ordinal=request.stage_ordinal,
                    attempt=request.attempt,
                    status="todo",
                    action_key=action_key,
                    active=True,
                )
            )
            if request.phase in {"implementation", "repair"}:
                implementation[request.repository_key] = RepositoryEvidence("", "pending")
            elif request.phase == "review":
                reviews[request.repository_key] = RepositoryEvidence(
                    snapshot.candidate_shas[request.repository_key],
                    "pending",
                )
            elif request.phase == "qa":
                qa[request.repository_key] = RepositoryEvidence(
                    snapshot.candidate_shas[request.repository_key],
                    "pending",
                )
            elif request.phase == "integration_qa":
                integration[request.suite_key] = GateEvidence(
                    candidate_shas=snapshot.candidate_shas,
                    result="pending",
                )
        self.states[parent_identifier] = replace(
            state,
            metadata=metadata,
            snapshot=replace(
                snapshot,
                children=implementation,
                reviews=reviews,
                qa=qa,
                integration_qa=integration,
                attempt=metadata.attempt,
            ),
            children=tuple(workflow_children),
            applied_action_keys=state.applied_action_keys | {action_key},
        )
        if self.fail_reads_after_create:
            self.fail_reads_after_create = False
            self.parent_read_failures_remaining = 2

    def write_phase_completion(
        self,
        completion: PhaseCompletion,
        *,
        action_key: str,
    ) -> None:
        self.events.append(("write-completion", completion.evidence_comment_uuid, action_key))
        self.completions[(completion.parent_identifier, completion.evidence_comment_uuid)] = completion

    def read_phase_completion(
        self,
        parent_identifier: str,
        evidence_comment_uuid: str,
    ) -> PhaseCompletion | None:
        self.events.append(("read-completion", evidence_comment_uuid))
        value = self.completions.get((parent_identifier, evidence_comment_uuid))
        if value is not None and self.corrupt_completion_read:
            return replace(value, result="blocked" if value.result != "blocked" else "fail")
        if value is not None and self.change_after_completion_read:
            state = self.states[parent_identifier]
            assert state.metadata is not None
            self.states[parent_identifier] = replace(
                state,
                metadata=replace(
                    state.metadata,
                    stage_ordinal=state.metadata.stage_ordinal + 1,
                ),
            )
        return value

    def mark_child_done(
        self,
        parent_identifier: str,
        completion: PhaseCompletion,
        metadata: ParentMetadata,
        *,
        action_key: str,
    ) -> None:
        self.events.append(("done", completion.evidence_comment_uuid, action_key))
        state = self.states[parent_identifier]
        snapshot = state.snapshot
        children = list(state.children)
        matching = [
            index
            for index, child in enumerate(children)
            if child.phase == completion.phase
            and child.attempt == completion.attempt
            and (
                child.repository_key == completion.repository_key
                or child.suite_key == completion.suite_key != ""
            )
        ]
        if len(matching) != 1:
            raise RuntimeError("completion child is not unique")
        index = matching[0]
        children[index] = replace(
            children[index],
            status="done",
            active=False,
            evidence_comment_uuid=completion.evidence_comment_uuid,
        )

        implementation = dict(snapshot.children)
        candidates = dict(snapshot.candidate_shas)
        reviews = dict(snapshot.reviews)
        qa = dict(snapshot.qa)
        integration = dict(snapshot.integration_qa)
        pull_requests = dict(snapshot.pull_requests)
        targets = dict(state.pull_requests)
        smoke_reads = snapshot.smoke_reads
        if completion.phase in {"implementation", "repair"}:
            previous_sha = candidates.get(completion.repository_key)
            implementation[completion.repository_key] = RepositoryEvidence(
                completion.candidate_sha,
                completion.result,
            )
            candidates[completion.repository_key] = completion.candidate_sha
            pull_requests[completion.repository_key] = PullRequestEvidence(
                completion.candidate_sha,
                "open",
                True,
                True,
            )
            if completion.pull_request_url:
                number = int(completion.pull_request_url.rsplit("/", 1)[1])
                targets[completion.repository_key] = PullRequestTarget(
                    completion.repository_key,
                    number,
                    completion.pull_request_url,
                )
            if (
                previous_sha is not None
                and previous_sha != completion.candidate_sha
                and not self.retain_gates_on_replacement
            ):
                reviews.clear()
                qa.clear()
                integration.clear()
                smoke_reads = ()
        elif completion.phase == "review":
            reviews[completion.repository_key] = RepositoryEvidence(
                completion.candidate_sha,
                completion.result,
            )
        elif completion.phase == "qa":
            qa[completion.repository_key] = RepositoryEvidence(
                completion.candidate_sha,
                completion.result,
            )
        elif completion.phase == "integration_qa":
            integration[completion.suite_key] = GateEvidence(
                candidate_shas=completion.candidate_shas,
                result=completion.result,
            )

        self.states[parent_identifier] = replace(
            state,
            metadata=metadata,
            snapshot=replace(
                snapshot,
                children=implementation,
                candidate_shas=candidates,
                reviews=reviews,
                qa=qa,
                integration_qa=integration,
                pull_requests=pull_requests,
                smoke_reads=smoke_reads,
                attempt=metadata.attempt,
            ),
            children=tuple(children),
            pull_requests=targets,
            applied_action_keys=state.applied_action_keys | {action_key},
        )
        if self.fail_reads_after_done:
            self.fail_reads_after_done = False
            self.parent_read_failures_remaining = 2

    def set_parent_status(
        self,
        parent_identifier: str,
        status: str,
        reason: str,
        metadata: ParentMetadata,
        *,
        action_key: str,
    ) -> None:
        self.events.append(("status", parent_identifier, status, reason, action_key))
        state = self.states[parent_identifier]
        if status == "done" and self.write_incomplete_parent_done:
            self.states[parent_identifier] = replace(state, parent_status=status)
            return
        self.states[parent_identifier] = replace(
            state,
            parent_status=status,
            metadata=metadata,
            applied_action_keys=state.applied_action_keys | {action_key},
        )
        if status == "done" and self.fail_parent_reads_after_parent_done:
            self.fail_parent_reads_after_parent_done = False
            self.parent_read_failures_remaining = 2

    def record_merge_state(
        self,
        parent_identifier: str,
        merge_state: str,
        merged_shas: dict[str, str],
        metadata: ParentMetadata,
        *,
        action_key: str,
    ) -> None:
        self.events.append(
            (
                "merge-state",
                merge_state,
                dict(merged_shas),
                action_key,
                metadata.stage_ordinal,
            )
        )
        state = self.states[parent_identifier]
        pull_requests = dict(state.snapshot.pull_requests)
        for repository, sha in merged_shas.items():
            existing = pull_requests[repository]
            pull_requests[repository] = replace(existing, state="merged", merged_sha=sha)
        self.states[parent_identifier] = replace(
            state,
            metadata=metadata,
            snapshot=replace(
                state.snapshot,
                merge_state=merge_state,
                merged_shas=merged_shas,
                pull_requests=pull_requests,
            ),
            applied_action_keys=state.applied_action_keys | {action_key},
        )
        if (
            merge_state == "merging"
            and len(merged_shas) == 1
            and self.inject_merge_progress_read_failure
            and not self.failed_merge_progress_read
        ):
            self.failed_merge_progress_read = True
            self.fail_reads_after_first_merge_progress = 2

    def write_smoke_read(
        self,
        parent_identifier: str,
        smoke_read: SmokeRead,
        metadata: ParentMetadata,
        *,
        action_key: str,
    ) -> None:
        self.events.append(("write-smoke", smoke_read, action_key))
        state = self.states[parent_identifier]
        if self.write_smoke_evidence_without_transition:
            self.states[parent_identifier] = replace(
                state,
                snapshot=replace(
                    state.snapshot,
                    smoke_reads=state.snapshot.smoke_reads + (smoke_read,),
                ),
            )
            return
        self.states[parent_identifier] = replace(
            state,
            metadata=metadata,
            snapshot=replace(
                state.snapshot,
                smoke_reads=state.snapshot.smoke_reads + (smoke_read,),
            ),
            applied_action_keys=state.applied_action_keys | {action_key},
        )
        if self.fail_parent_reads_after_smoke_write:
            self.fail_parent_reads_after_smoke_write = False
            self.parent_read_failures_remaining = 2
    def rerun_child(
        self,
        parent_identifier: str,
        child_identifier: str,
        metadata: ParentMetadata,
        *,
        action_key: str,
    ) -> None:
        self.events.append(("rerun", parent_identifier, child_identifier, action_key))
        state = self.states[parent_identifier]
        children = tuple(
            replace(child, active=True)
            if self.activate_on_rerun and child.identifier == child_identifier
            else child
            for child in state.children
        )
        self.states[parent_identifier] = replace(
            state,
            metadata=metadata,
            snapshot=replace(
                state.snapshot,
                recovery_count=1,
                reviews=(
                    {"api": RepositoryEvidence(SHA["api"], "pass")}
                    if self.mutate_gate_on_rerun
                    else state.snapshot.reviews
                ),
            ),
            children=children,
            active_work=self.activate_on_rerun,
            applied_action_keys=state.applied_action_keys | {action_key},
        )
        if self.fail_reads_after_rerun:
            self.fail_reads_after_rerun = False
            self.parent_read_failures_remaining = 2
        if self.override_parent_after_rerun:
            self.read_parent_identifier_override = "PRO-999"


class FakeGitHub:
    def __init__(self, event_log: list[tuple[object, ...]] | None = None) -> None:
        self.heads = {"api": SHA["api"], "web": SHA["web"]}
        self.mergeable = {"api": True, "web": True}
        self.checks = {"api": True, "web": True}
        self.merged: list[tuple[str, int]] = []
        self.merged_shas = {"api": SHA["api"], "web": SHA["web"]}
        self.fail_on: str | None = None
        self.commit_then_error_on: str | None = None
        self.malformed_ack_on: str | None = None
        self.ack_without_commit_on: str | None = None
        self.fail_merged_reread_on: str | None = None
        self.fail_merged_rereads_remaining: dict[str, int] = {}
        self.read_failures_remaining: dict[str, int] = {}
        self.malformed_read_on: str | None = None
        self.missing_merge_sha_on: str | None = None
        self.committed: set[str] = set()
        self.event_log = event_log

    @staticmethod
    def _key(repository: str) -> str:
        return repository.rsplit("-", 1)[-1]

    def get_pull_request(self, repository: str, number: int) -> PullRequestInfo:
        key = self._key(repository)
        event = ("github-read-pr", key, number)
        if self.event_log is not None:
            self.event_log.append(event)
        if self.read_failures_remaining.get(key, 0):
            self.read_failures_remaining[key] -= 1
            raise GitHubBoundaryError("authoritative pull request read unavailable")
        if self.malformed_read_on == key:
            return object()  # type: ignore[return-value]
        if self.fail_merged_reread_on == key and key in self.committed:
            raise GitHubBoundaryError("authoritative merged reread unavailable")
        if key in self.committed and self.fail_merged_rereads_remaining.get(key, 0):
            self.fail_merged_rereads_remaining[key] -= 1
            raise GitHubBoundaryError("authoritative merged reread temporarily unavailable")
        return PullRequestInfo(
            repository,
            number,
            "merged" if key in self.committed else "open",
            self.heads[key],
            "main",
            self.mergeable[key],
            "2026-08-27T10:00:00Z" if key in self.committed else None,
            (
                None
                if key == self.missing_merge_sha_on
                else self.merged_shas[key]
            )
            if key in self.committed
            else None,
        )

    def required_status_checks(
        self,
        repository: str,
        base_ref: str,
        expected_sha: str,
    ) -> RequiredStatusChecks:
        key = self._key(repository)
        event = ("github-read-checks", key, expected_sha)
        if self.event_log is not None:
            self.event_log.append(event)
        return RequiredStatusChecks(
            repository,
            base_ref,
            expected_sha,
            True,
            (),
            (),
            (),
            (),
            self.checks[key],
        )

    def merge_pull_request(
        self,
        repository: str,
        number: int,
        *,
        expected_sha: str,
    ) -> MergeResult:
        key = self._key(repository)
        if self.event_log is not None:
            self.event_log.append(("github-merge", key, number))
        if self.fail_on == key:
            raise GitHubBoundaryError("merge failed")
        self.merged.append((repository, number))
        if self.ack_without_commit_on != key:
            self.committed.add(key)
        if self.commit_then_error_on == key:
            raise GitHubBoundaryError("merge acknowledgement lost")
        if self.malformed_ack_on == key:
            return MergeResult(repository, number, False, expected_sha, "")
        return MergeResult(repository, number, True, expected_sha, self.merged_shas[key])


class FakeSmokeExecutor:
    def __init__(
        self,
        result: SmokeRead,
        *,
        bind_observation_id: bool = True,
    ) -> None:
        self.result = result
        self.bind_observation_id = bind_observation_id
        self.calls: list[tuple[str, tuple[str, ...], dict[str, str], str]] = []

    def execute(
        self,
        parent_identifier: str,
        repositories: tuple[str, ...],
        merged_shas: MappingProxyType | dict[str, str],
        *,
        action_key: str,
    ) -> SmokeRead:
        self.calls.append(
            (parent_identifier, repositories, dict(merged_shas), action_key)
        )
        if self.bind_observation_id:
            return replace(self.result, observation_id=action_key)
        return self.result


class FakeScopeResolver:
    def __init__(self, resolution: ScopeResolution) -> None:
        self.resolution = resolution
        self.calls: list[str] = []

    def resolve(self, parent_identifier: str) -> ScopeResolution:
        self.calls.append(parent_identifier)
        return self.resolution


class FakeOwnedProcessManager:
    def __init__(self) -> None:
        self.owner_token = "smoke-owner"
        self.started: list[tuple[object, object, str]] = []
        self.stopped: list[tuple[OwnedProcess, str, str, str]] = []

    def start_services(self, services, run, *, candidate_sha: str) -> tuple[OwnedProcess, ...]:
        self.started.append((services, run, candidate_sha))
        pid = 5000 + len(self.started)
        records = []
        for service in services:
            values = dict(
                repository_key=run.repository_key,
                candidate_sha=candidate_sha,
                pid=pid,
                port=service.port,
                health_url=service.health_url,
                run_id=run.run_id,
                owner_token=self.owner_token,
            )
            if "start_identity" in OwnedProcess.__dataclass_fields__:
                values["start_identity"] = f"fake-start-{pid}"
            records.append(OwnedProcess(**values))
        return tuple(records)

    def stop(
        self,
        record: OwnedProcess,
        *,
        run_id: str,
        repository_key: str,
        candidate_sha: str,
    ) -> None:
        self.stopped.append((record, run_id, repository_key, candidate_sha))


class SelfReportingFakeRunner:
    def verify(self, repository_key, expected_sha, cwd, *, argv):
        raise AssertionError("untrusted runner must never be called")

    def run(self, repository_key, candidate_shas, argv, cwd):
        raise AssertionError("untrusted runner must never be called")


class SelfReportingConcreteRunner(LocalExactShaCommandRunner):
    def verify(self, repository_key, expected_sha, cwd, *, argv):
        return ExactShaVerification(repository_key, expected_sha, expected_sha, argv)

    def run(self, repository_key, candidate_shas, argv, cwd):
        return ExactShaCommandResult(True, candidate_shas)


class MutableClosedCommandBackend:
    def __init__(self, manifest) -> None:
        self.heads = {
            repository.local_path: SHA[key]
            for key, repository in manifest.repositories.items()
        }
        self.calls: list[tuple[tuple[str, ...], Path]] = []
        self.command_hook = None

    def run(self, argv: tuple[str, ...], cwd: Path) -> ClosedCommandResult:
        self.calls.append((argv, cwd))
        if argv == ("git", "rev-parse", "HEAD"):
            return ClosedCommandResult(0, self.heads[cwd] + "\n", "")
        if self.command_hook is not None:
            self.command_hook(argv, cwd)
        return ClosedCommandResult(0, "", "")


class GenericWorkflowTests(unittest.TestCase):
    def setUp(self) -> None:
        self.manifest = load_manifest(FIXTURE)
        self.store = FakeWorkflowStore(self.manifest)
        self.store.add_blank("PRO-101")
        self.store.add_blank("PRO-102")
        self.store.add_blank("PRO-103")
        self.github = FakeGitHub(self.store.events)
        self.workflow = GenericWorkflow(
            self.manifest,
            self.store,
            self.store,
            github=self.github,
        )

    def test_parent_intake_dispatches_only_first_topological_wave(self):
        result = self.workflow.handle_parent_event(
            "PRO-101",
            affected=frozenset({"api", "web"}),
        )

        self.assertEqual(result.created_children, (("api", "implementation"),))
        self.assertEqual(result.parent_status, "in_progress")
        created = [event for event in self.store.events if event[0] == "create"]
        self.assertEqual(created[0][2][0].stage_ordinal, 1)

    def test_successful_child_creation_with_unobservable_reread_is_not_overwritten(self):
        self.store.fail_reads_after_create = True

        result = self.workflow.handle_parent_event(
            "PRO-101",
            affected=frozenset({"api"}),
        )

        state = self.store.states["PRO-101"]
        self.assertEqual(result.next_action, "uncertain")
        self.assertEqual(state.metadata.stage_ordinal, 1)
        self.assertEqual(len(state.children), 1)
        self.assertFalse(any(event[0] == "status" for event in self.store.events))

    def test_direct_parent_event_cannot_bootstrap_without_authoritative_transition(self):
        self.store.add_blank("PRO-104", authorized=False)

        result = self.workflow.handle_parent_event(
            "PRO-104",
            affected=frozenset({"api"}),
        )

        self.assertEqual(result.next_action, "noop")
        self.assertFalse(
            any(event[0] == "initialize" and event[1] == "PRO-104" for event in self.store.events)
        )

    def test_status_handler_records_authoritative_transition_before_intake(self):
        self.store.add_blank("PRO-104", authorized=False)
        resolver = FakeScopeResolver(ScopeResolution(affected=frozenset({"api"})))
        workflow = GenericWorkflow(
            self.manifest,
            self.store,
            self.store,
            github=self.github,
            scope_resolver=resolver,
        )

        result = workflow.handle_status_change("PRO-104", "backlog", "todo")

        event_kinds = [event[0] for event in self.store.events]
        self.assertLess(
            event_kinds.index("record-intake-transition"),
            event_kinds.index("initialize"),
        )
        self.assertEqual(result.created_children, (("api", "implementation"),))

    def test_only_backlog_to_todo_starts_intake(self):
        dispatch = self.workflow.handle_status_change("PRO-101", "backlog", "todo")
        noop = self.workflow.handle_status_change("PRO-102", "todo", "in_progress")

        self.assertEqual(dispatch.next_action, "dispatch")
        self.assertEqual(noop.next_action, "noop")
        self.assertFalse(any(event[0] == "initialize" and event[1] == "PRO-102" for event in self.store.events))

    def test_parent_intake_rejects_repository_project_issues(self):
        repository_project = self.manifest.repositories["api"].project_title
        self.store.states["PRO-101"] = replace(
            self.store.states["PRO-101"],
            project_key=repository_project,
        )

        status_result = self.workflow.handle_status_change(
            "PRO-101", "backlog", "todo"
        )
        direct_result = self.workflow.handle_parent_event(
            "PRO-101", affected=frozenset({"api"})
        )

        self.assertEqual(status_result.next_action, "noop")
        self.assertEqual(direct_result.next_action, "noop")
        self.assertFalse(any(event[0] == "initialize" for event in self.store.events))

    def test_backlog_to_todo_uses_injected_scope_resolution_for_real_intake(self):
        resolver = FakeScopeResolver(
            ScopeResolution(affected=frozenset({"api", "web"}))
        )
        workflow = GenericWorkflow(
            self.manifest,
            self.store,
            self.store,
            github=self.github,
            scope_resolver=resolver,
        )

        result = workflow.handle_status_change("PRO-101", "backlog", "todo")
        ignored = workflow.handle_status_change("PRO-102", "todo", "in_progress")

        self.assertEqual(result.created_children, (("api", "implementation"),))
        self.assertEqual(resolver.calls, ["PRO-101"])
        self.assertEqual(ignored.next_action, "noop")

    def test_ambiguous_outside_or_dependency_incomplete_scope_waits_for_human(self):
        ambiguous = self.workflow.handle_parent_event(
            "PRO-101",
            affected_candidates=(frozenset({"api"}), frozenset({"api", "web"})),
        )
        outside = self.workflow.handle_parent_event(
            "PRO-102",
            affected=frozenset({"billing"}),
        )
        incomplete = self.workflow.handle_parent_event(
            "PRO-103",
            affected=frozenset({"web"}),
        )

        self.assertEqual(ambiguous.next_action, "human-clarification")
        self.assertEqual(outside.next_action, "human-clarification")
        self.assertEqual(incomplete.next_action, "human-clarification")

    def test_initialized_parent_waits_for_new_authority_instead_of_resuming_work(self):
        self.workflow.handle_parent_event(
            "PRO-101",
            affected=frozenset({"api", "web"}),
        )

        result = self.workflow.handle_parent_event(
            "PRO-101",
            authority_requirements=("new-secret-recipient",),
        )

        self.assertEqual(result.next_action, "human-clarification")
        self.assertTrue(self.store.states["PRO-101"].human_wait)

    def test_coordinator_action_key_covers_ordinal_candidates_and_contracts(self):
        inputs = dict(
            workflow_version=1,
            instance_key="sample-commerce",
            parent_identifier="PRO-101",
            stage_kind="implementation",
            stage_ordinal=2,
            attempt=0,
            affected_repositories=frozenset({"api", "web"}),
            candidate_shas={"api": SHA["api"]},
            contract_hashes={"api": "f" * 40},
        )

        first = coordinator_action_key(**inputs)
        second = coordinator_action_key(**inputs)
        changed = coordinator_action_key(**{**inputs, "stage_ordinal": 3})

        self.assertEqual(first, second)
        self.assertRegex(first, r"^dispatch:[0-9a-f]{64}$")
        self.assertNotEqual(first, changed)

    def test_repeated_intake_with_active_successor_is_noop(self):
        self.workflow.handle_parent_event("PRO-101", affected=frozenset({"api", "web"}))
        before = len([event for event in self.store.events if event[0] == "create"])

        result = self.workflow.handle_parent_event(
            "PRO-101",
            affected=frozenset({"api", "web"}),
        )

        self.assertEqual(result.next_action, "noop")
        self.assertEqual(len([event for event in self.store.events if event[0] == "create"]), before)

    def test_event_entrypoints_fail_closed_without_mutation_for_future_child_relationship(self):
        snapshot = passing_snapshot()
        future_child = WorkflowChild(
            "PRO-101-FUTURE", "api", "api", "", "review", 6, 0,
            "in_progress", "review:" + "b" * 64, True,
        )
        entrypoints = {
            "status callback": lambda: self.workflow.handle_status_change(
                "PRO-101", "backlog", "todo"
            ),
            "parent event": lambda: self.workflow.handle_parent_event(
                "PRO-101", affected=frozenset({"api", "web"})
            ),
        }

        for entrypoint, invoke in entrypoints.items():
            with self.subTest(entrypoint=entrypoint):
                self.store.add_state(
                    "PRO-101",
                    snapshot,
                    status="todo" if entrypoint == "status callback" else "in_progress",
                    children=(future_child,),
                    pull_requests=pull_request_targets(),
                )
                before = self.store.states["PRO-101"]
                self.store.events.clear()

                result = invoke()

                self.assertEqual(result.parent_status, "blocked")
                self.assertEqual(result.next_action, "block")
                self.assertIn("child relationship", result.reason)
                self.assertEqual(result.mutation_count, 0)
                self.assertEqual(self.store.states["PRO-101"], before)
                self.assertFalse(
                    any(
                        event[0]
                        in {
                            "record-intake-transition",
                            "initialize",
                            "human",
                            "create",
                            "status",
                        }
                        for event in self.store.events
                    )
                )

    def test_replayed_intake_action_key_is_noop_even_before_metadata_is_visible(self):
        key = coordinator_action_key(
            workflow_version=1,
            instance_key="sample-commerce",
            parent_identifier="PRO-101",
            stage_kind="intake",
            stage_ordinal=0,
            attempt=0,
            affected_repositories=frozenset({"api"}),
            candidate_shas={},
            contract_hashes={},
        )
        self.store.states["PRO-101"] = replace(
            self.store.states["PRO-101"],
            applied_action_keys=frozenset({key}),
        )

        result = self.workflow.handle_parent_event(
            "PRO-101",
            affected=frozenset({"api"}),
        )

        self.assertEqual(result.next_action, "noop")
        self.assertFalse(any(event[0] == "initialize" for event in self.store.events))

    def test_terminal_duplicate_without_authoritative_evidence_is_not_recreated(self):
        snapshot = ParentSnapshot(affected_repositories=("api",))
        duplicate = WorkflowChild(
            "PRO-101-OLD",
            "api",
            "api",
            "",
            "implementation",
            1,
            0,
            "done",
            "dispatch:" + "0" * 64,
            False,
        )
        self.store.add_state("PRO-101", snapshot, children=(duplicate,))

        result = self.workflow.resume_parent("PRO-101")

        self.assertEqual(result.next_action, "noop")
        self.assertFalse(any(event[0] == "create" for event in self.store.events))

    def test_api_completion_is_verified_done_then_resumes_and_dispatches_web(self):
        self.workflow.handle_parent_event("PRO-101", affected=frozenset({"api", "web"}))
        self.store.events.clear()

        result = self.workflow.record_phase_completion(completion_for("api"))

        self.assertEqual(result.completed_child_status, "done")
        self.assertEqual(result.created_children, (("web", "implementation"),))
        order = [event[0] for event in self.store.events]
        self.assertLess(order.index("write-completion"), order.index("read-completion"))
        self.assertLess(order.index("read-completion"), order.index("done"))
        self.assertLess(order.index("done"), order.index("create"))

    def test_gate_stage_has_independent_repository_and_integration_children(self):
        self.workflow.handle_parent_event("PRO-101", affected=frozenset({"api", "web"}))
        self.workflow.record_phase_completion(completion_for("api"))

        result = self.workflow.record_phase_completion(completion_for("web"))

        self.assertEqual(
            result.created_children,
            (
                ("api", "review"),
                ("api", "qa"),
                ("web", "review"),
                ("web", "qa"),
                ("web-api", "integration_qa"),
            ),
        )

    def test_gate_dispatch_uses_typed_phase_not_decision_reason_wording(self):
        snapshot = replace(passing_snapshot(), reviews={}, qa={}, integration_qa={})
        self.store.add_state(
            "PRO-101",
            snapshot,
            pull_requests=pull_request_targets(),
        )
        typed_decision = ParentDecision(
            DecisionKind.DISPATCH,
            "wording deliberately contains no phase hint",
            ("api", "web"),
            dispatch_kind=DispatchKind.GATES,
        )

        with patch(
            "tools.multica_delivery.workflow.decide_parent_action",
            return_value=typed_decision,
        ):
            result = self.workflow.resume_parent("PRO-101")

        self.assertEqual(result.created_children[0], ("api", "review"))
        self.assertNotIn(("api", "implementation"), result.created_children)

    def test_independent_gate_completions_have_distinct_action_keys(self):
        self.workflow.handle_parent_event("PRO-101", affected=frozenset({"api", "web"}))
        self.workflow.record_phase_completion(completion_for("api"))
        self.workflow.record_phase_completion(completion_for("web"))
        self.store.events.clear()

        self.workflow.record_phase_completion(completion_for("api", phase="review"))
        self.workflow.record_phase_completion(completion_for("web", phase="review"))

        keys = [event[2] for event in self.store.events if event[0] == "write-completion"]
        self.assertEqual(len(keys), 2)
        self.assertNotEqual(keys[0], keys[1])

    def test_failed_phase_is_done_but_parent_repairs_existing_pr(self):
        snapshot = passing_snapshot()
        snapshot = replace(
            snapshot,
            reviews={**snapshot.reviews, "web": RepositoryEvidence(SHA["web"], "pending")},
        )
        review_child = WorkflowChild(
            "PRO-101-REVIEW",
            "web",
            "web",
            "",
            "review",
            5,
            0,
            "in_progress",
            "review:" + "1" * 64,
            True,
        )
        self.store.add_state(
            "PRO-101",
            snapshot,
            children=(review_child,),
            pull_requests=pull_request_targets(),
        )

        result = self.workflow.record_phase_completion(
            completion_for("web", phase="review", result="fail")
        )

        self.assertEqual(result.completed_child_status, "done")
        self.assertEqual(result.next_action, "repair")
        created = [event for event in self.store.events if event[0] == "create"][-1][2]
        self.assertEqual(created[0].phase, "repair")
        self.assertEqual(created[0].pull_request, pull_request_targets()["web"])

    def test_failed_gate_waits_for_active_stage_sibling_before_one_shared_repair(self):
        snapshot = replace(
            passing_snapshot(),
            reviews={
                "api": RepositoryEvidence(SHA["api"], "pending"),
                "web": RepositoryEvidence(SHA["web"], "pending"),
            },
        )
        children = (
            WorkflowChild(
                "PRO-101-API-REVIEW", "api", "api", "", "review", 5, 0,
                "in_progress", "review:" + "1" * 64, True,
            ),
            WorkflowChild(
                "PRO-101-WEB-REVIEW", "web", "web", "", "review", 5, 0,
                "in_progress", "review:" + "1" * 64, True,
            ),
        )
        self.store.add_state(
            "PRO-101", snapshot, children=children,
            pull_requests=pull_request_targets(),
        )

        first = self.workflow.record_phase_completion(
            completion_for("web", phase="review", result="fail")
        )
        creates_after_first = len(
            [event for event in self.store.events if event[0] == "create"]
        )
        second = self.workflow.record_phase_completion(
            completion_for("api", phase="review", result="pass")
        )

        self.assertEqual(first.next_action, "wait")
        self.assertEqual(creates_after_first, 0)
        self.assertEqual(second.next_action, "repair")
        self.assertEqual(second.created_children, (("web", "repair"),))

    def test_direct_resume_waits_for_current_stage_before_one_shared_repair(self):
        snapshot = replace(
            passing_snapshot(),
            reviews={
                "api": RepositoryEvidence(SHA["api"], "pass"),
                "web": RepositoryEvidence(SHA["web"], "fail"),
            },
        )
        children = (
            WorkflowChild(
                "PRO-101-WEB-REVIEW", "web", "web", "", "review", 5, 0,
                "done", "review:" + "1" * 64, False,
            ),
            WorkflowChild(
                "PRO-101-API-REVIEW", "api", "api", "", "review", 5, 0,
                "in_progress", "review:" + "2" * 64, True,
            ),
        )
        self.store.add_state(
            "PRO-101",
            snapshot,
            children=children,
            pull_requests=pull_request_targets(),
        )

        waiting = self.workflow.resume_parent("PRO-101")

        self.assertEqual(waiting.next_action, "wait")
        self.assertEqual(waiting.mutation_count, 0)
        self.assertEqual(
            [event for event in self.store.events if event[0] == "create"],
            [],
        )
        self.assertEqual(self.store.states["PRO-101"].snapshot.attempt, 0)

        state = self.store.states["PRO-101"]
        self.store.states["PRO-101"] = replace(
            state,
            children=(state.children[0], replace(state.children[1], status="done", active=False)),
        )
        repaired = self.workflow.resume_parent("PRO-101")

        self.assertEqual(repaired.next_action, "repair")
        self.assertEqual(repaired.created_children, (("web", "repair"),))
        self.assertEqual(self.store.states["PRO-101"].snapshot.attempt, 1)
        self.assertEqual(
            len([event for event in self.store.events if event[0] == "create"]),
            1,
        )

    def test_direct_resume_treats_each_current_stage_activity_signal_as_active(self):
        snapshot = replace(
            passing_snapshot(),
            reviews={
                "api": RepositoryEvidence(SHA["api"], "pass"),
                "web": RepositoryEvidence(SHA["web"], "fail"),
            },
        )
        terminal_failure = WorkflowChild(
            "PRO-101-WEB-REVIEW", "web", "web", "", "review", 5, 0,
            "done", "review:" + "3" * 64, False,
        )
        activity_signals = {
            "active marker": (
                WorkflowChild(
                    "PRO-101-API-REVIEW", "api", "api", "", "review", 5, 0,
                    "done", "review:" + "4" * 64, True,
                ),
                False,
            ),
            "active status": (
                WorkflowChild(
                    "PRO-101-API-REVIEW", "api", "api", "", "review", 5, 0,
                    "in_review", "review:" + "4" * 64, False,
                ),
                False,
            ),
            "non-terminal backlog status": (
                WorkflowChild(
                    "PRO-101-API-REVIEW", "api", "api", "", "review", 5, 0,
                    "backlog", "review:" + "4" * 64, False,
                ),
                False,
            ),
            "parent active work": (
                WorkflowChild(
                    "PRO-101-API-REVIEW", "api", "api", "", "review", 5, 0,
                    "done", "review:" + "4" * 64, False,
                ),
                True,
            ),
        }

        for signal, (sibling, active_work) in activity_signals.items():
            with self.subTest(signal=signal):
                self.store.add_state(
                    "PRO-101",
                    snapshot,
                    children=(terminal_failure, sibling),
                    pull_requests=pull_request_targets(),
                    active_work=active_work,
                )
                self.store.events.clear()

                result = self.workflow.resume_parent("PRO-101")

                self.assertEqual(result.next_action, "wait")
                self.assertEqual(result.mutation_count, 0)
                self.assertFalse(
                    any(event[0] == "create" for event in self.store.events)
                )
                self.assertEqual(self.store.states["PRO-101"].snapshot.attempt, 0)

    def test_direct_resume_ignores_children_from_historical_stage_or_attempt(self):
        cases = (
            ("older ordinal", 0, 4, 0, 1),
            ("older attempt", 1, 5, 0, 2),
        )
        for label, attempt, old_ordinal, old_attempt, expected_attempt in cases:
            with self.subTest(case=label):
                snapshot = replace(
                    passing_snapshot(),
                    attempt=attempt,
                    reviews={
                        "api": RepositoryEvidence(SHA["api"], "pass"),
                        "web": RepositoryEvidence(SHA["web"], "fail"),
                    },
                )
                failed_current = WorkflowChild(
                    "PRO-101-WEB-REVIEW", "web", "web", "", "review", 5, attempt,
                    "done", "review:" + "5" * 64, False,
                )
                historical = WorkflowChild(
                    "PRO-101-OLD", "api", "api", "", "review", old_ordinal, old_attempt,
                    "in_progress", "review:" + "6" * 64, True,
                )
                self.store.add_state(
                    "PRO-101",
                    snapshot,
                    children=(failed_current, historical),
                    pull_requests=pull_request_targets(),
                )
                self.store.events.clear()

                result = self.workflow.resume_parent("PRO-101")

                self.assertEqual(result.next_action, "repair")
                self.assertEqual(result.created_children, (("web", "repair"),))
                self.assertEqual(
                    self.store.states["PRO-101"].snapshot.attempt,
                    expected_attempt,
                )

    def test_direct_resume_fails_closed_without_mutation_for_future_child_relationship(self):
        snapshot = replace(
            passing_snapshot(),
            reviews={
                "api": RepositoryEvidence(SHA["api"], "pass"),
                "web": RepositoryEvidence(SHA["web"], "fail"),
            },
        )
        terminal_failure = WorkflowChild(
            "PRO-101-WEB-REVIEW", "web", "web", "", "review", 5, 0,
            "done", "review:" + "9" * 64, False,
        )
        future_relationships = {
            "future Stage ordinal": WorkflowChild(
                "PRO-101-FUTURE", "api", "api", "", "review", 6, 0,
                "in_progress", "review:" + "a" * 64, True,
            ),
            "future current-Stage attempt": WorkflowChild(
                "PRO-101-FUTURE", "api", "api", "", "review", 5, 1,
                "in_progress", "review:" + "a" * 64, True,
            ),
        }

        for relationship, future_child in future_relationships.items():
            with self.subTest(relationship=relationship):
                self.store.add_state(
                    "PRO-101",
                    snapshot,
                    children=(terminal_failure, future_child),
                    pull_requests=pull_request_targets(),
                )
                before = self.store.states["PRO-101"]
                self.store.events.clear()

                result = self.workflow.resume_parent("PRO-101")

                self.assertEqual(result.parent_status, "blocked")
                self.assertEqual(result.next_action, "block")
                self.assertIn("child relationship", result.reason)
                self.assertEqual(result.mutation_count, 0)
                self.assertEqual(self.store.states["PRO-101"], before)
                self.assertFalse(
                    any(
                        event[0] in {"create", "status", "merge-state", "write-smoke"}
                        for event in self.store.events
                    )
                )

    def test_failed_implementation_is_done_and_repairs_its_existing_pr(self):
        self.workflow.handle_parent_event("PRO-101", affected=frozenset({"api"}))

        result = self.workflow.record_phase_completion(
            completion_for("api", result="fail")
        )

        self.assertEqual(result.completed_child_status, "done")
        self.assertEqual(result.next_action, "repair")
        created = [event for event in self.store.events if event[0] == "create"][-1][2]
        self.assertEqual(created[0].phase, "repair")
        self.assertEqual(created[0].pull_request.url, completion_for("api").pull_request_url)

    def test_replacement_sha_keeps_pr_and_invalidates_all_affected_gates(self):
        snapshot = passing_snapshot()
        snapshot = replace(
            snapshot,
            reviews={**snapshot.reviews, "web": RepositoryEvidence(SHA["web"], "fail")},
        )
        self.store.add_state(
            "PRO-101",
            snapshot,
            pull_requests=pull_request_targets(),
        )
        repair = self.workflow.resume_parent("PRO-101")
        self.assertEqual(repair.next_action, "repair")

        result = self.workflow.record_phase_completion(
            completion_for("web", phase="repair", attempt=1, sha=REPLACEMENT_SHA)
        )

        state = self.store.states["PRO-101"]
        self.assertEqual(state.pull_requests["web"].url, pull_request_targets()["web"].url)
        self.assertEqual(state.snapshot.candidate_shas["web"], REPLACEMENT_SHA)
        self.assertEqual(
            state.snapshot.reviews["web"],
            RepositoryEvidence(REPLACEMENT_SHA, "pending"),
        )
        self.assertEqual(
            state.snapshot.reviews["api"],
            RepositoryEvidence(SHA["api"], "pending"),
        )
        self.assertEqual(
            state.snapshot.qa["web"],
            RepositoryEvidence(REPLACEMENT_SHA, "pending"),
        )
        self.assertEqual(
            state.snapshot.qa["api"],
            RepositoryEvidence(SHA["api"], "pending"),
        )
        self.assertEqual(
            dict(state.snapshot.integration_qa["web-api"].candidate_shas),
            {"api": SHA["api"], "web": REPLACEMENT_SHA},
        )
        self.assertEqual(result.next_action, "dispatch")
        self.assertEqual(
            result.created_children,
            (
                ("api", "review"),
                ("api", "qa"),
                ("web", "review"),
                ("web", "qa"),
                ("web-api", "integration_qa"),
            ),
        )

    def test_replacement_blocks_if_effect_does_not_authoritatively_invalidate_all_gates(self):
        snapshot = passing_snapshot()
        snapshot = replace(
            snapshot,
            reviews={**snapshot.reviews, "web": RepositoryEvidence(SHA["web"], "fail")},
        )
        self.store.add_state(
            "PRO-101",
            snapshot,
            pull_requests=pull_request_targets(),
        )
        self.workflow.resume_parent("PRO-101")
        self.store.retain_gates_on_replacement = True

        result = self.workflow.record_phase_completion(
            completion_for("web", phase="repair", attempt=1, sha=REPLACEMENT_SHA)
        )

        self.assertEqual(result.completed_child_status, "done")
        self.assertEqual(result.parent_status, "blocked")
        self.assertEqual(result.next_action, "block")

    def test_stale_qa_evidence_never_merges(self):
        snapshot = passing_snapshot()
        snapshot = replace(
            snapshot,
            qa={**snapshot.qa, "web": RepositoryEvidence(SHA["web"], "pending")},
        )
        qa_child = WorkflowChild(
            "PRO-101-QA",
            "web",
            "web",
            "",
            "qa",
            5,
            0,
            "in_progress",
            "qa:" + "2" * 64,
            True,
        )
        self.store.add_state(
            "PRO-101",
            snapshot,
            children=(qa_child,),
            pull_requests=pull_request_targets(),
        )

        result = self.workflow.record_phase_completion(
            completion_for("web", phase="qa", sha=REPLACEMENT_SHA)
        )

        self.assertEqual(result.parent_status, "in_progress")
        self.assertEqual(result.next_action, "repair")
        self.assertEqual(self.github.merged, [])

    def test_stale_integration_qa_is_rejected_before_child_completion(self):
        snapshot = passing_snapshot()
        snapshot = replace(
            snapshot,
            integration_qa={
                "web-api": GateEvidence(snapshot.candidate_shas, "pending")
            },
        )
        integration_child = WorkflowChild(
            "PRO-101-INTEGRATION",
            "web-api",
            "web",
            "web-api",
            "integration_qa",
            5,
            0,
            "in_progress",
            "qa:" + "8" * 64,
            True,
        )
        self.store.add_state(
            "PRO-101",
            snapshot,
            children=(integration_child,),
            pull_requests=pull_request_targets(),
        )

        result = self.workflow.record_phase_completion(
            completion_for(
                "web",
                phase="integration_qa",
                suite_key="web-api",
                sha=REPLACEMENT_SHA,
                candidate_shas={"api": SHA["api"], "web": REPLACEMENT_SHA},
            )
        )

        self.assertIsNone(result.completed_child_status)
        self.assertEqual(result.next_action, "block")
        self.assertNotIn("done", [event[0] for event in self.store.events])

    def test_integration_qa_completion_must_name_suite_command_repository(self):
        snapshot = replace(
            passing_snapshot(),
            integration_qa={
                "web-api": GateEvidence(passing_snapshot().candidate_shas, "pending")
            },
        )
        integration_child = WorkflowChild(
            "PRO-101-INTEGRATION",
            "web-api",
            "web",
            "web-api",
            "integration_qa",
            5,
            0,
            "in_progress",
            "qa:" + "8" * 64,
            True,
        )
        self.store.add_state(
            "PRO-101",
            snapshot,
            children=(integration_child,),
            pull_requests=pull_request_targets(),
        )

        result = self.workflow.record_phase_completion(
            completion_for(
                "api",
                phase="integration_qa",
                suite_key="web-api",
                candidate_shas=dict(snapshot.candidate_shas),
            )
        )

        self.assertEqual(result.parent_status, "blocked")
        self.assertNotIn("done", [event[0] for event in self.store.events])

    def test_completion_reread_mismatch_blocks_before_child_done(self):
        self.workflow.handle_parent_event("PRO-101", affected=frozenset({"api"}))
        self.store.corrupt_completion_read = True

        result = self.workflow.record_phase_completion(completion_for("api"))

        self.assertEqual(result.parent_status, "blocked")
        self.assertIsNone(result.completed_child_status)
        self.assertNotIn("done", [event[0] for event in self.store.events])

    def test_successful_child_done_with_unobservable_parent_read_is_not_overwritten(self):
        self.workflow.handle_parent_event("PRO-101", affected=frozenset({"api"}))
        self.store.events.clear()
        self.store.fail_reads_after_done = True

        result = self.workflow.record_phase_completion(completion_for("api"))

        state = self.store.states["PRO-101"]
        self.assertEqual(result.next_action, "uncertain")
        self.assertEqual(state.children[0].status, "done")
        self.assertFalse(any(event[0] == "status" for event in self.store.events))

    def test_completion_rereads_unchanged_parent_metadata_before_child_done(self):
        self.workflow.handle_parent_event("PRO-101", affected=frozenset({"api"}))
        self.store.events.clear()
        self.store.change_after_completion_read = True

        result = self.workflow.record_phase_completion(completion_for("api"))

        self.assertEqual(result.parent_status, "blocked")
        self.assertIsNone(result.completed_child_status)
        self.assertNotIn("done", [event[0] for event in self.store.events])

    def test_merge_stops_before_first_changed_head(self):
        self.store.add_state(
            "PRO-101",
            passing_snapshot(),
            pull_requests=pull_request_targets(),
        )
        self.github.heads["api"] = "f" * 40

        result = self.workflow.execute_merge_plan("PRO-101")

        self.assertEqual(result.parent_status, "blocked")
        self.assertEqual(self.github.merged, [])
        self.assertEqual(
            [event[1] for event in self.store.events if event[0] == "github-read-pr"],
            ["api", "web"],
        )

    def test_direct_merge_waits_without_mutation_for_active_current_stage(self):
        active_child = WorkflowChild(
            "PRO-101-REVIEW", "api", "api", "", "review", 5, 0,
            "in_review", "review:" + "7" * 64, True,
        )
        self.store.add_state(
            "PRO-101",
            passing_snapshot(),
            children=(active_child,),
            pull_requests=pull_request_targets(),
        )
        self.store.events.clear()

        result = self.workflow.execute_merge_plan("PRO-101")

        self.assertEqual(result.next_action, "wait")
        self.assertEqual(result.mutation_count, 0)
        self.assertEqual(self.github.merged, [])
        self.assertFalse(
            any(event[0] in {"merge-state", "github-merge"} for event in self.store.events)
        )

    def test_merge_preflights_every_pr_before_first_mutation(self):
        self.store.add_state(
            "PRO-101",
            passing_snapshot(),
            pull_requests=pull_request_targets(),
        )

        self.workflow.execute_merge_plan("PRO-101")

        event_names = [event[0] for event in self.store.events]
        first_mutation = event_names.index("merge-state")
        self.assertLess(event_names.index("github-read-pr"), first_mutation)
        self.assertEqual(event_names[:first_mutation].count("github-read-pr"), 2)
        self.assertEqual(event_names[:first_mutation].count("github-read-checks"), 2)

    def test_premerged_strict_subset_blocks_without_more_merges(self):
        snapshot = passing_snapshot()
        snapshot = replace(
            snapshot,
            merged_shas={"api": SHA["api"]},
            pull_requests={
                **snapshot.pull_requests,
                "api": PullRequestEvidence(
                    SHA["api"],
                    "merged",
                    True,
                    True,
                    SHA["api"],
                ),
            },
        )
        self.store.add_state(
            "PRO-101",
            snapshot,
            pull_requests=pull_request_targets(),
        )

        result = self.workflow.execute_merge_plan("PRO-101")

        self.assertEqual(result.parent_status, "blocked")
        self.assertEqual(self.github.merged, [])

    def test_mid_sequence_merge_failure_records_partial_merge_and_stops(self):
        self.store.add_state(
            "PRO-101",
            passing_snapshot(),
            pull_requests=pull_request_targets(),
        )
        self.github.fail_on = "web"

        result = self.workflow.execute_merge_plan("PRO-101")

        self.assertEqual(result.parent_status, "blocked")
        self.assertEqual(result.merge_state, "partial")
        self.assertEqual(self.github.merged, [("codeExploreHub/sample-commerce-api", 12)])
        self.assertEqual(self.store.rollback_calls, [])

    def test_commit_then_error_rereads_merged_pr_and_records_exact_prefix(self):
        self.store.add_state(
            "PRO-101", passing_snapshot(), pull_requests=pull_request_targets()
        )
        self.github.commit_then_error_on = "api"
        self.github.merged_shas["api"] = "1" * 40

        result = self.workflow.execute_merge_plan("PRO-101")

        self.assertEqual(result.merge_state, "merged")
        progress = [
            event for event in self.store.events
            if event[0] == "merge-state" and event[1] == "merging" and event[2]
        ]
        self.assertEqual(progress[0][2], {"api": "1" * 40})
        self.assertEqual(
            dict(self.store.states["PRO-101"].snapshot.merged_shas),
            {"api": "1" * 40, "web": SHA["web"]},
        )

    def test_malformed_merge_ack_rereads_merged_pr_before_recording_progress(self):
        self.store.add_state(
            "PRO-101", passing_snapshot(), pull_requests=pull_request_targets()
        )
        self.github.malformed_ack_on = "api"
        self.github.merged_shas["api"] = "2" * 40

        result = self.workflow.execute_merge_plan("PRO-101")

        self.assertEqual(result.merge_state, "merged")
        self.assertEqual(
            self.store.states["PRO-101"].snapshot.merged_shas["api"],
            "2" * 40,
        )

    def test_valid_merge_ack_cannot_replace_authoritative_merged_pr_read(self):
        self.store.add_state(
            "PRO-101", passing_snapshot(), pull_requests=pull_request_targets()
        )
        self.github.ack_without_commit_on = "api"

        result = self.workflow.execute_merge_plan("PRO-101")

        self.assertEqual(result.next_action, "block")
        self.assertEqual(self.store.states["PRO-101"].snapshot.merged_shas, {})

    def test_unreadable_post_merge_state_is_uncertain_not_assumed_uncommitted(self):
        self.store.add_state(
            "PRO-101", passing_snapshot(), pull_requests=pull_request_targets()
        )
        self.github.fail_merged_reread_on = "api"

        result = self.workflow.execute_merge_plan("PRO-101")

        self.assertEqual(result.next_action, "uncertain")
        self.assertEqual(
            self.store.states["PRO-101"].snapshot.merge_state, "merging"
        )
        self.assertFalse(any(event[0] == "status" for event in self.store.events))

    def test_retry_recovers_commit_after_immediate_authoritative_read_is_unavailable(self):
        self.store.add_state(
            "PRO-101", passing_snapshot(), pull_requests=pull_request_targets()
        )
        api_merge_sha = "1" * 40
        web_merge_sha = "2" * 40
        self.github.merged_shas = {
            "api": api_merge_sha,
            "web": web_merge_sha,
        }
        self.github.fail_merged_rereads_remaining["api"] = 1

        first = self.workflow.execute_merge_plan("PRO-101")
        second = self.workflow.execute_merge_plan("PRO-101")

        self.assertEqual(first.next_action, "uncertain")
        self.assertEqual(second.merge_state, "merged")
        self.assertEqual(
            self.github.merged.count(("codeExploreHub/sample-commerce-api", 12)),
            1,
        )
        self.assertEqual(
            dict(self.store.states["PRO-101"].snapshot.merged_shas),
            {"api": api_merge_sha, "web": web_merge_sha},
        )

    def test_resumed_merge_unavailable_prefix_read_is_uncertain_without_mutation(self):
        self.store.add_state(
            "PRO-101", merging_snapshot(), pull_requests=pull_request_targets()
        )
        self.github.read_failures_remaining["api"] = 1

        result = self.workflow.execute_merge_plan("PRO-101")

        self.assertEqual(result.next_action, "uncertain")
        self.assertEqual(
            dict(self.store.states["PRO-101"].snapshot.merged_shas),
            {},
        )
        self.assertEqual(self.github.merged, [])
        self.assertFalse(
            any(
                event[0] in {"merge-state", "status", "github-merge"}
                for event in self.store.events
            )
        )

    def test_resumed_merge_malformed_prefix_read_is_uncertain_without_mutation(self):
        self.store.add_state(
            "PRO-101", merging_snapshot(), pull_requests=pull_request_targets()
        )
        self.github.malformed_read_on = "api"

        result = self.workflow.execute_merge_plan("PRO-101")

        self.assertEqual(result.next_action, "uncertain")
        self.assertEqual(self.github.merged, [])
        self.assertFalse(any(event[0] == "merge-state" for event in self.store.events))

    def test_resumed_merge_wrong_candidate_head_is_uncertain_without_mutation(self):
        self.store.add_state(
            "PRO-101", merging_snapshot(), pull_requests=pull_request_targets()
        )
        self.github.heads["api"] = "f" * 40

        result = self.workflow.execute_merge_plan("PRO-101")

        self.assertEqual(result.next_action, "uncertain")
        self.assertEqual(self.github.merged, [])
        self.assertFalse(any(event[0] == "merge-state" for event in self.store.events))

    def test_resumed_merge_missing_remote_merge_sha_is_uncertain_without_mutation(self):
        self.store.add_state(
            "PRO-101", merging_snapshot(), pull_requests=pull_request_targets()
        )
        self.github.committed.add("api")
        self.github.missing_merge_sha_on = "api"

        result = self.workflow.execute_merge_plan("PRO-101")

        self.assertEqual(result.next_action, "uncertain")
        self.assertEqual(self.github.merged, [])
        self.assertFalse(any(event[0] == "merge-state" for event in self.store.events))

    def test_resumed_merge_persisted_prefix_longer_than_remote_is_uncertain(self):
        api_merge_sha = "1" * 40
        self.store.add_state(
            "PRO-101",
            merging_snapshot({"api": api_merge_sha}),
            pull_requests=pull_request_targets(),
        )
        self.github.merged_shas["api"] = api_merge_sha

        result = self.workflow.execute_merge_plan("PRO-101")

        self.assertEqual(result.next_action, "uncertain")
        self.assertEqual(
            dict(self.store.states["PRO-101"].snapshot.merged_shas),
            {"api": api_merge_sha},
        )
        self.assertEqual(self.github.merged, [])
        self.assertFalse(any(event[0] == "merge-state" for event in self.store.events))

    def test_resumed_merge_non_contiguous_remote_prefix_is_uncertain(self):
        self.store.add_state(
            "PRO-101", merging_snapshot(), pull_requests=pull_request_targets()
        )
        self.github.committed.add("web")

        result = self.workflow.execute_merge_plan("PRO-101")

        self.assertEqual(result.next_action, "uncertain")
        self.assertEqual(self.github.merged, [])
        self.assertFalse(any(event[0] == "merge-state" for event in self.store.events))

    def test_resumed_merge_recovers_complete_remote_prefix_without_duplicate_merge(self):
        api_merge_sha = "1" * 40
        web_merge_sha = "2" * 40
        self.store.add_state(
            "PRO-101", merging_snapshot(), pull_requests=pull_request_targets()
        )
        self.github.merged_shas = {
            "api": api_merge_sha,
            "web": web_merge_sha,
        }
        self.github.committed.update({"api", "web"})

        result = self.workflow.execute_merge_plan("PRO-101")

        self.assertEqual(result.merge_state, "merged")
        self.assertEqual(self.github.merged, [])
        self.assertEqual(
            dict(self.store.states["PRO-101"].snapshot.merged_shas),
            {"api": api_merge_sha, "web": web_merge_sha},
        )

    def test_all_merges_record_exact_candidate_map_then_route_smoke(self):
        self.store.add_state(
            "PRO-101",
            passing_snapshot(),
            pull_requests=pull_request_targets(),
        )

        result = self.workflow.execute_merge_plan("PRO-101")

        self.assertEqual(result.merge_state, "merged")
        self.assertEqual(result.next_action, "smoke")
        self.assertEqual(
            dict(self.store.states["PRO-101"].snapshot.merged_shas),
            {"api": SHA["api"], "web": SHA["web"]},
        )

    def test_merge_persists_authoritative_merge_shas_for_default_branch_smoke(self):
        self.store.add_state(
            "PRO-101",
            passing_snapshot(),
            pull_requests=pull_request_targets(),
        )
        merged = {"api": "1" * 40, "web": "2" * 40}
        self.github.merged_shas = merged
        smoke = FakeSmokeExecutor(
            passing_smoke(
                observation_id=SMOKE_OBSERVATION["first"],
                shas=merged,
            )
        )
        workflow = GenericWorkflow(
            self.manifest,
            self.store,
            self.store,
            github=self.github,
            smoke_executor=smoke,
        )

        result = workflow.execute_merge_plan("PRO-101")

        self.assertEqual(result.merge_state, "merged")
        self.assertEqual(dict(self.store.states["PRO-101"].snapshot.merged_shas), merged)
        self.assertEqual(smoke.calls[0][2], merged)

    def test_merge_transitions_use_unique_monotonic_keys_and_ordinals(self):
        self.store.add_state(
            "PRO-101",
            passing_snapshot(),
            pull_requests=pull_request_targets(),
        )

        self.workflow.execute_merge_plan("PRO-101")

        writes = [event for event in self.store.events if event[0] == "merge-state"]
        self.assertEqual([event[4] for event in writes], [6, 7, 8, 9])
        self.assertEqual(len({event[3] for event in writes}), 4)

    def test_merge_replay_converges_after_progress_write_read_failure(self):
        self.store.add_state(
            "PRO-101",
            passing_snapshot(),
            pull_requests=pull_request_targets(),
        )
        self.store.inject_merge_progress_read_failure = True

        first = self.workflow.execute_merge_plan("PRO-101")
        ordinal_after_uncertain_write = self.store.states["PRO-101"].metadata.stage_ordinal
        second = self.workflow.execute_merge_plan("PRO-101")

        self.assertEqual(first.next_action, "uncertain")
        self.assertEqual(ordinal_after_uncertain_write, 7)
        self.assertEqual(second.merge_state, "merged")
        self.assertEqual(
            self.github.merged,
            [
                ("codeExploreHub/sample-commerce-api", 12),
                ("codeExploreHub/sample-commerce-web", 14),
            ],
        )
        writes = [event for event in self.store.events if event[0] == "merge-state"]
        ordinals = [event[4] for event in writes]
        self.assertEqual(ordinals, sorted(set(ordinals)))

    def test_remaining_preflight_failure_after_committed_prefix_is_partial_and_replay_noops(self):
        self.store.add_state(
            "PRO-101",
            passing_snapshot(),
            pull_requests=pull_request_targets(),
        )
        authoritative_api_sha = "1" * 40
        self.github.merged_shas["api"] = authoritative_api_sha
        self.store.inject_merge_progress_read_failure = True

        first = self.workflow.execute_merge_plan("PRO-101")
        self.github.checks["web"] = False
        second = self.workflow.execute_merge_plan("PRO-101")
        mutation_events_after_partial = [
            event
            for event in self.store.events
            if event[0] in {"merge-state", "status", "github-merge"}
        ]
        third = self.workflow.execute_merge_plan("PRO-101")

        state = self.store.states["PRO-101"]
        mutation_events_after_replay = [
            event
            for event in self.store.events
            if event[0] in {"merge-state", "status", "github-merge"}
        ]
        self.assertEqual(first.next_action, "uncertain")
        self.assertEqual(second.parent_status, "blocked")
        self.assertEqual(second.merge_state, "partial")
        self.assertEqual(third.next_action, "block")
        self.assertEqual(third.merge_state, "partial")
        self.assertEqual(state.snapshot.merge_state, "partial")
        self.assertEqual(dict(state.snapshot.merged_shas), {"api": authoritative_api_sha})
        self.assertEqual(
            self.github.merged,
            [("codeExploreHub/sample-commerce-api", 12)],
        )
        self.assertEqual(mutation_events_after_replay, mutation_events_after_partial)

    def test_all_merges_start_owned_smoke_when_executor_is_configured(self):
        self.store.add_state(
            "PRO-101",
            passing_snapshot(),
            pull_requests=pull_request_targets(),
        )
        smoke = FakeSmokeExecutor(
            passing_smoke(observation_id=SMOKE_OBSERVATION["first"])
        )
        workflow = GenericWorkflow(
            self.manifest,
            self.store,
            self.store,
            github=self.github,
            smoke_executor=smoke,
        )

        result = workflow.execute_merge_plan("PRO-101")

        self.assertEqual(result.next_action, "smoke")
        self.assertEqual(len(smoke.calls), 1)
        self.assertEqual(len(self.store.states["PRO-101"].snapshot.smoke_reads), 1)

    def test_merged_prs_require_two_authoritative_identical_smoke_reads(self):
        snapshot = passing_snapshot()
        snapshot = replace(
            snapshot,
            merge_state="merged",
            merged_shas=snapshot.candidate_shas,
            pull_requests={
                repository: PullRequestEvidence(sha, "merged", True, True, sha)
                for repository, sha in snapshot.candidate_shas.items()
            },
        )
        self.store.add_state(
            "PRO-101",
            snapshot,
            pull_requests=pull_request_targets(),
        )

        first = self.workflow.resume_parent("PRO-101")
        after_one = self.workflow.record_smoke_read(
            "PRO-101",
            passing_smoke(observation_id=SMOKE_OBSERVATION["first"]),
        )
        after_two = self.workflow.record_smoke_read(
            "PRO-101",
            passing_smoke(observation_id=SMOKE_OBSERVATION["second"]),
        )

        self.assertEqual(first.next_action, "smoke")
        self.assertEqual(after_one.parent_status, "in_progress")
        self.assertEqual(after_one.next_action, "smoke")
        self.assertEqual(after_two.parent_status, "done")

    def test_parent_done_write_read_failure_is_uncertain_without_stale_block(self):
        snapshot = passing_snapshot()
        first_smoke = passing_smoke(observation_id=SMOKE_OBSERVATION["first"])
        second_smoke = passing_smoke(observation_id=SMOKE_OBSERVATION["second"])
        snapshot = replace(
            snapshot,
            merge_state="merged",
            merged_shas=snapshot.candidate_shas,
            pull_requests={
                repository: PullRequestEvidence(sha, "merged", True, True, sha)
                for repository, sha in snapshot.candidate_shas.items()
            },
            smoke_reads=(first_smoke, second_smoke),
        )
        self.store.add_state("PRO-101", snapshot, pull_requests=pull_request_targets())
        self.store.fail_parent_reads_after_parent_done = True
        self.store.events.clear()

        first = self.workflow.resume_parent("PRO-101")
        second = self.workflow.resume_parent("PRO-101")

        state = self.store.states["PRO-101"]
        status_events = [event for event in self.store.events if event[0] == "status"]
        self.assertEqual(first.next_action, "uncertain")
        self.assertEqual(second.next_action, "noop")
        self.assertEqual(state.parent_status, "done")
        self.assertEqual([event[2] for event in status_events], ["done"])
        self.assertIn(state.metadata.last_action, state.applied_action_keys)

    def test_incomplete_parent_done_transition_stays_uncertain_without_rewrite(self):
        snapshot = passing_snapshot()
        first_smoke = passing_smoke(observation_id=SMOKE_OBSERVATION["first"])
        second_smoke = passing_smoke(observation_id=SMOKE_OBSERVATION["second"])
        snapshot = replace(
            snapshot,
            merge_state="merged",
            merged_shas=snapshot.candidate_shas,
            pull_requests={
                repository: PullRequestEvidence(sha, "merged", True, True, sha)
                for repository, sha in snapshot.candidate_shas.items()
            },
            smoke_reads=(first_smoke, second_smoke),
        )
        self.store.add_state("PRO-101", snapshot, pull_requests=pull_request_targets())
        metadata_before = self.store.states["PRO-101"].metadata
        self.store.write_incomplete_parent_done = True
        self.store.events.clear()

        first = self.workflow.resume_parent("PRO-101")
        second = self.workflow.resume_parent("PRO-101")

        state = self.store.states["PRO-101"]
        status_events = [event for event in self.store.events if event[0] == "status"]
        self.assertEqual(first.next_action, "uncertain")
        self.assertEqual(second.next_action, "uncertain")
        self.assertEqual(state.parent_status, "done")
        self.assertEqual(state.metadata, metadata_before)
        self.assertEqual(len(status_events), 1)
        self.assertNotIn(status_events[0][4], state.applied_action_keys)

    def test_smoke_read_must_name_the_exact_authoritative_merged_sha_map(self):
        snapshot = passing_snapshot()
        snapshot = replace(
            snapshot,
            merge_state="merged",
            merged_shas=snapshot.candidate_shas,
            pull_requests={
                repository: PullRequestEvidence(sha, "merged", True, True, sha)
                for repository, sha in snapshot.candidate_shas.items()
            },
        )
        self.store.add_state(
            "PRO-101",
            snapshot,
            pull_requests=pull_request_targets(),
        )
        self.store.events.clear()

        result = self.workflow.record_smoke_read(
            "PRO-101",
            passing_smoke(
                observation_id=SMOKE_OBSERVATION["first"],
                shas={"api": "f" * 40, "web": SHA["web"]},
            ),
        )

        self.assertEqual(result.parent_status, "blocked")
        self.assertFalse(any(event[0] == "write-smoke" for event in self.store.events))

    def test_failed_post_merge_smoke_blocks_without_creating_repair_work(self):
        snapshot = passing_snapshot()
        snapshot = replace(
            snapshot,
            merge_state="merged",
            merged_shas=snapshot.candidate_shas,
            pull_requests={
                repository: PullRequestEvidence(sha, "merged", True, True, sha)
                for repository, sha in snapshot.candidate_shas.items()
            },
        )
        self.store.add_state(
            "PRO-101",
            snapshot,
            pull_requests=pull_request_targets(),
        )
        failed = replace(
            passing_smoke(observation_id=SMOKE_OBSERVATION["first"]),
            repository_results={"api": "pass", "web": "fail"},
        )
        self.store.events.clear()

        result = self.workflow.record_smoke_read("PRO-101", failed)

        self.assertEqual(result.parent_status, "blocked")
        self.assertEqual(result.next_action, "block")
        self.assertFalse(any(event[0] == "create" for event in self.store.events))

    def test_successful_smoke_write_with_unobservable_reread_is_not_overwritten(self):
        snapshot = passing_snapshot()
        snapshot = replace(
            snapshot,
            merge_state="merged",
            merged_shas=snapshot.candidate_shas,
            pull_requests={
                repository: PullRequestEvidence(sha, "merged", True, True, sha)
                for repository, sha in snapshot.candidate_shas.items()
            },
        )
        self.store.add_state("PRO-101", snapshot, pull_requests=pull_request_targets())
        self.store.fail_parent_reads_after_smoke_write = True
        self.store.events.clear()

        result = self.workflow.record_smoke_read(
            "PRO-101",
            passing_smoke(observation_id=SMOKE_OBSERVATION["first"]),
        )

        state = self.store.states["PRO-101"]
        self.assertEqual(result.next_action, "uncertain")
        self.assertEqual(len(state.snapshot.smoke_reads), 1)
        self.assertFalse(any(event[0] == "status" for event in self.store.events))

    def test_committed_smoke_replay_noops_until_a_new_observation_arrives(self):
        snapshot = passing_snapshot()
        snapshot = replace(
            snapshot,
            merge_state="merged",
            merged_shas=snapshot.candidate_shas,
            pull_requests={
                repository: PullRequestEvidence(sha, "merged", True, True, sha)
                for repository, sha in snapshot.candidate_shas.items()
            },
        )
        self.store.add_state("PRO-101", snapshot, pull_requests=pull_request_targets())
        first_observation = passing_smoke(
            observation_id=SMOKE_OBSERVATION["first"]
        )
        second_observation = passing_smoke(
            observation_id=SMOKE_OBSERVATION["second"]
        )
        self.store.fail_parent_reads_after_smoke_write = True
        self.store.events.clear()

        first = self.workflow.record_smoke_read("PRO-101", first_observation)
        committed = self.store.states["PRO-101"]
        committed_ordinal = committed.metadata.stage_ordinal
        committed_action_key = committed.metadata.last_action
        replay = self.workflow.record_smoke_read("PRO-101", first_observation)
        after_replay = self.store.states["PRO-101"]
        writes_after_replay = [
            event for event in self.store.events if event[0] == "write-smoke"
        ]
        second = self.workflow.record_smoke_read("PRO-101", second_observation)
        final = self.store.states["PRO-101"]
        second_action_key = [
            event[2] for event in self.store.events if event[0] == "write-smoke"
        ][-1]
        completed_replay = self.workflow.record_smoke_read(
            "PRO-101",
            second_observation,
        )

        self.assertEqual(first.next_action, "uncertain")
        self.assertEqual(replay.next_action, "noop")
        self.assertEqual(replay.action_key, committed_action_key)
        self.assertEqual(after_replay.parent_status, "in_progress")
        self.assertEqual(after_replay.metadata.stage_ordinal, committed_ordinal)
        self.assertEqual(after_replay.snapshot.smoke_reads, (first_observation,))
        self.assertEqual(len(writes_after_replay), 1)
        self.assertEqual(second.parent_status, "done")
        self.assertEqual(completed_replay.next_action, "noop")
        self.assertEqual(completed_replay.action_key, second_action_key)
        self.assertEqual(
            final.snapshot.smoke_reads,
            (first_observation, second_observation),
        )
        self.assertEqual(
            len([event for event in self.store.events if event[0] == "write-smoke"]),
            2,
        )

    def test_new_smoke_identity_after_done_is_noop_while_history_still_replays(self):
        snapshot = passing_snapshot()
        snapshot = replace(
            snapshot,
            merge_state="merged",
            merged_shas=snapshot.candidate_shas,
            pull_requests={
                repository: PullRequestEvidence(sha, "merged", True, True, sha)
                for repository, sha in snapshot.candidate_shas.items()
            },
        )
        self.store.add_state("PRO-101", snapshot, pull_requests=pull_request_targets())
        first_observation = passing_smoke(
            observation_id=SMOKE_OBSERVATION["first"]
        )
        second_observation = passing_smoke(
            observation_id=SMOKE_OBSERVATION["second"]
        )
        new_observation = passing_smoke(
            observation_id=SMOKE_OBSERVATION["third"]
        )
        self.workflow.record_smoke_read("PRO-101", first_observation)
        self.workflow.record_smoke_read("PRO-101", second_observation)
        completed = self.store.states["PRO-101"]
        second_action_key = [
            event[2] for event in self.store.events if event[0] == "write-smoke"
        ][-1]
        self.store.events.clear()

        replay = self.workflow.record_smoke_read("PRO-101", second_observation)
        after_replay = self.store.states["PRO-101"]
        rejected = self.workflow.record_smoke_read("PRO-101", new_observation)

        self.assertEqual(replay.next_action, "noop")
        self.assertEqual(replay.action_key, second_action_key)
        self.assertEqual(after_replay, completed)
        self.assertEqual(rejected.parent_status, "done")
        self.assertEqual(rejected.next_action, "noop")
        self.assertEqual(self.store.states["PRO-101"], completed)
        self.assertFalse(
            any(event[0] in {"write-smoke", "status"} for event in self.store.events)
        )

    def test_new_smoke_identity_while_blocked_is_noop_without_mutation(self):
        snapshot = passing_snapshot()
        snapshot = replace(
            snapshot,
            merge_state="merged",
            merged_shas=snapshot.candidate_shas,
            pull_requests={
                repository: PullRequestEvidence(sha, "merged", True, True, sha)
                for repository, sha in snapshot.candidate_shas.items()
            },
        )
        self.store.add_state(
            "PRO-101",
            snapshot,
            status="blocked",
            pull_requests=pull_request_targets(),
        )
        before = self.store.states["PRO-101"]
        self.store.events.clear()

        result = self.workflow.record_smoke_read(
            "PRO-101",
            passing_smoke(observation_id=SMOKE_OBSERVATION["first"]),
        )

        self.assertEqual(result.parent_status, "blocked")
        self.assertEqual(result.next_action, "noop")
        self.assertEqual(self.store.states["PRO-101"], before)
        self.assertFalse(
            any(event[0] in {"write-smoke", "status"} for event in self.store.events)
        )

    def test_new_smoke_identity_during_human_wait_is_noop_without_mutation(self):
        snapshot = passing_snapshot()
        snapshot = replace(
            snapshot,
            merge_state="merged",
            merged_shas=snapshot.candidate_shas,
            pull_requests={
                repository: PullRequestEvidence(sha, "merged", True, True, sha)
                for repository, sha in snapshot.candidate_shas.items()
            },
        )
        self.store.add_state(
            "PRO-101",
            snapshot,
            human_wait=True,
            pull_requests=pull_request_targets(),
        )
        before = self.store.states["PRO-101"]
        self.store.events.clear()

        result = self.workflow.record_smoke_read(
            "PRO-101",
            passing_smoke(observation_id=SMOKE_OBSERVATION["first"]),
        )

        self.assertEqual(result.parent_status, "in_progress")
        self.assertEqual(result.next_action, "noop")
        self.assertEqual(self.store.states["PRO-101"], before)
        self.assertFalse(
            any(event[0] in {"write-smoke", "status"} for event in self.store.events)
        )

    def test_new_smoke_identity_requires_the_current_pure_smoke_decision(self):
        snapshot = passing_snapshot()
        snapshot = replace(
            snapshot,
            merge_state="merged",
            merged_shas=snapshot.candidate_shas,
            pull_requests={
                repository: PullRequestEvidence(sha, "merged", True, True, sha)
                for repository, sha in snapshot.candidate_shas.items()
            },
        )
        self.store.add_state("PRO-101", snapshot, pull_requests=pull_request_targets())
        failed = replace(
            passing_smoke(observation_id=SMOKE_OBSERVATION["first"]),
            repository_results={"api": "pass", "web": "fail"},
        )
        self.workflow.record_smoke_read("PRO-101", failed)
        self.store.states["PRO-101"] = replace(
            self.store.states["PRO-101"],
            parent_status="in_progress",
        )
        before = self.store.states["PRO-101"]
        self.store.events.clear()

        result = self.workflow.record_smoke_read(
            "PRO-101",
            passing_smoke(observation_id=SMOKE_OBSERVATION["second"]),
        )

        self.assertEqual(result.parent_status, "in_progress")
        self.assertEqual(result.next_action, "block")
        self.assertEqual(self.store.states["PRO-101"], before)
        self.assertFalse(
            any(event[0] in {"write-smoke", "status"} for event in self.store.events)
        )

    def test_conflicting_smoke_payload_for_existing_identity_blocks_before_write(self):
        snapshot = passing_snapshot()
        snapshot = replace(
            snapshot,
            merge_state="merged",
            merged_shas=snapshot.candidate_shas,
            pull_requests={
                repository: PullRequestEvidence(sha, "merged", True, True, sha)
                for repository, sha in snapshot.candidate_shas.items()
            },
        )
        self.store.add_state("PRO-101", snapshot, pull_requests=pull_request_targets())
        observation = passing_smoke(observation_id=SMOKE_OBSERVATION["first"])
        self.workflow.record_smoke_read("PRO-101", observation)
        conflict = replace(
            observation,
            repository_results={"api": "pass", "web": "fail"},
        )
        self.store.events.clear()

        result = self.workflow.record_smoke_read("PRO-101", conflict)

        state = self.store.states["PRO-101"]
        self.assertEqual(result.next_action, "block")
        self.assertEqual(state.snapshot.smoke_reads, (observation,))
        self.assertFalse(any(event[0] == "write-smoke" for event in self.store.events))

    def test_smoke_evidence_without_its_parent_transition_is_uncertain_and_not_replayed(self):
        snapshot = passing_snapshot()
        snapshot = replace(
            snapshot,
            merge_state="merged",
            merged_shas=snapshot.candidate_shas,
            pull_requests={
                repository: PullRequestEvidence(sha, "merged", True, True, sha)
                for repository, sha in snapshot.candidate_shas.items()
            },
        )
        self.store.add_state("PRO-101", snapshot, pull_requests=pull_request_targets())
        metadata_before = self.store.states["PRO-101"].metadata
        self.store.write_smoke_evidence_without_transition = True
        self.store.events.clear()

        smoke = passing_smoke(observation_id=SMOKE_OBSERVATION["first"])
        first = self.workflow.record_smoke_read("PRO-101", smoke)
        second = self.workflow.record_smoke_read("PRO-101", smoke)

        state = self.store.states["PRO-101"]
        self.assertEqual(first.next_action, "uncertain")
        self.assertEqual(second.next_action, "uncertain")
        self.assertEqual(state.snapshot.smoke_reads, (smoke,))
        self.assertEqual(state.metadata, metadata_before)
        self.assertEqual(
            len([event for event in self.store.events if event[0] == "write-smoke"]),
            1,
        )
        self.assertFalse(any(event[0] == "status" for event in self.store.events))

    def test_smoke_execution_receives_exact_merged_sha_map(self):
        snapshot = passing_snapshot()
        snapshot = replace(
            snapshot,
            merge_state="merged",
            merged_shas=snapshot.candidate_shas,
            pull_requests={
                repository: PullRequestEvidence(sha, "merged", True, True, sha)
                for repository, sha in snapshot.candidate_shas.items()
            },
        )
        self.store.add_state("PRO-101", snapshot, pull_requests=pull_request_targets())
        smoke = FakeSmokeExecutor(
            passing_smoke(observation_id=SMOKE_OBSERVATION["first"])
        )
        workflow = GenericWorkflow(
            self.manifest,
            self.store,
            self.store,
            github=self.github,
            smoke_executor=smoke,
        )

        result = workflow.execute_smoke("PRO-101")

        self.assertEqual(result.next_action, "smoke")
        self.assertEqual(smoke.calls[0][0:3], (
            "PRO-101",
            ("api", "web"),
            {"api": SHA["api"], "web": SHA["web"]},
        ))

    def test_direct_smoke_preserves_all_merged_evidence_blocks_without_mutation(self):
        snapshot = passing_snapshot()
        snapshot = replace(
            snapshot,
            merge_state="merged",
            merged_shas=snapshot.candidate_shas,
            pull_requests={
                repository: PullRequestEvidence(sha, "merged", True, True, sha)
                for repository, sha in snapshot.candidate_shas.items()
            },
        )
        corruptions = {
            "missing implementation": replace(snapshot, children={}),
            "missing review": replace(snapshot, reviews={}),
            "missing repository QA": replace(snapshot, qa={}),
            "missing integration QA": replace(snapshot, integration_qa={}),
            "stale implementation": replace(
                snapshot,
                children={
                    **snapshot.children,
                    "web": RepositoryEvidence("d" * 40, "pass"),
                },
            ),
        }
        expected_reason = (
            "merged work lacks complete, current-SHA PASS pre-merge implementation, review, "
            "QA, or integration evidence; human action is required"
        )

        for corruption, corrupted in corruptions.items():
            with self.subTest(corruption=corruption):
                self.store.add_state(
                    "PRO-101",
                    corrupted,
                    pull_requests=pull_request_targets(),
                )
                before = self.store.states["PRO-101"]
                smoke = FakeSmokeExecutor(
                    passing_smoke(observation_id=SMOKE_OBSERVATION["first"])
                )
                workflow = GenericWorkflow(
                    self.manifest,
                    self.store,
                    self.store,
                    github=self.github,
                    smoke_executor=smoke,
                )
                self.store.events.clear()

                result = workflow.execute_smoke("PRO-101")

                self.assertEqual(result.next_action, "block")
                self.assertEqual(result.reason, expected_reason)
                self.assertEqual(result.mutation_count, 0)
                self.assertEqual(smoke.calls, [])
                self.assertEqual(self.store.states["PRO-101"], before)
                self.assertFalse(
                    any(event[0] in {"status", "write-smoke"} for event in self.store.events)
                )

    def test_direct_smoke_waits_without_execution_for_active_current_stage(self):
        snapshot = passing_snapshot()
        snapshot = replace(
            snapshot,
            merge_state="merged",
            merged_shas=snapshot.candidate_shas,
            pull_requests={
                repository: PullRequestEvidence(sha, "merged", True, True, sha)
                for repository, sha in snapshot.candidate_shas.items()
            },
        )
        active_child = WorkflowChild(
            "PRO-101-QA", "api", "api", "", "qa", 5, 0,
            "in_progress", "qa:" + "7" * 64, True,
        )
        self.store.add_state(
            "PRO-101",
            snapshot,
            children=(active_child,),
            pull_requests=pull_request_targets(),
        )
        smoke = FakeSmokeExecutor(
            passing_smoke(observation_id=SMOKE_OBSERVATION["first"])
        )
        workflow = GenericWorkflow(
            self.manifest,
            self.store,
            self.store,
            github=self.github,
            smoke_executor=smoke,
        )
        self.store.events.clear()

        result = workflow.execute_smoke("PRO-101")

        self.assertEqual(result.next_action, "wait")
        self.assertEqual(result.mutation_count, 0)
        self.assertEqual(smoke.calls, [])
        self.assertFalse(any(event[0] == "write-smoke" for event in self.store.events))

    def test_direct_smoke_record_waits_without_mutation_for_active_current_stage(self):
        snapshot = passing_snapshot()
        snapshot = replace(
            snapshot,
            merge_state="merged",
            merged_shas=snapshot.candidate_shas,
            pull_requests={
                repository: PullRequestEvidence(sha, "merged", True, True, sha)
                for repository, sha in snapshot.candidate_shas.items()
            },
        )
        active_child = WorkflowChild(
            "PRO-101-QA", "api", "api", "", "qa", 5, 0,
            "in_progress", "qa:" + "8" * 64, True,
        )
        self.store.add_state(
            "PRO-101",
            snapshot,
            children=(active_child,),
            pull_requests=pull_request_targets(),
        )
        self.store.events.clear()

        result = self.workflow.record_smoke_read(
            "PRO-101",
            passing_smoke(observation_id=SMOKE_OBSERVATION["first"]),
        )

        self.assertEqual(result.next_action, "wait")
        self.assertEqual(result.mutation_count, 0)
        self.assertEqual(self.store.states["PRO-101"].snapshot.smoke_reads, ())
        self.assertFalse(any(event[0] == "write-smoke" for event in self.store.events))

    def test_smoke_executor_cannot_replace_the_authoritative_observation_identity(self):
        snapshot = passing_snapshot()
        snapshot = replace(
            snapshot,
            merge_state="merged",
            merged_shas=snapshot.candidate_shas,
            pull_requests={
                repository: PullRequestEvidence(sha, "merged", True, True, sha)
                for repository, sha in snapshot.candidate_shas.items()
            },
        )
        self.store.add_state("PRO-101", snapshot, pull_requests=pull_request_targets())
        smoke = FakeSmokeExecutor(
            passing_smoke(observation_id=SMOKE_OBSERVATION["first"]),
            bind_observation_id=False,
        )
        workflow = GenericWorkflow(
            self.manifest,
            self.store,
            self.store,
            github=self.github,
            smoke_executor=smoke,
        )
        self.store.events.clear()

        result = workflow.execute_smoke("PRO-101")

        self.assertEqual(result.next_action, "block")
        self.assertFalse(any(event[0] == "write-smoke" for event in self.store.events))

    def test_owned_smoke_rejects_arbitrary_self_reporting_runner(self):
        with self.assertRaises(TypeError):
            OwnedSmokeExecutor(
                self.manifest,
                FakeOwnedProcessManager(),
                SelfReportingFakeRunner(),
            )

    def test_owned_smoke_rejects_concrete_runner_subclass_before_any_effect(self):
        manager = FakeOwnedProcessManager()
        backend = MutableClosedCommandBackend(self.manifest)

        with self.assertRaises(TypeError):
            OwnedSmokeExecutor(
                self.manifest,
                manager,
                SelfReportingConcreteRunner(self.manifest, backend),
            )

        self.assertEqual(backend.calls, [])
        self.assertEqual(manager.started, [])

    def test_owned_smoke_rejects_runner_bound_to_another_manifest_object(self):
        manager = FakeOwnedProcessManager()
        backend = MutableClosedCommandBackend(self.manifest)
        equivalent_manifest = replace(self.manifest)

        with self.assertRaises(TypeError):
            OwnedSmokeExecutor(
                self.manifest,
                manager,
                LocalExactShaCommandRunner(equivalent_manifest, backend),
            )

        self.assertEqual(backend.calls, [])
        self.assertEqual(manager.started, [])

    def test_owned_smoke_runner_public_attribute_cannot_be_replaced(self):
        manager = FakeOwnedProcessManager()
        backend = MutableClosedCommandBackend(self.manifest)
        executor = OwnedSmokeExecutor(
            self.manifest,
            manager,
            LocalExactShaCommandRunner(self.manifest, backend),
        )

        with self.assertRaises((AttributeError, TypeError)):
            executor.command_runner = SelfReportingConcreteRunner(
                self.manifest, backend
            )

        self.assertEqual(backend.calls, [])
        self.assertEqual(manager.started, [])

    def test_owned_smoke_revalidates_privately_stored_runner_before_execute(self):
        manager = FakeOwnedProcessManager()
        backend = MutableClosedCommandBackend(self.manifest)
        executor = OwnedSmokeExecutor(
            self.manifest,
            manager,
            LocalExactShaCommandRunner(self.manifest, backend),
        )
        with self.assertRaises(AttributeError):
            executor._command_runner = SelfReportingConcreteRunner(
                self.manifest, backend
            )

        self.assertEqual(backend.calls, [])
        self.assertEqual(manager.started, [])

    def test_owned_smoke_revalidates_runner_manifest_identity_before_execute(self):
        manager = FakeOwnedProcessManager()
        backend = MutableClosedCommandBackend(self.manifest)
        runner = LocalExactShaCommandRunner(self.manifest, backend)
        executor = OwnedSmokeExecutor(self.manifest, manager, runner)
        with self.assertRaises(AttributeError):
            runner.manifest = replace(self.manifest)

        self.assertEqual(backend.calls, [])
        self.assertEqual(manager.started, [])

    def test_owned_smoke_authority_bindings_cannot_be_mutated_into_matching_pair(self):
        manager = FakeOwnedProcessManager()
        backend = MutableClosedCommandBackend(self.manifest)
        executor = OwnedSmokeExecutor(
            self.manifest,
            manager,
            LocalExactShaCommandRunner(self.manifest, backend),
        )
        other_manifest = replace(self.manifest)
        other_runner = LocalExactShaCommandRunner(
            other_manifest, MutableClosedCommandBackend(other_manifest)
        )

        for attribute, replacement in (
            ("manifest", other_manifest),
            ("_command_runner", other_runner),
            ("process_manager", FakeOwnedProcessManager()),
        ):
            with self.subTest(attribute=attribute):
                with self.assertRaises(AttributeError):
                    setattr(executor, attribute, replacement)

        self.assertFalse(hasattr(executor, "__dict__"))
        self.assertEqual(backend.calls, [])
        self.assertEqual(manager.started, [])

    def test_owned_smoke_constructs_concrete_runner_when_omitted(self):
        executor = OwnedSmokeExecutor(self.manifest, FakeOwnedProcessManager())

        self.assertIs(type(executor._command_runner), LocalExactShaCommandRunner)

    def test_concrete_runner_blocks_stale_head_before_service_startup(self):
        manager = FakeOwnedProcessManager()
        backend = MutableClosedCommandBackend(self.manifest)
        backend.heads[self.manifest.repositories["web"].local_path] = "f" * 40
        executor = OwnedSmokeExecutor(
            self.manifest,
            manager,
            LocalExactShaCommandRunner(self.manifest, backend),
        )

        result = executor.execute(
            "PRO-101", ("api", "web"), {"api": SHA["api"], "web": SHA["web"]},
            action_key="smoke:" + "7" * 64,
        )

        self.assertEqual(manager.started, [])
        self.assertFalse(result.authoritative)
        self.assertNotIn("pass", result.repository_results.values())
        self.assertNotIn("pass", result.integration_results.values())

    def test_execute_smoke_persists_partial_stale_head_evidence_then_blocks_named_repository(self):
        snapshot = passing_snapshot()
        snapshot = replace(
            snapshot,
            merge_state="merged",
            merged_shas=snapshot.candidate_shas,
            pull_requests={
                repository: PullRequestEvidence(sha, "merged", True, True, sha)
                for repository, sha in snapshot.candidate_shas.items()
            },
        )
        self.store.add_state(
            "PRO-101", snapshot, pull_requests=pull_request_targets()
        )
        manager = FakeOwnedProcessManager()
        backend = MutableClosedCommandBackend(self.manifest)
        backend.heads[self.manifest.repositories["web"].local_path] = "f" * 40
        smoke_executor = OwnedSmokeExecutor(
            self.manifest,
            manager,
            LocalExactShaCommandRunner(self.manifest, backend),
        )
        workflow = GenericWorkflow(
            self.manifest,
            self.store,
            self.store,
            github=self.github,
            smoke_executor=smoke_executor,
        )
        self.store.events.clear()

        result = workflow.execute_smoke("PRO-101")

        state = self.store.states["PRO-101"]
        self.assertEqual(result.next_action, "block")
        self.assertIn("web", result.reason)
        self.assertEqual(manager.started, [])
        self.assertEqual(len(state.snapshot.smoke_reads), 1)
        recorded = state.snapshot.smoke_reads[0]
        self.assertFalse(recorded.authoritative)
        self.assertEqual(dict(recorded.checkout_shas), {"api": SHA["api"]})
        self.assertEqual(
            dict(recorded.repository_results),
            {"api": "pending", "web": "blocked"},
        )
        self.assertNotIn("pass", recorded.repository_results.values())
        self.assertTrue(any(event[0] == "write-smoke" for event in self.store.events))

    def test_repository_command_drift_persists_partial_named_block_and_leaves_unrun_pending(self):
        candidates = dict(SHA)
        base = passing_snapshot()
        snapshot = replace(
            base,
            affected_repositories=("api", "web", "notifications"),
            candidate_shas=candidates,
            children={
                repository: RepositoryEvidence(sha, "pass")
                for repository, sha in candidates.items()
            },
            pull_requests={
                repository: PullRequestEvidence(sha, "merged", True, True, sha)
                for repository, sha in candidates.items()
            },
            reviews={
                repository: RepositoryEvidence(sha, "pass")
                for repository, sha in candidates.items()
            },
            qa={
                repository: RepositoryEvidence(sha, "pass")
                for repository, sha in candidates.items()
            },
            integration_qa={
                "web-api": GateEvidence(candidates, "pass")
            },
            merge_state="merged",
            merged_shas=candidates,
        )
        self.store.add_state(
            "PRO-101", snapshot, pull_requests=pull_request_targets()
        )
        manager = FakeOwnedProcessManager()
        backend = MutableClosedCommandBackend(self.manifest)

        def change_web_during_api(argv, cwd):
            if argv == self.manifest.repositories["api"].commands["smoke"]:
                backend.heads[self.manifest.repositories["web"].local_path] = "f" * 40

        backend.command_hook = change_web_during_api
        workflow = GenericWorkflow(
            self.manifest,
            self.store,
            self.store,
            github=self.github,
            smoke_executor=OwnedSmokeExecutor(
                self.manifest,
                manager,
                LocalExactShaCommandRunner(self.manifest, backend),
            ),
        )
        self.store.events.clear()

        result = workflow.execute_smoke("PRO-101")

        recorded = self.store.states["PRO-101"].snapshot.smoke_reads[0]
        self.assertEqual(result.next_action, "block")
        self.assertIn("web", result.reason)
        self.assertFalse(recorded.authoritative)
        self.assertEqual(
            dict(recorded.checkout_shas),
            {"api": SHA["api"], "notifications": SHA["notifications"]},
        )
        self.assertEqual(
            dict(recorded.repository_results),
            {"api": "blocked", "web": "blocked", "notifications": "pending"},
        )
        self.assertEqual(dict(recorded.integration_results), {"web-api": "pending"})
        self.assertNotIn(
            (
                self.manifest.repositories["notifications"].commands["smoke"],
                self.manifest.repositories["notifications"].local_path,
            ),
            backend.calls,
        )
        self.assertEqual(len(manager.stopped), len(manager.started))
        self.assertFalse(
            recorded.authoritative
            and any(value == "pass" for value in recorded.repository_results.values())
        )

    def test_integration_command_drift_persists_partial_named_block(self):
        snapshot = passing_snapshot()
        snapshot = replace(
            snapshot,
            merge_state="merged",
            merged_shas=snapshot.candidate_shas,
            pull_requests={
                repository: PullRequestEvidence(sha, "merged", True, True, sha)
                for repository, sha in snapshot.candidate_shas.items()
            },
        )
        self.store.add_state(
            "PRO-101", snapshot, pull_requests=pull_request_targets()
        )
        manager = FakeOwnedProcessManager()
        backend = MutableClosedCommandBackend(self.manifest)
        integration_argv = self.manifest.integration_suites[0].command

        def change_api_during_integration(argv, cwd):
            if argv == integration_argv:
                backend.heads[self.manifest.repositories["api"].local_path] = "f" * 40

        backend.command_hook = change_api_during_integration
        workflow = GenericWorkflow(
            self.manifest,
            self.store,
            self.store,
            github=self.github,
            smoke_executor=OwnedSmokeExecutor(
                self.manifest,
                manager,
                LocalExactShaCommandRunner(self.manifest, backend),
            ),
        )
        self.store.events.clear()

        result = workflow.execute_smoke("PRO-101")

        recorded = self.store.states["PRO-101"].snapshot.smoke_reads[0]
        self.assertEqual(result.next_action, "block")
        self.assertIn("api", result.reason)
        self.assertFalse(recorded.authoritative)
        self.assertEqual(dict(recorded.checkout_shas), {"web": SHA["web"]})
        self.assertEqual(
            dict(recorded.repository_results),
            {"api": "blocked", "web": "pass"},
        )
        self.assertEqual(dict(recorded.integration_results), {"web-api": "blocked"})
        self.assertEqual(len(manager.stopped), len(manager.started))
        self.assertFalse(
            recorded.authoritative
            and any(value == "pass" for value in recorded.repository_results.values())
        )

    def test_concrete_runner_blocks_head_change_in_service_startup_hook(self):
        backend = MutableClosedCommandBackend(self.manifest)

        class CheckoutChangingManager(FakeOwnedProcessManager):
            def start_services(inner_self, services, run, *, candidate_sha):
                records = super(CheckoutChangingManager, inner_self).start_services(
                    services, run, candidate_sha=candidate_sha
                )
                backend.heads[self.manifest.repositories["web"].local_path] = "f" * 40
                return records

        manager = CheckoutChangingManager()
        executor = OwnedSmokeExecutor(
            self.manifest,
            manager,
            LocalExactShaCommandRunner(self.manifest, backend),
        )

        result = executor.execute(
            "PRO-101", ("api", "web"), {"api": SHA["api"], "web": SHA["web"]},
            action_key="smoke:" + "7" * 64,
        )

        self.assertGreater(len(manager.started), 0)
        self.assertEqual(len(manager.stopped), len(manager.started))
        self.assertFalse(result.authoritative)
        self.assertNotIn("pass", result.repository_results.values())

    def test_concrete_runner_blocks_head_change_during_smoke_command(self):
        manager = FakeOwnedProcessManager()
        backend = MutableClosedCommandBackend(self.manifest)
        changed = False

        def change_checkout(argv, cwd):
            nonlocal changed
            if not changed:
                changed = True
                backend.heads[self.manifest.repositories["web"].local_path] = "f" * 40

        backend.command_hook = change_checkout
        executor = OwnedSmokeExecutor(
            self.manifest,
            manager,
            LocalExactShaCommandRunner(self.manifest, backend),
        )

        result = executor.execute(
            "PRO-101", ("api", "web"), {"api": SHA["api"], "web": SHA["web"]},
            action_key="smoke:" + "7" * 64,
        )

        self.assertFalse(result.authoritative)
        self.assertNotIn("pass", result.repository_results.values())
        self.assertNotIn("pass", result.integration_results.values())

    def test_owned_smoke_runs_repository_and_cross_repository_commands_then_cleans_up(self):
        manager = FakeOwnedProcessManager()
        backend = MutableClosedCommandBackend(self.manifest)
        commands = LocalExactShaCommandRunner(self.manifest, backend)
        executor = OwnedSmokeExecutor(self.manifest, manager, commands)
        exact = {"api": SHA["api"], "web": SHA["web"]}

        result = executor.execute(
            "PRO-101",
            ("api", "web"),
            exact,
            action_key="smoke:" + "7" * 64,
        )

        self.assertEqual(
            [item[1].repository_key for item in manager.started],
            ["api", "web"],
        )
        self.assertEqual(
            [argv for argv, _ in backend.calls if argv != ("git", "rev-parse", "HEAD")],
            [
                self.manifest.repositories["api"].commands["smoke"],
                self.manifest.repositories["web"].commands["smoke"],
                self.manifest.integration_suites[0].command,
            ],
        )
        self.assertEqual(
            [item[0].repository_key for item in manager.stopped],
            ["web", "api"],
        )
        self.assertEqual(dict(result.merged_shas), exact)
        self.assertEqual(dict(result.repository_results), {"api": "pass", "web": "pass"})
        self.assertEqual(dict(result.integration_results), {"web-api": "pass"})
        self.assertTrue(result.authoritative)
        self.assertEqual(dict(result.checkout_shas), exact)

    def test_owned_smoke_starts_multiple_repository_services_with_one_manager_call(self):
        repositories = dict(self.manifest.repositories)
        repositories["api"] = replace(
            repositories["api"],
            services=(
                *repositories["api"].services,
                ServiceSpec("api-admin", 8081, "http://localhost:8081/health"),
            ),
        )
        manifest = replace(self.manifest, repositories=MappingProxyType(repositories))
        manager = FakeOwnedProcessManager()
        backend = MutableClosedCommandBackend(manifest)
        executor = OwnedSmokeExecutor(
            manifest,
            manager,
            LocalExactShaCommandRunner(manifest, backend),
        )

        executor.execute(
            "PRO-101",
            ("api",),
            {"api": SHA["api"]},
            action_key="smoke:" + "7" * 64,
        )

        self.assertEqual(len(manager.started), 1)
        self.assertEqual(len(manager.started[0][0]), 2)
        self.assertEqual(len(manager.stopped), 1)

    def test_watcher_recovers_once_then_blocks_a_still_stalled_parent(self):
        child = WorkflowChild(
            "PRO-101-API",
            "api",
            "api",
            "",
            "implementation",
            1,
            0,
            "in_progress",
            "dispatch:" + "3" * 64,
            False,
        )
        snapshot = ParentSnapshot(
            affected_repositories=("api",),
            children={"api": RepositoryEvidence("", "pending")},
            stalled=True,
            stalled_repository="api",
        )
        self.store.add_state("PRO-101", snapshot, children=(child,))
        self.store.activate_on_rerun = True
        stalled_at = datetime(2026, 8, 27, tzinfo=timezone.utc)

        first = self.workflow.recover_stalled_parent("PRO-101", now=stalled_at)
        recovered = self.store.states["PRO-101"]
        self.store.states["PRO-101"] = replace(
            recovered,
            children=tuple(replace(item, active=False) for item in recovered.children),
            active_work=False,
        )
        second = self.workflow.recover_stalled_parent("PRO-101", now=stalled_at)

        self.assertEqual(first.next_action, "resume")
        self.assertEqual(second.parent_status, "blocked")
        self.assertEqual(len([event for event in self.store.events if event[0] == "rerun"]), 1)
        rerun_key = [event for event in self.store.events if event[0] == "rerun"][0][-1]
        blocked_key = [event for event in self.store.events if event[0] == "status"][-1][-1]
        self.assertNotEqual(rerun_key, blocked_key)

    def test_watcher_entrypoints_fail_closed_without_mutation_for_future_child_relationship(self):
        future_child = WorkflowChild(
            "PRO-101-FUTURE", "api", "api", "", "implementation", 6, 0,
            "in_progress", "dispatch:" + "c" * 64, False,
        )
        snapshot = ParentSnapshot(
            affected_repositories=("api",),
            children={"api": RepositoryEvidence("", "pending")},
            stalled=True,
            stalled_repository="api",
        )
        entrypoints = {
            "direct recovery": lambda: self.workflow.recover_stalled_parent("PRO-101"),
            "watcher scan": self.workflow.watch_active_parents,
        }

        for entrypoint, invoke in entrypoints.items():
            with self.subTest(entrypoint=entrypoint):
                self.store.add_state("PRO-101", snapshot, children=(future_child,))
                before = self.store.states["PRO-101"]
                self.store.events.clear()

                result = invoke()

                self.assertEqual(result.parent_status, "blocked")
                self.assertEqual(result.next_action, "block")
                self.assertIn("child relationship", result.reason)
                self.assertEqual(result.mutation_count, 0)
                self.assertEqual(self.store.states["PRO-101"], before)
                self.assertFalse(
                    any(event[0] in {"rerun", "status", "create"} for event in self.store.events)
                )

    def test_watcher_does_not_accept_metadata_only_rerun_as_recovery(self):
        child = WorkflowChild(
            "PRO-101-API", "api", "api", "", "implementation", 1, 0,
            "in_progress", "dispatch:" + "b" * 64, False,
        )
        snapshot = ParentSnapshot(
            affected_repositories=("api",),
            children={"api": RepositoryEvidence("", "pending")},
            stalled=True,
            stalled_repository="api",
        )
        self.store.add_state("PRO-101", snapshot, children=(child,))

        result = self.workflow.recover_stalled_parent("PRO-101")

        self.assertIn(result.next_action, {"uncertain", "block"})
        self.assertNotEqual(result.next_action, "resume")

    def test_watcher_rejects_authoritative_read_for_a_different_parent(self):
        child = WorkflowChild(
            "PRO-101-API",
            "api",
            "api",
            "",
            "implementation",
            1,
            0,
            "in_progress",
            "dispatch:" + "3" * 64,
            False,
        )
        snapshot = ParentSnapshot(
            affected_repositories=("api",),
            children={"api": RepositoryEvidence("", "pending")},
            stalled=True,
            stalled_repository="api",
        )
        self.store.add_state("PRO-101", snapshot, children=(child,))
        self.store.read_parent_identifier_override = "PRO-999"

        result = self.workflow.recover_stalled_parent("PRO-101")

        self.assertEqual(result.next_action, "noop")
        self.assertFalse(any(event[0] == "rerun" for event in self.store.events))

    def test_successful_recovery_with_unobservable_reread_is_not_overwritten(self):
        child = WorkflowChild(
            "PRO-101-API",
            "api",
            "api",
            "",
            "implementation",
            1,
            0,
            "in_progress",
            "dispatch:" + "3" * 64,
            False,
        )
        snapshot = ParentSnapshot(
            affected_repositories=("api",),
            children={"api": RepositoryEvidence("", "pending")},
            stalled=True,
            stalled_repository="api",
        )
        self.store.add_state("PRO-101", snapshot, children=(child,))
        self.store.fail_reads_after_rerun = True

        result = self.workflow.recover_stalled_parent("PRO-101")

        self.assertEqual(result.next_action, "uncertain")
        self.assertEqual(self.store.states["PRO-101"].snapshot.recovery_count, 1)
        self.assertFalse(any(event[0] == "status" for event in self.store.events))

    def test_watcher_post_effect_read_must_still_name_requested_parent(self):
        child = WorkflowChild(
            "PRO-101-API",
            "api",
            "api",
            "",
            "implementation",
            1,
            0,
            "in_progress",
            "dispatch:" + "3" * 64,
            False,
        )
        snapshot = ParentSnapshot(
            affected_repositories=("api",),
            children={"api": RepositoryEvidence("", "pending")},
            stalled=True,
            stalled_repository="api",
        )
        self.store.add_state("PRO-101", snapshot, children=(child,))
        self.store.override_parent_after_rerun = True

        result = self.workflow.recover_stalled_parent("PRO-101")

        self.assertEqual(result.next_action, "uncertain")
        self.assertEqual(len([event for event in self.store.events if event[0] == "rerun"]), 1)
        self.assertFalse(any(event[0] == "status" for event in self.store.events))

    def test_watcher_ignores_healthy_human_wait_and_unsupported_work(self):
        pending = ParentSnapshot(
            affected_repositories=("api",),
            children={"api": RepositoryEvidence("", "pending")},
            stalled=True,
            stalled_repository="api",
        )
        child = WorkflowChild(
            "CH",
            "api",
            "api",
            "",
            "implementation",
            1,
            0,
            "in_progress",
            "dispatch:" + "4" * 64,
            False,
        )
        self.store.add_state("PRO-healthy", pending, children=(child,), active_work=True)
        self.store.add_state("PRO-human", pending, children=(child,), human_wait=True)
        self.store.add_state("PRO-version", pending, children=(child,), workflow_version=2)
        self.store.add_state("PRO-project", pending, children=(child,), project_key="foreign")

        self.assertEqual(self.workflow.recover_stalled_parent("PRO-healthy").next_action, "noop")
        self.assertEqual(self.workflow.recover_stalled_parent("PRO-human").next_action, "noop")
        self.assertEqual(self.workflow.recover_stalled_parent("PRO-version").next_action, "noop")
        self.assertEqual(self.workflow.recover_stalled_parent("PRO-project").next_action, "noop")

    def test_watcher_rereads_before_mutation_and_stops_when_work_changes(self):
        child = WorkflowChild(
            "PRO-101-API",
            "api",
            "api",
            "",
            "implementation",
            1,
            0,
            "in_progress",
            "dispatch:" + "5" * 64,
            False,
        )
        snapshot = ParentSnapshot(
            affected_repositories=("api",),
            children={"api": RepositoryEvidence("", "pending")},
            stalled=True,
            stalled_repository="api",
        )
        self.store.add_state("PRO-101", snapshot, children=(child,))
        self.store.change_on_recovery_reread = True

        result = self.workflow.recover_stalled_parent("PRO-101")

        self.assertEqual(result.next_action, "noop")
        self.assertFalse(any(event[0] == "rerun" for event in self.store.events))

    def test_watcher_never_reruns_a_child_from_an_old_repair_attempt(self):
        old_child = WorkflowChild(
            "PRO-101-API-OLD",
            "api",
            "api",
            "",
            "implementation",
            1,
            0,
            "in_progress",
            "dispatch:" + "6" * 64,
            False,
        )
        snapshot = ParentSnapshot(
            affected_repositories=("api",),
            children={"api": RepositoryEvidence("", "pending")},
            attempt=1,
            stalled=True,
            stalled_repository="api",
        )
        self.store.add_state("PRO-101", snapshot, children=(old_child,))

        result = self.workflow.recover_stalled_parent("PRO-101")

        self.assertEqual(result.next_action, "noop")
        self.assertFalse(any(event[0] == "rerun" for event in self.store.events))

    def test_watcher_accepts_authoritative_activation_of_the_same_existing_child(self):
        child = WorkflowChild(
            "PRO-101-API",
            "api",
            "api",
            "",
            "implementation",
            1,
            0,
            "in_progress",
            "dispatch:" + "9" * 64,
            False,
        )
        snapshot = ParentSnapshot(
            affected_repositories=("api",),
            children={"api": RepositoryEvidence("", "pending")},
            stalled=True,
            stalled_repository="api",
        )
        self.store.add_state("PRO-101", snapshot, children=(child,))
        self.store.activate_on_rerun = True

        result = self.workflow.recover_stalled_parent("PRO-101")

        self.assertEqual(result.next_action, "resume")
        self.assertTrue(self.store.states["PRO-101"].active_work)
        self.assertEqual(len(self.store.states["PRO-101"].children), 1)

    def test_watcher_blocks_if_rerun_effect_changes_gate_evidence(self):
        child = WorkflowChild(
            "PRO-101-API",
            "api",
            "api",
            "",
            "implementation",
            1,
            0,
            "in_progress",
            "dispatch:" + "a" * 64,
            False,
        )
        snapshot = ParentSnapshot(
            affected_repositories=("api",),
            children={"api": RepositoryEvidence("", "pending")},
            stalled=True,
            stalled_repository="api",
        )
        self.store.add_state("PRO-101", snapshot, children=(child,))
        self.store.mutate_gate_on_rerun = True

        result = self.workflow.recover_stalled_parent("PRO-101")

        self.assertEqual(result.parent_status, "blocked")
        self.assertEqual(result.next_action, "block")

    def test_watcher_scan_is_instance_project_version_scoped_and_recovers_one(self):
        child = WorkflowChild(
            "PRO-101-API",
            "api",
            "api",
            "",
            "implementation",
            1,
            0,
            "in_progress",
            "dispatch:" + "6" * 64,
            False,
        )
        snapshot = ParentSnapshot(
            affected_repositories=("api",),
            children={"api": RepositoryEvidence("", "pending")},
            stalled=True,
            stalled_repository="api",
        )
        self.store.add_state("PRO-101", snapshot, children=(child,))
        self.store.add_state("PRO-102", snapshot, children=(replace(child, identifier="PRO-102-API"),))
        self.store.activate_on_rerun = True

        result = self.workflow.watch_active_parents()

        self.assertEqual(result.next_action, "resume")
        self.assertEqual(len([event for event in self.store.events if event[0] == "rerun"]), 1)
        instance, projects, versions = self.store.list_arguments
        self.assertEqual(instance, "sample-commerce")
        self.assertEqual(versions, frozenset({1}))
        self.assertEqual(
            projects,
            frozenset(
                {
                    self.manifest.instance.control_project,
                    *(repository.project_title for repository in self.manifest.repositories.values()),
                }
            ),
        )


if __name__ == "__main__":
    unittest.main()
