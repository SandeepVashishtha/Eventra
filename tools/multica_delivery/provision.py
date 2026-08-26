"""Deterministic, manifest-driven reconciliation of one delivery instance."""

from __future__ import annotations

from dataclasses import dataclass
from types import MappingProxyType
from typing import Callable, Mapping, Protocol
from urllib.parse import urlparse

from .github_client import RepositoryInfo
from .manifest import manifest_digest
from .model import DeliveryManifest, FrameworkLock, RepositorySpec
from .multica_client import (
    AgentState,
    AutopilotState,
    MulticaClient,
    ProjectResourceState,
    ProjectState,
    SkillState,
    SquadMemberState,
    SquadState,
    TriggerState,
)


SKILL_VERSION = "1.0.0"
ENGINE_VERSION = "1.0.0"
WORKFLOW_METADATA_VERSION = 1
SUPPORTED_MULTICA_CLI = ">=0.4,<0.5"
WORKTREE_CAPABILITY = "local-worktree-v1"

_FIXED_AGENT_KEYS = (
    "delivery-lead",
    "independent-reviewer",
    "integration-qa",
    "workflow-watcher",
)
_VERIFICATION_SKILLS = frozenset(
    {
        "using-superpowers",
        "systematic-debugging",
        "verification-before-completion",
    }
)
_WATCHER_SKILLS = _VERIFICATION_SKILLS | {"workflow-use"}
_RESTRICTED_SKILL_AGENTS = frozenset({"integration-qa", "workflow-watcher"})


class ProvisionError(RuntimeError):
    """A sanitized desired-state, conflict, or reconciliation failure."""


@dataclass(frozen=True)
class ReconcileAction:
    """One redacted semantic action in deterministic execution order."""

    kind: str
    key: str
    changed_fields: tuple[str, ...] = ()


@dataclass(frozen=True)
class ReconcileResult:
    actions: tuple[ReconcileAction, ...]
    desired_agent_keys: tuple[str, ...]
    lock: FrameworkLock

    @property
    def mutation_count(self) -> int:
        """Count planned/applied external mutations, excluding lock emission."""

        return sum(action.kind != "lock.update" for action in self.actions)


class GitHubProvisioningClient(Protocol):
    """Read-only GitHub surface needed to validate manifest repositories."""

    def get_repository(self, repository: str) -> RepositoryInfo: ...


@dataclass(frozen=True)
class _DesiredProject:
    key: str
    title: str
    description: str


@dataclass(frozen=True)
class _DesiredAgent:
    key: str
    name: str
    description: str
    instructions: str
    skill_keys: tuple[str, ...]
    environment_keys: tuple[str, ...]


@dataclass(frozen=True)
class _DesiredState:
    projects: tuple[_DesiredProject, ...]
    agents: tuple[_DesiredAgent, ...]
    skill_keys: tuple[str, ...]
    squad_name: str
    squad_description: str
    squad_instructions: str
    autopilot_title: str
    autopilot_description: str
    trigger_label: str


@dataclass(frozen=True)
class _Snapshot:
    skills: Mapping[str, SkillState | None]
    all_skills: Mapping[str, SkillState]
    projects: Mapping[str, ProjectState | None]
    resources: Mapping[str, ProjectResourceState | None]
    agents: Mapping[str, AgentState | None]
    bindings: Mapping[str, tuple[str, ...]]
    environments: Mapping[str, tuple[str, ...]]
    squad: SquadState | None
    members: tuple[SquadMemberState, ...]
    autopilot: AutopilotState | None
    trigger: TriggerState | None


def _frozen(values: Mapping[str, object]) -> Mapping[str, object]:
    return MappingProxyType(dict(values))


def _unique_target(records, field: str, value: str, label: str):
    matches = tuple(record for record in records if getattr(record, field) == value)
    if len(matches) > 1:
        raise ProvisionError(f"duplicate {label} target state")
    return matches[0] if matches else None


