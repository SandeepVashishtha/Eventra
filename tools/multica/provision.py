"""Dry-run-first, idempotent Multica reconciliation for Eventra."""

from __future__ import annotations

import argparse
import getpass
import json
import os
import subprocess
from dataclasses import dataclass
from typing import Any, Sequence

from .contracts import (
    parse_agent_detail,
    parse_agent_environment,
    parse_agent_list,
    parse_agent_skill_list,
    parse_project_detail,
    parse_project_list,
    parse_project_resources,
    parse_runtime_list,
    parse_skill_detail,
    parse_skill_list,
    parse_squad_detail,
    parse_squad_list,
    parse_squad_members,
    parse_autopilot_detail,
    parse_autopilot_list,
)
from .eventra_adapter import ProjectConfig, build_eventra_config


HTTP_TIMEOUT = "90s"
PROCESS_TIMEOUT_SECONDS = 95
READ_ONLY_MAX_ATTEMPTS = 3
MAX_AGENT_DESCRIPTION = 255
WORKTREE_CAPABILITY = "local-worktree-v1"
ENV_RECIPIENTS = frozenset({"backend_engineer", "integration_qa"})
REQUIRED_ENV_KEYS = frozenset({"JWT_SECRET", "MAIL_USERNAME", "MAIL_PASSWORD"})
MUTATION_COMMAND_PREFIXES = frozenset(
    {
        ("skill", "import"),
        ("agent", "create"),
        ("agent", "update"),
        ("agent", "env", "set"),
        ("agent", "skills", "add"),
        ("squad", "create"),
        ("squad", "update"),
        ("squad", "member", "add"),
        ("squad", "member", "set-role"),
        ("project", "create"),
        ("project", "update"),
        ("project", "resource", "add"),
        ("project", "resource", "update"),
        ("autopilot", "create"),
        ("autopilot", "update"),
        ("autopilot", "trigger-add"),
        ("autopilot", "trigger-update"),
    }
)
READ_ONLY_COMMAND_PREFIXES = frozenset(
    {
        ("runtime", "list"),
        ("skill", "list"),
        ("skill", "get"),
        ("agent", "list"),
        ("agent", "get"),
        ("agent", "env", "get"),
        ("agent", "skills", "list"),
        ("squad", "list"),
        ("squad", "get"),
        ("squad", "member", "list"),
        ("project", "list"),
        ("project", "get"),
        ("project", "resource", "list"),
        ("autopilot", "list"),
        ("autopilot", "get"),
        ("issue", "list"),
        ("issue", "get"),
        ("issue", "children"),
        ("issue", "runs"),
        ("issue", "metadata", "list"),
    }
)


@dataclass(frozen=True)
class ProvisioningResult:
    """Identifiers for the desired Multica delivery-team objects."""

    agent_ids: dict[str, str | None]
    skill_ids: dict[str, str | None]
    squad_id: str | None
    project_id: str | None
    backend_project_id: str | None
    resource_ids: dict[str, str | None]
    autopilot_id: str | None
    mutation_count: int


@dataclass(frozen=True)
class _Preflight:
    skill_details: dict[str, dict[str, Any] | None]
    agent_details: dict[str, dict[str, Any] | None]
    agent_envs: dict[str, dict[str, str] | None]
    squad_detail: dict[str, Any] | None
    members: list[dict[str, Any]]
    project_detail: dict[str, Any] | None
    backend_project_detail: dict[str, Any] | None
    resources: dict[str, dict[str, Any] | None]
    backend_resources: dict[str, dict[str, Any] | None]
    autopilot_detail: dict[str, Any] | None


