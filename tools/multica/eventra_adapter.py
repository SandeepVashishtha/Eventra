"""Eventra-specific composition of the reusable Multica delivery blueprint."""

from dataclasses import dataclass, replace
from pathlib import Path
import re
from types import MappingProxyType
from typing import Mapping
import uuid

from .blueprint import AgentSpec, TeamBlueprint, build_multi_repo_blueprint
from tools.multica_delivery.model import (
    ControlSpec,
    DeliveryManifest,
    InstanceSpec,
    IntegrationSuiteSpec,
    PolicySpec,
    RepositorySpec,
    SecretEnvSpec,
    ServiceSpec,
    SkillSource as DeliverySkillSource,
)
from tools.multica_delivery.metadata import canonical_json


PUBLIC_SKILL_URLS = {
    "using-superpowers": "https://github.com/obra/superpowers/tree/main/skills/using-superpowers",
    "brainstorming": "https://github.com/obra/superpowers/tree/main/skills/brainstorming",
    "writing-plans": "https://github.com/obra/superpowers/tree/main/skills/writing-plans",
    "executing-plans": "https://github.com/obra/superpowers/tree/main/skills/executing-plans",
    "test-driven-development": "https://github.com/obra/superpowers/tree/main/skills/test-driven-development",
    "systematic-debugging": "https://github.com/obra/superpowers/tree/main/skills/systematic-debugging",
    "requesting-code-review": "https://github.com/obra/superpowers/tree/main/skills/requesting-code-review",
    "receiving-code-review": "https://github.com/obra/superpowers/tree/main/skills/receiving-code-review",
    "verification-before-completion": "https://github.com/obra/superpowers/tree/main/skills/verification-before-completion",
    "vercel-react-best-practices": "https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices",
    "rest-api-conventions": "https://github.com/rrezartprebreza/spring-boot-skills/tree/main/skills/spring-boot-3/rest-api-conventions",
    "testing-pyramid": "https://github.com/rrezartprebreza/spring-boot-skills/tree/main/skills/spring-boot-3/testing-pyramid",
    "spring-security-jwt": "https://github.com/rrezartprebreza/spring-boot-skills/tree/main/skills/spring-boot-3/spring-security-jwt",
    "playwright-cli": "https://github.com/microsoft/playwright-cli/tree/main/skills/playwright-cli",
}


EVENTRA_COMPATIBILITY_LOCK_IDS = MappingProxyType(
    {
        "agent": MappingProxyType(
            {
                "workflow-watcher": "7fed6058-d0ab-42b7-9092-42df03c10890",
            }
        ),
        "autopilot": MappingProxyType(
            {
                "workflow-watcher": "4103d5e7-1b3b-4856-94a1-9ffe1b096812",
            }
        ),
        "trigger": MappingProxyType(
            {
                "workflow-watcher": "7a6dea91-03a1-4e70-8709-9d5a97ec7f77",
            }
        ),
    }
)


@dataclass(frozen=True)
class PhaseContract:
    """Canonical metadata template used while Eventra runs both workflows."""

    metadata_json: str


_COMPATIBILITY_PHASES = frozenset(
    {"implementation", "review", "qa", "repair", "smoke"}
)
_COMPATIBILITY_RESULTS = frozenset({"pass", "fail", "blocked"})
_COMMIT_SHA = re.compile(r"[0-9a-f]{40}\Z")


def legacy_phase_contract(
    candidate_shas: Mapping[str, str],
    phase: str,
    *,
    result: str,
    attempt: int,
    evidence_comment: str,
    pr_url: str | None = None,
) -> PhaseContract:
    """Use the real legacy builder as the independent compatibility oracle."""

    from .workflow import PhaseCompletion, build_phase_metadata

    if (
        not isinstance(candidate_shas, Mapping)
        or not candidate_shas
        or set(candidate_shas) - {"frontend", "backend"}
    ):
        raise ValueError("invalid Eventra phase contract")
    try:
        values = build_phase_metadata(
            PhaseCompletion(
                kind=phase,
                result=result,
                attempt=attempt,
                evidence_comment=evidence_comment,
                frontend_sha=candidate_shas.get("frontend"),
                backend_sha=candidate_shas.get("backend"),
                pr_url=pr_url,
            )
        )
    except (TypeError, ValueError):
        raise ValueError("invalid Eventra phase contract") from None
    return PhaseContract(canonical_json(values))


