"""Read-only, scalar-free Multica CLI contract diagnostics for Eventra."""

from __future__ import annotations

import argparse
import json
import sys
from typing import Any

from .contracts import (
    parse_agent_detail,
    parse_agent_environment,
    parse_agent_list,
    parse_project_detail,
    parse_project_list,
    parse_project_resources,
    parse_runtime_list,
    parse_skill_detail,
    parse_skill_list,
    parse_squad_detail,
    parse_squad_list,
    parse_squad_members,
)
from .eventra_adapter import build_eventra_config
from .provision import MulticaRunner


def _json_type(value: Any) -> str:
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "boolean"
    if isinstance(value, str):
        return "string"
    if isinstance(value, (int, float)):
        return "number"
    if isinstance(value, list):
        return "array"
    if isinstance(value, dict):
        return "object"
    return type(value).__name__


def _environment_shape(value: Any) -> dict[str, Any]:
    """Summarize a custom environment without retaining its key names."""

    if not isinstance(value, dict):
        return {"type": _json_type(value)}
    return {
        "type": "object",
        "key_count": len(value),
        "value_types": sorted({_json_type(item) for item in value.values()}),
    }


def _shape(
    value: Any,
    *,
    target_id: str | None = None,
    target_field: str | None = None,
) -> dict[str, Any]:
    """Recursively keep JSON shape while dropping every scalar value."""

    value_type = _json_type(value)
    if isinstance(value, list):
        return {
            "type": value_type,
            "length": len(value),
            "items": [
                _shape(item, target_id=target_id, target_field=target_field)
                for item in value
            ],
        }
    if isinstance(value, dict):
        fields = {}
        for key, item in value.items():
            if key == "custom_env":
                fields[key] = _environment_shape(item)
                continue
            item_shape = _shape(item, target_id=target_id, target_field=target_field)
            if key == target_field:
                item_shape["target_id_matches"] = item == target_id
            fields[key] = item_shape
        return {"type": value_type, "fields": fields}
    return {"type": value_type}


def _exact_id(records: list[dict[str, str]], name: str, expected: str) -> str | None:
    matches = [record for record in records if record[name] == expected]
    if len(matches) > 1:
        raise RuntimeError("ambiguous audit read")
    return None if not matches else matches[0]["id"]


def _target_or_sample_id(
    records: list[dict[str, str]], name: str, expected: str
) -> str | None:
    """Prefer the Eventra record, otherwise inspect one existing read shape."""

    return _exact_id(records, name, expected) or (
        None if not records else records[0]["id"]
    )


def _read(runner: MulticaRunner, args: list[str]) -> dict[str, Any] | list[Any]:
    """Run an internally constructed list/get command with no stdin surface."""

    return runner.run(args)


def collect_contract_audit(
    runtime_id: str, daemon_id: str, runner: MulticaRunner
) -> dict[str, Any]:
    """Collect fixed Eventra preflight reads and return only their JSON shapes."""

    config = build_eventra_config(runtime_id, daemon_id)

    runtime_list = _read(runner, ["runtime", "list", "--output", "json"])
    parse_runtime_list(runtime_list)
    report: dict[str, Any] = {
        "runtime_list": _shape(runtime_list, target_id=config.runtime_id, target_field="id")
    }

    skill_list = _read(runner, ["skill", "list", "--output", "json"])
    skill_records = parse_skill_list(skill_list)
    skill_details = []
    for key in config.skills:
        skill_id = _exact_id(skill_records, "name", key)
        if skill_id is not None:
            detail = _read(runner, ["skill", "get", skill_id, "--output", "json"])
            parse_skill_detail(detail, skill_id)
            skill_details.append(_shape(detail, target_id=skill_id, target_field="id"))
    report["skills"] = {"list": _shape(skill_list), "details": skill_details}

    agent_list = _read(runner, ["agent", "list", "--output", "json"])
    agent_records = parse_agent_list(agent_list)
    agent_details = []
    agent_environments = []
    for agent in config.agents:
        agent_id = _exact_id(agent_records, "name", agent.name)
        if agent_id is None:
            continue
        detail = _read(runner, ["agent", "get", agent_id, "--output", "json"])
        parse_agent_detail(detail, agent_id)
        agent_details.append(_shape(detail, target_id=agent_id, target_field="id"))
        if agent.needs_backend_env:
            environment = _read(
                runner, ["agent", "env", "get", agent_id, "--output", "json"]
            )
            parse_agent_environment(environment, agent_id)
            agent_environments.append(
                _shape(environment, target_id=agent_id, target_field="agent_id")
            )
    report["agents"] = {
        "list": _shape(agent_list),
        "details": agent_details,
        "environments": agent_environments,
    }

    squad_list = _read(runner, ["squad", "list", "--output", "json"])
    squad_records = parse_squad_list(squad_list)
    squad_id = _target_or_sample_id(
        squad_records, "name", config.blueprint.squad_name
    )
    squad_report: dict[str, Any] = {"list": _shape(squad_list), "details": []}
    if squad_id is not None:
        detail = _read(runner, ["squad", "get", squad_id, "--output", "json"])
        parse_squad_detail(detail, squad_id)
        members = _read(
            runner, ["squad", "member", "list", squad_id, "--output", "json"]
        )
        parse_squad_members(members, squad_id)
        squad_report["details"].append(_shape(detail, target_id=squad_id, target_field="id"))
        squad_report["members"] = _shape(
            members, target_id=squad_id, target_field="squad_id"
        )
    report["squads"] = squad_report

    project_list = _read(runner, ["project", "list", "--output", "json"])
    project_records = parse_project_list(project_list)
    project_id = _target_or_sample_id(
        project_records, "title", config.project_title
    )
    project_report: dict[str, Any] = {"list": _shape(project_list), "details": []}
    if project_id is not None:
        detail = _read(runner, ["project", "get", project_id, "--output", "json"])
        parse_project_detail(detail, project_id)
        resources = _read(
            runner,
            ["project", "resource", "list", project_id, "--output", "json"],
        )
        parse_project_resources(resources, project_id)
        project_report["details"].append(
            _shape(detail, target_id=project_id, target_field="id")
        )
        project_report["resources"] = _shape(
            resources, target_id=project_id, target_field="project_id"
        )
    report["projects"] = project_report
    return report


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Print scalar-free shapes from fixed Eventra Multica read contracts.",
        allow_abbrev=False,
    )
    parser.add_argument("--runtime-id", required=True)
    parser.add_argument("--daemon-id", required=True)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    report = collect_contract_audit(args.runtime_id, args.daemon_id, MulticaRunner())
    json.dump(report, sys.stdout, sort_keys=True)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
