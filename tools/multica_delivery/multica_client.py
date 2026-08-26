"""Strict, injectable Multica CLI boundary with redacted contract failures."""

from __future__ import annotations

from dataclasses import dataclass
import json
from types import MappingProxyType
from typing import Any, Mapping, Protocol
from urllib.parse import urlparse


class CommandFailure(RuntimeError):
    """A permanent runner failure without retained command output."""


class TransientCommandError(CommandFailure):
    """The only runner failure eligible for one read-only retry."""


class MulticaContractError(RuntimeError):
    """A sanitized mismatch between an operation and its JSON response."""


@dataclass(frozen=True)
class CommandResult:
    """Process-neutral command output supplied by an injected runner."""

    returncode: int
    stdout: str


class CommandRunner(Protocol):
    """Execution is injected so this package never starts a subprocess."""

    def run(
        self,
        argv: tuple[str, ...],
        *,
        input_text: str | None = None,
    ) -> CommandResult: ...


@dataclass(frozen=True)
class MulticaResource:
    id: str
    name: str | None = None


@dataclass(frozen=True)
class AgentEnvironment:
    agent_id: str
    keys: tuple[str, ...]


@dataclass(frozen=True)
class MutationResult:
    resource_id: str | None


@dataclass(frozen=True)
class RuntimeInfo:
    id: str
    daemon_id: str
    status: str
    capabilities: tuple[str, ...]


@dataclass(frozen=True)
class SkillImportCapability:
    dry_run: bool


@dataclass(frozen=True)
class SkillState:
    id: str
    name: str
    source_url: str


@dataclass(frozen=True)
class ProjectState:
    id: str
    title: str
    description: str


@dataclass(frozen=True)
class ProjectResourceState:
    id: str
    project_id: str
    resource_type: str
    local_path: str
    daemon_id: str
    execution_mode: str


@dataclass(frozen=True)
class AgentState:
    id: str
    name: str
    description: str
    instructions: str
    runtime_id: str
    visibility: str
    max_concurrent_tasks: int


@dataclass(frozen=True)
class SquadState:
    id: str
    name: str
    description: str
    instructions: str
    leader_id: str


@dataclass(frozen=True)
class SquadMemberState:
    member_id: str
    member_type: str
    role: str


@dataclass(frozen=True)
class AutopilotState:
    id: str
    title: str
    description: str
    execution_mode: str
    project_id: str | None
    assignee_id: str
    assignee_type: str
    status: str


@dataclass(frozen=True)
class TriggerState:
    id: str
    autopilot_id: str
    kind: str
    cron_expression: str
    timezone: str
    enabled: bool
    label: str | None


_ENVELOPES = frozenset({"data", "result"})
_READ_PREFIXES = (
    ("version",),
    ("runtime", "list"),
    ("project", "list"),
    ("project", "get"),
    ("project", "resource", "list"),
    ("agent", "list"),
    ("agent", "get"),
    ("agent", "skills", "list"),
    ("skill", "list"),
    ("skill", "get"),
    ("squad", "list"),
    ("squad", "get"),
    ("squad", "member", "list"),
    ("autopilot", "list"),
    ("autopilot", "get"),
    ("issue", "list"),
    ("issue", "get"),
    ("issue", "children"),
    ("issue", "runs"),
    ("issue", "metadata", "list"),
    ("capability", "get"),
)
_MUTATION_PREFIXES = (
    ("skill", "import"),
    ("agent", "create"),
    ("agent", "update"),
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
)
_EMPTY_ERROR_VALUES = (None, "", (), [], {})
_UNSUPPORTED_CONTROL_KEYS = frozenset({"ok", "failed", "failure"})


def _keys(value: object) -> str:
    if not isinstance(value, Mapping):
        return f"type={type(value).__name__}"
    return "keys=" + ",".join(sorted(str(key) for key in value.keys()))


def _contract(operation: str, value: object) -> MulticaContractError:
    return MulticaContractError(f"malformed {operation} response ({_keys(value)})")


def _deep_freeze(value: object) -> object:
    if isinstance(value, Mapping):
        return MappingProxyType({str(key): _deep_freeze(item) for key, item in value.items()})
    if isinstance(value, list | tuple):
        return tuple(_deep_freeze(item) for item in value)
    return value


