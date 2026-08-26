"""Read-only contract audit across Multica and manifest-scoped GitHub state."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

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

    def probe(subject: str, read: Callable[[], object], *, empty_warning: str | None = None) -> object | None:
        try:
            value = read()
        except Exception:
            entries.append(ContractAuditEntry(subject, "fail", "read failed"))
            return None
        if empty_warning is not None and not value:
            entries.append(ContractAuditEntry(subject, "warn", empty_warning))
        else:
            entries.append(ContractAuditEntry(subject, "pass", "contract available"))
        return value

    probe("multica.version", multica.version)
    probe(
        "multica.runtime_daemon",
        lambda: multica.get_runtime(manifest.instance.runtime_id, manifest.instance.daemon_id),
    )
    probe("multica.projects", multica.list_projects)
    agents = probe("multica.agents", multica.list_agents)
    if agents:
        probe("multica.agent_environment", lambda: multica.get_agent_environment(agents[0].id))
    else:
        entries.append(ContractAuditEntry("multica.agent_environment", "warn", "no existing agent sample"))
    probe("multica.skills", multica.list_skills)
    capability = probe("multica.skill_import_capability", multica.inspect_skill_import)
    if capability is not None and not capability.get("dry_run", False):
        entries.append(ContractAuditEntry("multica.skill_import_dry_shape", "warn", "dry-run shape not advertised"))
    elif capability is not None:
        entries.append(ContractAuditEntry("multica.skill_import_dry_shape", "pass", "dry-run shape advertised"))

    probe("github.auth", github.auth_status)
    repositories = (manifest.control.github,) + tuple(
        repository.github for repository in manifest.repositories.values()
    )
    any_pull_request = False
    for repository in repositories:
        probe(f"github.repository.{repository}", lambda repository=repository: github.get_repository(repository))
        probe(f"github.projects.{repository}", lambda repository=repository: github.list_projects(repository))
        pulls = probe(
            f"github.pull_requests.{repository}",
            lambda repository=repository: github.list_pull_requests(repository),
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
