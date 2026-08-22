"""Dry-run-first, idempotent Multica reconciliation for Eventra."""

from __future__ import annotations

import argparse
import getpass
import json
import os
import subprocess
from dataclasses import dataclass
from typing import Any, Sequence

from .eventra_adapter import ProjectConfig, build_eventra_config


HTTP_TIMEOUT = "90s"
PROCESS_TIMEOUT_SECONDS = 95
MAX_AGENT_DESCRIPTION = 255
WORKTREE_CAPABILITY = "local-worktree-v1"
ENV_RECIPIENTS = frozenset({"backend_engineer", "integration_qa"})
REQUIRED_ENV_KEYS = frozenset({"JWT_SECRET", "MAIL_USERNAME", "MAIL_PASSWORD"})


@dataclass(frozen=True)
class ProvisioningResult:
    """Identifiers for the desired Multica delivery-team objects."""

    agent_ids: dict[str, str | None]
    skill_ids: dict[str, str | None]
    squad_id: str | None
    project_id: str | None
    resource_ids: dict[str, str | None]


@dataclass(frozen=True)
class _Preflight:
    skill_details: dict[str, dict[str, Any] | None]
    agent_details: dict[str, dict[str, Any] | None]
    agent_envs: dict[str, dict[str, str] | None]
    squad_detail: dict[str, Any] | None
    members: list[dict[str, Any]]
    project_detail: dict[str, Any] | None
    resources: dict[str, dict[str, Any] | None]


class MulticaRunner:
    """Strict, non-shelling JSON boundary around Multica CLI 0.4.31."""

    def run(
        self,
        args: list[str],
        *,
        stdin_json: dict[str, str] | None = None,
    ) -> dict[str, Any] | list[Any]:
        if not isinstance(args, list) or not all(isinstance(arg, str) for arg in args):
            raise TypeError("Multica arguments must be a list of strings")
        child_env = os.environ.copy()
        child_env["MULTICA_HTTP_TIMEOUT"] = HTTP_TIMEOUT
        try:
            completed = subprocess.run(
                ["multica", *args],
                input=None if stdin_json is None else json.dumps(stdin_json),
                text=True,
                capture_output=True,
                check=False,
                env=child_env,
                timeout=PROCESS_TIMEOUT_SECONDS,
            )
        except subprocess.TimeoutExpired:
            raise RuntimeError("Multica command timed out") from None
        except OSError:
            raise RuntimeError("Multica command could not be started") from None
        if completed.returncode != 0:
            raise RuntimeError(f"Multica command failed with exit {completed.returncode}")
        try:
            parsed = json.loads(completed.stdout)
        except (json.JSONDecodeError, TypeError):
            raise RuntimeError("Multica returned an invalid JSON response") from None
        if not isinstance(parsed, (dict, list)):
            raise RuntimeError("Multica returned an invalid JSON response")
        return parsed


