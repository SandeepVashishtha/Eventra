"""Strict, side-effect-free YAML boundary for delivery configuration."""

from dataclasses import fields, is_dataclass
import hashlib
import json
from pathlib import Path
import re
import shlex
from types import MappingProxyType
from typing import Any, Mapping
from urllib.parse import urlparse

import yaml

from .model import (
    ControlSpec,
    DeliveryManifest,
    FrameworkLock,
    InstanceSpec,
    IntegrationSuiteSpec,
    PolicySpec,
    RepositorySpec,
    SecretEnvSpec,
    ServiceSpec,
    SkillSource,
)


class ManifestError(ValueError):
    """Raised when an untrusted delivery manifest fails validation."""


class _UniqueKeyLoader(yaml.SafeLoader):
    pass


def _construct_mapping(loader: yaml.SafeLoader, node: yaml.nodes.MappingNode, deep: bool = False) -> dict[Any, Any]:
    mapping: dict[Any, Any] = {}
    for key_node, value_node in node.value:
        key = loader.construct_object(key_node, deep=deep)
        if key in mapping:
            raise ManifestError(f"duplicate key: {key!r}")
        mapping[key] = loader.construct_object(value_node, deep=deep)
    return mapping


_UniqueKeyLoader.add_constructor(yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG, _construct_mapping)

_GITHUB_SLUG = re.compile(r"^[A-Za-z0-9](?:[A-Za-z0-9_.-]{0,38})/[A-Za-z0-9][A-Za-z0-9_.-]{0,99}$")
_REQUIRED_COMMANDS = frozenset({"focused_test", "test", "build", "start", "smoke"})
_SECRET_RECIPIENTS = frozenset({"engineer", "delivery-lead", "independent-reviewer", "integration-qa", "workflow-watcher"})
_FIXED_ROLE_KEYS = frozenset(
    {"delivery-lead", "independent-reviewer", "integration-qa", "workflow-watcher"}
)


def _frozen(mapping: Mapping[str, Any]) -> Mapping[str, Any]:
    return MappingProxyType(dict(mapping))


def _mapping(value: Any, field: str) -> Mapping[str, Any]:
    if not isinstance(value, dict):
        raise ManifestError(f"{field} must be a mapping")
    return value


