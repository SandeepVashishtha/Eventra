"""Effect orchestration around the pure exact-SHA parent decision engine."""

from __future__ import annotations

from collections.abc import Callable, Mapping
from dataclasses import dataclass, field, replace
from datetime import datetime
import hashlib
import re
from types import MappingProxyType
from typing import Protocol
from urllib.parse import urlsplit
import uuid

from .decisions import (
    DecisionKind,
    DispatchKind,
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
from .exact_sha import (
    ExactShaBoundaryError,
    ExactShaCommandResult,
    ExactShaVerification,
    LocalExactShaCommandRunner,
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
_TERMINAL_CHILD_STATUSES = frozenset({"done", "blocked", "cancelled"})
_FUTURE_CHILD_RELATIONSHIP = "workflow child relationship is ahead of parent metadata"
_UNINITIALIZED_PARENT_STATE = "parent has no initialized workflow metadata"


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
class _MergePrefixObservation:
    merged_shas: Mapping[str, str]
    remaining: tuple[str, ...]

    def __post_init__(self) -> None:
        object.__setattr__(
            self,
            "merged_shas",
            MappingProxyType(dict(sorted(dict(self.merged_shas).items()))),
        )
        object.__setattr__(self, "remaining", tuple(self.remaining))


class _MergePrefixObservationError(WorkflowError):
    """An authoritative ordered pull-request scan could not be trusted."""


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


@dataclass(frozen=True)
class StatusTransition:
    """Authoritative intake authorization persisted by the issue-store boundary."""

    parent_identifier: str
    old_status: str
    new_status: str
    action_key: str

    def __post_init__(self) -> None:
        if (
            not isinstance(self.parent_identifier, str)
            or _ISSUE_IDENTIFIER.fullmatch(self.parent_identifier) is None
        ):
            raise WorkflowError("status transition parent is malformed")
        if self.old_status != "backlog" or self.new_status != "todo":
            raise WorkflowError("status transition is not an intake transition")
        if not isinstance(self.action_key, str) or _ACTION_KEY.fullmatch(self.action_key) is None:
            raise WorkflowError("status transition action key is malformed")


class ScopeResolver(Protocol):
    def resolve(self, parent_identifier: str) -> ScopeResolution: ...


class WorkflowSnapshotReader(Protocol):
    def read(self, parent_identifier: str) -> WorkflowState: ...

    def read_intake_transition(
        self,
        parent_identifier: str,
    ) -> StatusTransition | None: ...

    def read_phase_completion(
        self,
        parent_identifier: str,
        evidence_comment_uuid: str,
    ) -> PhaseCompletion | None: ...

    def list_active_parents(
        self,
        *,
        instance_key: str,
        project_keys: frozenset[str],
        workflow_versions: frozenset[int],
    ) -> tuple[str, ...]: ...


class WorkflowExecutor(Protocol):
    def record_intake_transition(
        self,
        parent_identifier: str,
        old_status: str,
        new_status: str,
        *,
        action_key: str,
    ) -> None: ...

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


class OwnedSmokeExecutor:
    """Run manifest smoke commands with services owned by one exact-SHA Run."""

    __slots__ = ("_manifest", "_process_manager", "_command_runner")

    def __setattr__(self, name: str, value: object) -> None:
        raise AttributeError("owned smoke authority bindings are immutable")

    @property
    def manifest(self) -> DeliveryManifest:
        return self._manifest

    @property
    def process_manager(self) -> ProcessManager:
        return self._process_manager

    def __init__(
        self,
        manifest: DeliveryManifest,
        process_manager: ProcessManager,
        command_runner: LocalExactShaCommandRunner | None = None,
    ) -> None:
        if not isinstance(manifest, DeliveryManifest):
            raise TypeError("manifest must be a DeliveryManifest")
        runner = (
            command_runner
            if command_runner is not None
            else LocalExactShaCommandRunner(manifest)
        )
        if (
            type(runner) is not LocalExactShaCommandRunner
            or runner.manifest is not manifest
        ):
            raise TypeError("command_runner must be a LocalExactShaCommandRunner")
        object.__setattr__(self, "_manifest", manifest)
        object.__setattr__(self, "_process_manager", process_manager)
        object.__setattr__(self, "_command_runner", runner)

    def _trusted_command_runner(self) -> LocalExactShaCommandRunner:
        runner = self._command_runner
        if (
            type(runner) is not LocalExactShaCommandRunner
            or runner.manifest is not self.manifest
        ):
            raise TypeError("command_runner must be a LocalExactShaCommandRunner")
        return runner

    def execute(
        self,
        parent_identifier: str,
        repositories: tuple[str, ...],
        merged_shas: Mapping[str, str],
        *,
        action_key: str,
    ) -> SmokeRead:
        command_runner = self._trusted_command_runner()
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
        repository_results = {repository: "pending" for repository in selected}
        integration_results = {suite.key: "pending" for suite in applicable_suites}
        checkout_shas: dict[str, str] = {}
        authoritative = False

        def verify_checkouts() -> tuple[dict[str, str], str | None]:
            observed: dict[str, str] = {}
            for repository in ordered:
                specification = self.manifest.repositories[repository]
                try:
                    verification = command_runner.verify(
                        repository,
                        exact[repository],
                        specification.local_path,
                        argv=("git", "rev-parse", "HEAD"),
                    )
                except ExactShaBoundaryError as error:
                    return observed, error.repository_key
                except Exception:
                    return observed, repository
                if (
                    not isinstance(verification, ExactShaVerification)
                    or verification.repository_key != repository
                    or verification.expected_sha != exact[repository]
                    or verification.argv != ("git", "rev-parse", "HEAD")
                ):
                    return observed, repository
                observed[repository] = verification.observed_sha
            return observed, None

        checkout_shas, checkout_failure = verify_checkouts()
        if checkout_failure in repository_results:
            repository_results[checkout_failure] = "blocked"
        pre_start_bound = checkout_failure is None and checkout_shas == exact
        startup_failed = False
        if pre_start_bound:
            try:
                for repository in service_order:
                    specification = self.manifest.repositories[repository]
                    run = ProcessRun(
                        repository_key=repository,
                        run_id=run_id,
                        argv=specification.commands["start"],
                        cwd=specification.local_path,
                    )
                    if specification.services:
                        started.extend(
                            self.process_manager.start_services(
                                specification.services,
                                run,
                                candidate_sha=exact[repository],
                            )
                        )
            except (ProcessOwnershipError, OSError, RuntimeError, TypeError, ValueError):
                startup_failed = True
        else:
            startup_failed = True

        if not startup_failed:
            checkout_shas, checkout_failure = verify_checkouts()
            if checkout_failure in repository_results:
                repository_results[checkout_failure] = "blocked"
            authoritative = checkout_failure is None and checkout_shas == exact
            if not authoritative:
                startup_failed = True

        if not startup_failed and authoritative:
            command_boundary_failed = False
            for repository in ordered:
                specification = self.manifest.repositories[repository]
                try:
                    command_result = command_runner.run(
                        repository,
                        exact,
                        specification.commands["smoke"],
                        specification.local_path,
                    )
                    if (
                        not isinstance(command_result, ExactShaCommandResult)
                        or dict(command_result.verified_shas) != exact
                    ):
                        raise WorkflowError("exact-SHA command result is malformed")
                    repository_results[repository] = "pass" if command_result.passed else "fail"
                except ExactShaBoundaryError as error:
                    repository_results[repository] = "blocked"
                    if error.repository_key in repository_results:
                        repository_results[error.repository_key] = "blocked"
                        checkout_shas.pop(error.repository_key, None)
                    authoritative = False
                    command_boundary_failed = True
                    break
                except Exception:
                    repository_results[repository] = "blocked"
                    checkout_shas.pop(repository, None)
                    authoritative = False
                    command_boundary_failed = True
                    break
            suites_to_run = () if command_boundary_failed else applicable_suites
            for suite in suites_to_run:
                if any(repository_results[repository] != "pass" for repository in suite.repositories):
                    integration_results[suite.key] = "blocked"
                    continue
                command_repository = self.manifest.repositories[suite.command_repository]
                try:
                    command_result = command_runner.run(
                        suite.command_repository,
                        exact,
                        suite.command,
                        command_repository.local_path,
                    )
                    if (
                        not isinstance(command_result, ExactShaCommandResult)
                        or dict(command_result.verified_shas) != exact
                    ):
                        raise WorkflowError("exact-SHA command result is malformed")
                    integration_results[suite.key] = "pass" if command_result.passed else "fail"
                except ExactShaBoundaryError as error:
                    integration_results[suite.key] = "blocked"
                    if error.repository_key in repository_results:
                        repository_results[error.repository_key] = "blocked"
                        checkout_shas.pop(error.repository_key, None)
                    authoritative = False
                    break
                except Exception:
                    integration_results[suite.key] = "blocked"
                    checkout_shas.pop(suite.command_repository, None)
                    authoritative = False
                    break

        cleanup_failed = False
        stopped_pids: set[int] = set()
        for record in reversed(started):
            if record.pid in stopped_pids:
                continue
            stopped_pids.add(record.pid)
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
            authoritative = False
        return SmokeRead(
            observation_id=action_key,
            merged_shas=exact,
            checkout_shas=checkout_shas,
            repository_results=repository_results,
            integration_results=integration_results,
            authoritative=authoritative,
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

    def _uncertain(
        self,
        state: WorkflowState,
        reason: str,
        *,
        action_key: str | None = None,
        mutation_count: int = 0,
    ) -> WorkflowResult:
        """Report an unobservable effect without issuing a compensating mutation."""

        return self._result(
            state,
            "uncertain",
            reason,
            action_key=action_key,
            mutation_count=mutation_count,
        )

    def _reconcile_parent(
        self,
        parent_identifier: str,
        expected: Callable[[WorkflowState], bool],
    ) -> WorkflowState | None:
        for _ in range(2):
            try:
                observed = self.snapshot_reader.read(parent_identifier)
            except Exception:
                continue
            if expected(observed):
                return observed
        return None

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
            return _UNINITIALIZED_PARENT_STATE
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
        if any(
            child.stage_ordinal > metadata.stage_ordinal
            or (
                child.stage_ordinal == metadata.stage_ordinal
                and child.attempt > metadata.attempt
            )
            for child in state.children
        ):
            return _FUTURE_CHILD_RELATIONSHIP
        return None

    def _state_problem_result(
        self,
        state: WorkflowState,
        parent_identifier: str,
        *,
        stage_kind: str = "block",
        allow_uninitialized: bool = False,
        future_child_only: bool = False,
    ) -> WorkflowResult | None:
        problem = self._state_problem(state, parent_identifier)
        if allow_uninitialized and problem == _UNINITIALIZED_PARENT_STATE:
            return None
        if problem is None or (
            future_child_only and problem != _FUTURE_CHILD_RELATIONSHIP
        ):
            return None
        return self._block(state, problem, stage_kind=stage_kind)

    @staticmethod
    def _current_stage_is_active(state: WorkflowState) -> bool:
        if state.metadata is None:
            return False
        current_children = (
            child
            for child in state.children
            if child.stage_ordinal == state.metadata.stage_ordinal
            and child.attempt == state.metadata.attempt
        )
        return state.active_work or any(
            child.active or child.status not in _TERMINAL_CHILD_STATUSES
            for child in current_children
        )

    def _current_stage_wait(self, state: WorkflowState) -> WorkflowResult | None:
        if not self._current_stage_is_active(state):
            return None
        return self._result(
            state,
            "wait",
            "current Stage still has active work",
        )

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
        if reason == _FUTURE_CHILD_RELATIONSHIP:
            return WorkflowResult(
                state.parent_identifier,
                "blocked",
                "block",
                reason,
                merge_state=merge_state or state.snapshot.merge_state,
            )
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
        try:
            state = self.snapshot_reader.read(parent_identifier)
        except Exception:
            return WorkflowResult(parent_identifier, "blocked", "block", "parent could not be read")
        if (
            not isinstance(state, WorkflowState)
            or state.parent_identifier != parent_identifier
            or state.parent_status != "todo"
            or state.project_key != self.manifest.instance.control_project
        ):
            return WorkflowResult(
                parent_identifier,
                state.parent_status if isinstance(state, WorkflowState) else "blocked",
                "noop",
                "authoritative parent state does not confirm the intake transition",
            )
        problem_result = self._state_problem_result(
            state,
            parent_identifier,
            stage_kind="intake-transition",
            allow_uninitialized=True,
        )
        if problem_result is not None:
            return problem_result
        key = self._action_key(
            state,
            "intake-transition",
            0,
            affected=frozenset(),
            candidate_shas={},
            contract_hashes={},
        )
        expected = StatusTransition(parent_identifier, old_status, new_status, key)
        try:
            observed = self.snapshot_reader.read_intake_transition(parent_identifier)
            if observed is None:
                self.executor.record_intake_transition(
                    parent_identifier,
                    old_status,
                    new_status,
                    action_key=key,
                )
                observed = self.snapshot_reader.read_intake_transition(parent_identifier)
            authoritative = self.snapshot_reader.read(parent_identifier)
        except Exception:
            return WorkflowResult(
                parent_identifier,
                state.parent_status,
                "uncertain",
                "intake transition could not be authoritatively reconciled",
                action_key=key,
            )
        normalized_authoritative = replace(
            authoritative,
            applied_action_keys=state.applied_action_keys,
        )
        if (
            observed != expected
            or normalized_authoritative != state
            or authoritative.applied_action_keys
            not in {
                state.applied_action_keys,
                state.applied_action_keys | {key},
            }
        ):
            return self._result(
                authoritative,
                "noop",
                "authoritative intake transition did not match or parent changed",
                action_key=key,
            )
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
        if (
            not isinstance(state, WorkflowState)
            or state.project_key != self.manifest.instance.control_project
        ):
            return WorkflowResult(
                parent_identifier,
                state.parent_status if isinstance(state, WorkflowState) else "blocked",
                "noop",
                "parent intake is restricted to the control Project",
            )
        problem_result = self._state_problem_result(
            state,
            parent_identifier,
            stage_kind="parent-event",
            allow_uninitialized=True,
        )
        if problem_result is not None:
            return problem_result
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

        try:
            intake_key = self._action_key(
                state,
                "intake-transition",
                0,
                affected=frozenset(),
                candidate_shas={},
                contract_hashes={},
            )
            transition = self.snapshot_reader.read_intake_transition(parent_identifier)
        except Exception:
            return self._result(
                state,
                "noop",
                "authoritative intake transition is unavailable",
            )
        if (
            state.parent_status != "todo"
            or transition
            != StatusTransition(parent_identifier, "backlog", "todo", intake_key)
        ):
            return self._result(
                state,
                "noop",
                "metadata-free parent lacks an authoritative Backlog to Todo transition",
            )

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
            if decision.dispatch_kind is DispatchKind.GATES:
                requests = self._gate_requests(state, ordinal)
                stage_kind = "gates"
            elif decision.dispatch_kind is DispatchKind.IMPLEMENTATION:
                requests = self._implementation_requests(
                    state,
                    decision.repositories,
                    ordinal,
                )
                stage_kind = "implementation"
            else:
                return self._block(state, "dispatch decision has no supported typed phase")
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
        except Exception:
            # Reconcile because the effect may have committed before failing.
            pass
        wanted = {
            (
                request.target_key,
                request.repository_key,
                request.suite_key,
                request.phase,
                request.stage_ordinal,
                request.attempt,
                key,
            )
            for request in requests
        }
        observed = self._reconcile_parent(
            state.parent_identifier,
            lambda current: (
                isinstance(current, WorkflowState)
                and current.parent_identifier == state.parent_identifier
                and current.metadata == metadata
                and key in current.applied_action_keys
                and wanted
                <= {
                    (
                        child.target_key,
                        child.repository_key,
                        child.suite_key,
                        child.phase,
                        child.stage_ordinal,
                        child.attempt,
                        child.action_key,
                    )
                    for child in current.children
                }
            ),
        )
        if observed is None:
            return self._uncertain(
                state,
                "successor creation is not yet authoritatively observable",
                action_key=key,
                mutation_count=1,
            )
        state = observed
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
        problem_result = self._state_problem_result(state, parent_identifier)
        if problem_result is not None:
            return problem_result
        if state.parent_status == "done":
            assert state.metadata is not None
            completed = decide_parent_action(self.manifest, state.snapshot)
            key = self._action_key(state, "complete", state.metadata.stage_ordinal)
            if (
                completed.kind is not DecisionKind.COMPLETE
                or state.metadata.last_action != key
                or key not in state.applied_action_keys
            ):
                return self._uncertain(
                    state,
                    "parent done status is not bound to its exact completion transition",
                    action_key=key,
                )
            return self._result(
                state,
                "noop",
                "parent completion is already authoritative",
                action_key=key,
            )
        if state.parent_status not in _ACTIVE_PARENT_STATUSES:
            return self._result(state, "noop", "parent is not active")
        if state.human_wait:
            return self._result(state, "wait", "parent is waiting for a human")
        decision = decide_parent_action(self.manifest, state.snapshot)
        if decision.kind in {
            DecisionKind.DISPATCH,
            DecisionKind.REPAIR,
            DecisionKind.MERGE,
            DecisionKind.SMOKE,
            DecisionKind.COMPLETE,
        }:
            stage_wait = self._current_stage_wait(state)
            if stage_wait is not None:
                return stage_wait
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

        try:
            fresh = self.snapshot_reader.read(parent_identifier)
        except Exception:
            return self._uncertain(
                state,
                "parent could not be reread before completion",
            )
        if fresh != state or decide_parent_action(self.manifest, fresh.snapshot) != decision:
            return self._result(fresh, "noop", "parent changed before completion")
        assert fresh.metadata is not None
        key = self._action_key(fresh, "complete", fresh.metadata.stage_ordinal)
        if key in fresh.applied_action_keys:
            return self._uncertain(
                fresh,
                "parent completion action exists without its done transition",
                action_key=key,
            )
        metadata = self._metadata(fresh, action_key=key)
        try:
            self.executor.set_parent_status(
                parent_identifier,
                "done",
                decision.reason,
                metadata,
                action_key=key,
            )
        except Exception:
            # The write may have committed. Reconcile before allowing any retry.
            pass
        expected_action_keys = fresh.applied_action_keys | {key}
        expected_state = replace(
            fresh,
            parent_status="done",
            metadata=metadata,
            applied_action_keys=expected_action_keys,
        )
        observed = self._reconcile_parent(
            parent_identifier,
            lambda current: (
                current == expected_state
                and current.parent_identifier == parent_identifier
                and current.parent_status == "done"
                and current.metadata == metadata
                and current.metadata.stage_ordinal == metadata.stage_ordinal
                and current.metadata.last_action == key
                and current.applied_action_keys == expected_action_keys
                and key in current.applied_action_keys
            ),
        )
        if observed is None:
            return self._uncertain(
                fresh,
                "parent completion transition is not yet authoritatively observable",
                action_key=key,
                mutation_count=1,
            )
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
            suite = suites[completion.suite_key]
            completion_shas = dict(completion.candidate_shas)
            if (
                completion.repository_key != suite.command_repository
                or completion_shas != dict(state.snapshot.candidate_shas)
                or any(not _valid_sha(sha) for sha in completion_shas.values())
                or completion_shas.get(suite.command_repository) != completion.candidate_sha
            ):
                return "integration QA completion target or exact SHA map is malformed", None
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
                else (
                    child.target_key == completion.suite_key
                    and child.suite_key == completion.suite_key
                    and child.repository_key == completion.repository_key
                )
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
        problem_result = self._state_problem_result(state, parent_identifier)
        if problem_result is not None:
            return problem_result
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
        except Exception:
            # Reconcile because the effect may have committed before failing.
            pass
        observed: PhaseCompletion | None = None
        evidence_read_succeeded = False
        for _ in range(2):
            try:
                candidate = self.snapshot_reader.read_phase_completion(
                    parent_identifier,
                    completion.evidence_comment_uuid,
                )
            except Exception:
                continue
            evidence_read_succeeded = True
            if candidate == completion:
                observed = candidate
                break
        if observed is None:
            if evidence_read_succeeded:
                return WorkflowResult(
                    parent_identifier,
                    "blocked",
                    "block",
                    "phase completion evidence reread did not match",
                    action_key=key,
                    mutation_count=1,
                )
            return self._uncertain(
                state,
                "phase completion evidence is not yet authoritatively observable",
                action_key=key,
                mutation_count=1,
            )
        verified_state: WorkflowState | None = None
        parent_read_succeeded = False
        for _ in range(2):
            try:
                candidate_state = self.snapshot_reader.read(parent_identifier)
            except Exception:
                continue
            parent_read_succeeded = True
            verified_state = candidate_state
            if candidate_state == state:
                break
        if not parent_read_succeeded:
            return self._uncertain(
                state,
                "parent metadata is not yet authoritatively observable before child completion",
                action_key=key,
                mutation_count=1,
            )
        if verified_state != state:
            return WorkflowResult(
                parent_identifier,
                "blocked",
                "block",
                "parent metadata changed before phase child completion",
                action_key=key,
                mutation_count=1,
            )
        try:
            self.executor.mark_child_done(
                parent_identifier,
                completion,
                metadata,
                action_key=key,
            )
        except Exception:
            # Reconcile because the effect may have committed before failing.
            pass
        done_state = self._reconcile_parent(
            parent_identifier,
            lambda current: (
                isinstance(current, WorkflowState)
                and current.parent_identifier == parent_identifier
                and current.metadata == metadata
                and key in current.applied_action_keys
                and len(
                    tuple(
                        item
                        for item in current.children
                        if item.evidence_comment_uuid == completion.evidence_comment_uuid
                        and item.status == "done"
                    )
                )
                == 1
            ),
        )
        if done_state is None:
            return self._uncertain(
                state,
                "phase child completion is not yet authoritatively observable",
                action_key=key,
                mutation_count=1,
            )
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
        unfinished_stage_siblings = tuple(
            item
            for item in done_state.children
            if item.identifier != completed[0].identifier
            and item.stage_ordinal == child.stage_ordinal
            and item.attempt == child.attempt
            and item.status not in _TERMINAL_CHILD_STATUSES
        )
        if unfinished_stage_siblings:
            return self._result(
                done_state,
                "wait",
                "current Stage still has non-terminal sibling work",
                completed_child_status="done",
                action_key=key,
                mutation_count=1,
            )
        resumed = self.resume_parent(parent_identifier)
        return replace(resumed, completed_child_status="done")

    def _preflight(
        self,
        state: WorkflowState,
        order: tuple[str, ...],
    ) -> str | None:
        if self.github is None:
            return "GitHub merge boundary is unavailable"
        if (
            set(state.pull_requests) != set(state.snapshot.affected_repositories)
            or not set(order) <= state.pull_requests.keys()
        ):
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

    def _read_merge_prefix(
        self,
        state: WorkflowState,
        order: tuple[str, ...],
    ) -> _MergePrefixObservation:
        if self.github is None:
            raise _MergePrefixObservationError(
                "authoritative merge-prefix read is unavailable"
            )
        if (
            set(state.pull_requests) != set(state.snapshot.affected_repositories)
            or not set(order) <= state.pull_requests.keys()
        ):
            raise _MergePrefixObservationError(
                "authoritative merge-prefix targets are incomplete"
            )

        merged_shas: dict[str, str] = {}
        remaining: list[str] = []
        saw_unmerged = False
        problems: list[str] = []
        for repository in order:
            target = state.pull_requests[repository]
            repository_spec = self.manifest.repositories[repository]
            try:
                pull_request = self.github.get_pull_request(
                    repository_spec.github,
                    target.number,
                )
            except Exception:
                problems.append(f"{repository} pull request could not be read")
                continue
            if not isinstance(pull_request, PullRequestInfo):
                problems.append(f"{repository} pull request read is malformed")
                continue
            if (
                pull_request.repository != repository_spec.github
                or pull_request.number != target.number
                or pull_request.head_sha
                != state.snapshot.candidate_shas.get(repository)
            ):
                problems.append(f"{repository} pull request identity changed")
                continue
            if pull_request.state == "merged":
                if (
                    pull_request.merged_at is None
                    or not _valid_sha(pull_request.merge_commit_sha)
                ):
                    problems.append(f"{repository} merged identity is malformed")
                    continue
                if saw_unmerged:
                    problems.append("remote merge prefix is non-contiguous")
                    continue
                assert pull_request.merge_commit_sha is not None
                merged_shas[repository] = pull_request.merge_commit_sha
            else:
                saw_unmerged = True
                remaining.append(repository)
        if problems:
            raise _MergePrefixObservationError("; ".join(problems))
        return _MergePrefixObservation(merged_shas, tuple(remaining))

    def _record_merge_transition(
        self,
        state: WorkflowState,
        *,
        merge_state: str,
        merged_shas: Mapping[str, str],
        merge_plan: tuple[str, ...],
        stage_kind: str,
    ) -> tuple[WorkflowState | None, WorkflowResult | None]:
        assert state.metadata is not None
        ordinal = state.metadata.stage_ordinal + 1
        key = self._action_key(state, stage_kind, ordinal)
        metadata = self._metadata(
            state,
            action_key=key,
            stage_ordinal=ordinal,
            merge_plan=merge_plan,
            merge_state=merge_state,
        )
        values = dict(merged_shas)
        attempted = key not in state.applied_action_keys
        if attempted:
            try:
                self.executor.record_merge_state(
                    state.parent_identifier,
                    merge_state,
                    values,
                    metadata,
                    action_key=key,
                )
            except Exception:
                # The boundary may have committed before its acknowledgement failed.
                pass
        observed = self._reconcile_parent(
            state.parent_identifier,
            lambda current: (
                isinstance(current, WorkflowState)
                and current.parent_identifier == state.parent_identifier
                and current.metadata is not None
                and current.metadata.stage_ordinal == ordinal
                and current.metadata.last_action == key
                and current.metadata.merge_plan == merge_plan
                and current.metadata.merge_state == merge_state
                and current.snapshot.merge_state == merge_state
                and dict(current.snapshot.merged_shas) == values
                and key in current.applied_action_keys
            ),
        )
        if observed is None:
            return None, self._uncertain(
                state,
                f"{stage_kind} write is not yet authoritatively observable",
                action_key=key,
                mutation_count=int(attempted),
            )
        return observed, None

    def _persist_merge_failure(
        self,
        state: WorkflowState,
        reason: str,
        *,
        merge_state: str,
        merged_shas: Mapping[str, str],
        merge_plan: tuple[str, ...],
    ) -> WorkflowResult:
        transitioned, uncertain = self._record_merge_transition(
            state,
            merge_state=merge_state,
            merged_shas=merged_shas,
            merge_plan=merge_plan,
            stage_kind=f"merge:{merge_state}",
        )
        if uncertain is not None:
            return uncertain
        assert transitioned is not None and transitioned.metadata is not None
        return self._persist_merge_block_status(
            transitioned,
            reason,
            merge_state=merge_state,
            merged_shas=merged_shas,
            prior_mutation_count=1,
        )

    def _persist_merge_block_status(
        self,
        transitioned: WorkflowState,
        reason: str,
        *,
        merge_state: str,
        merged_shas: Mapping[str, str],
        prior_mutation_count: int = 0,
    ) -> WorkflowResult:
        assert transitioned.metadata is not None
        ordinal = transitioned.metadata.stage_ordinal + 1
        key = self._action_key(transitioned, "merge:block-status", ordinal)
        metadata = self._metadata(
            transitioned,
            action_key=key,
            stage_ordinal=ordinal,
        )
        attempted = key not in transitioned.applied_action_keys
        if attempted:
            try:
                self.executor.set_parent_status(
                    transitioned.parent_identifier,
                    "blocked",
                    reason,
                    metadata,
                    action_key=key,
                )
            except Exception:
                pass
        observed = self._reconcile_parent(
            transitioned.parent_identifier,
            lambda current: (
                isinstance(current, WorkflowState)
                and current.parent_identifier == transitioned.parent_identifier
                and current.parent_status == "blocked"
                and current.metadata is not None
                and current.metadata.stage_ordinal == ordinal
                and current.metadata.last_action == key
                and current.snapshot.merge_state == merge_state
                and dict(current.snapshot.merged_shas) == dict(merged_shas)
                and key in current.applied_action_keys
            ),
        )
        if observed is None:
            return self._uncertain(
                transitioned,
                "merge failure status is not yet authoritatively observable",
                action_key=key,
                mutation_count=int(attempted),
            )
        return self._result(
            observed,
            "block",
            reason,
            action_key=key,
            mutation_count=prior_mutation_count + int(attempted),
            merge_state=merge_state,
        )

    def execute_merge_plan(self, parent_identifier: str) -> WorkflowResult:
        try:
            state = self.snapshot_reader.read(parent_identifier)
        except Exception:
            return WorkflowResult(parent_identifier, "blocked", "block", "parent could not be read")
        problem_result = self._state_problem_result(
            state,
            parent_identifier,
            stage_kind="merge",
        )
        if problem_result is not None:
            return problem_result
        entry_decision = decide_parent_action(self.manifest, state.snapshot)
        if entry_decision.kind is not DecisionKind.BLOCK:
            stage_wait = self._current_stage_wait(state)
            if stage_wait is not None:
                return stage_wait
        affected = frozenset(state.snapshot.affected_repositories)
        try:
            confirmed = tuple(repository for repository in self.manifest.merge_order if repository in affected)
            order = merge_order(self.manifest.repositories, affected, confirmed)
        except TopologyError:
            return self._block(state, "merge order is not dependency-safe", stage_kind="merge")

        merged = dict(state.snapshot.merged_shas)
        if state.snapshot.merge_state == "merged" and set(merged) == affected:
            return self.resume_parent(parent_identifier)

        merged_prs = {
            repository
            for repository, evidence in state.snapshot.pull_requests.items()
            if evidence.state == "merged"
        }

        if state.snapshot.merge_state == "partial":
            prefix = order[: len(merged)]
            assert state.metadata is not None
            replay_stage = (
                "merge:block-status"
                if state.parent_status == "blocked"
                else "merge:partial"
            )
            replay_key = self._action_key(
                state,
                replay_stage,
                state.metadata.stage_ordinal,
            )
            replayable_partial = (
                bool(merged)
                and tuple(state.metadata.merge_plan) == order
                and set(merged) == set(prefix)
                and merged_prs == set(prefix)
                and state.metadata.last_action == replay_key
                and replay_key in state.applied_action_keys
                and all(
                    _valid_sha(merged[repository])
                    and state.snapshot.pull_requests[repository].merged_sha
                    == merged[repository]
                    for repository in prefix
                )
            )
            if not replayable_partial:
                return self._uncertain(
                    state,
                    "partial merge state is not an authoritative replayable prefix",
                )
            reason = "cross-repository merge is partial; rollback and deployment are forbidden"
            if state.parent_status == "blocked":
                return self._result(
                    state,
                    "block",
                    reason,
                    merge_state="partial",
                )
            if state.parent_status not in _ACTIVE_PARENT_STATUSES:
                return self._uncertain(
                    state,
                    "partial merge has no authoritative blocked parent transition",
                )
            return self._persist_merge_block_status(
                state,
                reason,
                merge_state="partial",
                merged_shas=merged,
            )

        resuming = state.snapshot.merge_state == "merging"
        if resuming:
            try:
                observed_prefix = self._read_merge_prefix(state, order)
            except _MergePrefixObservationError as exc:
                return self._uncertain(state, str(exc))
            persisted_prefix = order[: len(merged)]
            observed_count = len(observed_prefix.merged_shas)
            persisted_matches_observation = (
                len(merged) <= observed_count
                and set(merged) == set(persisted_prefix)
                and all(
                    _valid_sha(merged[repository])
                    and observed_prefix.merged_shas.get(repository)
                    == merged[repository]
                    for repository in persisted_prefix
                )
            )
            if not persisted_matches_observation:
                return self._uncertain(
                    state,
                    "persisted merge prefix does not match authoritative remote truth",
                )
            if observed_count > len(merged):
                recovered_repository = order[observed_count - 1]
                recovered, uncertain = self._record_merge_transition(
                    state,
                    merge_state="merging",
                    merged_shas=observed_prefix.merged_shas,
                    merge_plan=order,
                    stage_kind=f"merge:recover:{recovered_repository}",
                )
                if uncertain is not None:
                    return uncertain
                assert recovered is not None
                state = recovered
                merged = dict(state.snapshot.merged_shas)
                merged_prs = {
                    repository
                    for repository, evidence in state.snapshot.pull_requests.items()
                    if evidence.state == "merged"
                }
            prefix = order[: len(merged)]
            assert state.metadata is not None
            replay_problem = (
                tuple(state.metadata.merge_plan) != order
                or set(merged) != set(prefix)
                or merged_prs != set(prefix)
                or state.metadata.last_action not in state.applied_action_keys
                or any(
                    not _valid_sha(merged[repository])
                    or state.snapshot.pull_requests[repository].merged_sha
                    != merged[repository]
                    for repository in prefix
                )
            )
            if replay_problem:
                return self._persist_merge_failure(
                    state,
                    "merge progress is not an authoritative replayable prefix; rollback is forbidden",
                    merge_state="partial",
                    merged_shas=merged,
                    merge_plan=order,
                )
            remaining = observed_prefix.remaining
        else:
            observed_merged = set(merged) | merged_prs
            if observed_merged:
                return self._persist_merge_failure(
                    state,
                    "cross-repository merge is already partial; rollback is forbidden",
                    merge_state="partial",
                    merged_shas=merged,
                    merge_plan=order,
                )
            decision = entry_decision
            if decision.kind is DecisionKind.BLOCK:
                return self._block(state, decision.reason, stage_kind="merge")
            if decision.kind is not DecisionKind.MERGE:
                if decision.kind in {DecisionKind.SMOKE, DecisionKind.COMPLETE}:
                    return self.resume_parent(parent_identifier)
                return self._result(state, "noop", "parent is not merge-authorized")
            remaining = order

        preflight_problem = self._preflight(state, remaining)
        if preflight_problem is not None:
            return self._persist_merge_failure(
                state,
                preflight_problem,
                merge_state="partial" if merged else "blocked",
                merged_shas=merged,
                merge_plan=order,
            )
        fresh = self._reconcile_parent(parent_identifier, lambda current: current == state)
        if fresh is None:
            return self._uncertain(state, "parent changed or became unreadable during all-PR preflight")

        if not resuming:
            reserved, uncertain = self._record_merge_transition(
                fresh,
                merge_state="merging",
                merged_shas={},
                merge_plan=order,
                stage_kind="merge:reserve",
            )
            if uncertain is not None:
                return uncertain
            assert reserved is not None
            fresh = reserved

        current = fresh
        for repository in remaining:
            target = current.pull_requests[repository]
            expected_sha = current.snapshot.candidate_shas[repository]
            result: MergeResult | None = None
            try:
                assert self.github is not None
                result = self.github.merge_pull_request(
                    self.manifest.repositories[repository].github,
                    target.number,
                    expected_sha=expected_sha,
                )
            except Exception:
                # A write may have committed before its acknowledgement failed.
                result = None
            try:
                assert self.github is not None
                authoritative = self.github.get_pull_request(
                    self.manifest.repositories[repository].github,
                    target.number,
                )
            except Exception:
                return self._uncertain(
                    current,
                    "merge mutation outcome is not yet authoritatively observable",
                )
            authoritative_merged = (
                isinstance(authoritative, PullRequestInfo)
                and authoritative.repository
                == self.manifest.repositories[repository].github
                and authoritative.number == target.number
                and authoritative.state == "merged"
                and authoritative.head_sha == expected_sha
                and authoritative.merged_at is not None
                and _valid_sha(authoritative.merge_commit_sha)
            )
            if authoritative_merged:
                result = MergeResult(
                    authoritative.repository,
                    authoritative.number,
                    True,
                    expected_sha,
                    authoritative.merge_commit_sha,
                )
            else:
                result = None
            if result is None:
                failed_state = "partial" if merged else "blocked"
                return self._persist_merge_failure(
                    current,
                    "merge sequence failed; rollback and deployment are forbidden",
                    merge_state=failed_state,
                    merged_shas=merged,
                    merge_plan=order,
                )
            assert isinstance(result, MergeResult)
            merged[repository] = result.merged_sha
            progressed, uncertain = self._record_merge_transition(
                current,
                merge_state="merging",
                merged_shas=merged,
                merge_plan=order,
                stage_kind=f"merge:progress:{repository}",
            )
            if uncertain is not None:
                return uncertain
            assert progressed is not None
            current = progressed

        completed, uncertain = self._record_merge_transition(
            current,
            merge_state="merged",
            merged_shas=merged,
            merge_plan=order,
            stage_kind="merge:final",
        )
        if uncertain is not None:
            return uncertain
        assert completed is not None
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
        checkout_keys = set(smoke_read.checkout_shas)
        checkout_scope_valid = (
            checkout_keys == affected
            and dict(smoke_read.checkout_shas) == dict(state.snapshot.merged_shas)
            if smoke_read.authoritative
            else checkout_keys <= affected
            and all(
                smoke_read.checkout_shas[repository]
                == state.snapshot.merged_shas.get(repository)
                for repository in checkout_keys
            )
        )
        if (
            set(smoke_read.merged_shas) != affected
            or dict(smoke_read.merged_shas) != dict(state.snapshot.merged_shas)
            or any(not _valid_sha(sha) for sha in smoke_read.merged_shas.values())
            or any(not _valid_sha(sha) for sha in smoke_read.checkout_shas.values())
            or not checkout_scope_valid
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
        problem_result = self._state_problem_result(
            state,
            parent_identifier,
            stage_kind="smoke",
        )
        if problem_result is not None:
            return problem_result
        smoke_problem = self._smoke_problem(state, smoke_read)
        if smoke_problem is not None:
            return self._block(state, smoke_problem, stage_kind="smoke")
        assert state.metadata is not None
        before = state.snapshot.smoke_reads
        smoke_action_keys = frozenset(
            action_key
            for action_key in state.applied_action_keys
            if action_key.startswith("smoke:")
        )
        first_smoke_ordinal = state.metadata.stage_ordinal - len(before) + 1
        historical_observations = tuple(
            zip(
                range(first_smoke_ordinal, state.metadata.stage_ordinal + 1),
                before,
            )
        )
        expected_smoke_action_keys = (
            frozenset(
                self._action_key(
                    state,
                    f"smoke:{historical_read.observation_id}",
                    historical_ordinal,
                )
                for historical_ordinal, historical_read in historical_observations
            )
            if before and first_smoke_ordinal >= 0
            else frozenset()
        )
        observation_ids = tuple(read.observation_id for read in before)
        if (
            (before and first_smoke_ordinal < 0)
            or len(set(observation_ids)) != len(observation_ids)
            or len(historical_observations) != len(before)
            or smoke_action_keys != expected_smoke_action_keys
        ):
            return self._uncertain(
                state,
                "existing smoke evidence is not bound to an authoritative parent transition",
            )
        for historical_ordinal, historical_read in historical_observations:
            if historical_read.observation_id != smoke_read.observation_id:
                continue
            key = self._action_key(
                state,
                f"smoke:{historical_read.observation_id}",
                historical_ordinal,
            )
            if historical_read != smoke_read:
                return self._block(
                    state,
                    "smoke observation identity conflicts with persisted evidence",
                    stage_kind="smoke",
                )
            return self._result(
                state,
                "noop",
                "smoke observation is already authoritative",
                action_key=key,
            )
        if state.parent_status not in _ACTIVE_PARENT_STATUSES:
            return self._result(state, "noop", "parent is not active")
        if state.human_wait:
            return self._result(state, "noop", "parent is waiting for a human")
        decision = decide_parent_action(self.manifest, state.snapshot)
        if decision.kind is not DecisionKind.SMOKE:
            return self._result(
                state,
                "block" if decision.kind is DecisionKind.BLOCK else "noop",
                decision.reason,
            )
        stage_wait = self._current_stage_wait(state)
        if stage_wait is not None:
            return stage_wait
        ordinal = state.metadata.stage_ordinal + 1
        key = self._action_key(
            state,
            f"smoke:{smoke_read.observation_id}",
            ordinal,
        )
        metadata = self._metadata(
            state,
            action_key=key,
            stage_ordinal=ordinal,
        )
        try:
            self.executor.write_smoke_read(
                parent_identifier,
                smoke_read,
                metadata,
                action_key=key,
            )
        except Exception:
            # Reconcile because the effect may have committed before failing.
            pass
        expected_smoke_reads = before + (smoke_read,)
        expected_action_keys = state.applied_action_keys | {key}
        expected_state = replace(
            state,
            metadata=metadata,
            snapshot=replace(state.snapshot, smoke_reads=expected_smoke_reads),
            applied_action_keys=expected_action_keys,
        )
        observed = self._reconcile_parent(
            parent_identifier,
            lambda current: (
                current == expected_state
                and current.parent_identifier == parent_identifier
                and current.snapshot.smoke_reads == expected_smoke_reads
                and current.metadata == metadata
                and current.metadata.stage_ordinal == ordinal
                and current.metadata.last_action == key
                and current.applied_action_keys == expected_action_keys
                and key in current.applied_action_keys
            ),
        )
        if observed is None:
            return self._uncertain(
                state,
                "smoke evidence and its parent transition are not yet authoritatively observable",
                action_key=key,
                mutation_count=1,
            )
        return self.resume_parent(parent_identifier)

    def execute_smoke(self, parent_identifier: str) -> WorkflowResult:
        try:
            state = self.snapshot_reader.read(parent_identifier)
        except Exception:
            return WorkflowResult(parent_identifier, "blocked", "block", "parent could not be read")
        problem_result = self._state_problem_result(
            state,
            parent_identifier,
            stage_kind="smoke",
        )
        if problem_result is not None:
            return problem_result
        decision = decide_parent_action(self.manifest, state.snapshot)
        if decision.kind is DecisionKind.BLOCK:
            return self._result(state, "block", decision.reason)
        if decision.kind is not DecisionKind.SMOKE:
            return self._result(state, "noop", "parent is not smoke-authorized")
        stage_wait = self._current_stage_wait(state)
        if stage_wait is not None:
            return stage_wait
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
        if (
            not isinstance(smoke_read, SmokeRead)
            or smoke_read.observation_id != key
        ):
            return self._block(
                state,
                "owned smoke observation identity does not match its authoritative token",
                stage_kind="smoke",
            )
        return self.record_smoke_read(parent_identifier, smoke_read)

    def _watch_scope_problem(
        self,
        state: WorkflowState,
        parent_identifier: str,
    ) -> str | None:
        state_problem = self._state_problem(state, parent_identifier)
        if state_problem is not None:
            return state_problem
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
        problem_result = self._state_problem_result(
            initial,
            parent_identifier,
            stage_kind="recovery",
            future_child_only=True,
        )
        if problem_result is not None:
            return problem_result
        scope_problem = self._watch_scope_problem(initial, parent_identifier)
        if scope_problem is not None or initial.human_wait or initial.active_work or not initial.snapshot.stalled:
            return self._result(initial, "noop", scope_problem or "work is healthy or waiting for a human")
        decision = decide_parent_action(self.manifest, initial.snapshot)
        if decision.kind is DecisionKind.BLOCK and initial.snapshot.recovery_count >= 1:
            return self._block(initial, decision.reason, stage_kind="recovery-block")
        if (
            decision.kind is not DecisionKind.DISPATCH
            or decision.dispatch_kind is not DispatchKind.RECOVERY
            or len(decision.repositories) != 1
        ):
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

        try:
            fresh = self.snapshot_reader.read(parent_identifier)
        except Exception:
            return self._result(initial, "noop", "parent became unreadable before recovery")
        problem_result = self._state_problem_result(
            fresh,
            parent_identifier,
            stage_kind="recovery",
            future_child_only=True,
        )
        if problem_result is not None:
            return problem_result
        if (
            fresh != initial
            or self._watch_scope_problem(fresh, parent_identifier) is not None
            or fresh.human_wait
            or fresh.active_work
            or decide_parent_action(self.manifest, fresh.snapshot) != decision
        ):
            return self._result(fresh, "noop", "workflow changed before recovery")
        assert fresh.metadata is not None
        ordinal = fresh.metadata.stage_ordinal + 1
        key = self._action_key(
            fresh,
            "recovery",
            ordinal,
        )
        if key in fresh.applied_action_keys:
            return self._result(fresh, "noop", "recovery action already exists", action_key=key)
        metadata = self._metadata(
            fresh,
            action_key=key,
            stage_ordinal=ordinal,
        )
        before_children = fresh.children
        target_identifier = candidates[0].identifier

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

        try:
            self.executor.rerun_child(
                parent_identifier,
                target_identifier,
                metadata,
                action_key=key,
            )
        except Exception:
            # Reconcile because the effect may have committed before failing.
            pass

        observed = self._reconcile_parent(
            parent_identifier,
            lambda current: (
                isinstance(current, WorkflowState)
                and current.parent_identifier == parent_identifier
                and current.metadata == metadata
                and current.snapshot.recovery_count
                == fresh.snapshot.recovery_count + 1
                and key in current.applied_action_keys
            ),
        )
        if observed is None:
            return self._uncertain(
                fresh,
                "bounded recovery is not yet authoritatively observable",
                action_key=key,
                mutation_count=1,
            )

        normalized_observed_snapshot = replace(
            observed.snapshot,
            recovery_count=fresh.snapshot.recovery_count,
            stalled=fresh.snapshot.stalled,
            stalled_repository=fresh.snapshot.stalled_repository,
        )
        before_by_id = {child.identifier: child for child in before_children}
        after_by_id = {child.identifier: child for child in observed.children}
        before_target = before_by_id[target_identifier]
        same_target = after_by_id.get(target_identifier)
        target_reactivated = (
            same_target is not None
            and not before_target.active
            and same_target.active
        )
        replacement_targets = tuple(
            child
            for child in observed.children
            if child.identifier != target_identifier
            and child.repository_key == before_target.repository_key
            and child.phase == before_target.phase
            and child.attempt == before_target.attempt
            and child.active
            and child_identity(child) != child_identity(before_target)
        )
        target_has_new_run = target_reactivated or len(replacement_targets) == 1
        if target_reactivated:
            allowed_after_identifiers = {frozenset(before_by_id)}
        elif len(replacement_targets) == 1:
            replacement_identifier = replacement_targets[0].identifier
            allowed_after_identifiers = {
                frozenset(before_by_id) | {replacement_identifier},
                (frozenset(before_by_id) - {target_identifier})
                | {replacement_identifier},
            }
        else:
            allowed_after_identifiers = set()
        unchanged_other_children = all(
            after_by_id.get(identifier) == before
            for identifier, before in before_by_id.items()
            if identifier != target_identifier
        )
        if (
            self._watch_scope_problem(observed, parent_identifier) is not None
            or observed.parent_identifier != fresh.parent_identifier
            or observed.parent_status != fresh.parent_status
            or observed.project_key != fresh.project_key
            or observed.snapshot.recovery_count != fresh.snapshot.recovery_count + 1
            or normalized_observed_snapshot != fresh.snapshot
            or not target_has_new_run
            or not observed.active_work
            or frozenset(after_by_id) not in allowed_after_identifiers
            or not unchanged_other_children
            or observed.pull_requests != fresh.pull_requests
            or observed.metadata != metadata
            or observed.human_wait != fresh.human_wait
            or observed.applied_action_keys != fresh.applied_action_keys | {key}
        ):
            return WorkflowResult(
                parent_identifier,
                "blocked",
                "block",
                "bounded recovery verification failed without a follow-up mutation",
                action_key=key,
                mutation_count=1,
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