class Provisioner:
    """Reconcile exact-name delivery objects while preserving unrelated state."""

    def __init__(self, runner: MulticaRunner):
        self.runner = runner

    def reconcile(
        self,
        config: ProjectConfig,
        *,
        apply: bool,
        backend_env: dict[str, str] | None,
    ) -> ProvisioningResult:
        self._validate_config(config)
        self._validate_backend_env(backend_env)
        desired_skills = self._desired_skills(config)
        state = self._preflight(config, desired_skills)
        self._validate_env_preconditions(config, state, apply, backend_env)

        if not apply:
            return ProvisioningResult(
                agent_ids={
                    role: None if detail is None else detail["id"]
                    for role, detail in state.agent_details.items()
                },
                skill_ids={
                    key: None if detail is None else detail["id"]
                    for key, detail in state.skill_details.items()
                },
                squad_id=None if state.squad_detail is None else state.squad_detail["id"],
                project_id=None if state.project_detail is None else state.project_detail["id"],
                resource_ids={
                    path: None if detail is None else detail["id"]
                    for path, detail in state.resources.items()
                },
            )

        skill_ids = self._reconcile_skills(desired_skills, state.skill_details)
        agent_ids = self._reconcile_agents(
            config, state.agent_details, state.agent_envs, backend_env
        )
        self._reconcile_bindings(config, agent_ids, skill_ids)
        squad_id = self._reconcile_squad(config, state.squad_detail, state.members, agent_ids)
        project_id = self._reconcile_project(config, state.project_detail)
        resource_ids = self._reconcile_resources(config, project_id, state.resources)
        return ProvisioningResult(agent_ids, skill_ids, squad_id, project_id, resource_ids)

    def _preflight(self, config, desired_skills) -> _Preflight:
        self._validate_runtime_capability(config)

        skill_index = self._index_records(
            self._records(["skill", "list", "--output", "json"], "skill list"),
            "skill list",
            "name",
        )
        skill_details = {}
        for key, source in desired_skills.items():
            item = self._unique_index(skill_index, key, "skill")
            detail = None if item is None else self._skill_get(item["id"])
            if detail is not None and self._skill_origin(detail) != source.url:
                raise RuntimeError(f"skill {key} has an unapproved origin")
            skill_details[key] = detail

        agent_index = self._index_records(
            self._records(["agent", "list", "--output", "json"], "agent list"),
            "agent list",
            "name",
        )
        agent_details, agent_envs = {}, {}
        for agent in config.agents:
            item = self._unique_index(agent_index, agent.name, "agent")
            detail = None if item is None else self._agent_get(item["id"])
            agent_details[agent.role] = detail
            agent_envs[agent.role] = (
                None
                if detail is None or not agent.needs_backend_env
                else self._agent_env_get(detail["id"])
            )

        squad_index = self._index_records(
            self._records(["squad", "list", "--output", "json"], "Squad list"),
            "Squad list",
            "name",
        )
        squad_item = self._unique_index(squad_index, config.blueprint.squad_name, "Squad")
        squad_detail = None if squad_item is None else self._squad_get(squad_item["id"])
        members = (
            []
            if squad_detail is None
            else self._member_records(squad_detail["id"])
        )

        project_index = self._index_records(
            self._records(["project", "list", "--output", "json"], "Project list"),
            "Project list",
            "title",
        )
        project_item = self._unique_index(project_index, config.project_title, "Project")
        project_detail = (
            None if project_item is None else self._project_get(project_item["id"])
        )
        raw_resources = (
            []
            if project_detail is None
            else self._resource_records(project_detail["id"])
        )
        resources = self._validate_resource_state(config, raw_resources)
        return _Preflight(
            skill_details,
            agent_details,
            agent_envs,
            squad_detail,
            members,
            project_detail,
            resources,
        )

    def _validate_runtime_capability(self, config) -> None:
        records = self._records(["runtime", "list", "--output", "json"], "runtime list")
        matches = []
        for record in records:
            runtime_id = record.get("id")
            if not isinstance(runtime_id, str) or not runtime_id:
                raise RuntimeError("malformed runtime list")
            if runtime_id == config.runtime_id:
                matches.append(record)
        if len(matches) != 1:
            raise RuntimeError("target runtime is missing or duplicated")
        target = matches[0]
        daemon_id = target.get("daemon_id")
        if not isinstance(daemon_id, str) or not daemon_id:
            raise RuntimeError("malformed runtime list")
        if daemon_id != config.daemon_id:
            raise RuntimeError("target runtime daemon does not match configuration")
        metadata = target.get("metadata")
        if target.get("status") != "online" or not isinstance(metadata, dict):
            raise RuntimeError("malformed runtime list")
        capabilities = metadata.get("capabilities")
        if not isinstance(capabilities, list) or not all(
            isinstance(value, str) for value in capabilities
        ):
            raise RuntimeError("malformed runtime list")
        if WORKTREE_CAPABILITY not in capabilities:
            raise RuntimeError(f"runtime lacks required {WORKTREE_CAPABILITY} capability")

    @staticmethod
    def _validate_config(config: ProjectConfig) -> None:
        roles = [agent.role for agent in config.agents]
        if len(roles) != len(set(roles)):
            raise ValueError("agent roles must be unique")
        recipients = {agent.role for agent in config.agents if agent.needs_backend_env}
        if recipients != ENV_RECIPIENTS:
            raise ValueError("backend environment recipients must be Backend Engineer and Integration QA")
        for agent in config.agents:
            if len(agent.description) > MAX_AGENT_DESCRIPTION:
                raise ValueError(
                    f"agent description for {agent.role} exceeds {MAX_AGENT_DESCRIPTION} characters"
                )
        if len(config.resources) != 2:
            raise ValueError("configuration must define exactly two resources")
        paths = [resource.local_path for resource in config.resources]
        if len(set(paths)) != 2:
            raise ValueError("configuration resource paths must be unique")
        if any(path in config.forbidden_paths for path in paths):
            raise ValueError("configuration includes a forbidden resource path")
        if any(
            resource.resource_type != "local_directory"
            or resource.execution_mode != "worktree"
            for resource in config.resources
        ):
            raise ValueError("configuration resources must be local_directory worktrees")

    @staticmethod
    def _validate_backend_env(backend_env: dict[str, str] | None) -> None:
        if backend_env is None:
            return
        if (
            not isinstance(backend_env, dict)
            or not all(isinstance(key, str) and isinstance(value, str) for key, value in backend_env.items())
            or set(backend_env) != REQUIRED_ENV_KEYS
        ):
            raise ValueError("backend environment is invalid")
        if len(backend_env["JWT_SECRET"]) < 64:
            raise ValueError("JWT secret must contain at least 64 characters")

    @staticmethod
    def _validate_env_preconditions(config, state, apply, backend_env) -> None:
        if not apply or backend_env is not None:
            return
        for agent in config.agents:
            if not agent.needs_backend_env:
                continue
            existing = state.agent_envs[agent.role]
            if existing is None or not REQUIRED_ENV_KEYS.issubset(existing):
                raise ValueError("backend environment is required before applying agent changes")

    @staticmethod
    def _desired_skills(config: ProjectConfig) -> dict[str, Any]:
        keys = {key for agent in config.agents for key in agent.skill_keys}
        missing = keys.difference(config.skills)
        if missing:
            raise ValueError(f"configuration is missing approved skills: {sorted(missing)!r}")
        return {key: source for key, source in config.skills.items() if key in keys}

    def _reconcile_skills(self, desired, details):
        ids = {}
        for key, source in desired.items():
            detail = details[key]
            if detail is None:
                response = self._object(
                    self.runner.run(
                        ["skill", "import", "--url", source.url, "--on-conflict", "fail", "--output", "json"]
                    ),
                    "skill import",
                )
                imported_skill = self._object(response.get("skill"), "skill import")
                skill_id = self._create_response_id(
                    imported_skill, key, "skill import"
                )
                detail = self._skill_get(skill_id)
                if detail["name"] != key or self._skill_origin(detail) != source.url:
                    raise RuntimeError(f"skill reconciliation failed for {key}")
            ids[key] = detail["id"]
        return ids

    def _reconcile_agents(self, config, details, envs, backend_env):
        ids = {}
        for agent in config.agents:
            desired = self._desired_agent(config, agent)
            detail = details[agent.role]
            created = detail is None
            if created:
                args = [
                    "agent", "create", "--name", agent.name,
                    "--description", agent.description,
                    "--instructions", desired["instructions"],
                    "--runtime-id", config.runtime_id,
                    "--visibility", "workspace",
                    "--max-concurrent-tasks", "1",
                ]
                stdin_json = None
                if agent.needs_backend_env:
                    args.append("--custom-env-stdin")
                    stdin_json = dict(backend_env)
                args.extend(["--output", "json"])
                response = self._object(
                    self.runner.run(args, stdin_json=stdin_json), "agent create"
                )
                agent_id = self._create_response_id(response, agent.name, "agent create")
                detail = self._agent_get(agent_id)
            elif not self._matches(detail, desired):
                agent_id = detail["id"]
                response = self._object(
                    self.runner.run(
                        [
                            "agent", "update", agent_id,
                            "--name", agent.name,
                            "--description", agent.description,
                            "--instructions", desired["instructions"],
                            "--runtime-id", config.runtime_id,
                            "--visibility", "workspace",
                            "--max-concurrent-tasks", "1",
                            "--output", "json",
                        ]
                    ),
                    "agent update",
                )
                self._assert_update_response(
                    response, agent_id, agent.name, "agent update"
                )
                detail = self._agent_get(agent_id)
            if not self._matches(detail, desired):
                raise RuntimeError(f"agent reconciliation failed for {agent.role}")
            agent_id = detail["id"]
            ids[agent.role] = agent_id

            if agent.needs_backend_env:
                if not created and backend_env is not None:
                    self._object(
                        self.runner.run(
                            ["agent", "env", "set", agent_id, "--custom-env-stdin", "--output", "json"],
                            stdin_json=dict(backend_env),
                        ),
                        "agent env set",
                    )
                current_env = self._agent_env_get(agent_id)
                if backend_env is not None:
                    matches_env = current_env == backend_env
                else:
                    matches_env = REQUIRED_ENV_KEYS.issubset(current_env)
                if not matches_env:
                    raise RuntimeError(f"agent environment reconciliation failed for {agent.role}")
        return ids

    @staticmethod
    def _desired_agent(config, agent):
        return {
            "id": None,
            "name": agent.name,
            "description": agent.description,
            "instructions": agent.instructions_file.read_text(),
            "runtime_id": config.runtime_id,
            "visibility": "workspace",
            "max_concurrent_tasks": 1,
        }

    def _reconcile_bindings(self, config, agent_ids, skill_ids) -> None:
        for agent in config.agents:
            agent_id = agent_ids[agent.role]
            existing = self._binding_ids(agent_id)
            missing = [skill_ids[key] for key in agent.skill_keys if skill_ids[key] not in existing]
            if missing:
                self._object(
                    self.runner.run(
                        ["agent", "skills", "add", agent_id, "--skill-ids", ",".join(missing), "--output", "json"]
                    ),
                    "agent skills add",
                )
            final = self._binding_ids(agent_id)
            if not {skill_ids[key] for key in agent.skill_keys}.issubset(final):
                raise RuntimeError(f"agent skill reconciliation failed for {agent.role}")

    def _binding_ids(self, agent_id):
        records = self._records(
            ["agent", "skills", "list", agent_id, "--output", "json"],
            "agent skill list",
        )
        result = set()
        for record in records:
            skill_id = record.get("id")
            name = record.get("name")
            if not isinstance(skill_id, str) or not skill_id or not isinstance(name, str) or not name:
                raise RuntimeError("malformed agent skill list")
            result.add(skill_id)
        return result

    def _reconcile_squad(self, config, detail, members, agent_ids):
        blueprint = config.blueprint
        desired = {
            "id": None,
            "name": blueprint.squad_name,
            "description": blueprint.squad_description,
            "instructions": blueprint.squad_instructions_file.read_text(),
            "leader_id": agent_ids[blueprint.leader_role],
        }
        created = detail is None
        if created:
            response = self._object(
                self.runner.run(
                    [
                        "squad", "create", "--name", blueprint.squad_name,
                        "--description", blueprint.squad_description,
                        "--leader", desired["leader_id"], "--output", "json",
                    ]
                ),
                "Squad create",
            )
            squad_id = self._create_response_id(response, blueprint.squad_name, "Squad create")
            response = self._object(
                self.runner.run(
                    ["squad", "update", squad_id, "--instructions", desired["instructions"], "--output", "json"]
                ),
                "Squad update",
            )
            self._assert_update_response(
                response, squad_id, blueprint.squad_name, "Squad update"
            )
            detail = self._squad_get(squad_id)
            members = []
        elif not self._matches(detail, desired):
            squad_id = detail["id"]
            response = self._object(
                self.runner.run(
                    [
                        "squad", "update", squad_id,
                        "--name", blueprint.squad_name,
                        "--description", blueprint.squad_description,
                        "--instructions", desired["instructions"],
                        "--leader", desired["leader_id"], "--output", "json",
                    ]
                ),
                "Squad update",
            )
            self._assert_update_response(
                response, squad_id, blueprint.squad_name, "Squad update"
            )
            detail = self._squad_get(squad_id)
        if not self._matches(detail, desired):
            raise RuntimeError("Squad reconciliation failed")
        squad_id = detail["id"]
        by_member = self._validate_members(members)
        wanted = {
            agent_ids[agent.role]: agent.role
            for agent in config.agents
            if agent.role != blueprint.leader_role
        }
        if set(by_member).difference(wanted):
            raise RuntimeError("unsafe Squad member state")
        for member_id, role in wanted.items():
            existing = by_member.get(member_id)
            if existing is None:
                self._object(
                    self.runner.run(
                        [
                            "squad", "member", "add", squad_id,
                            "--member-id", member_id, "--type", "agent",
                            "--role", role, "--output", "json",
                        ]
                    ),
                    "Squad member add",
                )
            elif existing["role"] != role:
                self._object(
                    self.runner.run(
                        [
                            "squad", "member", "set-role", squad_id,
                            "--member-id", member_id, "--member-type", "agent",
                            "--role", role, "--output", "json",
                        ]
                    ),
                    "Squad member set-role",
                )
        final = self._validate_members(self._member_records(squad_id))
        if {member_id: item["role"] for member_id, item in final.items()} != wanted:
            raise RuntimeError("Squad member reconciliation failed")
        return squad_id

    def _reconcile_project(self, config, detail):
        desired = {
            "id": None,
            "title": config.project_title,
            "description": config.project_context_file.read_text(),
        }
        if detail is None:
            response = self._object(
                self.runner.run(
                    ["project", "create", "--title", desired["title"], "--description", desired["description"], "--output", "json"]
                ),
                "Project create",
            )
            project_id = self._create_response_id(response, desired["title"], "Project create", "title")
            detail = self._project_get(project_id)
        elif not self._matches(detail, desired):
            project_id = detail["id"]
            response = self._object(
                self.runner.run(
                    ["project", "update", project_id, "--title", desired["title"], "--description", desired["description"], "--output", "json"]
                ),
                "Project update",
            )
            self._assert_update_response(
                response, project_id, desired["title"], "Project update", "title"
            )
            detail = self._project_get(project_id)
        if not self._matches(detail, desired):
            raise RuntimeError("Project reconciliation failed")
        return detail["id"]

    def _reconcile_resources(self, config, project_id, matches):
        ids = {}
        for resource in config.resources:
            detail = matches[resource.local_path]
            if detail is None:
                response = self._object(
                    self.runner.run(
                        [
                            "project", "resource", "add", project_id,
                            "--type", "local_directory", "--local-path", resource.local_path,
                            "--daemon-id", config.daemon_id,
                            "--execution-mode", "worktree", "--output", "json",
                        ]
                    ),
                    "Project resource add",
                )
                ids[resource.local_path] = self._record_id(response, "Project resource add")
            else:
                ids[resource.local_path] = detail["id"]
                ref = detail["resource_ref"]
                if ref["execution_mode"] != "worktree" or ref["daemon_id"] != config.daemon_id:
                    self._object(
                        self.runner.run(
                            [
                                "project", "resource", "update", project_id, detail["id"],
                                "--daemon-id", config.daemon_id,
                                "--execution-mode", "worktree", "--output", "json",
                            ]
                        ),
                        "Project resource update",
                    )
        final = self._validate_resource_state(config, self._resource_records(project_id))
        if any(detail is None for detail in final.values()):
            raise RuntimeError("Project resource reconciliation failed")
        for path, detail in final.items():
            ref = detail["resource_ref"]
            if ref["execution_mode"] != "worktree" or ref["daemon_id"] != config.daemon_id:
                raise RuntimeError("Project resource reconciliation failed")
            ids[path] = detail["id"]
        return ids

    def _skill_get(self, skill_id):
        detail = self._object(
            self.runner.run(["skill", "get", skill_id, "--output", "json"]),
            "skill detail",
        )
        self._strict_strings(detail, ("id", "name"), "skill detail")
        if detail["id"] != skill_id or self._skill_origin(detail) is None:
            raise RuntimeError("malformed skill detail")
        return detail

    @staticmethod
    def _skill_origin(detail):
        config = detail.get("config")
        if not isinstance(config, dict):
            return None
        origin = config.get("origin")
        if not isinstance(origin, dict):
            return None
        source_url = origin.get("source_url")
        return source_url if isinstance(source_url, str) and source_url else None

    def _agent_get(self, agent_id):
        detail = self._object(
            self.runner.run(["agent", "get", agent_id, "--output", "json"]),
            "agent detail",
        )
        self._strict_strings(
            detail,
            ("id", "name", "runtime_id", "visibility"),
            "agent detail",
        )
        self._string_types(detail, ("description", "instructions"), "agent detail")
        if detail["id"] != agent_id or not isinstance(detail.get("max_concurrent_tasks"), int):
            raise RuntimeError("malformed agent detail")
        return detail

    def _agent_env_get(self, agent_id):
        value = self._object(
            self.runner.run(["agent", "env", "get", agent_id, "--output", "json"]),
            "agent environment",
        )
        if not all(isinstance(key, str) and isinstance(item, str) for key, item in value.items()):
            raise RuntimeError("malformed agent environment")
        return value

    def _squad_get(self, squad_id):
        detail = self._object(
            self.runner.run(["squad", "get", squad_id, "--output", "json"]),
            "Squad detail",
        )
        self._strict_strings(
            detail,
            ("id", "name", "leader_id"),
            "Squad detail",
        )
        self._string_types(detail, ("description", "instructions"), "Squad detail")
        if detail["id"] != squad_id:
            raise RuntimeError("malformed Squad detail")
        return detail

    def _project_get(self, project_id):
        detail = self._object(
            self.runner.run(["project", "get", project_id, "--output", "json"]),
            "Project detail",
        )
        self._strict_strings(detail, ("id", "title"), "Project detail")
        self._string_types(detail, ("description",), "Project detail")
        if detail["id"] != project_id:
            raise RuntimeError("malformed Project detail")
        return detail

    def _member_records(self, squad_id):
        return self._records(
            ["squad", "member", "list", squad_id, "--output", "json"],
            "Squad member list",
        )

    def _validate_members(self, records):
        result = {}
        for record in records:
            self._strict_strings(record, ("member_id", "member_type", "role"), "Squad member list")
            if record["member_type"] != "agent" or record["member_id"] in result:
                raise RuntimeError("unsafe Squad member state")
            result[record["member_id"]] = record
        return result

    def _resource_records(self, project_id):
        return self._records(
            ["project", "resource", "list", project_id, "--output", "json"],
            "Project resource list",
        )

    def _validate_resource_state(self, config, records):
        wanted = {resource.local_path for resource in config.resources}
        by_path = {path: [] for path in wanted}
        for record in records:
            resource_id = self._record_id(record, "Project resource list")
            if record.get("resource_type") != "local_directory":
                raise RuntimeError("unsafe resource state")
            ref = record.get("resource_ref")
            if not isinstance(ref, dict):
                raise RuntimeError("unsafe resource state")
            self._strict_strings(
                ref,
                ("local_path", "daemon_id", "execution_mode"),
                "Project resource list",
            )
            path = ref["local_path"]
            if path not in wanted or ref["execution_mode"] not in {"in_place", "worktree"}:
                raise RuntimeError("unsafe resource state")
            record["id"] = resource_id
            by_path[path].append(record)
        if any(len(values) > 1 for values in by_path.values()):
            raise RuntimeError("unsafe resource state")
        return {path: values[0] if values else None for path, values in by_path.items()}

    def _records(self, args, label):
        value = self.runner.run(args)
        if not isinstance(value, list) or not all(isinstance(item, dict) for item in value):
            raise RuntimeError(f"malformed {label}")
        return value

    @staticmethod
    def _object(value, label):
        if not isinstance(value, dict):
            raise RuntimeError(f"malformed {label}")
        return value

    def _index_records(self, records, label, name_field):
        result = {}
        ids = set()
        for record in records:
            self._strict_strings(record, ("id", name_field), label)
            if record["id"] in ids:
                raise RuntimeError(f"malformed {label}")
            ids.add(record["id"])
            result.setdefault(record[name_field], []).append(record)
        return result

    @staticmethod
    def _unique_index(index, name, label):
        values = index.get(name, [])
        if len(values) > 1:
            raise RuntimeError(f"duplicate {label} state for {name}")
        return values[0] if values else None

    @staticmethod
    def _strict_strings(record, keys, label):
        if any(not isinstance(record.get(key), str) or not record[key] for key in keys):
            raise RuntimeError(f"malformed {label}")

    @staticmethod
    def _string_types(record, keys, label):
        if any(not isinstance(record.get(key), str) for key in keys):
            raise RuntimeError(f"malformed {label}")

    @staticmethod
    def _record_id(record, label):
        value = record.get("id")
        if not isinstance(value, str) or not value:
            raise RuntimeError(f"malformed {label}")
        return value

    def _create_response_id(self, response, expected_name, label, name_field="name"):
        self._strict_strings(response, ("id", name_field), label)
        if response[name_field] != expected_name:
            raise RuntimeError(f"malformed {label}")
        return response["id"]

    def _assert_update_response(
        self, response, target_id, expected_name, label, name_field="name"
    ):
        response_id = self._create_response_id(
            response, expected_name, label, name_field
        )
        if response_id != target_id:
            raise RuntimeError(f"{label} returned the wrong target id")

    @staticmethod
    def _matches(detail, desired):
        return detail is not None and all(
            key == "id" or detail.get(key) == value for key, value in desired.items()
        )