def render_phase_contract(
    manifest: DeliveryManifest,
    candidate_shas: Mapping[str, str],
    phase: str,
    *,
    result: str,
    attempt: int,
    evidence_comment: str,
    pr_url: str | None = None,
) -> PhaseContract:
    """Independently render one legacy-compatible manifest phase payload."""

    if (
        not isinstance(manifest, DeliveryManifest)
        or not isinstance(candidate_shas, Mapping)
        or not candidate_shas
        or set(candidate_shas) - set(manifest.repositories)
        or any(
            not isinstance(sha, str) or _COMMIT_SHA.fullmatch(sha) is None
            for sha in candidate_shas.values()
        )
        or phase not in _COMPATIBILITY_PHASES
        or result not in _COMPATIBILITY_RESULTS
        or not isinstance(attempt, int)
        or isinstance(attempt, bool)
        or not 0 <= attempt <= manifest.policy.max_repair_attempts
    ):
        raise ValueError("invalid delivery phase contract")
    try:
        uuid.UUID(evidence_comment)
    except (AttributeError, TypeError, ValueError):
        raise ValueError("invalid delivery phase contract") from None
    if phase in {"implementation", "repair"} and (
        len(candidate_shas) != 1 or pr_url is None
    ):
        raise ValueError("invalid delivery phase contract")
    if pr_url is not None:
        matching = tuple(
            key
            for key, repository in manifest.repositories.items()
            if re.fullmatch(
                rf"https://github\.com/{re.escape(repository.github)}/pull/[1-9][0-9]*",
                pr_url,
            )
        )
        if len(matching) != 1 or (
            phase in {"implementation", "repair"}
            and matching[0] not in candidate_shas
        ):
            raise ValueError("invalid delivery phase contract")

    namespace = manifest.instance.key
    values = {
        f"{namespace}.workflow.version": "1",
        f"{namespace}.phase.kind": phase,
        f"{namespace}.phase.result": result,
        f"{namespace}.phase.attempt": str(attempt),
        f"{namespace}.phase.evidence_comment": evidence_comment,
    }
    for repository, sha in candidate_shas.items():
        values[f"{namespace}.phase.sha.{repository}"] = sha
    if pr_url is not None:
        values[f"{namespace}.phase.pr"] = pr_url
    return PhaseContract(canonical_json(values))


def eventra_manifest(workspace: Path) -> DeliveryManifest:
    """Translate Eventra's current local topology into the generic model."""

    root = Path(workspace)
    current = build_eventra_config(
        "de500649-cada-4419-9d5d-279045e2eaae",
        "019fab98-bbad-7d17-b0b7-26e56dbe1b6f",
    )
    current_agents = {agent.role: agent for agent in current.agents}
    skills = MappingProxyType(
        {
            key: DeliverySkillSource(key, source.url, True)
            for key, source in current.skills.items()
        }
    )
    repositories = MappingProxyType(
        {
            "frontend": RepositorySpec(
                key="frontend",
                github="codeExploreHub/Eventra",
                project_title="Eventra Local Development",
                local_path=root / "Eventra",
                default_branch="master",
                depends_on=("backend",),
                commands=MappingProxyType(
                    {
                        "focused_test": ("npm", "run", "test:footer-meta"),
                        "test": ("npm", "run", "test:local-contract"),
                        "build": ("npm", "run", "build"),
                        "start": ("npm", "run", "dev:local"),
                        "smoke": ("npm", "run", "smoke:local"),
                    }
                ),
                skills=current_agents["frontend_engineer"].skill_keys,
                description=(
                    "Owns the browser user interface and local backend integration."
                ),
                services=(
                    ServiceSpec("frontend", 3000, "http://localhost:3000"),
                ),
            ),
            "backend": RepositorySpec(
                key="backend",
                github="codeExploreHub/Eventra-Backend",
                project_title="Eventra Backend Local Development",
                local_path=root / "Eventra-Backend",
                default_branch="master",
                depends_on=(),
                commands=MappingProxyType(
                    {
                        "focused_test": (
                            "scripts/test-local.sh",
                            "-Dtest=MetaControllerTests",
                        ),
                        "test": ("scripts/test-local.sh",),
                        "build": (
                            "./mvnw",
                            "-s",
                            ".mvn/settings-public.xml",
                            "-DskipTests",
                            "package",
                        ),
                        "start": ("scripts/run-local.sh",),
                        "smoke": ("scripts/smoke-local.sh",),
                    }
                ),
                skills=current_agents["backend_engineer"].skill_keys,
                description=(
                    "Owns the Spring Boot HTTP API and persistence behavior."
                ),
                services=(
                    ServiceSpec(
                        "backend",
                        8080,
                        "http://localhost:8080/actuator/health",
                    ),
                ),
                secret_env=MappingProxyType(
                    {
                        name: SecretEnvSpec(name, ("engineer", "integration-qa"))
                        for name in (
                            "JWT_SECRET",
                            "MAIL_USERNAME",
                            "MAIL_PASSWORD",
                        )
                    }
                ),
            ),
        }
    )
    return DeliveryManifest(
        schema_version=1,
        instance=InstanceSpec(
            key="eventra",
            display_name="Eventra",
            runtime_id="de500649-cada-4419-9d5d-279045e2eaae",
            daemon_id="019fab98-bbad-7d17-b0b7-26e56dbe1b6f",
            control_project="Eventra Delivery Control",
        ),
        control=ControlSpec(
            github="codeExploreHub/eventra-delivery-control",
            local_path=root / "Eventra-Delivery-Control",
        ),
        skill_registry=skills,
        repositories=repositories,
        integration_suites=(
            IntegrationSuiteSpec(
                key="frontend-backend",
                repositories=("backend", "frontend"),
                start_order=("backend", "frontend"),
                command_repository="frontend",
                command=("npm", "run", "smoke:local"),
            ),
        ),
        policy=PolicySpec(
            environment="development",
            automatic_merge=True,
            deployment="forbidden",
            max_repair_attempts=2,
            watcher_cron="*/30 * * * *",
            watcher_timezone="Asia/Shanghai",
        ),
        merge_order=("backend", "frontend"),
        role_skills=MappingProxyType(
            {
                "delivery-lead": current_agents["delivery_lead"].skill_keys,
                "independent-reviewer": current_agents[
                    "independent_reviewer"
                ].skill_keys,
                "integration-qa": current_agents["integration_qa"].skill_keys,
                "workflow-watcher": current_agents["workflow_watcher"].skill_keys,
            }
        ),
    )


