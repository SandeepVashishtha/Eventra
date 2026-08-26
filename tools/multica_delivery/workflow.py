"""Effect orchestration around the pure exact-SHA parent decision engine."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass, field, replace
from datetime import datetime
import hashlib
from pathlib import Path
import re
from types import MappingProxyType
from typing import Protocol
from urllib.parse import urlsplit
import uuid

from .decisions import (
    DecisionKind,
    ParentDecision,
    ParentSnapshot,
    SmokeRead,
    decide_parent_action,
)
from .github_client import (
    GitHubBoundaryError,
    MergeResult,
    PullRequestInfo,
    RequiredStatusChecks,
)
from .metadata import MetadataError, ParentMetadata, canonical_json
from .model import DeliveryManifest
from .processes import OwnedProcess, ProcessManager, ProcessOwnershipError, ProcessRun
from .topology import TopologyError, merge_order


_SHA = re.compile(r"[0-9a-f]{40}\Z")
_STABLE_KEY = re.compile(r"[A-Za-z0-9][A-Za-z0-9._:/-]*\Z")
_ISSUE_IDENTIFIER = re.compile(r"[A-Za-z][A-Za-z0-9]*-[1-9][0-9]*\Z")
_ACTION_KEY = re.compile(
    r"(?:dispatch|stage|review|qa|merge|repair|smoke|resume|recovery):[0-9a-f]{64}\Z"
)
_PHASES = frozenset({"implementation", "review", "qa", "integration_qa", "repair", "smoke"})
_PHASE_RESULTS = frozenset({"pass", "fail", "blocked"})
_ACTIVE_PARENT_STATUSES = frozenset({"todo", "in_progress", "in_review"})
_ACTIVE_CHILD_STATUSES = frozenset({"todo", "in_progress", "in_review"})


class WorkflowError(RuntimeError):
    """A fail-closed, non-secret workflow boundary failure."""


def _stable(value: object, field_name: str, *, empty: bool = False) -> str:
    if not isinstance(value, str) or (
        (not empty and not value)
        or (value and _STABLE_KEY.fullmatch(value) is None)
    ):
        raise WorkflowError(f"{field_name} must be a stable key")
    return value


def _valid_sha(value: object) -> bool:
    return isinstance(value, str) and _SHA.fullmatch(value) is not None


@dataclass(frozen=True)
class PullRequestTarget:
    repository_key: str
    number: int
    url: str

    def __post_init__(self) -> None:
        _stable(self.repository_key, "repository_key")
        if not isinstance(self.number, int) or isinstance(self.number, bool) or self.number < 1:
            raise WorkflowError("pull request number must be a positive integer")
        parsed = urlsplit(self.url)
        if (
            parsed.scheme != "https"
            or parsed.netloc != "github.com"
            or parsed.query
            or parsed.fragment
            or not parsed.path.endswith(f"/pull/{self.number}")
        ):
            raise WorkflowError("pull request URL is malformed")


@dataclass(frozen=True)
class WorkflowChild:
    identifier: str
    target_key: str
    repository_key: str
    suite_key: str
    phase: str
    stage_ordinal: int
    attempt: int
    status: str
    action_key: str
    active: bool
    evidence_comment_uuid: str = ""

    def __post_init__(self) -> None:
        _stable(self.identifier, "child identifier")
        _stable(self.target_key, "child target")
        _stable(self.repository_key, "child repository")
        _stable(self.suite_key, "child suite", empty=True)
        if self.phase not in _PHASES:
            raise WorkflowError("child phase is unsupported")
        for value, name in ((self.stage_ordinal, "stage ordinal"), (self.attempt, "attempt")):
            if not isinstance(value, int) or isinstance(value, bool) or value < 0:
                raise WorkflowError(f"{name} must be a non-negative integer")
        if self.status not in {"backlog", "todo", "in_progress", "in_review", "done", "blocked", "cancelled"}:
            raise WorkflowError("child status is unsupported")
        if _ACTION_KEY.fullmatch(self.action_key) is None:
            raise WorkflowError("child action key is malformed")
        if not isinstance(self.active, bool):
            raise WorkflowError("child active marker must be boolean")
        if self.evidence_comment_uuid:
            try:
                observed = str(uuid.UUID(self.evidence_comment_uuid))
            except (ValueError, AttributeError, TypeError) as error:
                raise WorkflowError("child evidence UUID is malformed") from error
            if observed != self.evidence_comment_uuid:
                raise WorkflowError("child evidence UUID is malformed")


@dataclass(frozen=True)
class ChildRequest:
    target_key: str
    repository_key: str
    suite_key: str
    phase: str
    stage_ordinal: int
    attempt: int
    candidate_shas: Mapping[str, str]
    pull_request: PullRequestTarget | None = None

    def __post_init__(self) -> None:
        _stable(self.target_key, "child target")
        _stable(self.repository_key, "child repository")
        _stable(self.suite_key, "child suite", empty=True)
        if self.phase not in _PHASES:
            raise WorkflowError("child request phase is unsupported")
        for value, name in ((self.stage_ordinal, "stage ordinal"), (self.attempt, "attempt")):
            if not isinstance(value, int) or isinstance(value, bool) or value < 0:
                raise WorkflowError(f"{name} must be a non-negative integer")
        candidates = dict(self.candidate_shas)
        if any(not isinstance(key, str) or not _valid_sha(sha) for key, sha in candidates.items()):
            raise WorkflowError("child candidate SHA map is malformed")
        object.__setattr__(self, "candidate_shas", MappingProxyType(dict(sorted(candidates.items()))))
        if self.phase == "repair" and self.pull_request is None:
            raise WorkflowError("repair must target an existing pull request")


@dataclass(frozen=True)
class PhaseCompletion:
    parent_identifier: str
    repository_key: str
    phase: str
    result: str
    attempt: int
    candidate_sha: str
    pull_request_url: str
    evidence_comment_uuid: str
    evidence_comment_url: str
    suite_key: str = ""
    candidate_shas: Mapping[str, str] = field(default_factory=dict)

    def __post_init__(self) -> None:
        candidates = dict(self.candidate_shas)
        object.__setattr__(self, "candidate_shas", MappingProxyType(dict(sorted(candidates.items()))))


@dataclass(frozen=True)
class WorkflowState:
    parent_identifier: str
    parent_status: str
    project_key: str
    metadata: ParentMetadata | None
    snapshot: ParentSnapshot
    children: tuple[WorkflowChild, ...] = ()
    pull_requests: Mapping[str, PullRequestTarget] = field(default_factory=dict)
    applied_action_keys: frozenset[str] = frozenset()
    human_wait: bool = False
    active_work: bool = False

    def __post_init__(self) -> None:
        if not isinstance(self.snapshot, ParentSnapshot):
            raise WorkflowError("workflow state snapshot is malformed")
        if self.metadata is not None and not isinstance(self.metadata, ParentMetadata):
            raise WorkflowError("workflow state metadata is malformed")
        if not isinstance(self.children, tuple) or any(
            not isinstance(child, WorkflowChild) for child in self.children
        ):
            raise WorkflowError("workflow children are malformed")
        targets = dict(self.pull_requests)
        if any(
            not isinstance(repository, str)
            or not isinstance(target, PullRequestTarget)
            or repository != target.repository_key
            for repository, target in targets.items()
        ):
            raise WorkflowError("workflow pull request targets are malformed")
        object.__setattr__(self, "pull_requests", MappingProxyType(dict(sorted(targets.items()))))
        keys = frozenset(self.applied_action_keys)
        if any(not isinstance(key, str) or _ACTION_KEY.fullmatch(key) is None for key in keys):
            raise WorkflowError("applied action keys are malformed")
        object.__setattr__(self, "applied_action_keys", keys)
        if not isinstance(self.human_wait, bool) or not isinstance(self.active_work, bool):
            raise WorkflowError("workflow wait markers must be boolean")


@dataclass(frozen=True)
class WorkflowResult:
    parent_identifier: str
    parent_status: str
    next_action: str
    reason: str = ""
    created_children: tuple[tuple[str, str], ...] = ()
    completed_child_status: str | None = None
    merge_state: str = "pending"
    action_key: str | None = None
    mutation_count: int = 0
    scanned_parents: int = 0
    recovery_candidates: int = 0


@dataclass(frozen=True)
class ScopeResolution:
    """Read-only issue analysis supplied to the generic intake boundary."""

    affected: frozenset[str] | None = None
    affected_candidates: tuple[frozenset[str], ...] = ()
    contract_hashes: Mapping[str, str] = field(default_factory=dict)
    authority_requirements: tuple[str, ...] = ()

    def __post_init__(self) -> None:
        if self.affected is not None:
            object.__setattr__(self, "affected", frozenset(self.affected))
        object.__setattr__(
            self,
            "affected_candidates",
            tuple(frozenset(candidate) for candidate in self.affected_candidates),
        )
        object.__setattr__(
            self,
            "contract_hashes",
            MappingProxyType(dict(sorted(dict(self.contract_hashes).items()))),
        )
        if not isinstance(self.authority_requirements, tuple) or any(
            not isinstance(requirement, str) or not requirement
            for requirement in self.authority_requirements
        ):
            raise WorkflowError("authority requirements are malformed")


class ScopeResolver(Protocol):
    def resolve(self, parent_identifier: str) -> ScopeResolution: ...


class WorkflowSnapshotReader(Protocol):
    def read(self, parent_identifier: str) -> WorkflowState: ...

    def read_phase_completion(
        self,
        parent_identifier: str,
        evidence_comment_uuid: str,
    ) -> PhaseCompletion | None: ...

    def read_smoke_reads(self, parent_identifier: str) -> tuple[SmokeRead, ...]: ...

    def list_active_parents(
        self,
        *,
        instance_key: str,
        project_keys: frozenset[str],
        workflow_versions: frozenset[int],
    ) -> tuple[str, ...]: ...


class WorkflowExecutor(Protocol):
    def initialize_parent(
        self,
        parent_identifier: str,
        metadata: ParentMetadata,
        *,
        action_key: str,
    ) -> None: ...

    def request_human_clarification(
        self,
        parent_identifier: str,
        reason: str,
        *,
        action_key: str,
    ) -> None: ...

    def create_children(
        self,
        parent_identifier: str,
        children: tuple[ChildRequest, ...],
        metadata: ParentMetadata,
        *,
        action_key: str,
    ) -> None: ...

    def write_phase_completion(
        self,
        completion: PhaseCompletion,
        *,
        action_key: str,
    ) -> None: ...

    def mark_child_done(
        self,
        parent_identifier: str,
        completion: PhaseCompletion,
        metadata: ParentMetadata,
        *,
        action_key: str,
    ) -> None:
        """Atomically finish the child and invalidate every gate on SHA replacement."""
        ...

    def set_parent_status(
        self,
        parent_identifier: str,
        status: str,
        reason: str,
        metadata: ParentMetadata,
        *,
        action_key: str,
    ) -> None: ...

    def record_merge_state(
        self,
        parent_identifier: str,
        merge_state: str,
        merged_shas: Mapping[str, str],
        metadata: ParentMetadata,
        *,
        action_key: str,
    ) -> None: ...

    def write_smoke_read(
        self,
        parent_identifier: str,
        smoke_read: SmokeRead,
        metadata: ParentMetadata,
        *,
        action_key: str,
    ) -> None: ...

    def rerun_child(
        self,
        parent_identifier: str,
        child_identifier: str,
        metadata: ParentMetadata,
        *,
        action_key: str,
    ) -> None: ...


class GitHubMergeClient(Protocol):
    def get_pull_request(self, repository: str, number: int) -> PullRequestInfo: ...

    def required_status_checks(
        self,
        repository: str,
        base_ref: str,
        expected_sha: str,
    ) -> RequiredStatusChecks: ...

    def merge_pull_request(
        self,
        repository: str,
        number: int,
        *,
        expected_sha: str,
    ) -> MergeResult: ...


class SmokeExecutor(Protocol):
    def execute(
        self,
        parent_identifier: str,
        repositories: tuple[str, ...],
        merged_shas: Mapping[str, str],
        *,
        action_key: str,
    ) -> SmokeRead: ...


class ExactShaCommandRunner(Protocol):
    """Run one argv only after binding every named repository to its exact SHA."""

    def run(
        self,
        repository_key: str,
        candidate_shas: Mapping[str, str],
        argv: tuple[str, ...],
        cwd: Path,
    ) -> bool: ...


class OwnedSmokeExecutor:
    """Run manifest smoke commands with services owned by one exact-SHA Run."""

    def __init__(
        self,
        manifest: DeliveryManifest,
        process_manager: ProcessManager,
        command_runner: ExactShaCommandRunner,
    ) -> None:
        if not isinstance(manifest, DeliveryManifest):
            raise TypeError("manifest must be a DeliveryManifest")
        self.manifest = manifest
        self.process_manager = process_manager
        self.command_runner = command_runner

    def execute(
        self,
        parent_identifier: str,
        repositories: tuple[str, ...],
        merged_shas: Mapping[str, str],
        *,
        action_key: str,
    ) -> SmokeRead:
        selected = tuple(repositories)
        exact = dict(merged_shas)
        if (
            not selected
            or len(set(selected)) != len(selected)
            or set(selected) != set(exact)
            or set(selected) - self.manifest.repositories.keys()
            or any(not _valid_sha(sha) for sha in exact.values())
            or _ACTION_KEY.fullmatch(action_key) is None
        ):
            raise WorkflowError("owned smoke target is malformed")
        try:
            ordered = merge_order(
                self.manifest.repositories,
                frozenset(selected),
                tuple(repository for repository in self.manifest.merge_order if repository in selected),
            )
        except TopologyError as error:
            raise WorkflowError("owned smoke target is not dependency-safe") from error
        applicable_suites = tuple(
            suite
            for suite in self.manifest.integration_suites
            if set(suite.repositories) <= set(selected)
        )
        service_order: list[str] = []
        for suite in applicable_suites:
            for repository in suite.start_order:
                if repository not in service_order:
                    service_order.append(repository)
        for repository in ordered:
            if repository not in service_order:
                service_order.append(repository)

        run_id = f"{parent_identifier}:{action_key}"
        started: list[OwnedProcess] = []
        repository_results = {repository: "blocked" for repository in selected}
        integration_results = {suite.key: "blocked" for suite in applicable_suites}
        startup_failed = False
        try:
            for repository in service_order:
                specification = self.manifest.repositories[repository]
                run = ProcessRun(
                    repository_key=repository,
                    run_id=run_id,
                    argv=specification.commands["start"],
                    cwd=specification.local_path,
                )
                for service in specification.services:
                    started.append(
                        self.process_manager.start(
                            service,
                            run,
                            candidate_sha=exact[repository],
                        )
                    )
        except (ProcessOwnershipError, OSError, RuntimeError, TypeError, ValueError):
            startup_failed = True

        if not startup_failed:
            for repository in ordered:
                specification = self.manifest.repositories[repository]
                try:
                    passed = self.command_runner.run(
                        repository,
                        exact,
                        specification.commands["smoke"],
                        specification.local_path,
                    )
                    if not isinstance(passed, bool):
                        raise WorkflowError("exact-SHA command result is malformed")
                    repository_results[repository] = "pass" if passed else "fail"
                except Exception:
                    repository_results[repository] = "blocked"
            for suite in applicable_suites:
                if any(repository_results[repository] != "pass" for repository in suite.repositories):
                    integration_results[suite.key] = "blocked"
                    continue
                command_repository = self.manifest.repositories[suite.command_repository]
                try:
                    passed = self.command_runner.run(
                        suite.command_repository,
                        exact,
                        suite.command,
                        command_repository.local_path,
                    )
                    if not isinstance(passed, bool):
                        raise WorkflowError("exact-SHA command result is malformed")
                    integration_results[suite.key] = "pass" if passed else "fail"
                except Exception:
                    integration_results[suite.key] = "blocked"

        cleanup_failed = False
        for record in reversed(started):
            try:
                self.process_manager.stop(
                    record,
                    run_id=run_id,
                    repository_key=record.repository_key,
                    candidate_sha=record.candidate_sha,
                )
            except (ProcessOwnershipError, OSError, RuntimeError, TypeError, ValueError):
                cleanup_failed = True
        if cleanup_failed:
            repository_results = {repository: "blocked" for repository in selected}
            integration_results = {suite.key: "blocked" for suite in applicable_suites}
        return SmokeRead(
            merged_shas=exact,
            repository_results=repository_results,
            integration_results=integration_results,
            authoritative=True,
        )


def coordinator_action_key(
    *,
    workflow_version: int,
    instance_key: str,
    parent_identifier: str,
    stage_kind: str,
    stage_ordinal: int,
    attempt: int,
    affected_repositories: frozenset[str],
    candidate_shas: Mapping[str, str],
    contract_hashes: Mapping[str, str],
) -> str:
    """Hash every frozen coordinator input into one stable idempotency key."""

    for value, name, positive in (
        (workflow_version, "workflow_version", True),
        (stage_ordinal, "stage_ordinal", False),
        (attempt, "attempt", False),
    ):
        if (
            not isinstance(value, int)
            or isinstance(value, bool)
            or value < (1 if positive else 0)
        ):
            raise WorkflowError(f"{name} is malformed")
    _stable(instance_key, "instance_key")
    if not isinstance(parent_identifier, str) or _ISSUE_IDENTIFIER.fullmatch(parent_identifier) is None:
        raise WorkflowError("parent identifier is malformed")
    _stable(stage_kind, "stage_kind")
    if not isinstance(affected_repositories, frozenset) or any(
        not isinstance(repository, str) or not repository
        for repository in affected_repositories
    ):
        raise WorkflowError("affected repository set is malformed")
    candidate_values = dict(candidate_shas)
    contract_values = dict(contract_hashes)
    if set(candidate_values) - affected_repositories or any(
        not _valid_sha(value) for value in candidate_values.values()
    ):
        raise WorkflowError("candidate SHA map is malformed")
    if any(
        not isinstance(key, str) or not key or not _valid_sha(value)
        for key, value in contract_values.items()
    ):
        raise WorkflowError("contract hash map is malformed")
    action_kind = stage_kind.split(":", 1)[0]
    prefix = {
        "implementation": "dispatch",
        "dispatch": "dispatch",
        "gates": "stage",
        "stage": "stage",
        "review": "review",
        "qa": "qa",
        "integration_qa": "qa",
        "merge": "merge",
        "repair": "repair",
        "smoke": "smoke",
        "recovery": "recovery",
    }.get(action_kind, "resume")
    payload = canonical_json(
        {
            "affected_repositories": sorted(affected_repositories),
            "attempt": attempt,
            "candidate_shas": dict(sorted(candidate_values.items())),
            "contract_hashes": dict(sorted(contract_values.items())),
            "instance_key": instance_key,
            "parent_identifier": parent_identifier,
            "stage_kind": stage_kind,
            "stage_ordinal": stage_ordinal,
            "workflow_version": workflow_version,
        }
    )
    return f"{prefix}:{hashlib.sha256(payload.encode('utf-8')).hexdigest()}"


class GenericWorkflow:
    """Apply one pure decision at a time through injectable strict effects."""

    def __init__(
        self,
        manifest: DeliveryManifest,
        snapshot_reader: WorkflowSnapshotReader,
        executor: WorkflowExecutor,
        *,
        github: GitHubMergeClient | None = None,
        smoke_executor: SmokeExecutor | None = None,
        scope_resolver: ScopeResolver | None = None,
        workflow_version: int = 1,
        supported_workflow_versions: frozenset[int] | None = None,
    ) -> None:
        if not isinstance(manifest, DeliveryManifest):
            raise TypeError("manifest must be a DeliveryManifest")
        if not isinstance(workflow_version, int) or isinstance(workflow_version, bool) or workflow_version < 1:
            raise ValueError("workflow_version must be positive")
        versions = supported_workflow_versions or frozenset({workflow_version})
        if (
            not isinstance(versions, frozenset)
            or workflow_version not in versions
            or any(not isinstance(value, int) or isinstance(value, bool) or value < 1 for value in versions)
        ):
            raise ValueError("supported workflow versions are malformed")
        self.manifest = manifest
        self.snapshot_reader = snapshot_reader
        self.executor = executor
        self.github = github
        self.smoke_executor = smoke_executor
        self.scope_resolver = scope_resolver
        self.workflow_version = workflow_version
        self.supported_workflow_versions = versions
        self.project_keys = frozenset(
            {
                manifest.instance.control_project,
                *(repository.project_title for repository in manifest.repositories.values()),
            }
        )

    def _result(
        self,
        state: WorkflowState,
        next_action: str,
        reason: str,
        *,
        created: tuple[tuple[str, str], ...] = (),
        completed_child_status: str | None = None,
        action_key: str | None = None,
        mutation_count: int = 0,
        merge_state: str | None = None,
    ) -> WorkflowResult:
        return WorkflowResult(
            parent_identifier=state.parent_identifier,
            parent_status=state.parent_status,
            next_action=next_action,
            reason=reason,
            created_children=created,
            completed_child_status=completed_child_status,
            merge_state=merge_state or state.snapshot.merge_state,
            action_key=action_key,
            mutation_count=mutation_count,
        )

    def _action_key(
        self,
        state: WorkflowState,
        stage_kind: str,
        stage_ordinal: int,
        *,
        attempt: int | None = None,
        candidate_shas: Mapping[str, str] | None = None,
        affected: frozenset[str] | None = None,
        contract_hashes: Mapping[str, str] | None = None,
    ) -> str:
        metadata = state.metadata
        return coordinator_action_key(
            workflow_version=self.workflow_version if metadata is None else metadata.workflow_version,
            instance_key=self.manifest.instance.key,
            parent_identifier=state.parent_identifier,
            stage_kind=stage_kind,
            stage_ordinal=stage_ordinal,
            attempt=(0 if metadata is None else metadata.attempt) if attempt is None else attempt,
            affected_repositories=(
                frozenset(state.snapshot.affected_repositories)
                if affected is None
                else affected
            ),
            candidate_shas=(state.snapshot.candidate_shas if candidate_shas is None else candidate_shas),
            contract_hashes=(
                {} if metadata is None else metadata.contract_hashes
            ) if contract_hashes is None else contract_hashes,
        )

    def _state_problem(self, state: WorkflowState, parent_identifier: str) -> str | None:
        if not isinstance(state, WorkflowState) or state.parent_identifier != parent_identifier:
            return "authoritative parent read returned the wrong parent"
        if state.project_key not in self.project_keys:
            return "parent is outside the configured instance projects"
        if state.metadata is None:
            return "parent has no initialized workflow metadata"
        metadata = state.metadata
        if (
            metadata.workflow_version not in self.supported_workflow_versions
            or metadata.instance_key != self.manifest.instance.key
        ):
            return "parent workflow version or instance is unsupported"
        if tuple(metadata.affected_repositories) != tuple(state.snapshot.affected_repositories):
            return "parent affected repository metadata disagrees with its snapshot"
        if dict(metadata.candidate_shas) != dict(state.snapshot.candidate_shas):
            return "parent candidate SHA metadata disagrees with its snapshot"
        if metadata.merge_state != state.snapshot.merge_state or metadata.attempt != state.snapshot.attempt:
            return "parent transition metadata disagrees with its snapshot"
        return None

    def _metadata(
        self,
        state: WorkflowState,
        *,
        action_key: str,
        stage_ordinal: int | None = None,
        attempt: int | None = None,
        candidate_shas: Mapping[str, str] | None = None,
        merge_plan: tuple[str, ...] | None = None,
        merge_state: str | None = None,
    ) -> ParentMetadata:
        if state.metadata is None:
            raise WorkflowError("parent has no initialized workflow metadata")
        values: dict[str, object] = {"last_action": action_key}
        if stage_ordinal is not None:
            values["stage_ordinal"] = stage_ordinal
        if attempt is not None:
            values["attempt"] = attempt
        if candidate_shas is not None:
            values["candidate_shas"] = candidate_shas
        if merge_plan is not None:
            values["merge_plan"] = merge_plan
        if merge_state is not None:
            values["merge_state"] = merge_state
        try:
            return replace(state.metadata, **values)
        except (MetadataError, TypeError) as error:
            raise WorkflowError("parent metadata transition is invalid") from error

    def _block(
        self,
        state: WorkflowState,
        reason: str,
        *,
        stage_kind: str = "block",
        merge_state: str | None = None,
        merged_shas: Mapping[str, str] | None = None,
        action_key: str | None = None,
    ) -> WorkflowResult:
        if state.metadata is None:
            return WorkflowResult(
                state.parent_identifier,
                "blocked",
                "block",
                reason,
                merge_state=merge_state or state.snapshot.merge_state,
            )
        key = action_key or self._action_key(
            state,
            stage_kind,
            state.metadata.stage_ordinal,
        )
        target_merge_state = merge_state or state.metadata.merge_state
        metadata = self._metadata(
            state,
            action_key=key,
            merge_state=target_merge_state,
        )
        mutations = 0
        try:
            if merge_state is not None:
                self.executor.record_merge_state(
                    state.parent_identifier,
                    merge_state,
                    dict(merged_shas or state.snapshot.merged_shas),
                    metadata,
                    action_key=key,
                )
                mutations += 1
                state = self.snapshot_reader.read(state.parent_identifier)
                metadata = state.metadata or metadata
            self.executor.set_parent_status(
                state.parent_identifier,
                "blocked",
                reason,
                metadata,
                action_key=key,
            )
            mutations += 1
            state = self.snapshot_reader.read(state.parent_identifier)
        except Exception:
            return WorkflowResult(
                state.parent_identifier,
                "blocked",
                "block",
                reason,
                merge_state=target_merge_state,
                action_key=key,
                mutation_count=mutations,
            )
        return self._result(
            state,
            "block",
            reason,
            action_key=key,
            mutation_count=mutations,
            merge_state=target_merge_state,
        )

    def _human_clarification(self, state: WorkflowState, reason: str) -> WorkflowResult:
        affected = frozenset(state.snapshot.affected_repositories)
        key = self._action_key(
            state,
            "human-clarification",
            0 if state.metadata is None else state.metadata.stage_ordinal,
            affected=affected,
            candidate_shas=state.snapshot.candidate_shas,
        )
        if key in state.applied_action_keys or state.human_wait:
            return self._result(state, "human-clarification", reason, action_key=key)
        try:
            self.executor.request_human_clarification(
                state.parent_identifier,
                reason,
                action_key=key,
            )
            state = self.snapshot_reader.read(state.parent_identifier)
        except Exception:
            return WorkflowResult(
                state.parent_identifier,
                "blocked",
                "block",
                "human clarification could not be recorded",
                action_key=key,
            )
        return self._result(
            state,
            "human-clarification",
            reason,
            action_key=key,
            mutation_count=1,
        )

    def handle_status_change(
        self,
        parent_identifier: str,
        old_status: str,
        new_status: str,
    ) -> WorkflowResult:
        if old_status != "backlog" or new_status != "todo":
            return WorkflowResult(parent_identifier, new_status, "noop", "status transition does not start intake")
        if self.scope_resolver is not None:
            try:
                resolution = self.scope_resolver.resolve(parent_identifier)
            except Exception:
                return WorkflowResult(
                    parent_identifier,
                    "blocked",
                    "block",
                    "parent scope resolution failed",
                )
            if not isinstance(resolution, ScopeResolution):
                return WorkflowResult(
                    parent_identifier,
                    "blocked",
                    "block",
                    "parent scope resolution is malformed",
                )
            return self.handle_parent_event(
                parent_identifier,
                affected=resolution.affected,
                affected_candidates=resolution.affected_candidates,
                contract_hashes=resolution.contract_hashes,
                authority_requirements=resolution.authority_requirements,
            )
        return WorkflowResult(parent_identifier, "todo", "dispatch", "Backlog to Todo starts parent intake")

    def _scope_problem(self, affected: frozenset[str]) -> str | None:
        if not affected:
            return "affected repository scope is missing"
        unknown = sorted(affected - self.manifest.repositories.keys())
        if unknown:
            return "affected repository scope is outside the manifest"
        for repository in sorted(affected):
            missing = sorted(set(self.manifest.repositories[repository].depends_on) - affected)
            if missing:
                return "affected repository scope is not dependency-closed"
        return None

    def handle_parent_event(
        self,
        parent_identifier: str,
        *,
        affected: frozenset[str] | None = None,
        affected_candidates: tuple[frozenset[str], ...] = (),
        contract_hashes: Mapping[str, str] | None = None,
        authority_requirements: tuple[str, ...] = (),
    ) -> WorkflowResult:
        try:
            state = self.snapshot_reader.read(parent_identifier)
        except Exception:
            return WorkflowResult(parent_identifier, "blocked", "block", "parent could not be read")
        if state.metadata is not None:
            existing = frozenset(state.metadata.affected_repositories)
            if authority_requirements:
                return self._human_clarification(
                    state,
                    "new authority requirements need human approval",
                )
            existing_candidates: set[frozenset[str]] = set()
            try:
                for candidate in affected_candidates:
                    existing_candidates.add(frozenset(candidate))
            except TypeError:
                return self._human_clarification(
                    state,
                    "affected repository candidates are malformed",
                )
            if affected is not None:
                if not isinstance(affected, frozenset):
                    return self._human_clarification(
                        state,
                        "affected repository scope is malformed",
                    )
                existing_candidates.add(affected)
            if existing_candidates and (
                len(existing_candidates) != 1 or next(iter(existing_candidates)) != existing
            ):
                return self._human_clarification(state, "new affected scope conflicts with initialized parent")
            if contract_hashes is not None:
                try:
                    supplied_hashes = dict(contract_hashes)
                except (TypeError, ValueError):
                    return self._human_clarification(
                        state,
                        "interface contract hashes are malformed",
                    )
                if (
                    any(
                        not isinstance(key, str) or not _valid_sha(value)
                        for key, value in supplied_hashes.items()
                    )
                    or supplied_hashes != dict(state.metadata.contract_hashes)
                ):
                    return self._human_clarification(
                        state,
                        "new interface contract requirements conflict with initialized parent",
                    )
            if state.human_wait or state.active_work or any(
                child.active and child.status in _ACTIVE_CHILD_STATUSES for child in state.children
            ):
                return self._result(state, "noop", "an intended successor is already active")
            return self.resume_parent(parent_identifier)

        if authority_requirements:
            return self._human_clarification(state, "new authority requirements need human approval")
        normalized_candidates: set[frozenset[str]] = set()
        try:
            for candidate in affected_candidates:
                normalized_candidates.add(frozenset(candidate))
        except TypeError:
            return self._human_clarification(state, "affected repository candidates are malformed")
        if affected is not None:
            if not isinstance(affected, frozenset):
                return self._human_clarification(state, "affected repository scope is malformed")
            normalized_candidates.add(affected)
        if len(normalized_candidates) != 1:
            return self._human_clarification(state, "affected repository scope is ambiguous")
        selected = next(iter(normalized_candidates))
        problem = self._scope_problem(selected)
        if problem is not None:
            return self._human_clarification(state, problem)
        hashes = dict(contract_hashes or {})
        if any(not isinstance(key, str) or not _valid_sha(value) for key, value in hashes.items()):
            return self._human_clarification(state, "interface contract hashes are malformed")
        dag = {
            repository: tuple(
                dependency
                for dependency in self.manifest.repositories[repository].depends_on
                if dependency in selected
            )
            for repository in sorted(selected)
        }
        key = coordinator_action_key(
            workflow_version=self.workflow_version,
            instance_key=self.manifest.instance.key,
            parent_identifier=parent_identifier,
            stage_kind="intake",
            stage_ordinal=0,
            attempt=0,
            affected_repositories=selected,
            candidate_shas={},
            contract_hashes=hashes,
        )
        if key in state.applied_action_keys:
            return self._result(
                state,
                "noop",
                "parent intake action already exists",
                action_key=key,
            )
        try:
            metadata = ParentMetadata(
                workflow_version=self.workflow_version,
                metadata_version=1,
                instance_key=self.manifest.instance.key,
                affected_repositories=tuple(
                    repository for repository in self.manifest.merge_order if repository in selected
                ),
                repository_dag=dag,
                candidate_shas={},
                contract_hashes=hashes,
                stage_ordinal=0,
                merge_plan=(),
                merge_state="pending",
                attempt=0,
                last_action=key,
            )
            self.executor.initialize_parent(parent_identifier, metadata, action_key=key)
        except Exception:
            return WorkflowResult(parent_identifier, "blocked", "block", "parent intake could not be initialized")
        return self.resume_parent(parent_identifier)

    def _ordered(self, repositories: set[str] | frozenset[str]) -> tuple[str, ...]:
        return tuple(repository for repository in self.manifest.merge_order if repository in repositories)

    def _implementation_requests(
        self,
        state: WorkflowState,
        repositories: tuple[str, ...],
        ordinal: int,
    ) -> tuple[ChildRequest, ...]:
        return tuple(
            ChildRequest(
                target_key=repository,
                repository_key=repository,
                suite_key="",
                phase="implementation",
                stage_ordinal=ordinal,
                attempt=state.snapshot.attempt,
                candidate_shas=state.snapshot.candidate_shas,
            )
            for repository in repositories
        )

    def _gate_requests(self, state: WorkflowState, ordinal: int) -> tuple[ChildRequest, ...]:
        affected = frozenset(state.snapshot.affected_repositories)
        requests: list[ChildRequest] = []
        for repository in self._ordered(affected):
            if repository not in state.snapshot.reviews:
                requests.append(
                    ChildRequest(
                        repository,
                        repository,
                        "",
                        "review",
                        ordinal,
                        state.snapshot.attempt,
                        state.snapshot.candidate_shas,
                        state.pull_requests.get(repository),
                    )
                )
            if repository not in state.snapshot.qa:
                requests.append(
                    ChildRequest(
                        repository,
                        repository,
                        "",
                        "qa",
                        ordinal,
                        state.snapshot.attempt,
                        state.snapshot.candidate_shas,
                        state.pull_requests.get(repository),
                    )
                )
        for suite in self.manifest.integration_suites:
            if set(suite.repositories) <= affected and suite.key not in state.snapshot.integration_qa:
                requests.append(
                    ChildRequest(
                        suite.key,
                        suite.command_repository,
                        suite.key,
                        "integration_qa",
                        ordinal,
                        state.snapshot.attempt,
                        state.snapshot.candidate_shas,
                    )
                )
        return tuple(requests)

    @staticmethod
    def _has_successor(state: WorkflowState, requests: tuple[ChildRequest, ...]) -> bool:
        wanted = {
            (request.target_key, request.phase, request.attempt)
            for request in requests
        }
        return any(
            (child.target_key, child.phase, child.attempt) in wanted
            for child in state.children
        )

    def _dispatch(
        self,
        state: WorkflowState,
        decision: ParentDecision,
        *,
        repair: bool = False,
    ) -> WorkflowResult:
        if state.metadata is None:
            return self._block(state, "parent has no initialized workflow metadata")
        ordinal = state.metadata.stage_ordinal + 1
        if repair:
            if decision.next_attempt is None:
                return self._block(state, "repair decision lacks the next attempt")
            missing_prs = set(decision.repositories) - state.pull_requests.keys()
            if missing_prs:
                return self._block(state, "repair cannot identify every existing pull request")
            requests = tuple(
                ChildRequest(
                    repository,
                    repository,
                    "",
                    "repair",
                    ordinal,
                    decision.next_attempt,
                    state.snapshot.candidate_shas,
                    state.pull_requests[repository],
                )
                for repository in decision.repositories
            )
            stage_kind = "repair"
            attempt = decision.next_attempt
            next_action = "repair"
        else:
            gate_dispatch = "review and QA" in decision.reason
            requests = (
                self._gate_requests(state, ordinal)
                if gate_dispatch
                else self._implementation_requests(state, decision.repositories, ordinal)
            )
            stage_kind = "gates" if gate_dispatch else "implementation"
            attempt = state.snapshot.attempt
            next_action = "dispatch"
        if not requests:
            return self._result(state, "noop", "requested successor already exists")
        if self._has_successor(state, requests):
            return self._result(state, "noop", "an intended successor already exists")
        key = self._action_key(
            state,
            stage_kind,
            ordinal,
            attempt=attempt,
        )
        if key in state.applied_action_keys:
            return self._result(state, "noop", "coordinator action already exists", action_key=key)
        metadata = self._metadata(
            state,
            action_key=key,
            stage_ordinal=ordinal,
            attempt=attempt,
        )
        try:
            self.executor.create_children(
                state.parent_identifier,
                requests,
                metadata,
                action_key=key,
            )
            state = self.snapshot_reader.read(state.parent_identifier)
        except Exception:
            return self._block(state, "successor creation failed", stage_kind=stage_kind)
        return self._result(
            state,
            next_action,
            decision.reason,
            created=tuple((request.target_key, request.phase) for request in requests),
            action_key=key,
            mutation_count=1,
        )

    def resume_parent(self, parent_identifier: str) -> WorkflowResult:
        try:
            state = self.snapshot_reader.read(parent_identifier)
        except Exception:
            return WorkflowResult(parent_identifier, "blocked", "block", "parent could not be read")
        problem = self._state_problem(state, parent_identifier)
        if problem is not None:
            return self._block(state, problem)
        if state.parent_status == "done":
            return self._result(state, "noop", "parent is already done")
        if state.parent_status not in _ACTIVE_PARENT_STATUSES:
            return self._result(state, "noop", "parent is not active")
        if state.human_wait:
            return self._result(state, "wait", "parent is waiting for a human")
        decision = decide_parent_action(self.manifest, state.snapshot)
        if decision.kind is DecisionKind.DISPATCH:
            if state.snapshot.stalled:
                return self._result(state, "wait", "stalled work is reserved for bounded recovery")
            return self._dispatch(state, decision)
        if decision.kind is DecisionKind.REPAIR:
            return self._dispatch(state, decision, repair=True)
        if decision.kind is DecisionKind.MERGE:
            return self.execute_merge_plan(parent_identifier)
        if decision.kind is DecisionKind.SMOKE:
            return self._result(state, "smoke", decision.reason)
        if decision.kind is DecisionKind.WAIT:
            return self._result(state, "wait", decision.reason)
        if decision.kind is DecisionKind.BLOCK:
            return self._block(state, decision.reason)
        if decision.kind is not DecisionKind.COMPLETE:
            return self._block(state, "parent decision is unsupported")

        fresh = self.snapshot_reader.read(parent_identifier)
        if fresh != state or decide_parent_action(self.manifest, fresh.snapshot) != decision:
            return self._result(fresh, "noop", "parent changed before completion")
        assert fresh.metadata is not None
        key = self._action_key(fresh, "complete", fresh.metadata.stage_ordinal)
        if key in fresh.applied_action_keys:
            return self._result(fresh, "noop", "parent completion already exists", action_key=key)
        metadata = self._metadata(fresh, action_key=key)
        try:
            self.executor.set_parent_status(
                parent_identifier,
                "done",
                decision.reason,
                metadata,
                action_key=key,
            )
            observed = self.snapshot_reader.read(parent_identifier)
        except Exception:
            return self._block(fresh, "parent completion write failed")
        if observed.parent_status != "done":
            return self._block(observed, "parent completion was not authoritative")
        return self._result(observed, "complete", decision.reason, action_key=key, mutation_count=1)

    def _completion_problem(
        self,
        state: WorkflowState,
        completion: PhaseCompletion,
    ) -> tuple[str | None, WorkflowChild | None]:
        if not isinstance(completion, PhaseCompletion):
            return "phase completion is malformed", None
        if completion.parent_identifier != state.parent_identifier:
            return "phase completion names the wrong parent", None
        if completion.phase not in _PHASES - {"smoke"} or completion.result not in _PHASE_RESULTS:
            return "phase completion kind or result is unsupported", None
        if (
            not isinstance(completion.attempt, int)
            or isinstance(completion.attempt, bool)
            or not 0 <= completion.attempt <= self.manifest.policy.max_repair_attempts
            or completion.attempt != state.snapshot.attempt
        ):
            return "phase completion attempt is not current", None
        if completion.repository_key not in state.snapshot.affected_repositories:
            return "phase completion repository is not affected", None
        if not _valid_sha(completion.candidate_sha):
            return "phase completion candidate SHA is malformed", None
        try:
            observed_uuid = str(uuid.UUID(completion.evidence_comment_uuid))
        except (ValueError, AttributeError, TypeError):
            return "phase completion evidence UUID is malformed", None
        evidence_url = urlsplit(completion.evidence_comment_url)
        if (
            observed_uuid != completion.evidence_comment_uuid
            or evidence_url.scheme != "https"
            or not evidence_url.netloc
            or evidence_url.username is not None
            or evidence_url.password is not None
        ):
            return "phase completion evidence is malformed", None
        repository = self.manifest.repositories[completion.repository_key]
        if completion.pull_request_url:
            target = state.pull_requests.get(completion.repository_key)
            parsed = urlsplit(completion.pull_request_url)
            prefix = f"/{repository.github}/pull/"
            if (
                parsed.scheme != "https"
                or parsed.netloc != "github.com"
                or not parsed.path.startswith(prefix)
                or not parsed.path[len(prefix):].isdigit()
                or parsed.query
                or parsed.fragment
            ):
                return "phase completion pull request is outside the managed repository", None
            if completion.phase == "repair" and (
                target is None or target.url != completion.pull_request_url
            ):
                return "repair must update the existing repository pull request", None
        elif completion.phase in {"implementation", "repair"}:
            return "implementation and repair completions require a pull request", None

        if completion.phase == "integration_qa":
            suites = {
                suite.key: suite
                for suite in self.manifest.integration_suites
                if set(suite.repositories) <= set(state.snapshot.affected_repositories)
            }
            if completion.suite_key not in suites:
                return "integration QA suite is not applicable", None
            completion_shas = dict(completion.candidate_shas)
            if (
                set(completion_shas) != set(state.snapshot.affected_repositories)
                or any(not _valid_sha(sha) for sha in completion_shas.values())
                or completion_shas.get(completion.repository_key) != completion.candidate_sha
            ):
                return "integration QA completion SHA map is malformed", None
        elif completion.suite_key or completion.candidate_shas:
            return "repository phase completion contains integration-only fields", None

        matching = tuple(
            child
            for child in state.children
            if child.phase == completion.phase
            and child.attempt == completion.attempt
            and (
                child.repository_key == completion.repository_key
                if completion.phase != "integration_qa"
                else child.suite_key == completion.suite_key
            )
        )
        if len(matching) != 1:
            return "phase completion does not resolve one intended child", None
        return None, matching[0]

    def record_phase_completion(self, completion: PhaseCompletion) -> WorkflowResult:
        parent_identifier = getattr(completion, "parent_identifier", "")
        try:
            state = self.snapshot_reader.read(parent_identifier)
        except Exception:
            return WorkflowResult(parent_identifier, "blocked", "block", "parent could not be read")
        problem = self._state_problem(state, parent_identifier)
        if problem is not None:
            return self._block(state, problem)
        completion_problem, child = self._completion_problem(state, completion)
        if completion_problem is not None or child is None:
            return self._block(state, completion_problem or "phase completion child is missing")
        if child.status == "done":
            if child.evidence_comment_uuid == completion.evidence_comment_uuid:
                return self._result(
                    state,
                    "noop",
                    "phase completion already exists",
                    completed_child_status="done",
                )
            return self._block(state, "terminal child has conflicting completion evidence")
        previous_candidate_sha = state.snapshot.candidate_shas.get(
            completion.repository_key
        )
        candidate_shas = dict(state.snapshot.candidate_shas)
        if completion.phase in {"implementation", "repair"}:
            candidate_shas[completion.repository_key] = completion.candidate_sha
        action_candidates = (
            completion.candidate_shas
            if completion.phase == "integration_qa"
            else {
                **state.snapshot.candidate_shas,
                completion.repository_key: completion.candidate_sha,
            }
        )
        key = self._action_key(
            state,
            f"{completion.phase}:{child.target_key}",
            child.stage_ordinal,
            attempt=completion.attempt,
            candidate_shas=action_candidates,
        )
        merge_plan = state.metadata.merge_plan if state.metadata is not None else ()
        merge_state = state.metadata.merge_state if state.metadata is not None else "pending"
        if dict(candidate_shas) != dict(state.snapshot.candidate_shas):
            merge_plan = ()
            merge_state = "pending"
        metadata = self._metadata(
            state,
            action_key=key,
            candidate_shas=candidate_shas,
            merge_plan=merge_plan,
            merge_state=merge_state,
        )
        try:
            self.executor.write_phase_completion(completion, action_key=key)
            observed = self.snapshot_reader.read_phase_completion(
                parent_identifier,
                completion.evidence_comment_uuid,
            )
        except Exception:
            return self._block(state, "phase completion evidence write failed")
        if observed != completion:
            return self._block(state, "phase completion evidence reread did not match")
        try:
            verified_state = self.snapshot_reader.read(parent_identifier)
        except Exception:
            return self._block(state, "parent metadata reread failed before phase completion")
        if verified_state != state:
            return self._block(
                verified_state,
                "parent metadata changed before phase child completion",
            )
        try:
            self.executor.mark_child_done(
                parent_identifier,
                completion,
                metadata,
                action_key=key,
            )
            done_state = self.snapshot_reader.read(parent_identifier)
        except Exception:
            return self._block(state, "phase child could not be marked done")
        completed = tuple(
            item
            for item in done_state.children
            if item.evidence_comment_uuid == completion.evidence_comment_uuid
            and item.status == "done"
        )
        if len(completed) != 1:
            return self._block(done_state, "phase child done status was not authoritative")
        replacement = (
            completion.phase in {"implementation", "repair"}
            and previous_candidate_sha is not None
            and previous_candidate_sha != completion.candidate_sha
        )
        if replacement:
            previous_target = state.pull_requests.get(completion.repository_key)
            current_target = done_state.pull_requests.get(completion.repository_key)
            pull_request = done_state.snapshot.pull_requests.get(completion.repository_key)
            invalidation_failed = (
                dict(done_state.snapshot.candidate_shas) != candidate_shas
                or bool(done_state.snapshot.reviews)
                or bool(done_state.snapshot.qa)
                or bool(done_state.snapshot.integration_qa)
                or bool(done_state.snapshot.smoke_reads)
                or pull_request is None
                or pull_request.head_sha != completion.candidate_sha
                or (
                    completion.phase == "repair"
                    and (previous_target is None or current_target != previous_target)
                )
            )
            if invalidation_failed:
                blocked = self._block(
                    done_state,
                    "replacement SHA did not authoritatively invalidate every gate",
                )
                return replace(blocked, completed_child_status="done")
        resumed = self.resume_parent(parent_identifier)
        return replace(resumed, completed_child_status="done")

    def _preflight(
        self,
        state: WorkflowState,
        order: tuple[str, ...],
    ) -> str | None:
        if self.github is None:
            return "GitHub merge boundary is unavailable"
        if set(state.pull_requests) != set(order):
            return "merge plan lacks exact pull request targets"
        problems: list[str] = []
        for repository in order:
            target = state.pull_requests[repository]
            repository_spec = self.manifest.repositories[repository]
            try:
                pull_request = self.github.get_pull_request(repository_spec.github, target.number)
                if (
                    pull_request.repository != repository_spec.github
                    or pull_request.number != target.number
                    or pull_request.state != "open"
                    or pull_request.head_sha != state.snapshot.candidate_shas[repository]
                    or pull_request.base_ref != repository_spec.default_branch
                    or pull_request.mergeable is not True
                ):
                    problems.append(f"{repository} pull request changed before merge")
                checks = self.github.required_status_checks(
                    repository_spec.github,
                    repository_spec.default_branch,
                    state.snapshot.candidate_shas[repository],
                )
                if (
                    checks.repository != repository_spec.github
                    or checks.base_ref != repository_spec.default_branch
                    or checks.sha != state.snapshot.candidate_shas[repository]
                    or checks.passing is not True
                ):
                    problems.append(
                        f"{repository} required checks did not pass exact-SHA preflight"
                    )
            except (GitHubBoundaryError, RuntimeError, TypeError, ValueError):
                problems.append(f"{repository} merge preflight failed")
        return "; ".join(problems) or None

    def execute_merge_plan(self, parent_identifier: str) -> WorkflowResult:
        try:
            state = self.snapshot_reader.read(parent_identifier)
        except Exception:
            return WorkflowResult(parent_identifier, "blocked", "block", "parent could not be read")
        problem = self._state_problem(state, parent_identifier)
        if problem is not None:
            return self._block(state, problem, stage_kind="merge")
        affected = frozenset(state.snapshot.affected_repositories)
        observed_merged = set(state.snapshot.merged_shas) | {
            repository
            for repository, evidence in state.snapshot.pull_requests.items()
            if evidence.state == "merged"
        }
        if observed_merged and observed_merged != affected:
            return self._block(
                state,
                "cross-repository merge is already partial; rollback is forbidden",
                stage_kind="merge",
                merge_state="partial",
                merged_shas=state.snapshot.merged_shas,
            )
        decision = decide_parent_action(self.manifest, state.snapshot)
        if decision.kind is DecisionKind.BLOCK:
            return self._block(state, decision.reason, stage_kind="merge")
        if decision.kind is not DecisionKind.MERGE:
            if decision.kind in {DecisionKind.SMOKE, DecisionKind.COMPLETE}:
                return self.resume_parent(parent_identifier)
            return self._result(state, "noop", "parent is not merge-authorized")
        try:
            confirmed = tuple(repository for repository in self.manifest.merge_order if repository in affected)
            order = merge_order(self.manifest.repositories, affected, confirmed)
        except TopologyError:
            return self._block(state, "merge order is not dependency-safe", stage_kind="merge")

        preflight_problem = self._preflight(state, order)
        if preflight_problem is not None:
            return self._block(
                state,
                preflight_problem,
                stage_kind="merge",
                merge_state="blocked",
                merged_shas={},
            )
        fresh = self.snapshot_reader.read(parent_identifier)
        if fresh != state or decide_parent_action(self.manifest, fresh.snapshot) != decision:
            return self._result(fresh, "noop", "parent changed during all-PR preflight")
        assert fresh.metadata is not None
        ordinal = fresh.metadata.stage_ordinal + 1
        key = self._action_key(fresh, "merge", ordinal)
        metadata = self._metadata(
            fresh,
            action_key=key,
            stage_ordinal=ordinal,
            merge_plan=order,
            merge_state="merging",
        )
        try:
            self.executor.record_merge_state(
                parent_identifier,
                "merging",
                {},
                metadata,
                action_key=key,
            )
        except Exception:
            return self._block(fresh, "merge state could not be reserved", stage_kind="merge")

        merged: dict[str, str] = {}
        for repository in order:
            target = fresh.pull_requests[repository]
            expected_sha = fresh.snapshot.candidate_shas[repository]
            try:
                assert self.github is not None
                result = self.github.merge_pull_request(
                    self.manifest.repositories[repository].github,
                    target.number,
                    expected_sha=expected_sha,
                )
                if (
                    not isinstance(result, MergeResult)
                    or result.repository != self.manifest.repositories[repository].github
                    or result.number != target.number
                    or result.merged is not True
                    or result.head_sha != expected_sha
                    or not _valid_sha(result.merged_sha)
                ):
                    raise WorkflowError("merge acknowledgement is malformed")
                merged[repository] = expected_sha
                current = self.snapshot_reader.read(parent_identifier)
                progress_metadata = self._metadata(
                    current,
                    action_key=key,
                    stage_ordinal=ordinal,
                    merge_plan=order,
                    merge_state="merging",
                )
                self.executor.record_merge_state(
                    parent_identifier,
                    "merging",
                    merged,
                    progress_metadata,
                    action_key=key,
                )
            except Exception:
                current = self.snapshot_reader.read(parent_identifier)
                failed_state = "partial" if merged else "blocked"
                return self._block(
                    current,
                    "merge sequence failed; rollback and deployment are forbidden",
                    stage_kind="merge",
                    merge_state=failed_state,
                    merged_shas=merged,
                    action_key=key,
                )

        current = self.snapshot_reader.read(parent_identifier)
        merged_metadata = self._metadata(
            current,
            action_key=key,
            stage_ordinal=ordinal,
            merge_plan=order,
            merge_state="merged",
        )
        try:
            self.executor.record_merge_state(
                parent_identifier,
                "merged",
                merged,
                merged_metadata,
                action_key=key,
            )
        except Exception:
            return self._block(
                current,
                "complete merge evidence could not be recorded",
                stage_kind="merge",
                merge_state="partial",
                merged_shas=merged,
                action_key=key,
            )
        resumed = (
            self.execute_smoke(parent_identifier)
            if self.smoke_executor is not None
            else self.resume_parent(parent_identifier)
        )
        return replace(resumed, merge_state="merged")

    def _smoke_problem(self, state: WorkflowState, smoke_read: SmokeRead) -> str | None:
        if not isinstance(smoke_read, SmokeRead):
            return "smoke read is malformed"
        affected = set(state.snapshot.affected_repositories)
        expected_suites = {
            suite.key
            for suite in self.manifest.integration_suites
            if set(suite.repositories) <= affected
        }
        if (
            set(smoke_read.merged_shas) != affected
            or dict(smoke_read.merged_shas) != dict(state.snapshot.merged_shas)
            or any(not _valid_sha(sha) for sha in smoke_read.merged_shas.values())
            or set(smoke_read.repository_results) != affected
            or set(smoke_read.integration_results) != expected_suites
            or any(value not in {"pending", "pass", "fail", "blocked"} for value in smoke_read.repository_results.values())
            or any(value not in {"pending", "pass", "fail", "blocked"} for value in smoke_read.integration_results.values())
            or not isinstance(smoke_read.authoritative, bool)
        ):
            return "smoke read does not cover the exact merged scope"
        return None

    def record_smoke_read(self, parent_identifier: str, smoke_read: SmokeRead) -> WorkflowResult:
        try:
            state = self.snapshot_reader.read(parent_identifier)
        except Exception:
            return WorkflowResult(parent_identifier, "blocked", "block", "parent could not be read")
        problem = self._state_problem(state, parent_identifier) or self._smoke_problem(state, smoke_read)
        if problem is not None:
            return self._block(state, problem, stage_kind="smoke")
        assert state.metadata is not None
        ordinal = state.metadata.stage_ordinal + 1
        key = self._action_key(state, "smoke", ordinal)
        metadata = self._metadata(
            state,
            action_key=key,
            stage_ordinal=ordinal,
        )
        before = state.snapshot.smoke_reads
        try:
            self.executor.write_smoke_read(
                parent_identifier,
                smoke_read,
                metadata,
                action_key=key,
            )
            observed = self.snapshot_reader.read_smoke_reads(parent_identifier)
        except Exception:
            return self._block(state, "smoke evidence write failed", stage_kind="smoke")
        if observed != before + (smoke_read,):
            return self._block(state, "smoke evidence reread did not match", stage_kind="smoke")
        return self.resume_parent(parent_identifier)

    def execute_smoke(self, parent_identifier: str) -> WorkflowResult:
        try:
            state = self.snapshot_reader.read(parent_identifier)
        except Exception:
            return WorkflowResult(parent_identifier, "blocked", "block", "parent could not be read")
        problem = self._state_problem(state, parent_identifier)
        if problem is not None:
            return self._block(state, problem, stage_kind="smoke")
        decision = decide_parent_action(self.manifest, state.snapshot)
        if decision.kind is not DecisionKind.SMOKE:
            return self._result(state, "noop", "parent is not smoke-authorized")
        if self.smoke_executor is None:
            return self._block(state, "owned smoke executor is unavailable", stage_kind="smoke")
        assert state.metadata is not None
        ordinal = state.metadata.stage_ordinal + 1
        key = self._action_key(state, "smoke", ordinal)
        try:
            smoke_read = self.smoke_executor.execute(
                parent_identifier,
                decision.repositories,
                state.snapshot.merged_shas,
                action_key=key,
            )
        except Exception:
            return self._block(state, "owned exact-SHA smoke execution failed", stage_kind="smoke")
        return self.record_smoke_read(parent_identifier, smoke_read)

    def _watch_scope_problem(self, state: WorkflowState) -> str | None:
        if state.parent_status not in _ACTIVE_PARENT_STATUSES:
            return "parent is not active"
        if state.project_key not in self.project_keys:
            return "parent is outside configured projects"
        if (
            state.metadata is None
            or state.metadata.instance_key != self.manifest.instance.key
            or state.metadata.workflow_version not in self.supported_workflow_versions
        ):
            return "parent workflow is unsupported"
        return None

    def recover_stalled_parent(
        self,
        parent_identifier: str,
        *,
        now: datetime | None = None,
    ) -> WorkflowResult:
        if now is not None and (not isinstance(now, datetime) or now.tzinfo is None):
            return WorkflowResult(parent_identifier, "blocked", "block", "recovery time must be timezone-aware")
        try:
            initial = self.snapshot_reader.read(parent_identifier)
        except Exception:
            return WorkflowResult(parent_identifier, "blocked", "block", "parent could not be read")
        scope_problem = self._watch_scope_problem(initial)
        if scope_problem is not None or initial.human_wait or initial.active_work or not initial.snapshot.stalled:
            return self._result(initial, "noop", scope_problem or "work is healthy or waiting for a human")
        decision = decide_parent_action(self.manifest, initial.snapshot)
        if decision.kind is DecisionKind.BLOCK and initial.snapshot.recovery_count >= 1:
            return self._block(initial, decision.reason, stage_kind="recovery-block")
        if decision.kind is not DecisionKind.DISPATCH or len(decision.repositories) != 1:
            return self._result(initial, "noop", "watcher has no bounded rerun action")
        repository = decision.repositories[0]
        candidates = tuple(
            child
            for child in initial.children
            if child.repository_key == repository
            and child.attempt == initial.snapshot.attempt
            and child.status in _ACTIVE_CHILD_STATUSES
            and not child.active
        )
        if len(candidates) != 1:
            return self._result(initial, "noop", "watcher cannot identify one existing stalled child")

        fresh = self.snapshot_reader.read(parent_identifier)
        if (
            fresh != initial
            or self._watch_scope_problem(fresh) is not None
            or fresh.human_wait
            or fresh.active_work
            or decide_parent_action(self.manifest, fresh.snapshot) != decision
        ):
            return self._result(fresh, "noop", "workflow changed before recovery")
        assert fresh.metadata is not None
        key = self._action_key(
            fresh,
            "recovery",
            fresh.metadata.stage_ordinal,
        )
        if key in fresh.applied_action_keys:
            return self._result(fresh, "noop", "recovery action already exists", action_key=key)
        metadata = self._metadata(fresh, action_key=key)
        before_children = fresh.children
        target_identifier = candidates[0].identifier
        try:
            self.executor.rerun_child(
                parent_identifier,
                target_identifier,
                metadata,
                action_key=key,
            )
            observed = self.snapshot_reader.read(parent_identifier)
        except Exception:
            return self._block(
                fresh,
                "bounded recovery mutation failed",
                stage_kind="recovery-block",
            )

        def child_identity(child: WorkflowChild) -> tuple[object, ...]:
            return (
                child.identifier,
                child.target_key,
                child.repository_key,
                child.suite_key,
                child.phase,
                child.stage_ordinal,
                child.attempt,
                child.action_key,
                child.evidence_comment_uuid,
            )

        normalized_observed_snapshot = replace(
            observed.snapshot,
            recovery_count=fresh.snapshot.recovery_count,
            stalled=fresh.snapshot.stalled,
            stalled_repository=fresh.snapshot.stalled_repository,
        )
        unchanged_other_children = all(
            before == after
            for before, after in zip(before_children, observed.children, strict=False)
            if before.identifier != target_identifier
        )
        if (
            observed.parent_identifier != fresh.parent_identifier
            or observed.parent_status != fresh.parent_status
            or observed.project_key != fresh.project_key
            or observed.snapshot.recovery_count != fresh.snapshot.recovery_count + 1
            or normalized_observed_snapshot != fresh.snapshot
            or tuple(map(child_identity, observed.children))
            != tuple(map(child_identity, before_children))
            or not unchanged_other_children
            or observed.pull_requests != fresh.pull_requests
            or observed.metadata != metadata
            or observed.human_wait != fresh.human_wait
            or observed.applied_action_keys != fresh.applied_action_keys | {key}
        ):
            return self._block(
                observed,
                "bounded recovery verification failed",
                stage_kind="recovery-block",
            )
        return self._result(
            observed,
            "resume",
            decision.reason,
            action_key=key,
            mutation_count=1,
        )

    def watch_active_parents(self) -> WorkflowResult:
        try:
            parents = self.snapshot_reader.list_active_parents(
                instance_key=self.manifest.instance.key,
                project_keys=self.project_keys,
                workflow_versions=self.supported_workflow_versions,
            )
        except Exception:
            return WorkflowResult("", "blocked", "block", "watcher parent scan failed")
        if not isinstance(parents, tuple) or any(not isinstance(parent, str) for parent in parents):
            return WorkflowResult("", "blocked", "block", "watcher parent scan is malformed")
        candidates = 0
        for parent_identifier in parents:
            result = self.recover_stalled_parent(parent_identifier)
            if result.next_action == "noop":
                continue
            candidates += 1
            return replace(
                result,
                scanned_parents=len(parents),
                recovery_candidates=candidates,
            )
        return WorkflowResult(
            "",
            "in_progress",
            "noop",
            "watcher found no recoverable parent",
            scanned_parents=len(parents),
            recovery_candidates=0,
        )