class MulticaRunner:
    """Strict, non-shelling JSON boundary around Multica CLI 0.4.31."""

    def __init__(self) -> None:
        self._mutation_count = 0

    @property
    def mutation_count(self) -> int:
        return self._mutation_count

    def run(
        self,
        args: list[str],
        *,
        stdin_json: dict[str, str] | None = None,
    ) -> dict[str, Any] | list[Any]:
        if not isinstance(args, list) or not all(isinstance(arg, str) for arg in args):
            raise TypeError("Multica arguments must be a list of strings")
        is_mutation = any(
            tuple(args[: len(prefix)]) == prefix
            for prefix in MUTATION_COMMAND_PREFIXES
        )
        if is_mutation:
            self._mutation_count += 1
        child_env = os.environ.copy()
        child_env["MULTICA_HTTP_TIMEOUT"] = HTTP_TIMEOUT
        retryable_read = stdin_json is None and any(
            tuple(args[: len(prefix)]) == prefix
            for prefix in READ_ONLY_COMMAND_PREFIXES
        )
        max_attempts = READ_ONLY_MAX_ATTEMPTS if retryable_read else 1
        for attempt in range(max_attempts):
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
            if completed.returncode == 0:
                break
            if attempt + 1 == max_attempts:
                raise RuntimeError(
                    f"Multica command failed with exit {completed.returncode}"
                )
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
        starting_mutation_count = self.runner.mutation_count
        self._validate_config(config)
        self._validate_backend_env(backend_env)
        desired_skills = self._desired_skills(config)
        state = self._preflight(config, desired_skills)
        canonical_env = self._validate_env_preconditions(
            config, state, apply, backend_env
        )

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
                backend_project_id=(
                    None
                    if state.backend_project_detail is None
                    else state.backend_project_detail["id"]
                ),
                resource_ids={
                    path: None if detail is None else detail["id"]
                    for path, detail in {
                        **state.resources,
                        **state.backend_resources,
                    }.items()
                },
                autopilot_id=(
                    None
                    if state.autopilot_detail is None
                    else state.autopilot_detail["autopilot"]["id"]
                ),
                mutation_count=self.runner.mutation_count - starting_mutation_count,
            )

        skill_ids = self._reconcile_skills(desired_skills, state.skill_details)
        agent_ids = self._reconcile_agents(
            config,
            state.agent_details,
            state.agent_envs,
            backend_env,
            canonical_env,
        )
        self._reconcile_bindings(config, agent_ids, skill_ids)
        squad_id = self._reconcile_squad(config, state.squad_detail, state.members, agent_ids)
        project_id = self._reconcile_project(
            config.project_title,
            config.project_context_file.read_text(),
            state.project_detail,
        )
        backend_project_id = self._reconcile_project(
            config.backend_project_title,
            config.backend_project_context_file.read_text(),
            state.backend_project_detail,
        )
        resource_ids = self._reconcile_resources(
            config, project_id, (config.resources[0],), state.resources
        )
        resource_ids.update(
            self._reconcile_resources(
                config,
                backend_project_id,
                (config.resources[1],),
                state.backend_resources,
            )
        )
        autopilot_id = self._reconcile_autopilot(
            config,
            state.autopilot_detail,
            agent_ids[config.watcher.agent_role],
            project_id,
            backend_project_id,
        )
        return ProvisioningResult(
            agent_ids=agent_ids,
            skill_ids=skill_ids,
            squad_id=squad_id,
            project_id=project_id,
            backend_project_id=backend_project_id,
            resource_ids=resource_ids,
            autopilot_id=autopilot_id,
            mutation_count=self.runner.mutation_count - starting_mutation_count,
        )

    def _preflight(self, config, desired_skills) -> _Preflight:
        self._validate_runtime_capability(config)

        skill_records = parse_skill_list(
            self.runner.run(["skill", "list", "--output", "json"])
        )
        skill_details = {}
        for key, source in desired_skills.items():
            item = self._exact_record(skill_records, key, "name", "skill")
            detail = None if item is None else self._skill_get(item["id"])
            if detail is not None and self._skill_origin(detail) != source.url:
                raise RuntimeError(f"skill {key} has an unapproved origin")
            skill_details[key] = detail

        agent_records = parse_agent_list(
            self.runner.run(["agent", "list", "--output", "json"])
        )
        agent_details, agent_envs = {}, {}
        for agent in config.agents:
            item = self._exact_record(agent_records, agent.name, "name", "agent")
            detail = None if item is None else self._agent_get(item["id"])
            agent_details[agent.role] = detail
            agent_envs[agent.role] = (
                None
                if detail is None or not agent.needs_backend_env
                else self._agent_env_get(detail["id"])
            )

        squad_records = parse_squad_list(
            self.runner.run(["squad", "list", "--output", "json"])
        )
        squad_item = self._exact_record(
            squad_records, config.blueprint.squad_name, "name", "Squad"
        )
        squad_detail = None if squad_item is None else self._squad_get(squad_item["id"])
        members = (
            []
            if squad_detail is None
            else self._member_records(squad_detail["id"])
        )

        project_records = parse_project_list(
            self.runner.run(["project", "list", "--output", "json"])
        )
        project_item = self._exact_record(
            project_records, config.project_title, "title", "Project"
        )
        project_detail = (
            None if project_item is None else self._project_get(project_item["id"])
        )
        raw_resources = (
            []
            if project_detail is None
            else self._resource_records(project_detail["id"])
        )
        resources = self._validate_resource_state(
            raw_resources, (config.resources[0].local_path,)
        )
        backend_project_item = self._exact_record(
            project_records, config.backend_project_title, "title", "Project"
        )
        backend_project_detail = (
            None
            if backend_project_item is None
            else self._project_get(backend_project_item["id"])
        )
        raw_backend_resources = (
            []
            if backend_project_detail is None
            else self._resource_records(backend_project_detail["id"])
        )
        backend_resources = self._validate_resource_state(
            raw_backend_resources, (config.resources[1].local_path,)
        )
        autopilot_records = parse_autopilot_list(
            self.runner.run(["autopilot", "list", "--output", "json"])
        )
        autopilot_item = self._exact_record(
            autopilot_records,
            config.watcher.title,
            "title",
            "Autopilot",
        )
        autopilot_detail = (
            None
            if autopilot_item is None
            else self._autopilot_get(autopilot_item["id"])
        )
        return _Preflight(
            skill_details,
            agent_details,
            agent_envs,
            squad_detail,
            members,
            project_detail,
            backend_project_detail,
            resources,
            backend_resources,
            autopilot_detail,
        )

    def _validate_runtime_capability(self, config) -> None:
        records = parse_runtime_list(
            self.runner.run(["runtime", "list", "--output", "json"]), config.runtime_id
        )
        matches = []
        for record in records:
            runtime_id = record["id"]
            if runtime_id == config.runtime_id:
                matches.append(record)
        if len(matches) != 1:
            raise RuntimeError("target runtime is missing or duplicated")
        target = matches[0]
        daemon_id = target["daemon_id"]
        if daemon_id != config.daemon_id:
            raise RuntimeError("target runtime daemon does not match configuration")
        metadata = target["metadata"]
        if target["status"] != "online":
            raise RuntimeError("malformed runtime list")
        capabilities = metadata["capabilities"]
        if WORKTREE_CAPABILITY not in capabilities:
            raise RuntimeError(f"runtime lacks required {WORKTREE_CAPABILITY} capability")

    @staticmethod
    def _validate_config(config: ProjectConfig) -> None:
        roles = [agent.role for agent in config.agents]
        if len(roles) != len(set(roles)):
            raise ValueError("agent roles must be unique")
        configured_roles = {agent.role for agent in config.agents}
        delivery_roles = {agent.role for agent in config.blueprint.agents}
        operational_roles = {
            agent.role for agent in config.blueprint.operational_agents
        }
        if configured_roles != delivery_roles | operational_roles:
            raise ValueError("configured Agent catalog does not match the blueprint")
        if (
            config.watcher.agent_role not in operational_roles
            or config.watcher.agent_role in delivery_roles
        ):
            raise ValueError("watcher must target an operational Agent")
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
        if config.project_title == config.backend_project_title:
            raise ValueError("frontend and backend Project titles must be distinct")
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
        watcher_text = config.watcher.description_file.read_text()
        if (
            watcher_text.count("__FRONTEND_PROJECT_ID__") != 1
            or watcher_text.count("__BACKEND_PROJECT_ID__") != 1
            or config.watcher.cron != "*/30 * * * *"
            or config.watcher.timezone != "Asia/Shanghai"
        ):
            raise ValueError("watcher configuration is invalid")

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
    def _validate_env_preconditions(
        config, state, apply, backend_env
    ) -> dict[str, str] | None:
        if not apply or backend_env is not None:
            return None
        recipient_envs = [state.agent_envs[role] for role in ENV_RECIPIENTS]
        if (
            any(not Provisioner._is_valid_backend_env(env) for env in recipient_envs)
            or recipient_envs[0] != recipient_envs[1]
        ):
            raise ValueError("backend environment is required before applying agent changes")
        return dict(recipient_envs[0])

    @staticmethod
    def _is_valid_backend_env(value: object) -> bool:
        return (
            isinstance(value, dict)
            and all(isinstance(key, str) and isinstance(item, str) for key, item in value.items())
            and set(value) == REQUIRED_ENV_KEYS
            and len(value["JWT_SECRET"]) >= 64
        )

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
                self.runner.run(
                    ["skill", "import", "--url", source.url, "--on-conflict", "fail", "--output", "json"]
                )
                detail = self._skill_by_name(key)
                if detail["name"] != key or self._skill_origin(detail) != source.url:
                    raise RuntimeError(f"skill reconciliation failed for {key}")
            ids[key] = detail["id"]
        return ids

    def _reconcile_agents(self, config, details, envs, backend_env, canonical_env):
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
                self.runner.run(args, stdin_json=stdin_json)
                detail = self._agent_by_name(agent.name)
            elif not self._matches(detail, desired):
                agent_id = detail["id"]
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
                )
                detail = self._agent_by_name(agent.name, expected_id=agent_id)
            if not self._matches(detail, desired):
                raise RuntimeError(f"agent reconciliation failed for {agent.role}")
            agent_id = detail["id"]
            ids[agent.role] = agent_id

            if agent.needs_backend_env:
                if not created and backend_env is not None and envs[agent.role] != backend_env:
                    self.runner.run(
                        ["agent", "env", "set", agent_id, "--custom-env-stdin", "--output", "json"],
                        stdin_json=dict(backend_env),
                    )
                current_env = self._agent_env_get(agent_id)
                if backend_env is not None:
                    matches_env = current_env == backend_env
                else:
                    matches_env = current_env == canonical_env
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
                self.runner.run(
                    ["agent", "skills", "add", agent_id, "--skill-ids", ",".join(missing), "--output", "json"]
                )
            final = self._binding_ids(agent_id)
            if (
                not existing.issubset(final)
                or not {skill_ids[key] for key in agent.skill_keys}.issubset(final)
            ):
                raise RuntimeError(f"agent skill reconciliation failed for {agent.role}")

    def _binding_ids(self, agent_id):
        records = parse_agent_skill_list(
            self.runner.run(
                ["agent", "skills", "list", agent_id, "--output", "json"]
            )
        )
        return {record["id"] for record in records}

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
            self.runner.run(
                [
                    "squad", "create", "--name", blueprint.squad_name,
                    "--description", blueprint.squad_description,
                    "--leader", desired["leader_id"], "--output", "json",
                ]
            )
            detail = self._squad_by_name(blueprint.squad_name)
            squad_id = detail["id"]
            if not self._matches(detail, {**desired, "instructions": ""}):
                raise RuntimeError("Squad reconciliation failed")
            members = self._member_records(squad_id)
            self._validate_new_squad_members(members, desired["leader_id"])
            self.runner.run(
                ["squad", "update", squad_id, "--instructions", desired["instructions"], "--output", "json"]
            )
            detail = self._squad_by_name(
                blueprint.squad_name, expected_id=squad_id
            )
            members = self._member_records(squad_id)
        elif not self._matches(detail, desired):
            squad_id = detail["id"]
            self.runner.run(
                [
                    "squad", "update", squad_id,
                    "--name", blueprint.squad_name,
                    "--description", blueprint.squad_description,
                    "--instructions", desired["instructions"],
                    "--leader", desired["leader_id"], "--output", "json",
                ]
            )
            detail = self._squad_by_name(
                blueprint.squad_name, expected_id=squad_id
            )
            members = self._member_records(squad_id)
        if not self._matches(detail, desired):
            raise RuntimeError("Squad reconciliation failed")
        squad_id = detail["id"]
        leader_id = desired["leader_id"]
        self._validate_server_managed_leader(members, leader_id)
        by_member = self._validate_members(members)
        wanted = {leader_id: "leader"}
        wanted.update(
            {
                agent_ids[agent.role]: agent.role
                for agent in config.blueprint.agents
                if agent.role != blueprint.leader_role
            }
        )
        non_leader_wanted = {
            agent_ids[agent.role]: agent.role
            for agent in config.blueprint.agents
            if agent.role != blueprint.leader_role
        }
        if set(by_member).difference(wanted):
            raise RuntimeError("unsafe Squad member state")
        for member_id, role in non_leader_wanted.items():
            existing = by_member.get(member_id)
            if existing is None:
                self.runner.run(
                    [
                        "squad", "member", "add", squad_id,
                        "--member-id", member_id, "--type", "agent",
                        "--role", role, "--output", "json",
                    ]
                )
            elif existing["role"] != role:
                self.runner.run(
                    [
                        "squad", "member", "set-role", squad_id,
                        "--member-id", member_id, "--member-type", "agent",
                        "--role", role, "--output", "json",
                    ]
                )
            if existing is None or existing["role"] != role:
                by_member = self._validate_members(self._member_records(squad_id))
                observed = by_member.get(member_id)
                if (
                    observed is None
                    or observed["member_type"] != "agent"
                    or observed["role"] != role
                ):
                    raise RuntimeError("Squad member reconciliation failed")
        final = self._validate_members(self._member_records(squad_id))
        if {member_id: item["role"] for member_id, item in final.items()} != wanted:
            raise RuntimeError("Squad member reconciliation failed")
        return squad_id

    def _reconcile_project(self, title, description, detail):
        desired = {
            "id": None,
            "title": title,
            "description": description,
        }
        if detail is None:
            self.runner.run(
                ["project", "create", "--title", desired["title"], "--description", desired["description"], "--output", "json"]
            )
            detail = self._project_by_title(desired["title"])
        elif not self._matches(detail, desired):
            project_id = detail["id"]
            self.runner.run(
                ["project", "update", project_id, "--title", desired["title"], "--description", desired["description"], "--output", "json"]
            )
            detail = self._project_by_title(
                desired["title"], expected_id=project_id
            )
        if not self._matches(detail, desired):
            raise RuntimeError("Project reconciliation failed")
        return detail["id"]

    def _reconcile_resources(self, config, project_id, resources, matches):
        ids = {}
        wanted_paths = tuple(resource.local_path for resource in resources)
        for resource in resources:
            detail = matches[resource.local_path]
            if detail is None:
                self.runner.run(
                    [
                        "project", "resource", "add", project_id,
                        "--type", "local_directory", "--local-path", resource.local_path,
                        "--daemon-id", config.daemon_id,
                        "--execution-mode", "worktree", "--output", "json",
                    ]
                )
                post = self._validate_resource_state(
                    self._resource_records(project_id), wanted_paths
                )[resource.local_path]
                self._assert_target_resource(post, config.daemon_id)
                ids[resource.local_path] = post["id"]
            else:
                ids[resource.local_path] = detail["id"]
                ref = detail["resource_ref"]
                if ref.get("execution_mode") != "worktree" or ref["daemon_id"] != config.daemon_id:
                    self.runner.run(
                        [
                            "project", "resource", "update", project_id, detail["id"],
                            "--daemon-id", config.daemon_id,
                            "--execution-mode", "worktree", "--output", "json",
                        ]
                    )
                    post = self._validate_resource_state(
                        self._resource_records(project_id), wanted_paths
                    )[resource.local_path]
                    self._assert_target_resource(
                        post, config.daemon_id, expected_id=detail["id"]
                    )
        final = self._validate_resource_state(
            self._resource_records(project_id), wanted_paths
        )
        if any(detail is None for detail in final.values()):
            raise RuntimeError("Project resource reconciliation failed")
        for path, detail in final.items():
            self._assert_target_resource(detail, config.daemon_id)
            ids[path] = detail["id"]
        return ids

    def _reconcile_autopilot(
        self,
        config,
        detail,
        watcher_agent_id,
        frontend_project_id,
        backend_project_id,
    ):
        description = (
            config.watcher.description_file.read_text()
            .replace("__FRONTEND_PROJECT_ID__", frontend_project_id)
            .replace("__BACKEND_PROJECT_ID__", backend_project_id)
        )
        wanted = {
            "id": None,
            "title": config.watcher.title,
            "description": description,
            "execution_mode": "run_only",
            "project_id": frontend_project_id,
            "assignee_id": watcher_agent_id,
            "assignee_type": "agent",
            "status": "active",
        }
        if detail is None:
            self.runner.run(
                [
                    "autopilot", "create",
                    "--title", wanted["title"],
                    "--description", wanted["description"],
                    "--agent", watcher_agent_id,
                    "--mode", "run_only",
                    "--project", frontend_project_id,
                    "--output", "json",
                ]
            )
            detail = self._autopilot_by_title(wanted["title"])
        elif not self._matches(detail["autopilot"], wanted):
            autopilot_id = detail["autopilot"]["id"]
            self.runner.run(
                [
                    "autopilot", "update", autopilot_id,
                    "--title", wanted["title"],
                    "--description", wanted["description"],
                    "--agent", watcher_agent_id,
                    "--mode", "run_only",
                    "--project", frontend_project_id,
                    "--status", "active",
                    "--output", "json",
                ]
            )
            detail = self._autopilot_by_title(
                wanted["title"], expected_id=autopilot_id
            )
        if not self._matches(detail["autopilot"], wanted):
            raise RuntimeError("Autopilot reconciliation failed")

        autopilot_id = detail["autopilot"]["id"]
        triggers = detail["triggers"]
        wanted_trigger = {
            "autopilot_id": autopilot_id,
            "kind": "schedule",
            "cron_expression": config.watcher.cron,
            "timezone": config.watcher.timezone,
            "enabled": True,
            "label": config.watcher.label,
        }
        if not triggers:
            self.runner.run(
                [
                    "autopilot", "trigger-add", autopilot_id,
                    "--kind", "schedule",
                    "--cron", config.watcher.cron,
                    "--timezone", config.watcher.timezone,
                    "--label", config.watcher.label,
                    "--output", "json",
                ]
            )
        elif not self._matches(triggers[0], wanted_trigger):
            self.runner.run(
                [
                    "autopilot", "trigger-update", autopilot_id,
                    triggers[0]["id"],
                    "--cron", config.watcher.cron,
                    "--timezone", config.watcher.timezone,
                    "--label", config.watcher.label,
                    "--enabled",
                    "--output", "json",
                ]
            )
        final = self._autopilot_get(autopilot_id)
        if (
            not self._matches(final["autopilot"], wanted)
            or len(final["triggers"]) != 1
            or not self._matches(final["triggers"][0], wanted_trigger)
        ):
            raise RuntimeError("Autopilot reconciliation failed")
        return autopilot_id

    def _autopilot_get(self, autopilot_id):
        autopilot, triggers = parse_autopilot_detail(
            self.runner.run(
                ["autopilot", "get", autopilot_id, "--output", "json"]
            ),
            autopilot_id,
        )
        return {"autopilot": autopilot, "triggers": triggers}

    def _autopilot_by_title(self, title, expected_id=None):
        records = parse_autopilot_list(
            self.runner.run(["autopilot", "list", "--output", "json"])
        )
        item = self._exact_record(
            records, title, "title", "Autopilot", required=True
        )
        self._assert_expected_id(item, expected_id, "Autopilot")
        return self._autopilot_get(item["id"])

    def _skill_get(self, skill_id):
        return parse_skill_detail(
            self.runner.run(["skill", "get", skill_id, "--output", "json"]),
            skill_id,
        )

    def _skill_by_name(self, name):
        records = parse_skill_list(
            self.runner.run(["skill", "list", "--output", "json"])
        )
        item = self._exact_record(records, name, "name", "skill", required=True)
        return self._skill_get(item["id"])

    @staticmethod
    def _skill_origin(detail):
        return detail["config"]["origin"]["source_url"]

    def _agent_get(self, agent_id):
        return parse_agent_detail(
            self.runner.run(["agent", "get", agent_id, "--output", "json"]),
            agent_id,
        )

    def _agent_by_name(self, name, expected_id=None):
        records = parse_agent_list(
            self.runner.run(["agent", "list", "--output", "json"])
        )
        item = self._exact_record(records, name, "name", "agent", required=True)
        self._assert_expected_id(item, expected_id, "agent")
        return self._agent_get(item["id"])

    def _agent_env_get(self, agent_id):
        return parse_agent_environment(
            self.runner.run(["agent", "env", "get", agent_id, "--output", "json"]),
            agent_id,
        )

    def _squad_get(self, squad_id):
        return parse_squad_detail(
            self.runner.run(["squad", "get", squad_id, "--output", "json"]),
            squad_id,
        )

    def _squad_by_name(self, name, expected_id=None):
        records = parse_squad_list(
            self.runner.run(["squad", "list", "--output", "json"])
        )
        item = self._exact_record(records, name, "name", "Squad", required=True)
        self._assert_expected_id(item, expected_id, "Squad")
        return self._squad_get(item["id"])

    def _project_get(self, project_id):
        return parse_project_detail(
            self.runner.run(["project", "get", project_id, "--output", "json"]),
            project_id,
        )

    def _project_by_title(self, title, expected_id=None):
        records = parse_project_list(
            self.runner.run(["project", "list", "--output", "json"])
        )
        item = self._exact_record(records, title, "title", "Project", required=True)
        self._assert_expected_id(item, expected_id, "Project")
        return self._project_get(item["id"])

    def _member_records(self, squad_id):
        return parse_squad_members(
            self.runner.run(
                ["squad", "member", "list", squad_id, "--output", "json"]
            ),
            squad_id,
        )

    def _validate_members(self, records):
        result = {}
        for record in records:
            if record["member_type"] != "agent" or record["member_id"] in result:
                raise RuntimeError("unsafe Squad member state")
            result[record["member_id"]] = record
        return result

    def _validate_new_squad_members(self, records, leader_id):
        if len(records) != 1:
            raise RuntimeError("Squad leader reconciliation failed")
        self._validate_server_managed_leader(records, leader_id)

    @staticmethod
    def _validate_server_managed_leader(records, leader_id):
        leaders = [record for record in records if record["member_id"] == leader_id]
        if (
            len(leaders) != 1
            or leaders[0]["member_type"] != "agent"
            or leaders[0]["role"] != "leader"
        ):
            raise RuntimeError("Squad leader reconciliation failed")

    def _resource_records(self, project_id):
        return parse_project_resources(
            self.runner.run(
                ["project", "resource", "list", project_id, "--output", "json"]
            ),
            project_id,
        )

    def _validate_resource_state(self, records, wanted_paths):
        wanted = set(wanted_paths)
        by_path = {path: [] for path in wanted}
        for record in records:
            if record["resource_type"] != "local_directory":
                raise RuntimeError("unsafe resource state")
            ref = record["resource_ref"]
            path = ref["local_path"]
            execution_mode = ref.get("execution_mode")
            if path not in wanted or execution_mode not in {None, "in_place", "worktree"}:
                raise RuntimeError("unsafe resource state")
            by_path[path].append(record)
        if any(len(values) > 1 for values in by_path.values()):
            raise RuntimeError("unsafe resource state")
        return {path: values[0] if values else None for path, values in by_path.items()}

    @staticmethod
    def _exact_record(records, name, name_field, label, required=False):
        values = [record for record in records if record[name_field] == name]
        if len(values) > 1:
            raise RuntimeError(f"duplicate {label} state for {name}")
        if not values and required:
            raise RuntimeError(f"missing {label} state for {name}")
        return values[0] if values else None

    @staticmethod
    def _assert_expected_id(record, expected_id, label):
        if expected_id is not None and record["id"] != expected_id:
            raise RuntimeError(f"{label} reconciliation targeted the wrong id")

    @staticmethod
    def _assert_target_resource(detail, daemon_id, expected_id=None):
        if detail is None:
            raise RuntimeError("Project resource reconciliation failed")
        ref = detail["resource_ref"]
        if (
            (expected_id is not None and detail["id"] != expected_id)
            or detail["resource_type"] != "local_directory"
            or ref["daemon_id"] != daemon_id
            or ref.get("execution_mode") != "worktree"
        ):
            raise RuntimeError("Project resource reconciliation failed")

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


