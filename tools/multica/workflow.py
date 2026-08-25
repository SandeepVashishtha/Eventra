"""Deterministic Eventra workflow transitions over the Multica CLI boundary."""

from __future__ import annotations

import argparse
import re
import uuid
from dataclasses import dataclass
from typing import Literal, Sequence

from .issue_contracts import parse_issue_detail, parse_issue_metadata
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
    return parser


def print_phase_result(value: PhaseResult) -> None:
    print(
        f"issue={value.issue_key} status={value.status} kind={value.kind} "
        f"result={value.result} mutations={value.mutation_count}"
    )


def main(argv: Sequence[str] | None = None) -> int:
    args = build_workflow_parser().parse_args(argv)
    if args.command != "finish-phase":
        raise RuntimeError("unsupported workflow command")
    completion = PhaseCompletion(
        kind=args.kind,
        result=args.result,
        attempt=args.attempt,
        evidence_comment=args.evidence_comment,
        frontend_sha=args.frontend_sha,
        backend_sha=args.backend_sha,
        pr_url=args.pr,
    )
    print_phase_result(finish_phase(MulticaRunner(), args.issue, completion))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
