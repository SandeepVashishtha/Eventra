"""Pure, fail-closed parent decisions for exact-SHA multi-repository delivery."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass, field
from enum import Enum
import re
from types import MappingProxyType
from typing import TypeVar

from .model import DeliveryManifest
from .topology import TopologyError, merge_order, topological_waves


_SHA = re.compile(r"[0-9a-f]{40}\Z")
_RESULTS = frozenset({"pending", "pass", "fail", "blocked"})
_MERGE_STATES = frozenset({"pending", "not_ready", "ready", "merging", "merged", "partial", "blocked"})
_PR_STATES = frozenset({"open", "closed", "merged"})

_T = TypeVar("_T")


def _frozen(value: Mapping[str, _T]) -> Mapping[str, _T]:
    return MappingProxyType(dict(value))


@dataclass(frozen=True)
class RepositoryEvidence:
    """One repository phase result bound to one candidate commit."""

    candidate_sha: str
    result: str


@dataclass(frozen=True)
class PullRequestEvidence:
    """Authoritative pull-request preflight evidence."""

    head_sha: str
    state: str
    mergeable: bool | None
    checks_pass: bool | None
    merged_sha: str | None = None


@dataclass(frozen=True)
class GateEvidence:
    """A suite-wide verdict bound to the complete candidate SHA map."""

    candidate_shas: Mapping[str, str]
    result: str

    def __post_init__(self) -> None:
        object.__setattr__(self, "candidate_shas", _frozen(self.candidate_shas))


@dataclass(frozen=True)
class SmokeRead:
    """One authoritative read of repository and integration smoke results."""

    merged_shas: Mapping[str, str]
    repository_results: Mapping[str, str]
    integration_results: Mapping[str, str]
    authoritative: bool

    def __post_init__(self) -> None:
        object.__setattr__(self, "merged_shas", _frozen(self.merged_shas))
        object.__setattr__(self, "repository_results", _frozen(self.repository_results))
        object.__setattr__(self, "integration_results", _frozen(self.integration_results))


@dataclass(frozen=True)
class ParentSnapshot:
    """Complete read-only evidence used for one parent transition decision."""

    affected_repositories: tuple[str, ...]
    candidate_shas: Mapping[str, str] = field(default_factory=dict)
    children: Mapping[str, RepositoryEvidence] = field(default_factory=dict)
    pull_requests: Mapping[str, PullRequestEvidence] = field(default_factory=dict)
    reviews: Mapping[str, RepositoryEvidence] = field(default_factory=dict)
    qa: Mapping[str, RepositoryEvidence] = field(default_factory=dict)
    integration_qa: Mapping[str, GateEvidence] = field(default_factory=dict)
    merge_state: str = "pending"
    merged_shas: Mapping[str, str] = field(default_factory=dict)
    smoke_reads: tuple[SmokeRead, ...] = ()
    attempt: int = 0
    stalled: bool = False
    stalled_repository: str | None = None
    recovery_count: int = 0
    satisfied_dependencies: frozenset[tuple[str, str]] = frozenset()

    def __post_init__(self) -> None:
        object.__setattr__(self, "affected_repositories", tuple(self.affected_repositories))
        for name in (
            "candidate_shas",
            "children",
            "pull_requests",
            "reviews",
            "qa",
            "integration_qa",
            "merged_shas",
        ):
            object.__setattr__(self, name, _frozen(getattr(self, name)))
        object.__setattr__(self, "smoke_reads", tuple(self.smoke_reads))
        object.__setattr__(self, "satisfied_dependencies", frozenset(self.satisfied_dependencies))


class DecisionKind(str, Enum):
    DISPATCH = "dispatch"
    WAIT = "wait"
    REPAIR = "repair"
    MERGE = "merge"
    SMOKE = "smoke"
    COMPLETE = "complete"
    BLOCK = "block"


class DispatchKind(str, Enum):
    IMPLEMENTATION = "implementation"
    GATES = "gates"
    RECOVERY = "recovery"


@dataclass(frozen=True)
class ParentDecision:
    kind: DecisionKind
    reason: str
    repositories: tuple[str, ...] = ()
    next_attempt: int | None = None
    dispatch_kind: DispatchKind | None = None


def _decision(
    kind: DecisionKind,
    reason: str,
    repositories: tuple[str, ...] = (),
    next_attempt: int | None = None,
    dispatch_kind: DispatchKind | None = None,
) -> ParentDecision:
    return ParentDecision(kind, reason, repositories, next_attempt, dispatch_kind)


def _ordered(manifest: DeliveryManifest, repositories: set[str] | frozenset[str]) -> tuple[str, ...]:
    return tuple(repository for repository in manifest.merge_order if repository in repositories)


def _valid_sha(value: object, *, empty: bool = False) -> bool:
    return isinstance(value, str) and ((empty and not value) or _SHA.fullmatch(value) is not None)


def _snapshot_problem(manifest: DeliveryManifest, snapshot: ParentSnapshot) -> str | None:
    if not isinstance(manifest, DeliveryManifest) or not isinstance(snapshot, ParentSnapshot):
        return "malformed parent workflow state"
    if (
        manifest.policy.max_repair_attempts != 2
        or manifest.policy.deployment != "forbidden"
        or not isinstance(manifest.policy.automatic_merge, bool)
    ):
        return "delivery policy exceeds the supported authority"
    try:
        merge_order(
            manifest.repositories,
            frozenset(manifest.repositories),
            manifest.merge_order,
        )
    except (TopologyError, TypeError):
        return "confirmed merge order is malformed or inconsistent with repository dependencies"
    affected_values = snapshot.affected_repositories
    if (
        not affected_values
        or any(not isinstance(repository, str) or not repository for repository in affected_values)
        or len(set(affected_values)) != len(affected_values)
    ):
        return "affected repositories are malformed"
    affected = frozenset(affected_values)
    try:
        topological_waves(
            manifest.repositories,
            affected,
            snapshot.satisfied_dependencies,
        )
    except TopologyError as error:
        return str(error)
    if (
        not isinstance(snapshot.attempt, int)
        or isinstance(snapshot.attempt, bool)
        or not 0 <= snapshot.attempt <= manifest.policy.max_repair_attempts
    ):
        return "repair attempt is outside the allowed range"
    if (
        not isinstance(snapshot.recovery_count, int)
        or isinstance(snapshot.recovery_count, bool)
        or not 0 <= snapshot.recovery_count <= 1
        or not isinstance(snapshot.stalled, bool)
    ):
        return "recovery evidence is malformed"
    if snapshot.stalled and snapshot.stalled_repository is None:
        return "stalled recovery lacks an existing affected child target"
    if snapshot.stalled_repository is not None and (
        not snapshot.stalled
        or snapshot.stalled_repository not in affected
        or snapshot.stalled_repository not in snapshot.children
    ):
        return "stalled repository is not an existing affected child"
    if snapshot.merge_state not in _MERGE_STATES:
        return "merge state is malformed"

    repository_maps: tuple[tuple[str, Mapping[str, object]], ...] = (
        ("candidate", snapshot.candidate_shas),
        ("child", snapshot.children),
        ("pull request", snapshot.pull_requests),
        ("review", snapshot.reviews),
        ("QA", snapshot.qa),
        ("merged SHA", snapshot.merged_shas),
    )
    for label, values in repository_maps:
        unknown = set(values) - affected
        if unknown:
            return f"{label} evidence contains a non-affected repository"
    if any(not _valid_sha(sha) for sha in snapshot.candidate_shas.values()):
        return "candidate SHA evidence is malformed"
    if any(not _valid_sha(sha) for sha in snapshot.merged_shas.values()):
        return "merged SHA evidence is malformed"

    for label, values in (("child", snapshot.children), ("review", snapshot.reviews), ("QA", snapshot.qa)):
        for evidence in values.values():
            if not isinstance(evidence, RepositoryEvidence):
                return f"{label} evidence is malformed"
            if evidence.result not in _RESULTS or not _valid_sha(
                evidence.candidate_sha,
                empty=evidence.result == "pending",
            ):
                return f"{label} evidence is malformed"
    for evidence in snapshot.pull_requests.values():
        if not isinstance(evidence, PullRequestEvidence):
            return "pull request evidence is malformed"
        if (
            evidence.state not in _PR_STATES
            or not _valid_sha(evidence.head_sha)
            or (evidence.mergeable is not None and not isinstance(evidence.mergeable, bool))
            or (evidence.checks_pass is not None and not isinstance(evidence.checks_pass, bool))
            or (evidence.merged_sha is not None and not _valid_sha(evidence.merged_sha))
        ):
            return "pull request evidence is malformed"

    applicable_suite_keys = {
        suite.key
        for suite in manifest.integration_suites
        if set(suite.repositories) <= affected
    }
    if set(snapshot.integration_qa) - applicable_suite_keys:
        return "integration QA evidence contains a non-applicable suite"
    for evidence in snapshot.integration_qa.values():
        if (
            not isinstance(evidence, GateEvidence)
            or evidence.result not in _RESULTS
            or any(not _valid_sha(sha) for sha in evidence.candidate_shas.values())
        ):
            return "integration QA evidence is malformed"
    for read in snapshot.smoke_reads:
        if not isinstance(read, SmokeRead) or not isinstance(read.authoritative, bool):
            return "smoke evidence is malformed"
        if any(not _valid_sha(sha) for sha in read.merged_shas.values()):
            return "smoke evidence is malformed"
        if any(result not in _RESULTS for result in (*read.repository_results.values(), *read.integration_results.values())):
            return "smoke evidence is malformed"
    return None


def _repair(
    manifest: DeliveryManifest,
    snapshot: ParentSnapshot,
    reason: str,
    repositories: set[str] | frozenset[str],
) -> ParentDecision:
    if snapshot.merge_state in {"merging", "merged", "partial"} or snapshot.merged_shas:
        return _decision(
            DecisionKind.BLOCK,
            f"{reason}; merged work requires human action and cannot be repaired automatically",
        )
    if snapshot.attempt >= manifest.policy.max_repair_attempts:
        return _decision(DecisionKind.BLOCK, f"{reason}; automatic repair attempt limit exhausted")
    return _decision(
        DecisionKind.REPAIR,
        reason,
        _ordered(manifest, repositories),
        snapshot.attempt + 1,
    )


def _wait_or_recover(
    manifest: DeliveryManifest,
    snapshot: ParentSnapshot,
    reason: str,
) -> ParentDecision:
    if not snapshot.stalled:
        return _decision(DecisionKind.WAIT, reason)
    if snapshot.recovery_count >= 1:
        return _decision(DecisionKind.BLOCK, "stalled recovery was already used")
    if snapshot.stalled_repository is None:  # guarded by _snapshot_problem
        return _decision(DecisionKind.BLOCK, "stalled recovery lacks an existing affected child target")
    return _decision(
        DecisionKind.DISPATCH,
        "rerun the existing stalled assignment once",
        (snapshot.stalled_repository,),
        dispatch_kind=DispatchKind.RECOVERY,
    )


def _applicable_suites(manifest: DeliveryManifest, affected: frozenset[str]) -> dict[str, frozenset[str]]:
    return {
        suite.key: frozenset(suite.repositories)
        for suite in manifest.integration_suites
        if set(suite.repositories) <= affected
    }


def _merged_problem(snapshot: ParentSnapshot, affected: frozenset[str]) -> tuple[str | None, bool]:
    merged_prs = {
        repository
        for repository, pull_request in snapshot.pull_requests.items()
        if pull_request.state == "merged"
    }
    observed = merged_prs | set(snapshot.merged_shas)
    if snapshot.merge_state == "partial" or (observed and observed != affected):
        return "cross-repository merge is partial; rollback is forbidden", False
    if snapshot.merge_state == "blocked":
        return "merge state is blocked", False
    all_merged = observed == affected
    if all_merged and (
        merged_prs != affected
        or set(snapshot.merged_shas) != affected
        or snapshot.merge_state != "merged"
    ):
        return "complete merge evidence is internally inconsistent", False
    if snapshot.merge_state == "merged" and not all_merged:
        return "merged state lacks complete repository evidence", False
    for repository in observed:
        pull_request = snapshot.pull_requests.get(repository)
        merged_sha = snapshot.merged_shas.get(repository)
        if (
            pull_request is None
            or pull_request.merged_sha != merged_sha
            or not isinstance(merged_sha, str)
            or _SHA.fullmatch(merged_sha) is None
        ):
            return f"{repository} authoritative merged SHA evidence is malformed", False
    return None, all_merged


def _smoke_decision(
    manifest: DeliveryManifest,
    snapshot: ParentSnapshot,
    affected: frozenset[str],
    suites: Mapping[str, frozenset[str]],
) -> ParentDecision:
    if not snapshot.smoke_reads:
        return _decision(
            DecisionKind.SMOKE,
            "merged exact SHAs require repository and integration smoke",
            _ordered(manifest, affected),
        )

    latest = snapshot.smoke_reads[-1]
    expected_shas = dict(snapshot.merged_shas)
    expected_suites = set(suites)
    if dict(latest.merged_shas) != expected_shas:
        return _decision(
            DecisionKind.BLOCK,
            "post-merge smoke does not match authoritative merged SHAs; human action is required",
        )

    repository_failures = {
        repository
        for repository, result in latest.repository_results.items()
        if repository in affected and result in {"fail", "blocked"}
    }
    suite_failures = {
        suite
        for suite, result in latest.integration_results.items()
        if suite in expected_suites and result in {"fail", "blocked"}
    }
    if repository_failures or suite_failures:
        return _decision(
            DecisionKind.BLOCK,
            "exact-merged-SHA smoke did not pass; human action is required",
        )

    exact_pass = (
        latest.authoritative
        and set(latest.repository_results) == affected
        and all(result == "pass" for result in latest.repository_results.values())
        and set(latest.integration_results) == expected_suites
        and all(result == "pass" for result in latest.integration_results.values())
    )
    if not exact_pass:
        return _decision(
            DecisionKind.SMOKE,
            "awaiting a complete authoritative exact-SHA smoke PASS",
            _ordered(manifest, affected),
        )
    if len(snapshot.smoke_reads) < 2 or snapshot.smoke_reads[-2] != latest:
        return _decision(
            DecisionKind.SMOKE,
            "one more identical authoritative exact-SHA smoke read is required",
            _ordered(manifest, affected),
        )
    return _decision(DecisionKind.COMPLETE, "two identical authoritative exact-SHA smoke reads passed")


def decide_parent_action(manifest: DeliveryManifest, snapshot: ParentSnapshot) -> ParentDecision:
    """Return one deterministic action without performing any side effect."""

    problem = _snapshot_problem(manifest, snapshot)
    if problem is not None:
        return _decision(DecisionKind.BLOCK, problem)

    affected = frozenset(snapshot.affected_repositories)
    merged_problem, all_merged = _merged_problem(snapshot, affected)
    if merged_problem is not None:
        return _decision(DecisionKind.BLOCK, merged_problem)

    if manifest.policy.environment == "production":
        return _decision(DecisionKind.WAIT, "production automatic merge is forbidden")

    implementation_findings: list[str] = []
    implementation_repairs: set[str] = set()
    for repository in _ordered(manifest, set(snapshot.children)):
        evidence = snapshot.children[repository]
        if evidence.result in {"fail", "blocked"}:
            implementation_findings.append(f"{repository} implementation evidence did not pass")
            implementation_repairs.add(repository)
        elif evidence.result == "pass" and evidence.candidate_sha != snapshot.candidate_shas.get(repository):
            implementation_findings.append(
                f"{repository} implementation evidence does not match candidate SHA"
            )
            implementation_repairs.add(repository)
    if implementation_repairs:
        return _repair(
            manifest,
            snapshot,
            "; ".join(implementation_findings),
            implementation_repairs,
        )

    satisfied = set(snapshot.satisfied_dependencies)
    for dependent in affected:
        for dependency in manifest.repositories[dependent].depends_on:
            evidence = snapshot.children.get(dependency)
            if (
                evidence is not None
                and evidence.result == "pass"
                and evidence.candidate_sha == snapshot.candidate_shas.get(dependency)
            ):
                satisfied.add((dependent, dependency))
    waves = topological_waves(manifest.repositories, affected, frozenset(satisfied))
    for wave in waves:
        incomplete = tuple(
            repository
            for repository in wave
            if repository not in snapshot.children
            or snapshot.children[repository].result != "pass"
            or snapshot.children[repository].candidate_sha != snapshot.candidate_shas.get(repository)
        )
        if not incomplete:
            continue
        missing = {repository for repository in incomplete if repository not in snapshot.children}
        if missing:
            return _decision(
                DecisionKind.DISPATCH,
                "dispatch the next dependency-ready implementation wave",
                _ordered(manifest, missing),
                dispatch_kind=DispatchKind.IMPLEMENTATION,
            )
        return _wait_or_recover(manifest, snapshot, "dependency-ready implementation is still active")

    if set(snapshot.candidate_shas) != affected:
        return _wait_or_recover(manifest, snapshot, "candidate SHA evidence is incomplete")

    missing_prs = affected - snapshot.pull_requests.keys()
    if missing_prs:
        return _wait_or_recover(manifest, snapshot, "pull request evidence is incomplete")

    missing_gate_repositories = {
        repository
        for repository in affected
        if repository not in snapshot.reviews or repository not in snapshot.qa
    }
    suites = _applicable_suites(manifest, affected)
    missing_suites = set(suites) - snapshot.integration_qa.keys()
    repair_findings: list[str] = []
    repair_repositories: set[str] = set()
    pending_reason: str | None = None
    for label, values in (("review", snapshot.reviews), ("QA", snapshot.qa)):
        for repository in _ordered(manifest, affected):
            evidence = values.get(repository)
            if evidence is None:
                continue
            if evidence.candidate_sha != snapshot.candidate_shas[repository]:
                repair_findings.append(
                    f"{repository} {label} evidence does not match candidate SHA"
                )
                repair_repositories.add(repository)
            elif evidence.result in {"fail", "blocked"}:
                repair_findings.append(f"{repository} {label} evidence did not pass")
                repair_repositories.add(repository)
            elif evidence.result != "pass" and pending_reason is None:
                pending_reason = f"{repository} {label} is still active"

    for suite_key in sorted(suites):
        evidence = snapshot.integration_qa.get(suite_key)
        if evidence is None:
            continue
        if dict(evidence.candidate_shas) != dict(snapshot.candidate_shas):
            repair_findings.append(
                f"{suite_key} integration QA evidence does not match candidate SHA map"
            )
            repair_repositories.update(suites[suite_key])
        elif evidence.result in {"fail", "blocked"}:
            repair_findings.append(f"{suite_key} integration QA evidence did not pass")
            repair_repositories.update(suites[suite_key])
        elif evidence.result != "pass" and pending_reason is None:
            pending_reason = f"{suite_key} integration QA is still active"

    for repository in _ordered(manifest, affected):
        pull_request = snapshot.pull_requests[repository]
        if pull_request.state == "closed":
            return _decision(DecisionKind.BLOCK, f"{repository} pull request is closed")
        if pull_request.head_sha != snapshot.candidate_shas[repository]:
            return _decision(
                DecisionKind.BLOCK,
                f"{repository} pull request head does not match candidate SHA",
            )
        if pull_request.state == "merged" and pull_request.checks_pass is not True:
            return _decision(
                DecisionKind.BLOCK,
                f"{repository} merged pull request lacks required-check PASS evidence",
            )
        if pull_request.state == "open":
            if pull_request.mergeable is False or pull_request.checks_pass is False:
                repair_findings.append(f"{repository} merge preflight did not pass")
                repair_repositories.add(repository)
            elif pull_request.mergeable is None or pull_request.checks_pass is None:
                if pending_reason is None:
                    pending_reason = f"{repository} merge preflight evidence is incomplete"

    if repair_repositories:
        return _repair(
            manifest,
            snapshot,
            "; ".join(repair_findings),
            repair_repositories,
        )
    if missing_gate_repositories or missing_suites:
        dispatch = set(missing_gate_repositories)
        for suite in missing_suites:
            dispatch.update(suites[suite])
        return _decision(
            DecisionKind.DISPATCH,
            "dispatch missing exact-SHA review and QA gates",
            _ordered(manifest, dispatch),
            dispatch_kind=DispatchKind.GATES,
        )
    if pending_reason is not None:
        return _wait_or_recover(manifest, snapshot, pending_reason)

    if all_merged:
        return _smoke_decision(manifest, snapshot, affected, suites)
    if snapshot.merge_state == "merging":
        return _wait_or_recover(manifest, snapshot, "merge execution is still active")
    if not manifest.policy.automatic_merge:
        return _decision(DecisionKind.WAIT, "automatic merge is disabled by policy")

    confirmed_order = tuple(repository for repository in manifest.merge_order if repository in affected)
    repositories = merge_order(manifest.repositories, affected, confirmed_order)
    return _decision(
        DecisionKind.MERGE,
        "all pull requests and exact-SHA gates passed",
        repositories,
    )