def recover_backend_env(config: ProjectConfig, runner: MulticaRunner) -> dict[str, str]:
    """Read the exact Backend Engineer environment without rendering it."""

    backend_agents = [agent for agent in config.agents if agent.role == "backend_engineer"]
    if len(backend_agents) != 1:
        raise RuntimeError("backend environment recovery failed")
    backend_name = backend_agents[0].name
    try:
        matches = [
            record
            for record in parse_agent_list(
                runner.run(["agent", "list", "--output", "json"])
            )
            if record["name"] == backend_name
        ]
        if len(matches) != 1:
            raise RuntimeError("backend environment recovery failed")
        value = parse_agent_environment(
            runner.run(
                ["agent", "env", "get", matches[0]["id"], "--output", "json"]
            ),
            matches[0]["id"],
        )
        Provisioner._validate_backend_env(value)
    except (RuntimeError, ValueError):
        raise RuntimeError("backend environment recovery failed") from None
    return dict(value)


def _planned_output(config: ProjectConfig) -> str:
    lines = ["Planned Multica reconciliation:"]
    lines.extend(f"agent: {agent.name}" for agent in config.agents)
    lines.extend(f"skill: {source.key} <- {source.url}" for source in config.skills.values())
    lines.append(f"Squad: {config.blueprint.squad_name}")
    lines.append(f"Project: {config.project_title}")
    lines.append(f"Backend Project: {config.backend_project_title}")
    lines.extend(f"resource: {resource.local_path} (worktree)" for resource in config.resources)
    return "\n".join(lines)


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--runtime-id", required=True)
    parser.add_argument("--daemon-id", required=True)
    parser.add_argument("--apply", action="store_true")
    environment_mode = parser.add_mutually_exclusive_group()
    environment_mode.add_argument("--prompt-backend-env", action="store_true")
    environment_mode.add_argument("--reuse-backend-env", action="store_true")
    args = parser.parse_args(argv)
    config = build_eventra_config(args.runtime_id, args.daemon_id)
    runner = MulticaRunner()
    backend_env = (
        prompt_backend_env()
        if args.prompt_backend_env
        else recover_backend_env(config, runner)
        if args.reuse_backend_env
        else None
    )
    result = Provisioner(runner).reconcile(
        config, apply=args.apply, backend_env=backend_env
    )
    if args.apply:
        print(json.dumps(result.__dict__, sort_keys=True))
    else:
        print(_planned_output(config))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