@dataclass(frozen=True)
class SkillSource:
    """A named, auditable public skill origin."""

    key: str
    url: str


@dataclass(frozen=True)
class LocalResource:
    """One authoritative local Git checkout registered with Multica."""

    name: str
    local_path: str
    execution_mode: str
    resource_type: str = "local_directory"


@dataclass(frozen=True)
class AutopilotSpec:
    """One reconciled run-only scheduled workflow safety net."""

    title: str
    description_file: Path
    cron: str
    timezone: str
    label: str
    agent_role: str


@dataclass(frozen=True)
class ProjectConfig:
    """All Eventra-specific values consumed by the Multica provisioner."""

    runtime_id: str
    daemon_id: str
    project_title: str
    project_description: str
    project_context_file: Path
    backend_project_title: str
    backend_project_description: str
    backend_project_context_file: Path
    blueprint: TeamBlueprint
    agents: tuple[AgentSpec, ...]
    skills: Mapping[str, SkillSource]
    resources: tuple[LocalResource, ...]
    forbidden_paths: tuple[str, ...]
    watcher: AutopilotSpec


def _eventra_agents(blueprint: TeamBlueprint) -> tuple[AgentSpec, ...]:
    """Add stack skills and secret recipients without mutating the blueprint."""

    additions = {
        "frontend_engineer": ("vercel-react-best-practices",),
        "backend_engineer": (
            "rest-api-conventions",
            "testing-pyramid",
            "spring-security-jwt",
        ),
        "integration_qa": ("playwright-cli",),
    }
    backend_env_roles = {"backend_engineer", "integration_qa"}
    catalog = blueprint.agents + blueprint.operational_agents
    return tuple(
        replace(
            agent,
            skill_keys=agent.skill_keys + additions.get(agent.role, ()),
            needs_backend_env=agent.role in backend_env_roles,
        )
        for agent in catalog
    )


def build_eventra_config(runtime_id: str, daemon_id: str) -> ProjectConfig:
    """Build the isolated local-development configuration for Eventra."""

    blueprint = build_multi_repo_blueprint("Eventra")
    skills = MappingProxyType(
        {
            key: SkillSource(key=key, url=url)
            for key, url in PUBLIC_SKILL_URLS.items()
        }
    )
    return ProjectConfig(
        runtime_id=runtime_id,
        daemon_id=daemon_id,
        project_title="Eventra Local Development",
        project_description=(
            "Quality-gated local delivery across the authoritative Eventra frontend "
            "and backend repositories."
        ),
        project_context_file=Path(__file__).with_name("instructions") / "eventra_project.md",
        backend_project_title="Eventra Backend Local Development",
        backend_project_description=(
            "Backend child-issue delivery for the authoritative local Eventra "
            "backend repository."
        ),
        backend_project_context_file=(
            Path(__file__).with_name("instructions") / "eventra_backend_project.md"
        ),
        blueprint=blueprint,
        agents=_eventra_agents(blueprint),
        skills=skills,
        resources=(
            LocalResource(
                name="Eventra Frontend",
                local_path="/Users/didi/Eventra-workspace/Eventra",
                execution_mode="worktree",
            ),
            LocalResource(
                name="Eventra Backend",
                local_path="/Users/didi/Eventra-workspace/Eventra-Backend",
                execution_mode="worktree",
            ),
        ),
        forbidden_paths=("/Users/didi/Eventra-workspace/Eventra/Backend",),
        watcher=AutopilotSpec(
            title="Eventra · Stalled Work Watcher",
            description_file=(
                Path(__file__).with_name("instructions")
                / "stalled_work_watcher.md"
            ),
            cron="*/30 * * * *",
            timezone="Asia/Shanghai",
            label="Eventra stalled-work recovery",
            agent_role="workflow_watcher",
        ),
    )
