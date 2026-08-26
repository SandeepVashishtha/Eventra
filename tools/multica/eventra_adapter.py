"""Eventra-specific composition of the reusable Multica delivery blueprint."""

from dataclasses import dataclass, replace
from pathlib import Path
from types import MappingProxyType
from typing import Mapping

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


def _phase_contract_values(
    namespace: str,
    repository: str,
    phase: str,
    attempt: int,
) -> dict[str, str]:
    if (
        not namespace
        or repository not in {"frontend", "backend"}
        or phase not in _COMPATIBILITY_PHASES
        or not isinstance(attempt, int)
        or isinstance(attempt, bool)
        or not 0 <= attempt <= 2
    ):
        raise ValueError("invalid Eventra phase contract")
    values = {
        f"{namespace}.workflow.version": "1",
        f"{namespace}.phase.kind": phase,
        f"{namespace}.phase.result": "{result}",
        f"{namespace}.phase.attempt": str(attempt),
        f"{namespace}.phase.evidence_comment": "{evidence_comment_uuid}",
        f"{namespace}.phase.sha.{repository}": "{candidate_sha}",
    }
    if phase in {"implementation", "repair"}:
        values[f"{namespace}.phase.pr"] = "{pull_request_url}"
    return values


def legacy_phase_contract(
    repository: str,
    phase: str,
    *,
    attempt: int,
) -> PhaseContract:
    """Render the existing Eventra flat-metadata template."""

    values = _phase_contract_values("eventra", repository, phase, attempt)
    return PhaseContract(canonical_json(values))


def render_phase_contract(
    manifest: DeliveryManifest,
    repository: str,
    phase: str,
    *,
    attempt: int,
) -> PhaseContract:
    """Render a manifest-namespaced phase template for compatibility checks."""

    if not isinstance(manifest, DeliveryManifest) or repository not in manifest.repositories:
        raise ValueError("invalid delivery phase contract")
    values = _phase_contract_values(
        manifest.instance.key,
        repository,
        phase,
        attempt,
    )
    return PhaseContract(canonical_json(values))


def eventra_manifest(workspace: Path) -> DeliveryManifest:
    """Translate Eventra's current local topology into the generic model."""

    root = Path(workspace)
    skill_keys = (
        "using-superpowers",
        "test-driven-development",
        "systematic-debugging",
        "verification-before-completion",
        "vercel-react-best-practices",
        "rest-api-conventions",
        "testing-pyramid",
        "spring-security-jwt",
    )
    skills = MappingProxyType(
        {
            key: DeliverySkillSource(key, PUBLIC_SKILL_URLS[key], True)
            for key in skill_keys
        }
    )
    common_skills = (
        "using-superpowers",
        "test-driven-development",
        "systematic-debugging",
        "verification-before-completion",
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
                skills=common_skills + ("vercel-react-best-practices",),
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
                skills=common_skills
                + (
                    "rest-api-conventions",
                    "testing-pyramid",
                    "spring-security-jwt",
                ),
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