def _contains_key(value: object, forbidden: str) -> bool:
    if isinstance(value, Mapping):
        return forbidden in value or any(_contains_key(item, forbidden) for item in value.values())
    if isinstance(value, list | tuple):
        return any(_contains_key(item, forbidden) for item in value)
    return False


class MulticaClient:
    """Product-neutral argv and response-shape adapter for Multica."""

    def __init__(
        self,
        runner: CommandRunner,
        runtime_id: str = "",
        daemon_id: str = "",
    ) -> None:
        self._runner = runner
        self.runtime_id = runtime_id
        self.daemon_id = daemon_id

    def _execute(
        self,
        argv: tuple[str, ...],
        *,
        operation: str,
        read_only: bool,
        input_text: str | None = None,
    ) -> object:
        if not isinstance(argv, tuple) or not argv or not all(isinstance(part, str) and part for part in argv):
            raise TypeError("argv must be a non-empty tuple of non-empty strings")
        attempts = 2 if read_only else 1
        for attempt in range(attempts):
            try:
                value = self._runner.run(argv, input_text=input_text)
                if isinstance(value, CommandResult):
                    if value.returncode != 0:
                        raise CommandFailure()
                    try:
                        value = json.loads(value.stdout)
                    except (json.JSONDecodeError, TypeError):
                        raise MulticaContractError(f"malformed {operation} JSON response") from None
                return value
            except TransientCommandError:
                if read_only and attempt == 0:
                    continue
                raise CommandFailure(f"{operation} command failed") from None
            except (CommandFailure, OSError, TimeoutError):
                raise CommandFailure(f"{operation} command failed") from None
        raise AssertionError("unreachable")

    def call(self, argv: tuple[str, ...]) -> Mapping[str, object]:
        """Perform a JSON call while classifying retry and secret boundaries."""

        if not isinstance(argv, tuple) or not argv or argv[0] != "multica":
            raise MulticaContractError("unsupported Multica argv")
        command = argv[1:]
        if command[:3] in {("agent", "env", "get"), ("agent", "env", "set")}:
            raise MulticaContractError("agent environment requires the typed environment boundary")
        read_only = any(command[: len(prefix)] == prefix for prefix in _READ_PREFIXES)
        mutation = any(command[: len(prefix)] == prefix for prefix in _MUTATION_PREFIXES)
        if not read_only and not mutation:
            raise MulticaContractError("unsupported Multica argv")
        value = self._execute(argv, operation="Multica call", read_only=read_only)
        if not isinstance(value, Mapping):
            raise _contract("Multica call", value)
        value = self._unwrap(
            value,
            "Multica call",
            direct_status_control=mutation,
        )
        if not isinstance(value, Mapping):
            raise _contract("Multica call", value)
        if _contains_key(value, "custom_env"):
            raise MulticaContractError("Multica call response requires the typed environment boundary")
        return _deep_freeze(value)

    def _read(self, argv: tuple[str, ...], operation: str) -> object:
        return self._execute(argv, operation=operation, read_only=True)

    def _mutate(self, argv: tuple[str, ...], operation: str, *, input_text: str | None = None) -> object:
        return self._execute(argv, operation=operation, read_only=False, input_text=input_text)

    @staticmethod
    def _unwrap(
        value: object,
        operation: str,
        *resource_keys: str,
        direct_status_control: bool = False,
    ) -> object:
        current = value
        if isinstance(current, Mapping):
            envelopes = [key for key in _ENVELOPES if key in current]
            transport_markers = {
                "success",
                "error",
                "errors",
                "meta",
            } & current.keys()
            status_is_control = bool(envelopes or transport_markers or direct_status_control)
            if (
                bool(_UNSUPPORTED_CONTROL_KEYS & current.keys())
                or ("success" in current and current["success"] is not True)
                or (
                    status_is_control
                    and "status" in current
                    and current["status"] not in {"ok", "success"}
                )
                or ("error" in current and current["error"] not in _EMPTY_ERROR_VALUES)
                or ("errors" in current and current["errors"] not in _EMPTY_ERROR_VALUES)
                or ("meta" in current and not isinstance(current["meta"], Mapping))
            ):
                raise _contract(operation, current)
            if envelopes:
                allowed = set(envelopes) | {"success", "status", "error", "errors", "meta"}
                if (
                    len(envelopes) != 1
                    or set(current) - allowed
                ):
                    raise _contract(operation, current)
                current = current[envelopes[0]]
        if isinstance(current, Mapping):
            for key in resource_keys:
                if key in current:
                    return current[key]
        return current

    @staticmethod
    def _resource(value: object, operation: str) -> MulticaResource:
        if not isinstance(value, Mapping):
            raise _contract(operation, value)
        resource_id = value.get("id")
        name = value.get("name", value.get("title"))
        if not isinstance(resource_id, str) or not resource_id or (name is not None and not isinstance(name, str)):
            raise _contract(operation, value)
        return MulticaResource(resource_id, name)

    @staticmethod
    def _resources(value: object, operation: str) -> tuple[MulticaResource, ...]:
        if not isinstance(value, list):
            raise _contract(operation, value)
        return tuple(MulticaClient._resource(item, operation) for item in value)

    def version(self) -> str:
        value = self._unwrap(
            self._read(("multica", "version", "--output", "json"), "Multica version"),
            "Multica version",
            "version",
        )
        if isinstance(value, Mapping):
            value = value.get("version")
        if not isinstance(value, str) or not value:
            raise _contract("Multica version", value)
        return value

    def get_runtime(self, runtime_id: str | None = None, daemon_id: str | None = None) -> RuntimeInfo:
        target_runtime = runtime_id or self.runtime_id
        target_daemon = daemon_id or self.daemon_id
        raw = self._unwrap(
            self._read(("multica", "runtime", "list", "--output", "json"), "runtime list"),
            "runtime list",
            "runtimes",
        )
        if not isinstance(raw, list):
            raise _contract("runtime list", raw)
        matches = [item for item in raw if isinstance(item, Mapping) and item.get("id") == target_runtime]
        if (
            len(matches) != 1
            or matches[0].get("daemon_id") != target_daemon
            or matches[0].get("status") != "online"
        ):
            raise MulticaContractError("runtime/daemon is not reachable")
        metadata = matches[0].get("metadata")
        capabilities = metadata.get("capabilities") if isinstance(metadata, Mapping) else None
        if not isinstance(capabilities, list) or not all(isinstance(item, str) and item for item in capabilities):
            raise _contract("runtime list", matches[0])
        return RuntimeInfo(target_runtime, target_daemon, "online", tuple(capabilities))

    @staticmethod
    def _string_field(value: Mapping[str, object], field: str, operation: str) -> str:
        result = value.get(field)
        if not isinstance(result, str) or not result:
            raise _contract(operation, value)
        return result

    @staticmethod
    def _text_field(value: Mapping[str, object], field: str, operation: str) -> str:
        result = value.get(field)
        if not isinstance(result, str):
            raise _contract(operation, value)
        return result

    def list_projects(self) -> tuple[ProjectState, ...]:
        operation = "project list"
        raw = self._unwrap(
            self._read(("multica", "project", "list", "--output", "json"), operation),
            operation,
            "projects",
        )
        summaries = self._resources(raw, operation)
        projects = []
        for summary in summaries:
            detail_operation = "project get"
            detail = self._unwrap(
                self._read(
                    ("multica", "project", "get", summary.id, "--output", "json"),
                    detail_operation,
                ),
                detail_operation,
                "project",
            )
            if not isinstance(detail, Mapping) or detail.get("id") != summary.id:
                raise _contract(detail_operation, detail)
            projects.append(
                ProjectState(
                    summary.id,
                    self._string_field(detail, "title", detail_operation),
                    self._text_field(detail, "description", detail_operation),
                )
            )
        return tuple(projects)

    def list_project_resources(
        self,
        project_id: str,
    ) -> tuple[ProjectResourceState, ...]:
        operation = "project resource list"
        raw = self._unwrap(
            self._read(
                (
                    "multica",
                    "project",
                    "resource",
                    "list",
                    project_id,
                    "--output",
                    "json",
                ),
                operation,
            ),
            operation,
            "resources",
        )
        if not isinstance(raw, list):
            raise _contract(operation, raw)
        result = []
        for item in raw:
            if not isinstance(item, Mapping) or item.get("project_id") != project_id:
                raise _contract(operation, item)
            reference = item.get("resource_ref")
            if not isinstance(reference, Mapping):
                raise _contract(operation, item)
            execution_mode = reference.get("execution_mode", "in_place")
            if not isinstance(execution_mode, str) or not execution_mode:
                raise _contract(operation, item)
            result.append(
                ProjectResourceState(
                    self._string_field(item, "id", operation),
                    project_id,
                    self._string_field(item, "resource_type", operation),
                    self._string_field(reference, "local_path", operation),
                    self._string_field(reference, "daemon_id", operation),
                    execution_mode,
                )
            )
        return tuple(result)

    def list_agents(self) -> tuple[AgentState, ...]:
        operation = "agent list"
        raw = self._unwrap(
            self._read(("multica", "agent", "list", "--output", "json"), operation),
            operation,
            "agents",
        )
        summaries = self._resources(raw, operation)
        agents = []
        for summary in summaries:
            detail_operation = "agent get"
            detail = self._unwrap(
                self._read(
                    ("multica", "agent", "get", summary.id, "--output", "json"),
                    detail_operation,
                ),
                detail_operation,
                "agent",
            )
            if not isinstance(detail, Mapping) or detail.get("id") != summary.id:
                raise _contract(detail_operation, detail)
            concurrency = detail.get("max_concurrent_tasks")
            if not isinstance(concurrency, int) or isinstance(concurrency, bool):
                raise _contract(detail_operation, detail)
            agents.append(
                AgentState(
                    summary.id,
                    self._string_field(detail, "name", detail_operation),
                    self._text_field(detail, "description", detail_operation),
                    self._text_field(detail, "instructions", detail_operation),
                    self._string_field(detail, "runtime_id", detail_operation),
                    self._string_field(detail, "visibility", detail_operation),
                    concurrency,
                )
            )
        return tuple(agents)

    def list_agent_skill_ids(self, agent_id: str) -> tuple[str, ...]:
        operation = "agent skill list"
        raw = self._unwrap(
            self._read(
                ("multica", "agent", "skills", "list", agent_id, "--output", "json"),
                operation,
            ),
            operation,
            "skills",
        )
        resources = self._resources(raw, operation)
        return tuple(resource.id for resource in resources)

    def list_skills(self) -> tuple[SkillState, ...]:
        operation = "skill list"
        raw = self._unwrap(
            self._read(("multica", "skill", "list", "--output", "json"), operation),
            operation,
            "skills",
        )
        summaries = self._resources(raw, operation)
        skills = []
        for summary in summaries:
            detail_operation = "skill get"
            detail = self._unwrap(
                self._read(
                    ("multica", "skill", "get", summary.id, "--output", "json"),
                    detail_operation,
                ),
                detail_operation,
                "skill",
            )
            if not isinstance(detail, Mapping) or detail.get("id") != summary.id:
                raise _contract(detail_operation, detail)
            config = detail.get("config")
            origin = config.get("origin") if isinstance(config, Mapping) else None
            if not isinstance(origin, Mapping):
                raise _contract(detail_operation, detail)
            skills.append(
                SkillState(
                    summary.id,
                    self._string_field(detail, "name", detail_operation),
                    self._string_field(origin, "source_url", detail_operation),
                )
            )
        return tuple(skills)

    def list_squads(self) -> tuple[SquadState, ...]:
        operation = "squad list"
        raw = self._unwrap(
            self._read(("multica", "squad", "list", "--output", "json"), operation),
            operation,
            "squads",
        )
        summaries = self._resources(raw, operation)
        squads = []
        for summary in summaries:
            detail_operation = "squad get"
            detail = self._unwrap(
                self._read(
                    ("multica", "squad", "get", summary.id, "--output", "json"),
                    detail_operation,
                ),
                detail_operation,
                "squad",
            )
            if not isinstance(detail, Mapping) or detail.get("id") != summary.id:
                raise _contract(detail_operation, detail)
            squads.append(
                SquadState(
                    summary.id,
                    self._string_field(detail, "name", detail_operation),
                    self._text_field(detail, "description", detail_operation),
                    self._text_field(detail, "instructions", detail_operation),
                    self._string_field(detail, "leader_id", detail_operation),
                )
            )
        return tuple(squads)

    def list_squad_members(self, squad_id: str) -> tuple[SquadMemberState, ...]:
        operation = "squad member list"
        raw = self._unwrap(
            self._read(
                ("multica", "squad", "member", "list", squad_id, "--output", "json"),
                operation,
            ),
            operation,
            "members",
        )
        if not isinstance(raw, list):
            raise _contract(operation, raw)
        members = []
        record_ids = set()
        member_ids = set()
        for item in raw:
            if not isinstance(item, Mapping) or item.get("squad_id") != squad_id:
                raise _contract(operation, item)
            record_id = self._string_field(item, "id", operation)
            member_id = self._string_field(item, "member_id", operation)
            if record_id in record_ids or member_id in member_ids:
                raise _contract(operation, item)
            record_ids.add(record_id)
            member_ids.add(member_id)
            members.append(
                SquadMemberState(
                    member_id,
                    self._string_field(item, "member_type", operation),
                    self._string_field(item, "role", operation),
                )
            )
        return tuple(members)

    @classmethod
    def _autopilot_state(cls, value: object, operation: str) -> AutopilotState:
        if not isinstance(value, Mapping):
            raise _contract(operation, value)
        project_id = value.get("project_id")
        if project_id is not None and (
            not isinstance(project_id, str) or not project_id
        ):
            raise _contract(operation, value)
        execution_mode = value.get("execution_mode")
        assignee_type = value.get("assignee_type")
        status = value.get("status")
        if (
            execution_mode not in {"create_issue", "run_only"}
            or assignee_type != "agent"
            or status not in {"active", "paused"}
        ):
            raise _contract(operation, value)
        return AutopilotState(
            cls._string_field(value, "id", operation),
            cls._string_field(value, "title", operation),
            cls._text_field(value, "description", operation),
            execution_mode,
            project_id,
            cls._string_field(value, "assignee_id", operation),
            assignee_type,
            status,
        )

    def list_autopilots(self) -> tuple[AutopilotState, ...]:
        operation = "autopilot list"
        raw = self._unwrap(
            self._read(("multica", "autopilot", "list", "--output", "json"), operation),
            operation,
        )
        if (
            not isinstance(raw, Mapping)
            or set(raw) != {"autopilots", "total"}
            or not isinstance(raw.get("autopilots"), list)
        ):
            raise _contract(operation, raw)
        total = raw.get("total")
        items = raw["autopilots"]
        if not isinstance(total, int) or isinstance(total, bool) or total != len(items):
            raise _contract(operation, raw)
        return tuple(self._autopilot_state(item, operation) for item in items)

    def list_autopilot_triggers(self, autopilot_id: str) -> tuple[TriggerState, ...]:
        operation = "autopilot trigger list"
        raw = self._unwrap(
            self._read(
                ("multica", "autopilot", "get", autopilot_id, "--output", "json"),
                operation,
            ),
            operation,
        )
        if not isinstance(raw, Mapping):
            raise _contract(operation, raw)
        autopilot = self._autopilot_state(raw.get("autopilot"), operation)
        triggers = raw.get("triggers")
        collaborators = raw.get("collaborators")
        if (
            set(raw) != {"autopilot", "collaborators", "triggers"}
            or autopilot.id != autopilot_id
            or not isinstance(triggers, list)
            or collaborators != []
        ):
            raise _contract(operation, raw)
        result = []
        for item in triggers:
            if not isinstance(item, Mapping) or item.get("autopilot_id") != autopilot_id:
                raise _contract(operation, item)
            for key in (
                "provider",
                "signing_secret_hint",
                "webhook_path",
                "webhook_token",
                "webhook_token_hint",
                "webhook_url",
            ):
                if item.get(key) is not None:
                    raise _contract(operation, item)
            for key in ("has_signing_secret", "has_webhook_token"):
                if item.get(key) is not False:
                    raise _contract(operation, item)
            enabled = item.get("enabled")
            label = item.get("label")
            cron_expression = item.get("cron_expression")
            if (
                item.get("kind") != "schedule"
                or not isinstance(enabled, bool)
                or (label is not None and not isinstance(label, str))
                or not isinstance(cron_expression, str)
                or len(cron_expression.split()) != 5
            ):
                raise _contract(operation, item)
            result.append(
                TriggerState(
                    self._string_field(item, "id", operation),
                    autopilot_id,
                    "schedule",
                    cron_expression,
                    self._string_field(item, "timezone", operation),
                    enabled,
                    label,
                )
            )
        return tuple(result)

    def _mutation_result(
        self,
        argv: tuple[str, ...],
        operation: str,
        resource_key: str,
        *,
        id_field: str = "id",
        expected_id: str | None = None,
        association: tuple[str, str] | None = None,
    ) -> MutationResult:
        response = self._mutate(argv, operation)
        if isinstance(response, Mapping) and dict(response) == {"ok": True}:
            return MutationResult(expected_id)
        raw = self._unwrap(
            response,
            operation,
            resource_key,
            direct_status_control=True,
        )
        if not isinstance(raw, Mapping):
            raise _contract(operation, raw)
        resource_id = raw.get(id_field)
        if (
            not isinstance(resource_id, str)
            or not resource_id
            or (expected_id is not None and resource_id != expected_id)
            or (
                association is not None
                and raw.get(association[0]) != association[1]
            )
        ):
            raise _contract(operation, raw)
        return MutationResult(resource_id)

    def create_project(self, *, title: str, description: str) -> MutationResult:
        return self._mutation_result(
            (
                "multica", "project", "create", "--title", title,
                "--description", description, "--output", "json",
            ),
            "project create",
            "project",
        )

    def update_project(
        self,
        project_id: str,
        *,
        title: str,
        description: str,
    ) -> MutationResult:
        return self._mutation_result(
            (
                "multica", "project", "update", project_id, "--title", title,
                "--description", description, "--output", "json",
            ),
            "project update",
            "project",
            expected_id=project_id,
        )

    def add_project_worktree(
        self,
        project_id: str,
        *,
        local_path: str,
        daemon_id: str,
        execution_mode: str,
    ) -> MutationResult:
        return self._mutation_result(
            (
                "multica", "project", "resource", "add", project_id,
                "--type", "local_directory", "--local-path", local_path,
                "--daemon-id", daemon_id, "--execution-mode", execution_mode,
                "--output", "json",
            ),
            "project worktree add",
            "resource",
            association=("project_id", project_id),
        )

    def update_project_worktree(
        self,
        project_id: str,
        resource_id: str,
        *,
        daemon_id: str,
        execution_mode: str,
    ) -> MutationResult:
        return self._mutation_result(
            (
                "multica", "project", "resource", "update", project_id,
                resource_id, "--daemon-id", daemon_id, "--execution-mode",
                execution_mode, "--output", "json",
            ),
            "project worktree update",
            "resource",
            expected_id=resource_id,
            association=("project_id", project_id),
        )

    def create_agent(
        self,
        *,
        name: str,
        description: str,
        instructions: str,
        runtime_id: str,
        visibility: str,
        max_concurrent_tasks: int,
    ) -> MutationResult:
        return self._mutation_result(
            self._agent_mutation_argv(
                "create",
                None,
                name=name,
                description=description,
                instructions=instructions,
                runtime_id=runtime_id,
                visibility=visibility,
                max_concurrent_tasks=max_concurrent_tasks,
            ),
            "agent create",
            "agent",
        )

    def update_agent(
        self,
        agent_id: str,
        *,
        name: str,
        description: str,
        instructions: str,
        runtime_id: str,
        visibility: str,
        max_concurrent_tasks: int,
    ) -> MutationResult:
        return self._mutation_result(
            self._agent_mutation_argv(
                "update",
                agent_id,
                name=name,
                description=description,
                instructions=instructions,
                runtime_id=runtime_id,
                visibility=visibility,
                max_concurrent_tasks=max_concurrent_tasks,
            ),
            "agent update",
            "agent",
            expected_id=agent_id,
        )

    @staticmethod
    def _agent_mutation_argv(
        verb: str,
        agent_id: str | None,
        *,
        name: str,
        description: str,
        instructions: str,
        runtime_id: str,
        visibility: str,
        max_concurrent_tasks: int,
    ) -> tuple[str, ...]:
        if (
            not isinstance(max_concurrent_tasks, int)
            or isinstance(max_concurrent_tasks, bool)
            or max_concurrent_tasks < 1
        ):
            raise TypeError("max_concurrent_tasks must be a positive integer")
        prefix = ("multica", "agent", verb) + (() if agent_id is None else (agent_id,))
        return prefix + (
            "--name", name, "--description", description,
            "--instructions", instructions, "--runtime-id", runtime_id,
            "--visibility", visibility, "--max-concurrent-tasks",
            str(max_concurrent_tasks), "--output", "json",
        )

    def add_agent_skill(self, agent_id: str, skill_id: str) -> MutationResult:
        return self._mutation_result(
            (
                "multica", "agent", "skills", "add", agent_id,
                "--skill-ids", skill_id, "--output", "json",
            ),
            "agent skill add",
            "agent",
            expected_id=agent_id,
        )

    def create_squad(
        self,
        *,
        name: str,
        description: str,
        leader_id: str,
    ) -> MutationResult:
        return self._mutation_result(
            (
                "multica", "squad", "create", "--name", name,
                "--description", description, "--leader", leader_id,
                "--output", "json",
            ),
            "squad create",
            "squad",
        )

    def update_squad(
        self,
        squad_id: str,
        *,
        name: str,
        description: str,
        instructions: str,
        leader_id: str,
    ) -> MutationResult:
        return self._mutation_result(
            (
                "multica", "squad", "update", squad_id, "--name", name,
                "--description", description, "--instructions", instructions,
                "--leader", leader_id, "--output", "json",
            ),
            "squad update",
            "squad",
            expected_id=squad_id,
        )

    def add_squad_member(
        self,
        squad_id: str,
        agent_id: str,
        *,
        role: str,
    ) -> MutationResult:
        return self._mutation_result(
            (
                "multica", "squad", "member", "add", squad_id,
                "--member-id", agent_id, "--type", "agent",
                "--role", role, "--output", "json",
            ),
            "squad member add",
            "member",
            id_field="member_id",
            expected_id=agent_id,
        )

    def update_squad_member(
        self,
        squad_id: str,
        agent_id: str,
        *,
        role: str,
    ) -> MutationResult:
        return self._mutation_result(
            (
                "multica", "squad", "member", "set-role", squad_id,
                "--member-id", agent_id, "--member-type", "agent",
                "--role", role, "--output", "json",
            ),
            "squad member update",
            "member",
            id_field="member_id",
            expected_id=agent_id,
        )

    def create_autopilot(
        self,
        *,
        title: str,
        description: str,
        execution_mode: str,
        project_id: str,
        assignee_id: str,
        status: str,
    ) -> MutationResult:
        if status != "active":
            raise MulticaContractError("new Autopilot must be active")
        return self._mutation_result(
            (
                "multica", "autopilot", "create", "--title", title,
                "--description", description, "--agent", assignee_id,
                "--mode", execution_mode, "--project", project_id,
                "--output", "json",
            ),
            "autopilot create",
            "autopilot",
        )

    def update_autopilot(
        self,
        autopilot_id: str,
        *,
        title: str,
        description: str,
        execution_mode: str,
        project_id: str,
        assignee_id: str,
        status: str,
    ) -> MutationResult:
        return self._mutation_result(
            (
                "multica", "autopilot", "update", autopilot_id,
                "--title", title, "--description", description,
                "--agent", assignee_id, "--mode", execution_mode,
                "--project", project_id, "--status", status,
                "--output", "json",
            ),
            "autopilot update",
            "autopilot",
            expected_id=autopilot_id,
        )

    def add_autopilot_trigger(
        self,
        autopilot_id: str,
        *,
        cron_expression: str,
        timezone: str,
        label: str,
    ) -> MutationResult:
        return self._mutation_result(
            (
                "multica", "autopilot", "trigger-add", autopilot_id,
                "--kind", "schedule", "--cron", cron_expression,
                "--timezone", timezone, "--label", label,
                "--output", "json",
            ),
            "autopilot trigger add",
            "trigger",
            association=("autopilot_id", autopilot_id),
        )

    def update_autopilot_trigger(
        self,
        autopilot_id: str,
        trigger_id: str,
        *,
        cron_expression: str,
        timezone: str,
        enabled: bool,
        label: str,
    ) -> MutationResult:
        if enabled is not True:
            raise MulticaContractError("Autopilot trigger update requires enabled state")
        return self._mutation_result(
            (
                "multica", "autopilot", "trigger-update", autopilot_id,
                trigger_id, "--cron", cron_expression, "--timezone", timezone,
                "--enabled", "--label", label,
                "--output", "json",
            ),
            "autopilot trigger update",
            "trigger",
            expected_id=trigger_id,
            association=("autopilot_id", autopilot_id),
        )

    def inspect_skill_import(self) -> SkillImportCapability:
        """Inspect declared capability metadata; never execute ``skill import``."""

        raw = self._unwrap(
            self._read(
                ("multica", "capability", "get", "skill-import", "--output", "json"),
                "skill import capability",
            ),
            "skill import capability",
            "capability",
        )
        if not isinstance(raw, Mapping) or not isinstance(raw.get("dry_run"), bool):
            raise _contract("skill import capability", raw)
        return SkillImportCapability(raw["dry_run"])

    def get_agent_environment(self, agent_id: str) -> AgentEnvironment:
        operation = "agent environment"
        raw = self._unwrap(
            self._read(
                ("multica", "agent", "env", "get", agent_id, "--output", "json"),
                operation,
            ),
            operation,
            "environment",
        )
        if not isinstance(raw, Mapping):
            raise _contract(operation, raw)
        actual_agent = raw.get("agent_id")
        custom_env = raw.get("custom_env")
        if actual_agent != agent_id or not isinstance(custom_env, Mapping) or not all(
            isinstance(key, str) and isinstance(value, str) for key, value in custom_env.items()
        ):
            raise _contract(operation, raw)
        return AgentEnvironment(agent_id, tuple(sorted(custom_env)))

    def import_skill(self, url: str) -> MulticaResource:
        parsed = urlparse(url)
        if (
            parsed.scheme != "https"
            or parsed.hostname != "github.com"
            or parsed.username is not None
            or parsed.password is not None
            or parsed.query
            or parsed.fragment
        ):
            raise MulticaContractError("skill import requires a public GitHub URL")
        response = self._mutate(
            (
                "multica", "skill", "import", "--url", url,
                "--on-conflict", "fail", "--output", "json",
            ),
            "skill import",
        )
        if (
            isinstance(response, Mapping)
            and set(response) == {"skill", "status"}
            and response.get("status") == "created"
        ):
            raw = response["skill"]
        else:
            raw = self._unwrap(
                response,
                "skill import",
                "skill",
                direct_status_control=True,
            )
        return self._resource(raw, "skill import")

    def set_agent_environment(self, agent_id: str, values: Mapping[str, str]) -> MutationResult:
        if not all(isinstance(key, str) and key and isinstance(value, str) for key, value in values.items()):
            raise TypeError("environment must map non-empty names to string values")
        response = self._mutate(
            (
                "multica",
                "agent",
                "env",
                "set",
                agent_id,
                "--custom-env-stdin",
                "--output",
                "json",
            ),
            "agent environment update",
            input_text=json.dumps(dict(values), sort_keys=True),
        )
        if isinstance(response, Mapping) and (
            dict(response) == dict(values) or dict(response) == {"ok": True}
        ):
            return MutationResult(agent_id)
        raw = self._unwrap(
            response,
            "agent environment update",
            "agent",
            direct_status_control=True,
        )
        if not isinstance(raw, Mapping) or raw.get("id") != agent_id:
            raise _contract("agent environment update", raw)
        return MutationResult(agent_id)
