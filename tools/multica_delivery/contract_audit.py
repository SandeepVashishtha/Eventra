"""Read-only contract audit across Multica and manifest-scoped GitHub state."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Mapping

from .model import DeliveryManifest


@dataclass(frozen=True)
class ContractAuditEntry:
    subject: str
    status: str
    detail: str

    def __post_init__(self) -> None:
        if self.status not in {"pass", "warn", "fail"}:
            raise ValueError("invalid audit status")


@dataclass(frozen=True)
class ContractAuditReport:
    entries: tuple[ContractAuditEntry, ...]


def audit_contracts(multica: object, github: object, manifest: DeliveryManifest) -> ContractAuditReport:
    """Probe only fixed read/capability methods and classify every result."""

    entries: list[ContractAuditEntry] = []

    def probe(
        subject: str,
        read: Callable[[], object],
        *,
        validate: Callable[[object], bool] = lambda value: True,
        empty_warning: str | None = None,
    ) -> object | None:
        try:
            value = read()
            if not validate(value):
                raise ValueError("invalid contract shape")
        except Exception:
            entries.append(ContractAuditEntry(subject, "fail", "read failed"))
            return None
        if empty_warning is not None and not value:
            entries.append(ContractAuditEntry(subject, "warn", empty_warning))
        else:
            entries.append(ContractAuditEntry(subject, "pass", "contract available"))
        return value

    def resources(value: object) -> bool:
        return isinstance(value, tuple | list) and all(
            isinstance(getattr(item, "id", None), str) and bool(item.id)
            for item in value
        )

    def runtime(value: object) -> bool:
        if isinstance(value, Mapping):
            return (
                value.get("id") == manifest.instance.runtime_id
                and value.get("daemon_id") == manifest.instance.daemon_id
                and value.get("status") == "online"
            )
        return (
            getattr(value, "id", None) == manifest.instance.runtime_id
            and getattr(value, "daemon_id", None) == manifest.instance.daemon_id
            and getattr(value, "status", None) == "online"
        )

    def capability(value: object) -> bool:
        if isinstance(value, Mapping):
            return isinstance(value.get("dry_run"), bool)
        return isinstance(getattr(value, "dry_run", None), bool)

    def repository_shape(value: object, expected: str) -> bool:
        if isinstance(value, Mapping):
            name = value.get("repository", value.get("nameWithOwner"))
            visibility = value.get("visibility")
        else:
            name = getattr(value, "repository", None)
            visibility = getattr(value, "visibility", None)
        return name == expected and visibility in {"public", "private", "internal"}

    def project_shape(value: object, expected: str) -> bool:
        if not isinstance(value, tuple | list):
            return False
        for project in value:
            if isinstance(project, Mapping):
                project_id = project.get("id")
                title = project.get("title")
                url = project.get("url")
                public = project.get("public")
                closed = project.get("closed")
                linked = project.get("linked_repositories")
            else:
                project_id = getattr(project, "id", None)
                title = getattr(project, "title", None)
                url = getattr(project, "url", None)
                public = getattr(project, "public", None)
                closed = getattr(project, "closed", None)
                linked = getattr(project, "linked_repositories", None)
            if (
                not isinstance(project_id, str)
                or not project_id
                or not isinstance(title, str)
                or not title
                or not isinstance(url, str)
                or not url.startswith("https://github.com/")
                or not isinstance(public, bool)
                or not isinstance(closed, bool)
                or not isinstance(linked, tuple)
                or expected not in linked
            ):
                return False
        return True

    def pull_shape(value: object, expected: str) -> bool:
        return isinstance(value, tuple | list) and all(
            getattr(item, "repository", expected) == expected
            and isinstance(getattr(item, "number", None), int)
            and not isinstance(getattr(item, "number", None), bool)
            and item.number > 0
            for item in value
        )

    probe("multica.version", multica.version, validate=lambda value: isinstance(value, str) and bool(value))
    probe(
        "multica.runtime_daemon",
        lambda: multica.get_runtime(manifest.instance.runtime_id, manifest.instance.daemon_id),
        validate=runtime,
    )
    probe("multica.projects", multica.list_projects, validate=resources)
    agents = probe("multica.agents", multica.list_agents, validate=resources)
    if agents:
        probe(
            "multica.agent_environment",
            lambda: multica.get_agent_environment(agents[0].id),
            validate=lambda value: getattr(value, "agent_id", None) == agents[0].id
            and isinstance(getattr(value, "keys", None), tuple),
        )
    else:
        entries.append(ContractAuditEntry("multica.agent_environment", "warn", "no existing agent sample"))
    probe("multica.skills", multica.list_skills, validate=resources)
    capability_value = probe(
        "multica.skill_import_capability",
        multica.inspect_skill_import,
        validate=capability,
    )
    dry_run = (
        capability_value.get("dry_run")
        if isinstance(capability_value, Mapping)
        else getattr(capability_value, "dry_run", None)
    )
    if capability_value is None:
        entries.append(ContractAuditEntry("multica.skill_import_dry_shape", "fail", "capability unavailable"))
    elif dry_run is False:
        entries.append(ContractAuditEntry("multica.skill_import_dry_shape", "warn", "dry-run shape not advertised"))
    elif dry_run is True:
        entries.append(ContractAuditEntry("multica.skill_import_dry_shape", "pass", "dry-run shape advertised"))

    probe(
        "github.auth",
        github.auth_status,
        validate=lambda value: (
            isinstance(getattr(value, "login", None), str)
            and bool(value.login)
        )
        or (
            isinstance(value, Mapping)
            and value.get("active") is True
            and isinstance(value.get("login"), str)
            and bool(value["login"])
        ),
    )
    repositories = (manifest.control.github,) + tuple(
        repository.github for repository in manifest.repositories.values()
    )
    any_pull_request = False
    for repository in repositories:
        probe(
            f"github.repository.{repository}",
            lambda repository=repository: github.get_repository(repository),
            validate=lambda value, repository=repository: repository_shape(value, repository),
        )
        probe(
            f"github.projects.{repository}",
            lambda repository=repository: github.list_projects(repository),
            validate=lambda value, repository=repository: project_shape(value, repository),
        )
        pulls = probe(
            f"github.pull_requests.{repository}",
            lambda repository=repository: github.list_pull_requests(repository),
            validate=lambda value, repository=repository: pull_shape(value, repository),
        )
        if pulls:
            any_pull_request = True
            probe(
                f"github.pull_request.{repository}",
                lambda repository=repository, number=pulls[0].number: github.get_pull_request(repository, number),
            )
    entries.append(
        ContractAuditEntry(
            "github.pull_request_shape",
            "pass" if any_pull_request else "warn",
            "sample contract available" if any_pull_request else "no existing pull request sample",
        )
    )
    return ContractAuditReport(tuple(entries))