def _string(value: Any, field: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ManifestError(f"{field} must be a non-empty string")
    return value


def _integer(value: Any, field: str) -> int:
    if not isinstance(value, int) or isinstance(value, bool):
        raise ManifestError(f"{field} must be an integer")
    return value


def _sequence(value: Any, field: str) -> list[Any]:
    if not isinstance(value, list):
        raise ManifestError(f"{field} must be a list")
    return value


def _expect_keys(data: Mapping[str, Any], field: str, required: set[str], optional: set[str] = set()) -> None:
    missing = required - data.keys()
    unknown = data.keys() - required - optional
    if missing:
        raise ManifestError(f"{field} missing required key(s): {', '.join(sorted(missing))}")
    if unknown:
        raise ManifestError(f"{field} has unknown key(s): {', '.join(sorted(unknown))}")


def _command(value: Any, field: str) -> tuple[str, ...]:
    if isinstance(value, str):
        result = tuple(shlex.split(value))
    elif isinstance(value, list) and all(isinstance(part, str) and part for part in value):
        result = tuple(value)
    else:
        raise ManifestError(f"{field} must be a command string or string list")
    if not result:
        raise ManifestError(f"{field} must not be empty")
    return result


def _github_slug(value: Any, field: str) -> str:
    slug = _string(value, field)
    if not _GITHUB_SLUG.fullmatch(slug):
        raise ManifestError(f"{field} must be an owner/repository GitHub slug")
    return slug


def _public_skill_url(value: Any, field: str) -> str:
    url = _string(value, field)
    parsed = urlparse(url)
    if parsed.scheme != "https" or parsed.netloc != "github.com" or len([part for part in parsed.path.split("/") if part]) < 2:
        raise ManifestError(f"{field} must be a public https://github.com URL")
    return url


def _topological_order(repositories: Mapping[str, RepositorySpec]) -> tuple[str, ...]:
    pending = {key: set(spec.depends_on) for key, spec in repositories.items()}
    order: list[str] = []
    while pending:
        available = [key for key in repositories if key in pending and not pending[key]]
        if not available:
            raise ManifestError("repository dependencies contain a cycle")
        for key in available:
            order.append(key)
            del pending[key]
        resolved = set(available)
        for dependencies in pending.values():
            dependencies.difference_update(resolved)
    return tuple(order)


def _validate_dependency_order(order: tuple[str, ...], repositories: Mapping[str, RepositorySpec], field: str) -> None:
    if len(order) != len(repositories) or set(order) != set(repositories):
        raise ManifestError(f"{field} must list every repository exactly once")
    positions = {key: index for index, key in enumerate(order)}
    for key, repository in repositories.items():
        for dependency in repository.depends_on:
            if positions[dependency] > positions[key]:
                raise ManifestError(f"{field} is inconsistent with repository dependencies")


def load_manifest(path: Path) -> DeliveryManifest:
    try:
        return load_manifest_text(Path(path).read_text(encoding="utf-8"))
    except OSError as error:
        raise ManifestError(f"cannot read manifest {path}: {error}") from error


def load_manifest_text(text: str) -> DeliveryManifest:
    try:
        document = yaml.load(text, Loader=_UniqueKeyLoader)
    except (yaml.YAMLError, ManifestError) as error:
        raise ManifestError(str(error)) from error
    top = _mapping(document, "manifest")
    _expect_keys(
        top,
        "manifest",
        {
            "schema_version",
            "instance",
            "control",
            "skill_registry",
            "policies",
            "repositories",
            "integration_suites",
            "merge_order",
        },
        {"role_skills"},
    )
    if _integer(top["schema_version"], "schema_version") != 1:
        raise ManifestError("schema_version must be 1")

    instance_data = _mapping(top["instance"], "instance")
    _expect_keys(instance_data, "instance", {"key", "display_name", "runtime_id", "daemon_id", "control_project"})
    instance = InstanceSpec(**{key: _string(value, f"instance.{key}") for key, value in instance_data.items()})

    control_data = _mapping(top["control"], "control")
    _expect_keys(control_data, "control", {"github", "local_path"})
    control = ControlSpec(_github_slug(control_data["github"], "control.github"), Path(_string(control_data["local_path"], "control.local_path")))

    skill_sources: dict[str, SkillSource] = {}
    for key, source in _mapping(top["skill_registry"], "skill_registry").items():
        name = _string(key, "skill_registry key")
        source_data = _mapping(source, f"skill_registry.{name}")
        _expect_keys(source_data, f"skill_registry.{name}", {"url", "approved"})
        if source_data["approved"] is not True:
            raise ManifestError(f"skill_registry.{name} is not operator-approved")
        skill_sources[name] = SkillSource(name, _public_skill_url(source_data["url"], f"skill_registry.{name}.url"), True)
    if not skill_sources:
        raise ManifestError("skill_registry must not be empty")

    role_skills: dict[str, tuple[str, ...]] = {}
    if "role_skills" in top:
        role_data = _mapping(top["role_skills"], "role_skills")
        if set(role_data) != _FIXED_ROLE_KEYS:
            raise ManifestError("role_skills must declare every fixed role exactly once")
        for role, raw_skills in role_data.items():
            values = tuple(
                _string(value, f"role_skills.{role}")
                for value in _sequence(raw_skills, f"role_skills.{role}")
            )
            if not values or len(set(values)) != len(values):
                raise ManifestError(f"role_skills.{role} must be non-empty and unique")
            undeclared = set(values) - skill_sources.keys()
            if undeclared:
                raise ManifestError(
                    f"role_skills.{role} uses undeclared skill key(s): "
                    f"{', '.join(sorted(undeclared))}"
                )
            role_skills[role] = values

    policies = _mapping(top["policies"], "policies")
    _expect_keys(policies, "policies", {"environment", "automatic_merge", "deployment", "max_repair_attempts", "watcher_cron", "watcher_timezone"})
    environment = _string(policies["environment"], "policies.environment")
    if environment not in {"development", "production"}:
        raise ManifestError("policies.environment must be development or production")
    automatic_merge = policies["automatic_merge"]
    if not isinstance(automatic_merge, bool):
        raise ManifestError("policies.automatic_merge must be a boolean")
    if environment != "development" and automatic_merge:
        raise ManifestError("policies.automatic_merge is allowed only in development")
    if policies["deployment"] != "forbidden":
        raise ManifestError("policies.deployment must be forbidden")
    if policies["max_repair_attempts"] != 2:
        raise ManifestError("policies.max_repair_attempts must be 2")
    policy = PolicySpec(environment, automatic_merge, "forbidden", 2, _string(policies["watcher_cron"], "policies.watcher_cron"), _string(policies["watcher_timezone"], "policies.watcher_timezone"))

    repositories: dict[str, RepositorySpec] = {}
    projects: set[str] = {instance.control_project}
    github_slugs: set[str] = {control.github.casefold()}
    paths: set[Path] = {control.local_path}
    ports: set[int] = set()
    for key, item in _mapping(top["repositories"], "repositories").items():
        name = _string(key, "repository key")
        data = _mapping(item, f"repositories.{name}")
        _expect_keys(data, f"repositories.{name}", {"github", "local_path", "default_branch", "project", "commands", "services", "skills"}, {"description", "depends_on", "secret_env"})
        github = _github_slug(data["github"], f"repositories.{name}.github")
        normalized_github = github.casefold()
        if normalized_github in github_slugs:
            raise ManifestError(f"duplicate GitHub repository: {github}")
        github_slugs.add(normalized_github)
        project = _string(data["project"], f"repositories.{name}.project")
        if project in projects:
            raise ManifestError(f"duplicate Project: {project}")
        projects.add(project)
        local_path = Path(_string(data["local_path"], f"repositories.{name}.local_path"))
        if local_path in paths:
            raise ManifestError(f"duplicate local-path: {local_path}")
        paths.add(local_path)
        commands_data = _mapping(data["commands"], f"repositories.{name}.commands")
        missing_commands = _REQUIRED_COMMANDS - commands_data.keys()
        if missing_commands:
            raise ManifestError(f"repositories.{name}.commands missing: {', '.join(sorted(missing_commands))}")
        commands = _frozen({command: _command(value, f"repositories.{name}.commands.{command}") for command, value in commands_data.items()})
        services: list[ServiceSpec] = []
        for service in _sequence(data["services"], f"repositories.{name}.services"):
            service_data = _mapping(service, f"repositories.{name}.service")
            _expect_keys(service_data, f"repositories.{name}.service", {"name", "port", "health_url"})
            port = service_data["port"]
            if not isinstance(port, int) or isinstance(port, bool) or not 1 <= port <= 65535:
                raise ManifestError(f"repositories.{name}.service.port must be a valid port")
            if port in ports:
                raise ManifestError(f"duplicate service port on daemon: {port}")
            ports.add(port)
            services.append(ServiceSpec(_string(service_data["name"], "service.name"), port, _string(service_data["health_url"], "service.health_url")))
        depends_on = tuple(_string(value, f"repositories.{name}.depends_on") for value in _sequence(data.get("depends_on", []), f"repositories.{name}.depends_on"))
        if len(set(depends_on)) != len(depends_on):
            raise ManifestError(f"repositories.{name}.depends_on contains duplicates")
        skills = tuple(_string(value, f"repositories.{name}.skills") for value in _sequence(data["skills"], f"repositories.{name}.skills"))
        undeclared = set(skills) - skill_sources.keys()
        if undeclared:
            raise ManifestError(f"repositories.{name} uses undeclared skill key(s): {', '.join(sorted(undeclared))}")
        secrets: dict[str, SecretEnvSpec] = {}
        for secret_name, secret in _mapping(data.get("secret_env", {}), f"repositories.{name}.secret_env").items():
            secret_key = _string(secret_name, "secret_env key")
            secret_data = _mapping(secret, f"repositories.{name}.secret_env.{secret_key}")
            _expect_keys(secret_data, f"repositories.{name}.secret_env.{secret_key}", {"recipients"})
            recipients = tuple(_string(value, "secret recipient") for value in _sequence(secret_data["recipients"], "secret recipients"))
            invalid_recipients = set(recipients) - _SECRET_RECIPIENTS
            if invalid_recipients:
                raise ManifestError(f"undeclared secret recipient(s): {', '.join(sorted(invalid_recipients))}")
            secrets[secret_key] = SecretEnvSpec(secret_key, recipients)
        repositories[name] = RepositorySpec(name, github, project, local_path, _string(data["default_branch"], f"repositories.{name}.default_branch"), depends_on, commands, skills, _string(data.get("description", ""), f"repositories.{name}.description") if data.get("description", "") else "", tuple(services), _frozen(secrets))
    if not repositories:
        raise ManifestError("repositories must not be empty")
    for key, repository in repositories.items():
        unknown = set(repository.depends_on) - repositories.keys()
        if unknown:
            raise ManifestError(f"repositories.{key} has unknown dependency: {', '.join(sorted(unknown))}")
    frozen_repositories = _frozen(repositories)
    _topological_order(frozen_repositories)

    suites: list[IntegrationSuiteSpec] = []
    for key, item in _mapping(top["integration_suites"], "integration_suites").items():
        name = _string(key, "integration-suite key")
        data = _mapping(item, f"integration_suites.{name}")
        _expect_keys(data, f"integration_suites.{name}", {"repositories", "start_order", "command_repository", "command"})
        members = tuple(_string(value, f"integration_suites.{name}.repositories") for value in _sequence(data["repositories"], f"integration_suites.{name}.repositories"))
        start_order = tuple(_string(value, f"integration_suites.{name}.start_order") for value in _sequence(data["start_order"], f"integration_suites.{name}.start_order"))
        if not members or len(set(members)) != len(members) or set(members) - repositories.keys():
            raise ManifestError(f"integration_suites.{name} has unknown or duplicate repositories")
        for repository in members:
            missing_dependencies = set(repositories[repository].depends_on) - set(members)
            if missing_dependencies:
                raise ManifestError(
                    f"integration_suites.{name} must include the dependency closure of {repository}"
                )
        if len(start_order) != len(members) or set(start_order) != set(members):
            raise ManifestError(f"integration_suites.{name}.start_order must list suite repositories exactly once")
        positions = {repository: position for position, repository in enumerate(start_order)}
        for repository in members:
            for dependency in repositories[repository].depends_on:
                if dependency in positions and positions[dependency] > positions[repository]:
                    raise ManifestError(f"integration_suites.{name}.start_order is inconsistent with repository dependencies")
        command_repository = _string(data["command_repository"], f"integration_suites.{name}.command_repository")
        if command_repository not in members:
            raise ManifestError(f"integration_suites.{name}.command_repository must be in repositories")
        suites.append(IntegrationSuiteSpec(name, members, start_order, command_repository, _command(data["command"], f"integration_suites.{name}.command")))

    merge_order = tuple(_string(value, "merge_order") for value in _sequence(top["merge_order"], "merge_order"))
    _validate_dependency_order(merge_order, frozen_repositories, "merge_order")
    return DeliveryManifest(
        1,
        instance,
        control,
        _frozen(skill_sources),
        frozen_repositories,
        tuple(suites),
        policy,
        merge_order,
        _frozen(role_skills),
    )


def _canonical(value: Any) -> Any:
    if is_dataclass(value):
        return {field.name: _canonical(getattr(value, field.name)) for field in fields(value)}
    if isinstance(value, Mapping):
        return {str(key): _canonical(item) for key, item in value.items()}
    if isinstance(value, Path):
        return str(value)
    if isinstance(value, tuple):
        return [_canonical(item) for item in value]
    return value


def manifest_digest(manifest: DeliveryManifest) -> str:
    payload = json.dumps(_canonical(manifest), sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def load_lock(path: Path) -> FrameworkLock:
    try:
        text = Path(path).read_text(encoding="utf-8")
    except OSError as error:
        raise ManifestError(f"cannot read lock {path}: {error}") from error
    try:
        data = yaml.load(text, Loader=_UniqueKeyLoader)
    except (yaml.YAMLError, ManifestError) as error:
        raise ManifestError(f"invalid framework.lock: {error}") from error
    lock = _mapping(data, "framework.lock")
    required = {"skill_version", "engine_version", "manifest_schema_version", "workflow_metadata_version", "supported_multica_cli", "manifest_digest", "resource_ids"}
    _expect_keys(lock, "framework.lock", required)
    resource_ids: dict[str, Mapping[str, str]] = {}
    for kind, values in _mapping(lock["resource_ids"], "framework.lock.resource_ids").items():
        resource_ids[_string(kind, "resource kind")] = _frozen({
            _string(key, "resource key"): _string(value, "resource id")
            for key, value in _mapping(values, f"resource_ids.{kind}").items()
        })
    return FrameworkLock(
        _string(lock["skill_version"], "framework.lock.skill_version"),
        _string(lock["engine_version"], "framework.lock.engine_version"),
        _integer(lock["manifest_schema_version"], "framework.lock.manifest_schema_version"),
        _integer(lock["workflow_metadata_version"], "framework.lock.workflow_metadata_version"),
        _string(lock["supported_multica_cli"], "framework.lock.supported_multica_cli"),
        _string(lock["manifest_digest"], "framework.lock.manifest_digest"),
        _frozen(resource_ids),
    )
