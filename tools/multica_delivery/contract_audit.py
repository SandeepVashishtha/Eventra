"""Read-only contract audit across Multica and manifest-scoped GitHub state."""

from __future__ import annotations

from dataclasses import dataclass
import re
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
            pull_detail_shape(item, expected) for item in value
        )

    def field(value: object, name: str) -> object:
        return value.get(name) if isinstance(value, Mapping) else getattr(value, name, None)

    def pull_detail_shape(value: object, expected: str, number: int | None = None) -> bool:
        if isinstance(value, Mapping):
            repository = value.get("repository")
            actual_number = value.get("number")
            state = value.get("state")
            head_sha = value.get("head_sha")
            base_ref = value.get("base_ref")
            mergeable = value.get("mergeable")
        else:
            repository = getattr(value, "repository", None)
            actual_number = getattr(value, "number", None)
            state = getattr(value, "state", None)
            head_sha = getattr(value, "head_sha", None)
            base_ref = getattr(value, "base_ref", None)
            mergeable = getattr(value, "mergeable", "malformed")
        return (
            repository == expected
            and isinstance(actual_number, int)
            and not isinstance(actual_number, bool)
            and actual_number > 0
            and (number is None or actual_number == number)
            and state in {"open", "closed"}
            and isinstance(head_sha, str)
            and re.fullmatch(r"[0-9a-f]{40}", head_sha) is not None
            and isinstance(base_ref, str)
            and bool(base_ref)
            and not base_ref.startswith("-")
            and mergeable in {True, False, None}
        )

    def required_shape(value: object, expected: str, base_ref: str, sha: str) -> bool:
        if isinstance(value, Mapping):
            repository = value.get("repository")
            actual_base = value.get("base_ref")
            actual_sha = value.get("sha")
            strict = value.get("strict")
            required = value.get("required_contexts")
            required_checks = value.get("required_checks")
            successful = value.get("successful_contexts")
            successful_checks = value.get("successful_checks")
            passing = value.get("passing")
        else:
            repository = getattr(value, "repository", None)
            actual_base = getattr(value, "base_ref", None)
            actual_sha = getattr(value, "sha", None)
            strict = getattr(value, "strict", None)
            required = getattr(value, "required_contexts", None)
            required_checks = getattr(value, "required_checks", None)
            successful = getattr(value, "successful_contexts", None)
            successful_checks = getattr(value, "successful_checks", None)
            passing = getattr(value, "passing", None)

        def check_identity(identity: object) -> tuple[str, int] | None:
            context = field(identity, "context")
            app_id = field(identity, "app_id")
            if (
                not isinstance(context, str)
                or not context
                or not isinstance(app_id, int)
                or isinstance(app_id, bool)
                or app_id < 1
            ):
                return None
            return context, app_id

        required_identities = (
            tuple(check_identity(identity) for identity in required_checks)
            if isinstance(required_checks, tuple)
            else None
        )
        successful_identities = (
            tuple(check_identity(identity) for identity in successful_checks)
            if isinstance(successful_checks, tuple)
            else None
        )
        return (
            repository == expected
            and actual_base == base_ref
            and actual_sha == sha
            and isinstance(strict, bool)
            and isinstance(required, tuple)
            and isinstance(successful, tuple)
            and required_identities is not None
            and successful_identities is not None
            and all(identity is not None for identity in required_identities)
            and all(identity is not None for identity in successful_identities)
            and all(isinstance(context, str) and context for context in required)
            and all(isinstance(context, str) and context for context in successful)
            and len(set(required)) == len(required)
            and len(set(successful)) == len(successful)
            and len(set(required_identities)) == len(required_identities)
            and len(set(successful_identities)) == len(successful_identities)
            and set(successful) <= set(required)
            and set(successful_identities) <= set(required_identities)
            and isinstance(passing, bool)
            and passing
            is (
                successful == required
                and successful_identities == required_identities
            )
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
    sampled_pull_request = False
    validated_pull_request = False
    pull_contract_failure = False
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
        if pulls is None:
            pull_contract_failure = True
        if pulls:
            sampled_pull_request = True
            pull = pulls[0]
            pull_number = field(pull, "number")
            detail = probe(
                f"github.pull_request.{repository}",
                lambda repository=repository, number=pull_number: github.get_pull_request(repository, number),
                validate=lambda value, repository=repository, number=pull_number: pull_detail_shape(
                    value, repository, number
                ),
            )
            if detail is None:
                pull_contract_failure = True
                continue
            detail_base_ref = field(detail, "base_ref")
            detail_head_sha = field(detail, "head_sha")
            checks = probe(
                f"github.required_status_checks.{repository}",
                lambda repository=repository, base_ref=detail_base_ref, head_sha=detail_head_sha: github.required_status_checks(
                    repository,
                    base_ref,
                    head_sha,
                ),
                validate=lambda value, repository=repository, base_ref=detail_base_ref, head_sha=detail_head_sha: required_shape(
                    value,
                    repository,
                    base_ref,
                    head_sha,
                ),
            )
            if checks is None:
                pull_contract_failure = True
            else:
                validated_pull_request = True
    if validated_pull_request and not pull_contract_failure:
        pull_summary_status = "pass"
        pull_summary_detail = "sample contract available"
    elif sampled_pull_request or pull_contract_failure:
        pull_summary_status = "fail"
        pull_summary_detail = "sample contract failed"
    else:
        pull_summary_status = "warn"
        pull_summary_detail = "no existing pull request sample"
    entries.append(
        ContractAuditEntry(
            "github.pull_request_shape",
            pull_summary_status,
            pull_summary_detail,
        )
    )
    return ContractAuditReport(tuple(entries))
