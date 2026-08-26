"""Project-neutral definitions for a delivery team and operational agents."""

from dataclasses import dataclass, field
from pathlib import Path


@dataclass(frozen=True)
class AgentSpec:
    """A catalog entry and its persistent instruction contract."""

    role: str
    name: str
    description: str
    instructions_file: Path = field(repr=False)
    skill_keys: tuple[str, ...]
    needs_backend_env: bool = False


@dataclass(frozen=True)
class TeamBlueprint:
    """The immutable structure required to provision one delivery team."""

    squad_name: str
    squad_description: str
    squad_instructions_file: Path = field(repr=False)
    leader_role: str
    agents: tuple[AgentSpec, ...]
    operational_agents: tuple[AgentSpec, ...]


def build_multi_repo_blueprint(name_prefix: str) -> TeamBlueprint:
    """Build the standard delivery team and its operational agents."""

    instructions = Path(__file__).with_name("instructions")
    common = ("using-superpowers",)
    implementer = common + (
        "executing-plans",
        "test-driven-development",
        "systematic-debugging",
        "requesting-code-review",
        "receiving-code-review",
        "verification-before-completion",
    )
    agents = (
        AgentSpec(
            "delivery_lead",
            f"{name_prefix} Delivery Lead",
            "Coordinates multi-repository delivery without editing business code.",
            instructions / "delivery_lead.md",
            common + ("brainstorming", "writing-plans", "verification-before-completion"),
        ),
        AgentSpec(
            "frontend_engineer",
            f"{name_prefix} Frontend Engineer",
            "Owns assigned frontend implementation, tests, commits, and pull requests.",
            instructions / "frontend_engineer.md",
            implementer,
        ),
        AgentSpec(
            "backend_engineer",
            f"{name_prefix} Backend Engineer",
            "Owns assigned backend implementation, tests, contracts, commits, and pull requests.",
            instructions / "backend_engineer.md",
            implementer,
            needs_backend_env=True,
        ),
        AgentSpec(
            "integration_qa",
            f"{name_prefix} Integration QA",
            "Verifies exact frontend and backend commits without fixing business code.",
            instructions / "integration_qa.md",
            common + ("systematic-debugging", "verification-before-completion"),
        ),
        AgentSpec(
            "independent_reviewer",
            f"{name_prefix} Independent Reviewer",
            "Reviews exact commits independently and returns actionable findings.",
            instructions / "independent_reviewer.md",
            common + ("systematic-debugging", "verification-before-completion"),
        ),
    )
    operational_agents = (
        AgentSpec(
            "workflow_watcher",
            f"{name_prefix} Workflow Watcher",
            "Runs bounded workflow recovery without coordinating delivery or editing business code.",
            instructions / "workflow_watcher.md",
            common + ("systematic-debugging", "verification-before-completion"),
        ),
    )
    return TeamBlueprint(
        squad_name=f"{name_prefix} Local Delivery",
        squad_description="Coordinates quality-gated delivery across separate repositories.",
        squad_instructions_file=instructions / "squad.md",
        leader_role="delivery_lead",
        agents=agents,
        operational_agents=operational_agents,
    )