def prompt_backend_env() -> dict[str, str]:
    """Collect backend values without echoing secret input."""

    jwt_secret = getpass.getpass("Stable JWT secret (at least 64 characters): ")
    if len(jwt_secret) < 64:
        raise ValueError("JWT secret must contain at least 64 characters")
    mail_username = input("Local mail username [unused@example.com]: ").strip()
    mail_password = getpass.getpass("Local mail password [unused]: ")
    return {
        "JWT_SECRET": jwt_secret,
        "MAIL_USERNAME": mail_username or "unused@example.com",
        "MAIL_PASSWORD": mail_password or "unused",
    }


def _planned_output(config: ProjectConfig) -> str:
    lines = ["Planned Multica reconciliation:"]
    lines.extend(f"agent: {agent.name}" for agent in config.agents)
    lines.extend(f"skill: {source.key} <- {source.url}" for source in config.skills.values())
    lines.append(f"Squad: {config.blueprint.squad_name}")
    lines.append(f"Project: {config.project_title}")
    lines.extend(f"resource: {resource.local_path} (worktree)" for resource in config.resources)
    return "\n".join(lines)


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--runtime-id", required=True)
    parser.add_argument("--daemon-id", required=True)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--prompt-backend-env", action="store_true")
    args = parser.parse_args(argv)
    config = build_eventra_config(args.runtime_id, args.daemon_id)
    backend_env = prompt_backend_env() if args.prompt_backend_env else None
    result = Provisioner(MulticaRunner()).reconcile(
        config, apply=args.apply, backend_env=backend_env
    )
    if args.apply:
        print(json.dumps(result.__dict__, sort_keys=True))
    else:
        print(_planned_output(config))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
