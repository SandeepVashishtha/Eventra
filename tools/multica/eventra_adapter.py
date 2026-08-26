"""Eventra-specific composition of the reusable Multica delivery blueprint."""

from dataclasses import dataclass, replace
from pathlib import Path
from types import MappingProxyType
from typing import Mapping

from .blueprint import AgentSpec, TeamBlueprint, build_multi_repo_blueprint


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
