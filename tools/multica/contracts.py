"""Pure, strict parsers for the Multica CLI 0.4.31 read contracts."""

from typing import Any


def _error(contract: str) -> None:
    raise RuntimeError(f"malformed {contract}")


def _string(value: Any) -> bool:
    return isinstance(value, str) and bool(value)


def _records(value: Any, contract: str) -> list[dict[str, Any]]:
    if not isinstance(value, list) or not all(isinstance(item, dict) for item in value):
        _error(contract)
    return value


def _id(record: dict[str, Any], contract: str) -> str:
    value = record.get("id")
    if not _string(value):
        _error(contract)
    return value


def _named_records(value: Any, contract: str, name: str) -> list[dict[str, str]]:
    result = []
    ids = set()
    for record in _records(value, contract):
        record_id = _id(record, contract)
        record_name = record.get(name)
        if not _string(record_name) or record_id in ids:
            _error(contract)
        ids.add(record_id)
        result.append({"id": record_id, name: record_name})
    return result


def parse_runtime_list(value: Any, expected_runtime_id: str) -> list[dict[str, Any]]:
    """Normalize runtime records required for worktree-capability checks."""

    contract = "runtime list"
    if not _string(expected_runtime_id):
        _error(contract)
    result = []
    ids = set()
    for record in _records(value, contract):
        record_id = _id(record, contract)
        if record_id in ids:
            _error(contract)
        ids.add(record_id)
        if record_id != expected_runtime_id:
            result.append({"id": record_id})
            continue
        daemon_id = record.get("daemon_id")
        status = record.get("status")
        metadata = record.get("metadata")
        capabilities = metadata.get("capabilities") if isinstance(metadata, dict) else None
        if (
            not _string(daemon_id)
            or not _string(status)
            or not isinstance(metadata, dict)
            or not isinstance(capabilities, list)
            or not all(_string(item) for item in capabilities)
        ):
            _error(contract)
        result.append(
            {
                "id": record_id,
                "daemon_id": daemon_id,
                "status": status,
                "metadata": {"capabilities": list(capabilities)},
            }
        )
    return result


def parse_skill_list(value: Any) -> list[dict[str, str]]:
    return _named_records(value, "skill list", "name")


def parse_skill_detail(value: Any, expected_id: str) -> dict[str, Any]:
    contract = "skill detail"
    if not isinstance(value, dict) or not _string(expected_id):
        _error(contract)
    record_id = _id(value, contract)
    name = value.get("name")
    config = value.get("config")
    origin = config.get("origin") if isinstance(config, dict) else None
    source_url = origin.get("source_url") if isinstance(origin, dict) else None
    if record_id != expected_id or not _string(name) or not _string(source_url):
        _error(contract)
    return {"id": record_id, "name": name, "config": {"origin": {"source_url": source_url}}}


def parse_agent_list(value: Any) -> list[dict[str, str]]:
    return _named_records(value, "agent list", "name")


def parse_agent_detail(value: Any, expected_id: str) -> dict[str, Any]:
    contract = "agent detail"
    if not isinstance(value, dict) or not _string(expected_id):
        _error(contract)
    record_id = _id(value, contract)
    fields = ("name", "runtime_id", "visibility")
    if record_id != expected_id or any(not _string(value.get(field)) for field in fields):
        _error(contract)
    description = value.get("description")
    instructions = value.get("instructions")
    max_concurrent_tasks = value.get("max_concurrent_tasks")
    if (
        not isinstance(description, str)
        or not isinstance(instructions, str)
        or not isinstance(max_concurrent_tasks, int)
        or isinstance(max_concurrent_tasks, bool)
    ):
        _error(contract)
    return {
        "id": record_id,
        "name": value["name"],
        "description": description,
        "instructions": instructions,
        "runtime_id": value["runtime_id"],
        "visibility": value["visibility"],
        "max_concurrent_tasks": max_concurrent_tasks,
    }


