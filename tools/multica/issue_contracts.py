"""Pure, strict parsers for Multica CLI 0.4.33 Issue read contracts."""

from __future__ import annotations

from datetime import datetime
from typing import Any


ISSUE_STATUSES = frozenset(
    {"backlog", "todo", "in_progress", "in_review", "done", "blocked", "cancelled"}
)
RUN_STATUSES = frozenset(
    {
        "queued",
        "dispatched",
        "running",
        "waiting_local_directory",
        "completed",
        "failed",
        "canceled",
        "cancelled",
    }
)
ACTIVE_RUN_STATUSES = frozenset(
    {"queued", "dispatched", "running", "waiting_local_directory"}
)
TERMINAL_PHASE_STATUSES = frozenset({"done"})


def _error(contract: str) -> None:
    raise RuntimeError(f"malformed {contract}")


def _string(value: Any) -> bool:
    return isinstance(value, str) and bool(value)


def _timestamp(value: Any) -> bool:
    if not _string(value):
        return False
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return False
    return parsed.tzinfo is not None


def _normalize_issue(value: Any, contract: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        _error(contract)
    record_id = value.get("id")
    identifier = value.get("identifier")
    parent_issue_id = value.get("parent_issue_id")
    stage = value.get("stage")
    status = value.get("status")
    assignee_id = value.get("assignee_id")
    assignee_type = value.get("assignee_type")
    project_id = value.get("project_id")
    updated_at = value.get("updated_at")
    if (
        not _string(record_id)
        or not _string(identifier)
        or (parent_issue_id is not None and not _string(parent_issue_id))
        or (
            stage is not None
            and (
                not isinstance(stage, int)
                or isinstance(stage, bool)
                or stage < 1
            )
        )
        or status not in ISSUE_STATUSES
        or not _string(assignee_id)
        or assignee_type not in {"agent", "squad"}
        or not _string(project_id)
        or not _timestamp(updated_at)
    ):
        _error(contract)
    return {
        "id": record_id,
        "identifier": identifier,
        "parent_issue_id": parent_issue_id,
        "stage": stage,
        "status": status,
        "assignee_id": assignee_id,
        "assignee_type": assignee_type,
        "project_id": project_id,
        "updated_at": updated_at,
    }


def parse_issue_detail(value: Any, expected_identifier: str) -> dict[str, Any]:
    """Normalize the fields used by the Eventra workflow for one Issue."""

    contract = "issue detail"
    if not _string(expected_identifier):
        _error(contract)
    result = _normalize_issue(value, contract)
    if result["identifier"] != expected_identifier:
        _error(contract)
    return result


def parse_issue_children(value: Any, expected_parent_id: str) -> list[dict[str, Any]]:
    """Normalize staged and unstaged direct children of one parent Issue."""

    contract = "issue children"
    if (
        not isinstance(value, dict)
        or set(value) != {"stages", "total", "unstaged"}
        or not _string(expected_parent_id)
        or not isinstance(value["stages"], list)
        or not isinstance(value["unstaged"], list)
        or not isinstance(value["total"], int)
        or isinstance(value["total"], bool)
        or value["total"] < 0
    ):
        _error(contract)

    result: list[dict[str, Any]] = []
    record_ids: set[str] = set()
    identifiers: set[str] = set()
    stage_numbers: set[int] = set()

    for group in value["stages"]:
        if not isinstance(group, dict):
            _error(contract)
        stage = group.get("stage")
        total = group.get("total")
        done = group.get("done")
        issues = group.get("issues")
        if (
            set(group) != {"stage", "total", "done", "issues"}
            or not isinstance(stage, int)
            or isinstance(stage, bool)
            or stage < 1
            or stage in stage_numbers
            or not isinstance(total, int)
            or isinstance(total, bool)
            or not isinstance(done, int)
            or isinstance(done, bool)
            or not isinstance(issues, list)
            or total != len(issues)
        ):
            _error(contract)
        stage_numbers.add(stage)
        normalized = [_normalize_issue(item, contract) for item in issues]
        if done != sum(item["status"] == "done" for item in normalized):
            _error(contract)
        for item in normalized:
            if item["parent_issue_id"] != expected_parent_id or item["stage"] != stage:
                _error(contract)
            _append_unique(result, item, record_ids, identifiers, contract)

    for raw in value["unstaged"]:
        item = _normalize_issue(raw, contract)
        if item["parent_issue_id"] != expected_parent_id or item["stage"] is not None:
            _error(contract)
        _append_unique(result, item, record_ids, identifiers, contract)

    if value["total"] != len(result):
        _error(contract)
    return result


def _append_unique(
    result: list[dict[str, Any]],
    item: dict[str, Any],
    record_ids: set[str],
    identifiers: set[str],
    contract: str,
) -> None:
    if item["id"] in record_ids or item["identifier"] in identifiers:
        _error(contract)
    record_ids.add(item["id"])
    identifiers.add(item["identifier"])
    result.append(item)


def parse_issue_runs(value: Any, expected_issue_id: str) -> list[dict[str, str]]:
    """Normalize Issue runs and derive one authoritative activity timestamp."""

    contract = "issue runs"
    if (
        not isinstance(value, list)
        or not _string(expected_issue_id)
        or not all(isinstance(item, dict) for item in value)
    ):
        _error(contract)
    result: list[dict[str, str]] = []
    record_ids: set[str] = set()
    for record in value:
        record_id = record.get("id")
        issue_id = record.get("issue_id")
        status = record.get("status")
        if (
            not _string(record_id)
            or record_id in record_ids
            or issue_id != expected_issue_id
            or status not in RUN_STATUSES
        ):
            _error(contract)
        timestamps = {
            key: record.get(key)
            for key in ("created_at", "dispatched_at", "started_at", "completed_at")
        }
        if not _timestamp(timestamps["created_at"]) or any(
            item is not None and not _timestamp(item)
            for item in timestamps.values()
        ):
            _error(contract)
        activity_at = next(
            item
            for item in (
                timestamps["completed_at"],
                timestamps["started_at"],
                timestamps["dispatched_at"],
                timestamps["created_at"],
            )
            if item is not None
        )
        record_ids.add(record_id)
        result.append(
            {
                "id": record_id,
                "issue_id": issue_id,
                "status": status,
                "created_at": timestamps["created_at"],
                "activity_at": activity_at,
            }
        )
    return result


def parse_issue_metadata(value: Any) -> dict[str, str]:
    """Require Multica's flat, explicitly string-typed metadata envelope."""

    if not isinstance(value, dict) or not all(
        _string(key) and isinstance(item, str) for key, item in value.items()
    ):
        _error("issue metadata")
    return dict(value)
