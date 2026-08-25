"""Deterministic Eventra workflow transitions over the Multica CLI boundary."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import uuid
from dataclasses import dataclass
from typing import Literal, Sequence

from .issue_contracts import (
    ACTIVE_RUN_STATUSES,
    parse_issue_children,
    parse_issue_detail,
    parse_issue_list,
    parse_issue_metadata,
    parse_issue_runs,
)
from .provision import MulticaRunner


PHASE_KINDS = frozenset({"implementation", "review", "qa", "repair", "smoke"})
PHASE_RESULTS = frozenset({"pass", "fail", "blocked"})
SHA_PATTERN = re.compile(r"[0-9a-f]{40}\Z")
ISSUE_KEY_PATTERN = re.compile(r"[A-Z][A-Z0-9]*-[1-9][0-9]*\Z")
PR_PATTERN = re.compile(
    r"https://github\.com/codeExploreHub/(?:Eventra|Eventra-Backend)/pull/[1-9][0-9]*\Z"
)
CONTROLLED_PHASE_KEYS = frozenset(
    {
        "eventra.workflow.version",
        "eventra.phase.kind",
        "eventra.phase.result",
        "eventra.phase.attempt",
        "eventra.phase.evidence_comment",
        "eventra.phase.sha.frontend",
        "eventra.phase.sha.backend",
        "eventra.phase.pr",
    }
)


@dataclass(frozen=True)
class PhaseCompletion:
    kind: Literal["implementation", "review", "qa", "repair", "smoke"]
    result: Literal["pass", "fail", "blocked"]
    attempt: int
    evidence_comment: str
    frontend_sha: str | None
    backend_sha: str | None
    pr_url: str | None


@dataclass(frozen=True)
class PhaseResult:
    issue_id: str
    issue_key: str
    status: str
    kind: str
    result: str
    mutation_count: int


@dataclass(frozen=True)
class PhaseSnapshot:
    issue_key: str
    stage: int
    kind: str
    result: str | None
    attempt: int
    status: str
    frontend_sha: str | None
    backend_sha: str | None


@dataclass(frozen=True)
class PullRequestSnapshot:
    repository: str
    url: str
    head_sha: str
    state: str
    mergeable: bool
    checks_pass: bool


@dataclass(frozen=True)
class ParentSnapshot:
    identifier: str
    classification: str
    attempt: int
    last_action: str | None
    merge_state: str
    candidate_frontend_sha: str | None
    candidate_backend_sha: str | None
    children: tuple[PhaseSnapshot, ...]
    pull_requests: tuple[PullRequestSnapshot, ...]


@dataclass(frozen=True)
class ParentDecision:
    kind: Literal[
        "noop",
        "create_gate_stage",
        "create_repair_stage",
        "merge",
        "create_smoke_stage",
        "complete_parent",
        "block_parent",
    ]
    action_key: str | None
    reason: str


@dataclass(frozen=True)
class ChildRunSnapshot:
    issue_id: str
    identifier: str
    stage: int
    issue_status: str
    latest_run_status: str | None
    latest_run_activity_at: str | None
    has_active_run: bool
    has_phase_completion: bool


@dataclass(frozen=True)
class WorkflowSnapshot:
    parent_issue_id: str
    parent_identifier: str
    has_human_approval_wait: bool
    has_malformed_state: bool
    latest_stage_finished: bool
    has_later_parent_run: bool
    active_parent_has_no_executable_successor: bool
    children: tuple[ChildRunSnapshot, ...]

    def first_terminal_run_without_phase_completion(
        self,
    ) -> ChildRunSnapshot | None:
        candidates = sorted(
            (
                child
                for child in self.children
                if child.latest_run_status in {"completed", "failed"}
                and not child.has_phase_completion
            ),
            key=lambda child: (
                child.latest_run_activity_at or "",
                child.identifier,
            ),
        )
        return candidates[0] if candidates else None


@dataclass(frozen=True)
class RecoveryDecision:
    kind: Literal["noop", "rerun_child", "rerun_parent"]
    issue_key: str | None
    reason: str


@dataclass(frozen=True)
class RecoveryResult:
    decision: RecoveryDecision
    mutation_count: int


@dataclass(frozen=True)
class WatchResult:
    scanned: int
    candidates: int
    applied: int
    decision: str


class GitHubRunner:
    """Strict non-shelling JSON boundary for read-only GitHub PR state."""

    def run(self, args: list[str]) -> dict[str, object]:
        if not isinstance(args, list) or not all(isinstance(item, str) for item in args):
            raise TypeError("GitHub arguments must be a list of strings")
        try:
            completed = subprocess.run(
                ["gh", *args],
                text=True,
                capture_output=True,
                check=False,
                timeout=30,
            )
        except subprocess.TimeoutExpired:
            raise RuntimeError("GitHub command timed out") from None
        except OSError:
            raise RuntimeError("GitHub command could not be started") from None
        if completed.returncode != 0:
            raise RuntimeError(
                f"GitHub command failed with exit {completed.returncode}"
            )
        try:
            value = json.loads(completed.stdout)
        except (json.JSONDecodeError, TypeError):
            raise RuntimeError("GitHub returned an invalid JSON response") from None
        if not isinstance(value, dict):
            raise RuntimeError("GitHub returned an invalid JSON response")
        return value


def _invalid_completion() -> None:
    raise ValueError("invalid phase completion")


def _validated_sha(value: str) -> str:
    if not isinstance(value, str) or SHA_PATTERN.fullmatch(value) is None:
        _invalid_completion()
    return value


def _validated_pr_url(value: str) -> str:
    if not isinstance(value, str) or PR_PATTERN.fullmatch(value) is None:
        _invalid_completion()
    return value


def build_phase_metadata(value: PhaseCompletion) -> dict[str, str]:
    """Validate one phase envelope and build explicitly string-valued metadata."""

    if (
        not isinstance(value, PhaseCompletion)
        or value.kind not in PHASE_KINDS
        or value.result not in PHASE_RESULTS
        or not isinstance(value.attempt, int)
        or isinstance(value.attempt, bool)
        or value.attempt < 0
    ):
        _invalid_completion()
    try:
        uuid.UUID(value.evidence_comment)
    except (AttributeError, TypeError, ValueError):
        _invalid_completion()
    if value.frontend_sha is None and value.backend_sha is None:
        _invalid_completion()
    if value.kind in {"implementation", "repair"} and value.pr_url is None:
        _invalid_completion()
    if value.kind in {"implementation", "repair"}:
        if (value.frontend_sha is None) == (value.backend_sha is None):
            _invalid_completion()
        pr_url = _validated_pr_url(value.pr_url)
        if (
            "/codeExploreHub/Eventra/pull/" in pr_url
            and value.frontend_sha is None
        ) or (
            "/codeExploreHub/Eventra-Backend/pull/" in pr_url
            and value.backend_sha is None
        ):
            _invalid_completion()

    result = {
        "eventra.workflow.version": "1",
        "eventra.phase.kind": value.kind,
        "eventra.phase.result": value.result,
        "eventra.phase.attempt": str(value.attempt),
        "eventra.phase.evidence_comment": value.evidence_comment,
    }
    if value.frontend_sha is not None:
        result["eventra.phase.sha.frontend"] = _validated_sha(value.frontend_sha)
    if value.backend_sha is not None:
        result["eventra.phase.sha.backend"] = _validated_sha(value.backend_sha)
    if value.pr_url is not None:
        result["eventra.phase.pr"] = _validated_pr_url(value.pr_url)
    return result


def _scope(snapshot: ParentSnapshot) -> str:
    return {
        "frontend-only": "frontend",
        "backend-only": "backend",
        "cross-stack": "cross-stack",
    }.get(snapshot.classification, "invalid")


def _action_key(snapshot: ParentSnapshot, kind: str, attempt: int) -> str:
    return ":".join(
        (
            "1",
            snapshot.identifier,
            kind,
            str(attempt),
            _scope(snapshot),
            snapshot.candidate_frontend_sha or "-",
            snapshot.candidate_backend_sha or "-",
        )
    )


def _parent_decision(
    snapshot: ParentSnapshot,
    kind: str,
    reason: str,
    *,
    attempt: int | None = None,
) -> ParentDecision:
    if kind == "noop":
        return ParentDecision("noop", None, reason)
    key = _action_key(snapshot, kind, snapshot.attempt if attempt is None else attempt)
    if snapshot.last_action == key:
        return ParentDecision("noop", None, "coordinator action already recorded")
    return ParentDecision(kind, key, reason)


def _phase_shas_match(snapshot: ParentSnapshot, phases: tuple[PhaseSnapshot, ...]) -> bool:
    for phase_value in phases:
        if (
            phase_value.frontend_sha is not None
            and phase_value.frontend_sha != snapshot.candidate_frontend_sha
        ) or (
            phase_value.backend_sha is not None
            and phase_value.backend_sha != snapshot.candidate_backend_sha
        ):
            return False
    return True


def _gate_coverage(snapshot: ParentSnapshot, phases: tuple[PhaseSnapshot, ...]) -> bool:
    if {item.kind for item in phases} != {"review", "qa"}:
        return False
    expected = {
        repository
        for repository, sha in (
            ("frontend", snapshot.candidate_frontend_sha),
            ("backend", snapshot.candidate_backend_sha),
        )
        if sha is not None
    }
    return all(
        {
            repository
            for item in phases
            if item.kind == kind
            for repository, sha in (
                ("frontend", item.frontend_sha),
                ("backend", item.backend_sha),
            )
            if sha is not None
        }
        == expected
        for kind in ("review", "qa")
    )


def _pull_requests_ready(snapshot: ParentSnapshot) -> bool:
    expected = {
        repository: sha
        for repository, sha in (
            ("frontend", snapshot.candidate_frontend_sha),
            ("backend", snapshot.candidate_backend_sha),
        )
        if sha is not None
    }
    if len(snapshot.pull_requests) != len(expected):
        return False
    observed = {item.repository: item for item in snapshot.pull_requests}
    return set(observed) == set(expected) and all(
        item.head_sha == expected[repository]
        and item.state == "open"
        and item.mergeable is True
        and item.checks_pass is True
        for repository, item in observed.items()
    )


def _repair_or_block(snapshot: ParentSnapshot) -> ParentDecision:
    if snapshot.attempt >= 2:
        return _parent_decision(
            snapshot,
            "block_parent",
            "automatic attempt limit exhausted",
        )
    return _parent_decision(
        snapshot,
        "create_repair_stage",
        "current exact-SHA gate set did not pass",
        attempt=snapshot.attempt + 1,
    )


def decide_parent_action(snapshot: ParentSnapshot) -> ParentDecision:
    """Return one deterministic coordinator action without mutating state."""

    if (
        not isinstance(snapshot, ParentSnapshot)
        or _scope(snapshot) == "invalid"
        or snapshot.attempt < 0
        or snapshot.merge_state not in {"not_ready", "ready", "merged", "partial"}
    ):
        return ParentDecision("block_parent", None, "malformed parent workflow state")
    if snapshot.merge_state == "partial":
        return _parent_decision(
            snapshot,
            "block_parent",
            "cross-repository merge is partial",
        )

    if snapshot.children:
        latest_stage = max(item.stage for item in snapshot.children)
        latest = tuple(item for item in snapshot.children if item.stage == latest_stage)
    else:
        latest = ()

    if snapshot.merge_state == "merged":
        if latest and {item.kind for item in latest} == {"smoke"}:
            if any(item.status != "done" for item in latest):
                return ParentDecision("noop", None, "smoke stage is still active")
            if all(item.result == "pass" for item in latest):
                return _parent_decision(
                    snapshot,
                    "complete_parent",
                    "merged local smoke passed",
                )
            return _repair_or_block(snapshot)
        return _parent_decision(
            snapshot,
            "create_smoke_stage",
            "merged candidates require local smoke",
        )

    if not latest:
        return ParentDecision("noop", None, "parent has no completed stage")
    if any(item.status != "done" for item in latest):
        return ParentDecision("noop", None, "latest stage is still active")
    if any(item.result not in PHASE_RESULTS for item in latest):
        return _parent_decision(
            snapshot,
            "block_parent",
            "terminal phase evidence is malformed",
        )

    kinds = {item.kind for item in latest}
    if kinds <= {"implementation", "repair"}:
        if not all(item.result == "pass" for item in latest):
            return _repair_or_block(snapshot)
        if not _phase_shas_match(snapshot, latest):
            return _parent_decision(
                snapshot,
                "block_parent",
                "implementation evidence does not match current candidates",
            )
        return _parent_decision(
            snapshot,
            "create_gate_stage",
            "implementation evidence is ready for exact-SHA gates",
        )

    if kinds <= {"review", "qa"}:
        if not _phase_shas_match(snapshot, latest):
            return _parent_decision(
                snapshot,
                "create_gate_stage",
                "candidate SHA changed after the latest gate set",
            )
        if not _gate_coverage(snapshot, latest):
            return _parent_decision(
                snapshot,
                "block_parent",
                "required exact-SHA gate coverage is incomplete",
            )
        if not all(item.result == "pass" for item in latest):
            return _repair_or_block(snapshot)
        if not _pull_requests_ready(snapshot):
            return _parent_decision(
                snapshot,
                "block_parent",
                "current pull request state is not merge-ready",
            )
        return _parent_decision(
            snapshot,
            "merge",
            "all current exact-SHA gates and merge checks passed",
        )

    return _parent_decision(
        snapshot,
        "block_parent",
        "latest stage mixes incompatible phase kinds",
    )


def decide_recovery(snapshot: WorkflowSnapshot) -> RecoveryDecision:
    """Choose at most one safe stalled-work rerun."""

    if snapshot.has_human_approval_wait or snapshot.has_malformed_state:
        return RecoveryDecision("noop", None, "state is not auto-recoverable")
    stalled_child = snapshot.first_terminal_run_without_phase_completion()
    if stalled_child is not None and not stalled_child.has_active_run:
        return RecoveryDecision(
            "rerun_child",
            stalled_child.identifier,
            "terminal run without terminal phase transition",
        )
    unstarted_child = next(
        (
            child
            for child in sorted(
                snapshot.children,
                key=lambda item: (item.stage, item.identifier),
            )
            if child.issue_status in {"todo", "in_progress", "in_review"}
            and child.latest_run_status is None
            and not child.has_active_run
        ),
        None,
    )
    if unstarted_child is not None:
        return RecoveryDecision(
            "rerun_child",
            unstarted_child.identifier,
            "nonterminal assigned child without an active run",
        )
    if snapshot.latest_stage_finished and not snapshot.has_later_parent_run:
        return RecoveryDecision(
            "rerun_parent",
            snapshot.parent_identifier,
            "finished stage without successor parent run",
        )
    if snapshot.active_parent_has_no_executable_successor:
        return RecoveryDecision(
            "rerun_parent",
            snapshot.parent_identifier,
            "active parent without executable successor",
        )
    return RecoveryDecision("noop", None, "workflow has an active successor")


def recover_once(runner: MulticaRunner, snapshot_loader) -> RecoveryResult:
    """Reread one workflow, rerun once, and require a fresh active task."""

    initial = decide_recovery(snapshot_loader())
    if initial.kind == "noop":
        return RecoveryResult(initial, 0)
    fresh = decide_recovery(snapshot_loader())
    if fresh != initial:
        return RecoveryResult(
            RecoveryDecision("noop", None, "workflow changed before recovery"),
            0,
        )
    issue_key = fresh.issue_key
    if issue_key is None:
        raise RuntimeError("malformed recovery decision")
    detail = parse_issue_detail(
        runner.run(["issue", "get", issue_key, "--output", "json"]),
        issue_key,
    )
    issue_id = str(detail["id"])
    before = parse_issue_runs(
        runner.run(["issue", "runs", issue_key, "--output", "json"]),
        issue_id,
    )
    before_ids = {item["id"] for item in before}
    runner.run(["issue", "rerun", issue_key, "--output", "json"])
    after = parse_issue_runs(
        runner.run(["issue", "runs", issue_key, "--output", "json"]),
        issue_id,
    )
    if not any(
        item["id"] not in before_ids and item["status"] in ACTIVE_RUN_STATUSES
        for item in after
    ):
        raise RuntimeError("recovery verification failed")
    return RecoveryResult(fresh, 1)


def _parent_metadata(value: dict[str, str]) -> dict[str, object]:
    classification = value.get("eventra.workflow.classification")
    next_stage = value.get("eventra.workflow.next_stage")
    attempt = value.get("eventra.workflow.attempt")
    merge_state = value.get("eventra.workflow.merge_state")
    last_action = value.get("eventra.workflow.last_action")
    frontend_sha = value.get("eventra.workflow.frontend_sha")
    backend_sha = value.get("eventra.workflow.backend_sha")
    if (
        value.get("eventra.workflow.version") != "1"
        or classification not in {"frontend-only", "backend-only", "cross-stack"}
        or not isinstance(next_stage, str)
        or not next_stage.isdigit()
        or int(next_stage) < 1
        or not isinstance(attempt, str)
        or not attempt.isdigit()
        or merge_state not in {"not_ready", "ready", "merged", "partial"}
        or not isinstance(last_action, str)
        or (frontend_sha is not None and SHA_PATTERN.fullmatch(frontend_sha) is None)
        or (backend_sha is not None and SHA_PATTERN.fullmatch(backend_sha) is None)
        or (classification == "frontend-only" and (frontend_sha is None or backend_sha is not None))
        or (classification == "backend-only" and (backend_sha is None or frontend_sha is not None))
        or (classification == "cross-stack" and (frontend_sha is None or backend_sha is None))
    ):
        raise RuntimeError("malformed parent workflow metadata")
    return {
        "classification": classification,
        "attempt": int(attempt),
        "merge_state": merge_state,
        "last_action": last_action or None,
        "frontend_sha": frontend_sha,
        "backend_sha": backend_sha,
    }


def _phase_snapshot(
    issue: dict[str, object],
    metadata: dict[str, str],
) -> PhaseSnapshot:
    kind = metadata.get("eventra.phase.kind", "unknown")
    result = metadata.get("eventra.phase.result")
    attempt_text = metadata.get("eventra.phase.attempt", "0")
    frontend_sha = metadata.get("eventra.phase.sha.frontend")
    backend_sha = metadata.get("eventra.phase.sha.backend")
    if (
        (kind != "unknown" and kind not in PHASE_KINDS)
        or (result is not None and result not in PHASE_RESULTS)
        or not attempt_text.isdigit()
        or (frontend_sha is not None and SHA_PATTERN.fullmatch(frontend_sha) is None)
        or (backend_sha is not None and SHA_PATTERN.fullmatch(backend_sha) is None)
    ):
        raise RuntimeError("malformed child phase metadata")
    completed = _has_phase_completion(metadata)
    return PhaseSnapshot(
        issue_key=str(issue["identifier"]),
        stage=int(issue["stage"]),
        kind=kind,
        result=result if completed else None,
        attempt=int(attempt_text),
        status=str(issue["status"]),
        frontend_sha=frontend_sha,
        backend_sha=backend_sha,
    )


def _repository_for_pr(value: str) -> str:
    _validated_pr_url(value)
    if "/codeExploreHub/Eventra-Backend/pull/" in value:
        return "backend"
    return "frontend"


def _parse_pull_request(
    value: object,
    expected_url: str,
    repository: str,
) -> PullRequestSnapshot:
    if not isinstance(value, dict) or set(value) != {
        "url", "headRefOid", "state", "mergeable", "statusCheckRollup"
    }:
        raise RuntimeError("malformed GitHub pull request")
    if value.get("url") != expected_url:
        raise RuntimeError("malformed GitHub pull request")
    head_sha = value.get("headRefOid")
    state = value.get("state")
    mergeable = value.get("mergeable")
    checks = value.get("statusCheckRollup")
    if (
        not isinstance(head_sha, str)
        or SHA_PATTERN.fullmatch(head_sha) is None
        or state not in {"OPEN", "CLOSED", "MERGED"}
        or mergeable not in {"MERGEABLE", "CONFLICTING", "UNKNOWN"}
        or not isinstance(checks, list)
        or not all(isinstance(item, dict) for item in checks)
    ):
        raise RuntimeError("malformed GitHub pull request")
    conclusions = [item.get("conclusion") for item in checks]
    if any(item is not None and not isinstance(item, str) for item in conclusions):
        raise RuntimeError("malformed GitHub pull request")
    checks_pass = all(
        conclusion in {"SUCCESS", "NEUTRAL", "SKIPPED"}
        for conclusion in conclusions
    )
    return PullRequestSnapshot(
        repository=repository,
        url=expected_url,
        head_sha=head_sha,
        state=state.lower(),
        mergeable=mergeable == "MERGEABLE",
        checks_pass=checks_pass,
    )


def load_parent_snapshot(
    runner: MulticaRunner,
    github: GitHubRunner,
    parent_key: str,
) -> ParentSnapshot:
    """Read parent phase metadata and current GitHub heads without mutation."""

    parent = parse_issue_detail(
        runner.run(["issue", "get", parent_key, "--output", "json"]),
        parent_key,
    )
    if parent["parent_issue_id"] is not None:
        raise RuntimeError("parent planning requires a parent issue")
    metadata = _parent_metadata(
        parse_issue_metadata(
            runner.run(
                ["issue", "metadata", "list", parent_key, "--output", "json"]
            )
        )
    )
    children = parse_issue_children(
        runner.run(["issue", "children", parent_key, "--output", "json"]),
        str(parent["id"]),
    )
    phases: list[PhaseSnapshot] = []
    pr_candidates: dict[str, tuple[int, str]] = {}
    for child in children:
        if child["stage"] is None:
            continue
        child_metadata = parse_issue_metadata(
            runner.run(
                [
                    "issue", "metadata", "list", str(child["identifier"]),
                    "--output", "json",
                ]
            )
        )
        phases.append(_phase_snapshot(child, child_metadata))
        pr_url = child_metadata.get("eventra.phase.pr")
        if pr_url is not None:
            repository = _repository_for_pr(pr_url)
            candidate = (int(child["stage"]), pr_url)
            previous = pr_candidates.get(repository)
            if previous is None or candidate[0] > previous[0]:
                pr_candidates[repository] = candidate
            elif candidate[0] == previous[0] and candidate[1] != previous[1]:
                raise RuntimeError("conflicting phase pull requests")

    pull_requests = []
    for repository, (_, url) in sorted(pr_candidates.items()):
        raw = github.run(
            [
                "pr", "view", url,
                "--json", "url,headRefOid,state,mergeable,statusCheckRollup",
            ]
        )
        pull_requests.append(_parse_pull_request(raw, url, repository))
    return ParentSnapshot(
        identifier=parent_key,
        classification=str(metadata["classification"]),
        attempt=int(metadata["attempt"]),
        last_action=metadata["last_action"],
        merge_state=str(metadata["merge_state"]),
        candidate_frontend_sha=metadata["frontend_sha"],
        candidate_backend_sha=metadata["backend_sha"],
        children=tuple(phases),
        pull_requests=tuple(pull_requests),
    )


def _has_phase_completion(metadata: dict[str, str]) -> bool:
    return (
        metadata.get("eventra.workflow.version") == "1"
        and metadata.get("eventra.phase.kind") in PHASE_KINDS
        and metadata.get("eventra.phase.result") in PHASE_RESULTS
        and metadata.get("eventra.phase.attempt", "").isdigit()
        and _is_uuid(metadata.get("eventra.phase.evidence_comment"))
    )


def _is_uuid(value: str | None) -> bool:
    try:
        uuid.UUID(value)
    except (AttributeError, TypeError, ValueError):
        return False
    return True


def load_workflow_snapshot(
    runner: MulticaRunner,
    parent_key: str,
) -> WorkflowSnapshot:
    """Read one complete parent/child/run view from authoritative CLI reads."""

    parent = parse_issue_detail(
        runner.run(["issue", "get", parent_key, "--output", "json"]),
        parent_key,
    )
    if parent["parent_issue_id"] is not None:
        raise RuntimeError("workflow snapshot requires a parent issue")
    parent_metadata = parse_issue_metadata(
        runner.run(["issue", "metadata", "list", parent_key, "--output", "json"])
    )
    if parent_metadata.get("eventra.workflow.version") != "1":
        raise RuntimeError("unsupported workflow metadata")
    children = parse_issue_children(
        runner.run(["issue", "children", parent_key, "--output", "json"]),
        str(parent["id"]),
    )
    parent_runs = parse_issue_runs(
        runner.run(["issue", "runs", parent_key, "--output", "json"]),
        str(parent["id"]),
    )
    snapshots: list[ChildRunSnapshot] = []
    has_human_wait = parent["assignee_type"] == "member"
    for child in children:
        child_key = str(child["identifier"])
        metadata = parse_issue_metadata(
            runner.run(
                ["issue", "metadata", "list", child_key, "--output", "json"]
            )
        )
        runs = parse_issue_runs(
            runner.run(["issue", "runs", child_key, "--output", "json"]),
            str(child["id"]),
        )
        latest = max(runs, key=lambda item: item["activity_at"]) if runs else None
        has_active = any(item["status"] in ACTIVE_RUN_STATUSES for item in runs)
        has_human_wait = has_human_wait or child["assignee_type"] == "member"
        snapshots.append(
            ChildRunSnapshot(
                issue_id=str(child["id"]),
                identifier=child_key,
                stage=0 if child["stage"] is None else int(child["stage"]),
                issue_status=str(child["status"]),
                latest_run_status=None if latest is None else str(latest["status"]),
                latest_run_activity_at=(
                    None if latest is None else str(latest["activity_at"])
                ),
                has_active_run=has_active,
                has_phase_completion=_has_phase_completion(metadata),
            )
        )

    staged = [item for item in children if item["stage"] is not None]
    latest_stage_children: list[dict[str, object]] = []
    if staged:
        latest_stage = max(int(item["stage"]) for item in staged)
        latest_stage_children = [
            item for item in staged if item["stage"] == latest_stage
        ]
    latest_stage_finished = bool(latest_stage_children) and all(
        item["status"] == "done" for item in latest_stage_children
    )
    stage_activity = max(
        (str(item["updated_at"]) for item in latest_stage_children),
        default="",
    )
    has_later_parent_run = latest_stage_finished and any(
        item["activity_at"] > stage_activity for item in parent_runs
    )
    parent_active = any(
        item["status"] in ACTIVE_RUN_STATUSES for item in parent_runs
    )
    return WorkflowSnapshot(
        parent_issue_id=str(parent["id"]),
        parent_identifier=parent_key,
        has_human_approval_wait=has_human_wait,
        has_malformed_state=False,
        latest_stage_finished=latest_stage_finished,
        has_later_parent_run=has_later_parent_run,
        active_parent_has_no_executable_successor=(
            parent["status"] == "in_progress"
            and not parent_active
            and not children
        ),
        children=tuple(snapshots),
    )


def _list_workflow_parents(
    runner: MulticaRunner,
    project_ids: Sequence[str],
) -> list[str]:
    records: dict[str, dict[str, object]] = {}
    for project_id in project_ids:
        if not isinstance(project_id, str) or not project_id:
            raise ValueError("invalid watcher project identifier")
        for status in ("in_progress", "in_review"):
            offset = 0
            while True:
                page = parse_issue_list(
                    runner.run(
                        [
                            "issue",
                            "list",
                            "--project",
                            project_id,
                            "--status",
                            status,
                            "--metadata",
                            'eventra.workflow.version="1"',
                            "--limit",
                            "50",
                            "--offset",
                            str(offset),
                            "--output",
                            "json",
                        ]
                    ),
                    project_id,
                )
                for issue in page["issues"]:
                    if issue["parent_issue_id"] is not None:
                        continue
                    previous = records.get(str(issue["id"]))
                    if previous is not None and previous != issue:
                        raise RuntimeError("malformed watcher issue list")
                    records[str(issue["id"])] = issue
                if not page["has_more"]:
                    break
                if not page["issues"]:
                    raise RuntimeError("malformed watcher issue list")
                offset += len(page["issues"])
    ordered = sorted(
        records.values(),
        key=lambda item: (str(item["updated_at"]), str(item["identifier"])),
    )
    return [str(item["identifier"]) for item in ordered]


def watch_projects(
    runner: MulticaRunner,
    project_ids: Sequence[str],
    *,
    apply: bool,
) -> WatchResult:
    """Scan only the configured projects and recover at most one workflow."""

    if len(project_ids) != 2 or len(set(project_ids)) != 2:
        raise ValueError("watcher requires two distinct project identifiers")
    parent_keys = _list_workflow_parents(runner, project_ids)
    candidates: list[tuple[str, RecoveryDecision]] = []
    for parent_key in parent_keys:
        decision = decide_recovery(load_workflow_snapshot(runner, parent_key))
        if decision.kind != "noop":
            candidates.append((parent_key, decision))
    if not candidates:
        return WatchResult(len(parent_keys), 0, 0, "noop")
    first_parent, first_decision = candidates[0]
    if not apply:
        return WatchResult(
            len(parent_keys), len(candidates), 0, first_decision.kind
        )
    recovered = recover_once(
        runner,
        lambda: load_workflow_snapshot(runner, first_parent),
    )
    return WatchResult(
        len(parent_keys),
        len(candidates),
        recovered.mutation_count,
        recovered.decision.kind,
    )


def finish_phase(
    runner: MulticaRunner,
    issue_key: str,
    value: PhaseCompletion,
) -> PhaseResult:
    """Write, verify, and terminally finish one staged child phase."""

    wanted = build_phase_metadata(value)
    if not isinstance(issue_key, str) or ISSUE_KEY_PATTERN.fullmatch(issue_key) is None:
        raise ValueError("invalid issue identifier")
    detail = parse_issue_detail(
        runner.run(["issue", "get", issue_key, "--output", "json"]),
        issue_key,
    )
    if detail["parent_issue_id"] is None or detail["stage"] is None:
        raise RuntimeError("phase completion requires a staged child issue")
    before = parse_issue_metadata(
        runner.run(["issue", "metadata", "list", issue_key, "--output", "json"])
    )
    controlled_before = {
        key: item for key, item in before.items() if key in CONTROLLED_PHASE_KEYS
    }
    if detail["status"] == "done":
        if controlled_before == wanted:
            return PhaseResult(
                str(detail["id"]), issue_key, "done", value.kind, value.result, 0
            )
        raise RuntimeError("terminal phase metadata conflicts with request")
    if detail["status"] in {"blocked", "cancelled"}:
        raise RuntimeError("phase issue is not mutable")
    if any(
        key not in wanted or wanted[key] != item
        for key, item in controlled_before.items()
    ):
        raise RuntimeError("phase metadata conflicts with request")

    for key, item in wanted.items():
        runner.run(
            [
                "issue",
                "metadata",
                "set",
                issue_key,
                "--key",
                key,
                "--value",
                item,
                "--type",
                "string",
                "--output",
                "json",
            ]
        )
    observed = parse_issue_metadata(
        runner.run(["issue", "metadata", "list", issue_key, "--output", "json"])
    )
    controlled_observed = {
        key: item for key, item in observed.items() if key in CONTROLLED_PHASE_KEYS
    }
    if controlled_observed != wanted:
        raise RuntimeError("phase metadata reconciliation failed")
    runner.run(
        [
            "issue",
            "status",
            issue_key,
            "done",
            "--no-start",
            "--output",
            "json",
        ]
    )
    final = parse_issue_detail(
        runner.run(["issue", "get", issue_key, "--output", "json"]),
        issue_key,
    )
    if final["status"] != "done":
        raise RuntimeError("phase completion failed")
    return PhaseResult(
        str(final["id"]),
        issue_key,
        "done",
        value.kind,
        value.result,
        len(wanted) + 1,
    )


def build_workflow_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Advance Eventra Multica workflow state deterministically."
    )
    subparsers = parser.add_subparsers(dest="command", required=True)
    finish = subparsers.add_parser("finish-phase")
    finish.add_argument("issue")
    finish.add_argument("--kind", required=True, choices=sorted(PHASE_KINDS))
    finish.add_argument("--result", required=True, choices=sorted(PHASE_RESULTS))
    finish.add_argument("--attempt", required=True, type=int)
    finish.add_argument("--evidence-comment", required=True)
    finish.add_argument("--frontend-sha")
    finish.add_argument("--backend-sha")
    finish.add_argument("--pr")
    plan_parent = subparsers.add_parser("plan-parent")
    plan_parent.add_argument("parent")
    watch = subparsers.add_parser("watch")
    watch.add_argument("--project-id", required=True)
    watch.add_argument("--backend-project-id", required=True)
    watch.add_argument("--apply", action="store_true")
    return parser


def print_phase_result(value: PhaseResult) -> None:
    print(
        f"issue={value.issue_key} status={value.status} kind={value.kind} "
        f"result={value.result} mutations={value.mutation_count}"
    )


def print_watch_result(value: WatchResult) -> None:
    print(
        f"scanned={value.scanned} candidates={value.candidates} "
        f"applied={value.applied} decision={value.decision}"
    )


def print_parent_decision(value: ParentDecision) -> None:
    print(
        f"decision={value.kind} action={value.action_key or '-'} "
        f"reason={value.reason}"
    )


def main(argv: Sequence[str] | None = None) -> int:
    args = build_workflow_parser().parse_args(argv)
    runner = MulticaRunner()
    if args.command == "finish-phase":
        completion = PhaseCompletion(
            kind=args.kind,
            result=args.result,
            attempt=args.attempt,
            evidence_comment=args.evidence_comment,
            frontend_sha=args.frontend_sha,
            backend_sha=args.backend_sha,
            pr_url=args.pr,
        )
        print_phase_result(finish_phase(runner, args.issue, completion))
    elif args.command == "plan-parent":
        print_parent_decision(
            decide_parent_action(
                load_parent_snapshot(runner, GitHubRunner(), args.parent)
            )
        )
    elif args.command == "watch":
        print_watch_result(
            watch_projects(
                runner,
                (args.project_id, args.backend_project_id),
                apply=args.apply,
            )
        )
    else:
        raise RuntimeError("unsupported workflow command")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