def parse_agent_environment(value: Any, expected_id: str) -> dict[str, str]:
    """Parse the exact environment envelope without exposing malformed content."""

    contract = "agent environment"
    if not isinstance(value, dict) or not _string(expected_id) or value.get("agent_id") != expected_id:
        _error(contract)
    custom_env = value.get("custom_env")
    if not isinstance(custom_env, dict) or not all(
        isinstance(key, str) and isinstance(item, str) for key, item in custom_env.items()
    ):
        _error(contract)
    return dict(custom_env)


def parse_agent_skill_list(value: Any) -> list[dict[str, str]]:
    return _named_records(value, "agent skill list", "name")


def parse_squad_list(value: Any) -> list[dict[str, str]]:
    return _named_records(value, "squad list", "name")


def parse_squad_detail(value: Any, expected_id: str) -> dict[str, str]:
    contract = "squad detail"
    if not isinstance(value, dict) or not _string(expected_id):
        _error(contract)
    record_id = _id(value, contract)
    name = value.get("name")
    leader_id = value.get("leader_id")
    description = value.get("description")
    instructions = value.get("instructions")
    if (
        record_id != expected_id
        or not _string(name)
        or not _string(leader_id)
        or not isinstance(description, str)
        or not isinstance(instructions, str)
    ):
        _error(contract)
    return {
        "id": record_id,
        "name": name,
        "description": description,
        "instructions": instructions,
        "leader_id": leader_id,
    }


def parse_squad_members(value: Any, expected_squad_id: str) -> list[dict[str, str]]:
    contract = "squad member list"
    if not _string(expected_squad_id):
        _error(contract)
    result = []
    ids = set()
    member_ids = set()
    for record in _records(value, contract):
        record_id = _id(record, contract)
        squad_id = record.get("squad_id")
        member_id = record.get("member_id")
        member_type = record.get("member_type")
        role = record.get("role")
        if (
            record_id in ids
            or member_id in member_ids
            or squad_id != expected_squad_id
            or not _string(member_id)
            or not _string(member_type)
            or not _string(role)
        ):
            _error(contract)
        ids.add(record_id)
        member_ids.add(member_id)
        result.append({"member_id": member_id, "member_type": member_type, "role": role})
    return result


def parse_project_list(value: Any) -> list[dict[str, str]]:
    return _named_records(value, "project list", "title")


def parse_project_detail(value: Any, expected_id: str) -> dict[str, str]:
    contract = "project detail"
    if not isinstance(value, dict) or not _string(expected_id):
        _error(contract)
    record_id = _id(value, contract)
    title = value.get("title")
    description = value.get("description")
    if record_id != expected_id or not _string(title) or not isinstance(description, str):
        _error(contract)
    return {"id": record_id, "title": title, "description": description}


def parse_project_resources(value: Any, expected_project_id: str) -> list[dict[str, Any]]:
    contract = "project resource list"
    if not _string(expected_project_id):
        _error(contract)
    result = []
    ids = set()
    for record in _records(value, contract):
        record_id = _id(record, contract)
        project_id = record.get("project_id")
        resource_type = record.get("resource_type")
        resource_ref = record.get("resource_ref")
        if (
            record_id in ids
            or project_id != expected_project_id
            or not _string(resource_type)
            or not isinstance(resource_ref, dict)
        ):
            _error(contract)
        local_path = resource_ref.get("local_path")
        daemon_id = resource_ref.get("daemon_id")
        execution_mode = resource_ref.get("execution_mode")
        if (
            not _string(local_path)
            or not _string(daemon_id)
            or ("execution_mode" in resource_ref and not _string(execution_mode))
        ):
            _error(contract)
        ids.add(record_id)
        normalized_ref = {"local_path": local_path, "daemon_id": daemon_id}
        if "execution_mode" in resource_ref:
            normalized_ref["execution_mode"] = execution_mode
        result.append(
            {
                "id": record_id,
                "resource_type": resource_type,
                "resource_ref": normalized_ref,
            }
        )
    return result