class Provisioner:
    """Reconcile exact instance-scoped targets while preserving unrelated state."""

    def __init__(
        self,
        multica: MulticaClient,
        github: GitHubProvisioningClient,
    ) -> None:
        self.multica = multica
        self.github = github

    def reconcile(
        self,
        manifest: DeliveryManifest,
        lock: FrameworkLock,
        *,
        apply: bool,
        secret_lookup: Callable[[str], str],
    ) -> ReconcileResult:
        self._validate_local_inputs(manifest, lock)
        desired = self._desired_state(manifest)
        self._validate_external_scope(manifest)
        snapshot = self._snapshot(manifest, desired, lock)
        actions = self._plan(manifest, lock, desired, snapshot)
        agent_keys = tuple(agent.key for agent in desired.agents)
        if not apply:
            return ReconcileResult(actions, agent_keys, lock)
        if not actions:
            return ReconcileResult((), agent_keys, lock)

        try:
            self._apply_skills(manifest, desired)
            self._apply_projects(manifest, desired, lock)
            self._apply_worktrees(manifest, desired)
            self._apply_agents(manifest, desired, lock)
            self._apply_bindings_and_environment(
                manifest,
                desired,
                secret_lookup,
            )
            self._apply_squad(manifest, desired, lock)
            self._apply_autopilot(manifest, desired, lock)
        except ProvisionError:
            raise
        except Exception:
            raise ProvisionError("provisioning mutation failed") from None

        final_snapshot = self._snapshot(manifest, desired, lock)
        updated_lock = self._build_lock(manifest, lock, final_snapshot)
        remaining = self._plan(manifest, updated_lock, desired, final_snapshot)
        if remaining:
            raise ProvisionError("authoritative post-write state did not converge")
        return ReconcileResult(actions, agent_keys, updated_lock)

    @staticmethod
    def _validate_local_inputs(
        manifest: DeliveryManifest,
        lock: FrameworkLock,
    ) -> None:
        for repository_key, repository in manifest.repositories.items():
            if len(repository.skills) != len(set(repository.skills)):
                raise ProvisionError(
                    f"duplicate repository skill for {repository_key}"
                )
        for category, identities in lock.resource_ids.items():
            values = tuple(identities.values())
            if len(values) != len(set(values)):
                raise ProvisionError(f"duplicate lock identity in {category}")

    def _validate_external_scope(self, manifest: DeliveryManifest) -> None:
        try:
            version = self.multica.version()
            runtime = self.multica.get_runtime(
                manifest.instance.runtime_id,
                manifest.instance.daemon_id,
            )
        except Exception:
            raise ProvisionError("Multica runtime preflight failed") from None
        if not version.startswith("0.4."):
            raise ProvisionError("unsupported Multica CLI version")
        if (
            runtime.id != manifest.instance.runtime_id
            or runtime.daemon_id != manifest.instance.daemon_id
            or runtime.status != "online"
            or WORKTREE_CAPABILITY not in runtime.capabilities
        ):
            raise ProvisionError("Multica runtime/daemon preflight failed")

        repositories = (("control", manifest.control.github, None),) + tuple(
            (key, repository.github, repository.default_branch)
            for key, repository in sorted(manifest.repositories.items())
        )
        for key, repository, default_branch in repositories:
            try:
                observed = self.github.get_repository(repository)
            except Exception:
                raise ProvisionError(f"GitHub repository preflight failed for {key}") from None
            if observed.repository != repository:
                raise ProvisionError(f"GitHub repository identity mismatch for {key}")
            if default_branch is not None and observed.default_branch != default_branch:
                raise ProvisionError(f"GitHub default branch mismatch for {key}")

    def _desired_state(self, manifest: DeliveryManifest) -> _DesiredState:
        if manifest.policy.watcher_cron != "*/30 * * * *":
            raise ProvisionError("Watcher requires the approved 30-minute schedule")
        for key, source in manifest.skill_registry.items():
            parsed = urlparse(source.url)
            if (
                not source.approved
                or parsed.scheme != "https"
                or parsed.hostname != "github.com"
                or parsed.username is not None
                or parsed.password is not None
                or parsed.query
                or parsed.fragment
            ):
                raise ProvisionError(f"skill {key!r} is not an approved public origin")

        display = manifest.instance.display_name
        projects = (
            _DesiredProject(
                "control",
                manifest.instance.control_project,
                f"{display} delivery control for {manifest.control.github}.",
            ),
        ) + tuple(
            _DesiredProject(
                key,
                repository.project_title,
                self._repository_project_description(repository),
            )
            for key, repository in sorted(manifest.repositories.items())
        )

        integration_repositories = {
            repository
            for suite in manifest.integration_suites
            for repository in suite.repositories
        }
        integration_skills = {
            skill
            for repository_key in integration_repositories
            for skill in manifest.repositories[repository_key].skills
        }
        all_repository_skills = {
            skill
            for repository in manifest.repositories.values()
            for skill in repository.skills
        }
        available = set(manifest.skill_registry)
        base = tuple(key for key in ("using-superpowers",) if key in available)
        reviewer = tuple(sorted(all_repository_skills & _VERIFICATION_SKILLS))
        integration = tuple(sorted(integration_skills & _VERIFICATION_SKILLS))
        watcher = tuple(sorted(available & _WATCHER_SKILLS))
        environment = self._environment_recipients(manifest)
        fixed = (
            _DesiredAgent(
                "delivery-lead",
                f"{display} Delivery Lead",
                f"Coordinates manifest-scoped delivery for {display}.",
                "Coordinate parent delivery work across only the manifest Projects and repositories.",
                base,
                environment["delivery-lead"],
            ),
            _DesiredAgent(
                "independent-reviewer",
                f"{display} Independent Reviewer",
                f"Reviews exact candidate commits for {display}.",
                "Independently review exact candidate SHAs and record evidence without implementation authority.",
                reviewer,
                environment["independent-reviewer"],
            ),
            _DesiredAgent(
                "integration-qa",
                f"{display} Integration QA",
                f"Verifies declared integration suites for {display}.",
                "Run only manifest-declared repository and integration verification against exact candidate SHAs.",
                integration,
                environment["integration-qa"],
            ),
            _DesiredAgent(
                "workflow-watcher",
                f"{display} Workflow Watcher",
                f"Performs bounded stalled-work recovery for {display}.",
                (
                    "Reread workflow state and perform at most one approved recovery "
                    "action; never implement, merge, or deploy."
                ),
                watcher,
                environment["workflow-watcher"],
            ),
        )
        engineers = tuple(
            _DesiredAgent(
                f"{key}-engineer",
                f"{display} {key} Engineer",
                repository.description or f"Owns implementation for {repository.github}.",
                (
                    f"Implement only repository {repository.github} in Project "
                    f"{repository.project_title} at {repository.local_path}."
                ),
                tuple(repository.skills),
                environment[f"{key}-engineer"],
            )
            for key, repository in sorted(manifest.repositories.items())
        )
        return _DesiredState(
            projects,
            fixed + engineers,
            tuple(sorted(manifest.skill_registry)),
            f"{display} Delivery Squad",
            f"Manifest-scoped delivery team for {display}.",
            "Coordinate implementation, independent review, and integration QA; deployment is forbidden.",
            f"{display} Workflow Watcher",
            "Run-only bounded recovery for active manifest-scoped parent delivery Issues.",
            f"{manifest.instance.key} stalled-work recovery",
        )

    @staticmethod
    def _repository_project_description(repository: RepositorySpec) -> str:
        prefix = repository.description or f"Delivery work for {repository.github}."
        return (
            f"{prefix}\nRepository: {repository.github}\n"
            f"Default branch: {repository.default_branch}"
        )

    @staticmethod
    def _environment_recipients(
        manifest: DeliveryManifest,
    ) -> Mapping[str, tuple[str, ...]]:
        keys = list(_FIXED_AGENT_KEYS) + [
            f"{repository}-engineer" for repository in sorted(manifest.repositories)
        ]
        result: dict[str, set[str]] = {key: set() for key in keys}
        for repository_key, repository in manifest.repositories.items():
            for secret_name, specification in repository.secret_env.items():
                for recipient in specification.recipients:
                    target = (
                        f"{repository_key}-engineer"
                        if recipient == "engineer"
                        else recipient
                    )
                    result[target].add(secret_name)
        return MappingProxyType(
            {key: tuple(sorted(values)) for key, values in result.items()}
        )

    def _snapshot(
        self,
        manifest: DeliveryManifest,
        desired: _DesiredState,
        lock: FrameworkLock,
        *,
        validate_lock: bool = True,
    ) -> _Snapshot:
        try:
            skill_records = self.multica.list_skills()
            project_records = self.multica.list_projects()
            agent_records = self.multica.list_agents()
            squad_records = self.multica.list_squads()
            autopilot_records = self.multica.list_autopilots()
        except Exception:
            raise ProvisionError("provisioning preflight read failed") from None

        skill_by_id = self._by_unique_id(skill_records, "skill")
        project_by_id = self._by_unique_id(project_records, "Project")
        agent_by_id = self._by_unique_id(agent_records, "agent")
        squad_by_id = self._by_unique_id(squad_records, "Squad")
        autopilot_by_id = self._by_unique_id(autopilot_records, "Autopilot")

        skills: dict[str, SkillState | None] = {}
        for key in desired.skill_keys:
            state = self._locked_target(
                skill_records,
                lock,
                category="skill",
                key=key,
                field="name",
                value=key,
                label="skill",
                allow_rename=False,
            )
            if state is not None and state.source_url != manifest.skill_registry[key].url:
                raise ProvisionError(f"skill {key!r} has a same-name/different-origin conflict")
            skills[key] = state

        projects = {
            project.key: self._locked_target(
                project_records,
                lock,
                category="project",
                key=project.key,
                field="title",
                value=project.title,
                label="Project",
            )
            for project in desired.projects
        }
        resources: dict[str, ProjectResourceState | None] = {
            key: None for key in manifest.repositories
        }
        for key, project in projects.items():
            if project is None:
                continue
            try:
                records = self.multica.list_project_resources(project.id)
            except Exception:
                raise ProvisionError(f"Project resource preflight failed for {key}") from None
            self._by_unique_id(records, "Project resource")
            if key == "control":
                if records:
                    raise ProvisionError("foreign target resource in control Project")
                continue
            wanted = str(manifest.repositories[key].local_path)
            matches = []
            for record in records:
                if (
                    record.project_id != project.id
                    or record.resource_type != "local_directory"
                    or record.local_path != wanted
                    or record.execution_mode not in {"in_place", "worktree"}
                ):
                    raise ProvisionError(f"foreign target resource in Project {key}")
                matches.append(record)
            if len(matches) > 1:
                raise ProvisionError(f"duplicate Project resource target state for {key}")
            resources[key] = matches[0] if matches else None

        agents: dict[str, AgentState | None] = {}
        bindings: dict[str, tuple[str, ...]] = {}
        environments: dict[str, tuple[str, ...]] = {}
        for agent in desired.agents:
            state = self._locked_target(
                agent_records,
                lock,
                category="agent",
                key=agent.key,
                field="name",
                value=agent.name,
                label="agent",
            )
            agents[agent.key] = state
            if state is None:
                bindings[agent.key] = ()
                environments[agent.key] = ()
                continue
            try:
                binding_ids = tuple(self.multica.list_agent_skill_ids(state.id))
                environment = self.multica.get_agent_environment(state.id)
            except Exception:
                raise ProvisionError(f"agent preflight failed for {agent.key}") from None
            if len(binding_ids) != len(set(binding_ids)):
                raise ProvisionError(f"duplicate target skill binding for {agent.key}")
            if any(identifier not in skill_by_id for identifier in binding_ids):
                raise ProvisionError(f"foreign target skill binding for {agent.key}")
            if environment.agent_id != state.id or len(environment.keys) != len(
                set(environment.keys)
            ):
                raise ProvisionError(f"invalid target environment state for {agent.key}")
            foreign_environment = set(environment.keys) - set(agent.environment_keys)
            if foreign_environment:
                raise ProvisionError(f"foreign target environment binding for {agent.key}")
            bindings[agent.key] = tuple(sorted(binding_ids))
            environments[agent.key] = tuple(sorted(environment.keys))

        squad = self._locked_target(
            squad_records,
            lock,
            category="squad",
            key="delivery",
            field="name",
            value=desired.squad_name,
            label="Squad",
        )
        members: tuple[SquadMemberState, ...] = ()
        if squad is not None:
            try:
                members = tuple(self.multica.list_squad_members(squad.id))
            except Exception:
                raise ProvisionError("Squad member preflight failed") from None
            member_ids = [member.member_id for member in members]
            if (
                len(member_ids) != len(set(member_ids))
                or any(member.member_type != "agent" for member in members)
            ):
                raise ProvisionError("duplicate/foreign target Squad member state")
            desired_existing_ids = {
                agent.id
                for key, agent in agents.items()
                if agent is not None and key != "workflow-watcher"
            }
            if set(member_ids) - desired_existing_ids:
                raise ProvisionError("foreign target Squad member state")
            lead = agents.get("delivery-lead")
            lead_member = (
                None if lead is None else next(
                    (member for member in members if member.member_id == lead.id),
                    None,
                )
            )
            if (
                lead is None
                or squad.leader_id != lead.id
                or lead_member is None
                or lead_member.role != "leader"
            ):
                raise ProvisionError("Squad leader state is invalid")

        autopilot = self._locked_target(
            autopilot_records,
            lock,
            category="autopilot",
            key="workflow-watcher",
            field="title",
            value=desired.autopilot_title,
            label="Autopilot",
        )
        trigger = None
        if autopilot is not None:
            if autopilot.assignee_type != "agent":
                raise ProvisionError("foreign target Autopilot assignee state")
            try:
                trigger_records = tuple(
                    self.multica.list_autopilot_triggers(autopilot.id)
                )
            except Exception:
                raise ProvisionError("Autopilot trigger preflight failed") from None
            self._by_unique_id(trigger_records, "Autopilot trigger")
            if len(trigger_records) > 1 or any(
                item.autopilot_id != autopilot.id or item.kind != "schedule"
                for item in trigger_records
            ):
                raise ProvisionError("duplicate/foreign target trigger state")
            trigger = trigger_records[0] if trigger_records else None

        snapshot = _Snapshot(
            _frozen(skills),
            _frozen(skill_by_id),
            _frozen(projects),
            _frozen(resources),
            _frozen(agents),
            _frozen(bindings),
            _frozen(environments),
            squad,
            members,
            autopilot,
            trigger,
        )
        self._validate_restricted_bindings(desired, snapshot)
        if validate_lock:
            self._validate_lock_identities(
                lock,
                snapshot,
                project_by_id,
                agent_by_id,
                squad_by_id,
                autopilot_by_id,
            )
        return snapshot

    @staticmethod
    def _by_unique_id(records, label: str):
        values = {record.id: record for record in records}
        if len(values) != len(records):
            raise ProvisionError(f"duplicate {label} identity")
        return values

    @staticmethod
    def _locked_target(
        records,
        lock: FrameworkLock,
        *,
        category: str,
        key: str,
        field: str,
        value: str,
        label: str,
        allow_rename: bool = True,
    ):
        exact = _unique_target(records, field, value, label)
        locked_id = lock.resource_ids.get(category, {}).get(key)
        if locked_id is None:
            return exact
        locked = tuple(record for record in records if record.id == locked_id)
        if len(locked) != 1:
            raise ProvisionError(f"foreign lock identity for {category}.{key}")
        target = locked[0]
        if exact is not None and exact.id != target.id:
            raise ProvisionError(f"foreign target {label} state for {key}")
        if not allow_rename and getattr(target, field) != value:
            raise ProvisionError(f"foreign lock identity for {category}.{key}")
        return target

    @staticmethod
    def _validate_restricted_bindings(
        desired: _DesiredState,
        snapshot: _Snapshot,
    ) -> None:
        desired_by_key = {agent.key: agent for agent in desired.agents}
        desired_skill_ids = {
            key: skill.id
            for key, skill in snapshot.skills.items()
            if skill is not None
        }
        for agent_key in _RESTRICTED_SKILL_AGENTS:
            state = snapshot.agents[agent_key]
            if state is None:
                continue
            allowed = {
                desired_skill_ids[key]
                for key in desired_by_key[agent_key].skill_keys
                if key in desired_skill_ids
            }
            if set(snapshot.bindings[agent_key]) - allowed:
                raise ProvisionError(f"foreign target skill binding for {agent_key}")

    def _validate_lock_identities(
        self,
        lock: FrameworkLock,
        snapshot: _Snapshot,
        project_by_id: Mapping[str, ProjectState],
        agent_by_id: Mapping[str, AgentState],
        squad_by_id: Mapping[str, SquadState],
        autopilot_by_id: Mapping[str, AutopilotState],
    ) -> None:
        categories = {
            "skill": snapshot.skills,
            "project": snapshot.projects,
            "worktree": snapshot.resources,
            "agent": snapshot.agents,
            "squad": {"delivery": snapshot.squad},
            "autopilot": {"workflow-watcher": snapshot.autopilot},
            "trigger": {"workflow-watcher": snapshot.trigger},
        }
        live_by_category = {
            "skill": snapshot.all_skills,
            "project": project_by_id,
            "agent": agent_by_id,
            "squad": squad_by_id,
            "autopilot": autopilot_by_id,
        }
        for category, desired_records in categories.items():
            locked = lock.resource_ids.get(category, {})
            for key, record in desired_records.items():
                locked_id = locked.get(key)
                if locked_id is None:
                    continue
                if record is None or record.id != locked_id:
                    raise ProvisionError(
                        f"foreign lock identity for {category}.{key}"
                    )
                live = live_by_category.get(category)
                if live is not None and locked_id not in live:
                    raise ProvisionError(
                        f"foreign lock identity for {category}.{key}"
                    )

    def _plan(
        self,
        manifest: DeliveryManifest,
        lock: FrameworkLock,
        desired: _DesiredState,
        snapshot: _Snapshot,
    ) -> tuple[ReconcileAction, ...]:
        actions: list[ReconcileAction] = []
        for key in desired.skill_keys:
            if snapshot.skills[key] is None:
                actions.append(ReconcileAction("skill.import", key))

        for project in desired.projects:
            observed = snapshot.projects[project.key]
            if observed is None:
                actions.append(ReconcileAction("project.create", project.key))
            else:
                changed = tuple(
                    field
                    for field in ("title", "description")
                    if getattr(observed, field) != getattr(project, field)
                )
                if changed:
                    actions.append(ReconcileAction("project.update", project.key, changed))

        for key, repository in sorted(manifest.repositories.items()):
            observed = snapshot.resources[key]
            if observed is None:
                actions.append(ReconcileAction("worktree.create", key))
            else:
                changed = tuple(
                    field
                    for field, wanted in (
                        ("daemon_id", manifest.instance.daemon_id),
                        ("execution_mode", "worktree"),
                    )
                    if getattr(observed, field) != wanted
                )
                if changed:
                    actions.append(ReconcileAction("worktree.update", key, changed))

        desired_agents = {agent.key: agent for agent in desired.agents}
        for agent in desired.agents:
            observed = snapshot.agents[agent.key]
            if observed is None:
                actions.append(ReconcileAction("agent.create", agent.key))
            else:
                changed = tuple(
                    field
                    for field, wanted in self._agent_fields(manifest, agent).items()
                    if getattr(observed, field) != wanted
                )
                if changed:
                    actions.append(ReconcileAction("agent.update", agent.key, changed))

        for agent in desired.agents:
            observed_ids = set(snapshot.bindings[agent.key])
            for skill_key in agent.skill_keys:
                skill = snapshot.skills[skill_key]
                if skill is None or skill.id not in observed_ids:
                    actions.append(
                        ReconcileAction("agent.skill.add", f"{agent.key}:{skill_key}")
                    )
            if tuple(sorted(snapshot.environments[agent.key])) != agent.environment_keys:
                actions.append(
                    ReconcileAction(
                        "agent.environment.set",
                        agent.key,
                        agent.environment_keys,
                    )
                )

        desired_agent_ids = {
            key: agent.id for key, agent in snapshot.agents.items() if agent is not None
        }
        lead_id = desired_agent_ids.get("delivery-lead")
        if snapshot.squad is None:
            actions.append(ReconcileAction("squad.create", "delivery"))
        elif lead_id is None or not self._squad_matches(
            snapshot.squad,
            desired,
            lead_id,
        ):
            actions.append(ReconcileAction("squad.update", "delivery"))
        members = {member.member_id: member for member in snapshot.members}
        for agent in desired.agents:
            if agent.key in {"delivery-lead", "workflow-watcher"}:
                continue
            agent_id = desired_agent_ids.get(agent.key)
            observed = None if agent_id is None else members.get(agent_id)
            if observed is None:
                actions.append(ReconcileAction("squad.member.add", agent.key))
            elif observed.role != agent.key:
                actions.append(ReconcileAction("squad.member.update", agent.key))

        control_id = (
            None
            if snapshot.projects["control"] is None
            else snapshot.projects["control"].id
        )
        watcher_id = desired_agent_ids.get("workflow-watcher")
        if snapshot.autopilot is None:
            actions.append(ReconcileAction("autopilot.create", "workflow-watcher"))
        elif control_id is None or watcher_id is None or not self._autopilot_matches(
            snapshot.autopilot,
            desired,
            control_id,
            watcher_id,
        ):
            actions.append(ReconcileAction("autopilot.update", "workflow-watcher"))
        if snapshot.trigger is None:
            actions.append(ReconcileAction("trigger.create", "workflow-watcher"))
        elif not self._trigger_matches(snapshot.trigger, manifest, desired):
            actions.append(ReconcileAction("trigger.update", "workflow-watcher"))

        expected_lock = self._build_lock_or_none(manifest, lock, snapshot)
        if actions or expected_lock is None or expected_lock != lock:
            actions.append(ReconcileAction("lock.update", "framework"))
        return tuple(actions)

    @staticmethod
    def _agent_fields(
        manifest: DeliveryManifest,
        agent: _DesiredAgent,
    ) -> Mapping[str, object]:
        return {
            "name": agent.name,
            "description": agent.description,
            "instructions": agent.instructions,
            "runtime_id": manifest.instance.runtime_id,
            "visibility": "workspace",
            "max_concurrent_tasks": 1,
        }

    @staticmethod
    def _squad_matches(
        observed: SquadState,
        desired: _DesiredState,
        leader_id: str,
    ) -> bool:
        return (
            observed.name == desired.squad_name
            and observed.description == desired.squad_description
            and observed.instructions == desired.squad_instructions
            and observed.leader_id == leader_id
        )

    @staticmethod
    def _autopilot_matches(
        observed: AutopilotState,
        desired: _DesiredState,
        project_id: str,
        watcher_id: str,
    ) -> bool:
        return (
            observed.title == desired.autopilot_title
            and observed.description == desired.autopilot_description
            and observed.execution_mode == "run_only"
            and observed.project_id == project_id
            and observed.assignee_id == watcher_id
            and observed.assignee_type == "agent"
            and observed.status == "active"
        )

    @staticmethod
    def _trigger_matches(
        observed: TriggerState,
        manifest: DeliveryManifest,
        desired: _DesiredState,
    ) -> bool:
        return (
            observed.kind == "schedule"
            and observed.cron_expression == manifest.policy.watcher_cron
            and observed.timezone == manifest.policy.watcher_timezone
            and observed.enabled is True
            and observed.label == desired.trigger_label
        )

    def _apply_skills(
        self,
        manifest: DeliveryManifest,
        desired: _DesiredState,
    ) -> None:
        for key in desired.skill_keys:
            records = self.multica.list_skills()
            observed = _unique_target(records, "name", key, "skill")
            source = manifest.skill_registry[key].url
            if observed is None:
                self.multica.import_skill(source)
                records = self.multica.list_skills()
                observed = _unique_target(records, "name", key, "skill")
            if observed is None or observed.source_url != source:
                raise ProvisionError(f"skill reconciliation failed for {key}")

    def _apply_projects(
        self,
        manifest: DeliveryManifest,
        desired: _DesiredState,
        lock: FrameworkLock,
    ) -> None:
        for project in desired.projects:
            records = self.multica.list_projects()
            observed = self._locked_target(
                records,
                lock,
                category="project",
                key=project.key,
                field="title",
                value=project.title,
                label="Project",
            )
            updated_id = None
            if observed is None:
                self.multica.create_project(
                    title=project.title,
                    description=project.description,
                )
            elif (
                observed.title != project.title
                or observed.description != project.description
            ):
                self.multica.update_project(
                    observed.id,
                    title=project.title,
                    description=project.description,
                )
                updated_id = observed.id
            records = self.multica.list_projects()
            final = _unique_target(records, "title", project.title, "Project")
            if (
                final is None
                or final.title != project.title
                or final.description != project.description
                or (updated_id is not None and final.id != updated_id)
            ):
                raise ProvisionError(f"Project reconciliation failed for {project.key}")

    def _apply_worktrees(
        self,
        manifest: DeliveryManifest,
        desired: _DesiredState,
    ) -> None:
        desired_projects = {project.key: project for project in desired.projects}
        for key, repository in sorted(manifest.repositories.items()):
            projects = self.multica.list_projects()
            project = _unique_target(
                projects,
                "title",
                desired_projects[key].title,
                "Project",
            )
            if project is None:
                raise ProvisionError(f"Project reconciliation failed for {key}")
            records = self.multica.list_project_resources(project.id)
            observed = self._exact_worktree(records, project.id, str(repository.local_path), key)
            updated_id = None
            if observed is None:
                self.multica.add_project_worktree(
                    project.id,
                    local_path=str(repository.local_path),
                    daemon_id=manifest.instance.daemon_id,
                    execution_mode="worktree",
                )
            elif (
                observed.daemon_id != manifest.instance.daemon_id
                or observed.execution_mode != "worktree"
            ):
                self.multica.update_project_worktree(
                    project.id,
                    observed.id,
                    daemon_id=manifest.instance.daemon_id,
                    execution_mode="worktree",
                )
                updated_id = observed.id
            final = self._exact_worktree(
                self.multica.list_project_resources(project.id),
                project.id,
                str(repository.local_path),
                key,
            )
            if (
                final is None
                or final.daemon_id != manifest.instance.daemon_id
                or final.execution_mode != "worktree"
            ):
                raise ProvisionError(f"worktree reconciliation failed for {key}")
            if updated_id is not None and final.id != updated_id:
                raise ProvisionError(f"worktree identity changed for {key}")

    @staticmethod
    def _exact_worktree(records, project_id: str, local_path: str, key: str):
        matches = []
        for record in records:
            if (
                record.project_id != project_id
                or record.resource_type != "local_directory"
                or record.local_path != local_path
                or record.execution_mode not in {"in_place", "worktree"}
            ):
                raise ProvisionError(f"foreign target resource in Project {key}")
            matches.append(record)
        if len(matches) > 1:
            raise ProvisionError(f"duplicate Project resource target state for {key}")
        return matches[0] if matches else None

    def _apply_agents(
        self,
        manifest: DeliveryManifest,
        desired: _DesiredState,
        lock: FrameworkLock,
    ) -> None:
        for agent in desired.agents:
            fields = self._agent_fields(manifest, agent)
            records = self.multica.list_agents()
            observed = self._locked_target(
                records,
                lock,
                category="agent",
                key=agent.key,
                field="name",
                value=agent.name,
                label="agent",
            )
            updated_id = None
            if observed is None:
                self.multica.create_agent(**fields)
            elif any(getattr(observed, key) != value for key, value in fields.items()):
                self.multica.update_agent(observed.id, **fields)
                updated_id = observed.id
            final = _unique_target(
                self.multica.list_agents(),
                "name",
                agent.name,
                "agent",
            )
            if final is None or any(
                getattr(final, key) != value for key, value in fields.items()
            ):
                raise ProvisionError(f"agent reconciliation failed for {agent.key}")
            if updated_id is not None and final.id != updated_id:
                raise ProvisionError(f"agent identity changed for {agent.key}")

    def _apply_bindings_and_environment(
        self,
        manifest: DeliveryManifest,
        desired: _DesiredState,
        secret_lookup: Callable[[str], str],
    ) -> None:
        skill_records = self.multica.list_skills()
        skills = {
            key: _unique_target(skill_records, "name", key, "skill")
            for key in desired.skill_keys
        }
        for agent in desired.agents:
            observed = _unique_target(
                self.multica.list_agents(),
                "name",
                agent.name,
                "agent",
            )
            if observed is None:
                raise ProvisionError(f"agent reconciliation failed for {agent.key}")
            existing = set(self.multica.list_agent_skill_ids(observed.id))
            for skill_key in agent.skill_keys:
                skill = skills[skill_key]
                if skill is None:
                    raise ProvisionError(f"skill reconciliation failed for {skill_key}")
                if skill.id not in existing:
                    self.multica.add_agent_skill(observed.id, skill.id)
                    final = set(self.multica.list_agent_skill_ids(observed.id))
                    if skill.id not in final or not existing.issubset(final):
                        raise ProvisionError(
                            f"agent skill reconciliation failed for {agent.key}"
                        )
                    existing = final

            environment = self.multica.get_agent_environment(observed.id)
            wanted_keys = agent.environment_keys
            if environment.agent_id != observed.id:
                raise ProvisionError(
                    f"environment reconciliation failed for {agent.key}"
                )
            if tuple(sorted(environment.keys)) != wanted_keys:
                values: dict[str, str] = {}
                for name in wanted_keys:
                    try:
                        value = secret_lookup(name)
                    except Exception:
                        raise ProvisionError(
                            f"secret lookup failed for {name}"
                        ) from None
                    if not isinstance(value, str):
                        raise ProvisionError(f"secret lookup failed for {name}")
                    values[name] = value
                try:
                    self.multica.set_agent_environment(observed.id, values)
                except Exception:
                    raise ProvisionError(
                        f"environment reconciliation failed for {agent.key}"
                    ) from None
                finally:
                    values.clear()
                final_environment = self.multica.get_agent_environment(observed.id)
                if (
                    final_environment.agent_id != observed.id
                    or tuple(sorted(final_environment.keys)) != wanted_keys
                ):
                    raise ProvisionError(
                        f"environment reconciliation failed for {agent.key}"
                    )

    def _apply_squad(
        self,
        manifest: DeliveryManifest,
        desired: _DesiredState,
        lock: FrameworkLock,
    ) -> None:
        agents = {
            agent.key: _unique_target(
                self.multica.list_agents(), "name", agent.name, "agent"
            )
            for agent in desired.agents
        }
        if any(agent is None for agent in agents.values()):
            raise ProvisionError("Squad agent reconciliation failed")
        lead_id = agents["delivery-lead"].id
        squad = self._locked_target(
            self.multica.list_squads(),
            lock,
            category="squad",
            key="delivery",
            field="name",
            value=desired.squad_name,
            label="Squad",
        )
        updated_squad_id = None
        if squad is None:
            self.multica.create_squad(
                name=desired.squad_name,
                description=desired.squad_description,
                leader_id=lead_id,
            )
            squad = _unique_target(
                self.multica.list_squads(),
                "name",
                desired.squad_name,
                "Squad",
            )
            if (
                squad is None
                or squad.name != desired.squad_name
                or squad.description != desired.squad_description
                or squad.leader_id != lead_id
            ):
                raise ProvisionError("Squad creation verification failed")
            created_members = tuple(
                self.multica.list_squad_members(squad.id)
            )
            if (
                len(created_members) != 1
                or created_members[0].member_id != lead_id
                or created_members[0].member_type != "agent"
                or created_members[0].role != "leader"
            ):
                raise ProvisionError("Squad leader creation verification failed")
            if squad.instructions != desired.squad_instructions:
                self.multica.update_squad(
                    squad.id,
                    name=desired.squad_name,
                    description=desired.squad_description,
                    instructions=desired.squad_instructions,
                    leader_id=lead_id,
                )
                updated_squad_id = squad.id
        elif not self._squad_matches(squad, desired, lead_id):
            self.multica.update_squad(
                squad.id,
                name=desired.squad_name,
                description=desired.squad_description,
                instructions=desired.squad_instructions,
                leader_id=lead_id,
            )
            updated_squad_id = squad.id
        squad = _unique_target(
            self.multica.list_squads(),
            "name",
            desired.squad_name,
            "Squad",
        )
        if squad is None or not self._squad_matches(squad, desired, lead_id):
            raise ProvisionError("Squad reconciliation failed")
        if updated_squad_id is not None and squad.id != updated_squad_id:
            raise ProvisionError("Squad identity changed during update")

        expected = {lead_id: "leader"}
        expected.update(
            {
                state.id: key
                for key, state in agents.items()
                if key not in {"delivery-lead", "workflow-watcher"}
            }
        )
        members = {member.member_id: member for member in self.multica.list_squad_members(squad.id)}
        if set(members) - set(expected):
            raise ProvisionError("foreign target Squad member state")
        for agent_id, role in expected.items():
            observed = members.get(agent_id)
            if observed is None:
                if role == "leader":
                    raise ProvisionError("Squad leader reconciliation failed")
                self.multica.add_squad_member(squad.id, agent_id, role=role)
            elif observed.member_type != "agent":
                raise ProvisionError("foreign target Squad member state")
            elif observed.role != role:
                self.multica.update_squad_member(squad.id, agent_id, role=role)
            members = {
                member.member_id: member
                for member in self.multica.list_squad_members(squad.id)
            }
            final = members.get(agent_id)
            if final is None or final.member_type != "agent" or final.role != role:
                raise ProvisionError("Squad member reconciliation failed")
        if {
            member_id: member.role for member_id, member in members.items()
        } != expected:
            raise ProvisionError("Squad member reconciliation failed")

    def _apply_autopilot(
        self,
        manifest: DeliveryManifest,
        desired: _DesiredState,
        lock: FrameworkLock,
    ) -> None:
        control = _unique_target(
            self.multica.list_projects(),
            "title",
            desired.projects[0].title,
            "Project",
        )
        watcher_spec = next(
            agent for agent in desired.agents if agent.key == "workflow-watcher"
        )
        watcher = _unique_target(
            self.multica.list_agents(),
            "name",
            watcher_spec.name,
            "agent",
        )
        if control is None or watcher is None:
            raise ProvisionError("Autopilot dependency reconciliation failed")
        autopilot = self._locked_target(
            self.multica.list_autopilots(),
            lock,
            category="autopilot",
            key="workflow-watcher",
            field="title",
            value=desired.autopilot_title,
            label="Autopilot",
        )
        fields = {
            "title": desired.autopilot_title,
            "description": desired.autopilot_description,
            "execution_mode": "run_only",
            "project_id": control.id,
            "assignee_id": watcher.id,
            "status": "active",
        }
        updated_autopilot_id = None
        if autopilot is None:
            self.multica.create_autopilot(**fields)
        elif not self._autopilot_matches(
            autopilot,
            desired,
            control.id,
            watcher.id,
        ):
            self.multica.update_autopilot(autopilot.id, **fields)
            updated_autopilot_id = autopilot.id
        autopilot = _unique_target(
            self.multica.list_autopilots(),
            "title",
            desired.autopilot_title,
            "Autopilot",
        )
        if autopilot is None or not self._autopilot_matches(
            autopilot,
            desired,
            control.id,
            watcher.id,
        ):
            raise ProvisionError("Autopilot reconciliation failed")
        if (
            updated_autopilot_id is not None
            and autopilot.id != updated_autopilot_id
        ):
            raise ProvisionError("Autopilot identity changed during update")

        triggers = tuple(self.multica.list_autopilot_triggers(autopilot.id))
        if len(triggers) > 1:
            raise ProvisionError("duplicate/foreign target trigger state")
        trigger = triggers[0] if triggers else None
        updated_trigger_id = None
        if trigger is None:
            self.multica.add_autopilot_trigger(
                autopilot.id,
                cron_expression=manifest.policy.watcher_cron,
                timezone=manifest.policy.watcher_timezone,
                label=desired.trigger_label,
            )
        elif not self._trigger_matches(trigger, manifest, desired):
            self.multica.update_autopilot_trigger(
                autopilot.id,
                trigger.id,
                cron_expression=manifest.policy.watcher_cron,
                timezone=manifest.policy.watcher_timezone,
                enabled=True,
                label=desired.trigger_label,
            )
            updated_trigger_id = trigger.id
        final_triggers = tuple(self.multica.list_autopilot_triggers(autopilot.id))
        if len(final_triggers) != 1 or not self._trigger_matches(
            final_triggers[0], manifest, desired
        ):
            raise ProvisionError("Autopilot trigger reconciliation failed")
        if (
            updated_trigger_id is not None
            and final_triggers[0].id != updated_trigger_id
        ):
            raise ProvisionError("Autopilot trigger identity changed during update")

    def _build_lock_or_none(
        self,
        manifest: DeliveryManifest,
        lock: FrameworkLock,
        snapshot: _Snapshot,
    ) -> FrameworkLock | None:
        required = (
            tuple(snapshot.skills.values())
            + tuple(snapshot.projects.values())
            + tuple(snapshot.resources.values())
            + tuple(snapshot.agents.values())
            + (snapshot.squad, snapshot.autopilot, snapshot.trigger)
        )
        if any(record is None for record in required):
            return None
        return self._build_lock(manifest, lock, snapshot)

    @staticmethod
    def _build_lock(
        manifest: DeliveryManifest,
        lock: FrameworkLock,
        snapshot: _Snapshot,
    ) -> FrameworkLock:
        categories = {
            kind: dict(values) for kind, values in lock.resource_ids.items()
        }
        desired = {
            "skill": {
                key: value.id for key, value in snapshot.skills.items() if value is not None
            },
            "project": {
                key: value.id for key, value in snapshot.projects.items() if value is not None
            },
            "worktree": {
                key: value.id for key, value in snapshot.resources.items() if value is not None
            },
            "agent": {
                key: value.id for key, value in snapshot.agents.items() if value is not None
            },
            "squad": {"delivery": snapshot.squad.id} if snapshot.squad else {},
            "autopilot": (
                {"workflow-watcher": snapshot.autopilot.id}
                if snapshot.autopilot
                else {}
            ),
            "trigger": (
                {"workflow-watcher": snapshot.trigger.id}
                if snapshot.trigger
                else {}
            ),
        }
        if any(not values for values in desired.values()):
            raise ProvisionError("cannot emit lock before reconciliation succeeds")
        for kind, values in desired.items():
            category = categories.setdefault(kind, {})
            for key, identifier in values.items():
                locked_id = category.get(key)
                if locked_id is not None and locked_id != identifier:
                    raise ProvisionError(f"foreign lock identity for {kind}.{key}")
                category[key] = identifier
        frozen_categories = MappingProxyType(
            {
                kind: MappingProxyType(dict(sorted(values.items())))
                for kind, values in sorted(categories.items())
            }
        )
        return FrameworkLock(
            SKILL_VERSION,
            ENGINE_VERSION,
            manifest.schema_version,
            WORKFLOW_METADATA_VERSION,
            SUPPORTED_MULTICA_CLI,
            manifest_digest(manifest),
            frozen_categories,
        )
