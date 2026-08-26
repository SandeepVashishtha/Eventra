from __future__ import annotations

from dataclasses import replace
from pathlib import Path
from types import MappingProxyType
import unittest

from tools.multica_delivery.github_client import RepositoryInfo
from tools.multica_delivery.manifest import load_manifest
from tools.multica_delivery.model import FrameworkLock
from tools.multica_delivery.multica_client import AgentEnvironment, MutationResult, RuntimeInfo
from tools.multica_delivery.provision import (
    AgentState,
    AutopilotState,
    ProjectResourceState,
    ProjectState,
    ProvisionError,
    Provisioner,
    SkillState,
    SquadMemberState,
    SquadState,
    TriggerState,
)


FIXTURE = Path(__file__).parent / "fixtures" / "three-repository-delivery.yaml"


def no_secrets(name: str) -> str:
    raise AssertionError(f"unexpected secret lookup for {name}")


class FakeGitHub:
    def __init__(self, manifest):
        repositories = (manifest.control.github,) + tuple(
            repository.github for repository in manifest.repositories.values()
        )
        self.repositories = {
            repository: RepositoryInfo(repository, "private", "main")
            for repository in repositories
        }
        self.calls: list[str] = []

    def get_repository(self, repository: str) -> RepositoryInfo:
        self.calls.append(repository)
        return self.repositories[repository]


class StatefulMultica:
    def __init__(self, manifest):
        self.runtime = RuntimeInfo(
            manifest.instance.runtime_id,
            manifest.instance.daemon_id,
            "online",
            ("local-worktree-v1",),
        )
        self.skills: dict[str, SkillState] = {}
        self.projects: dict[str, ProjectState] = {}
        self.resources: dict[str, dict[str, ProjectResourceState]] = {}
        self.agents: dict[str, AgentState] = {}
        self.bindings: dict[str, set[str]] = {}
        self.environments: dict[str, dict[str, str]] = {}
        self.squads: dict[str, SquadState] = {}
        self.members: dict[str, dict[str, SquadMemberState]] = {}
        self.autopilots: dict[str, AutopilotState] = {}
        self.triggers: dict[str, dict[str, TriggerState]] = {}
        self.mutations: list[str] = []
        self.freeze_mutations: set[str] = set()
        self.environment_failure: str | None = None
        self.secret_sets: list[tuple[str, dict[str, str]]] = []
        self._next: dict[str, int] = {}

    @property
    def was_mutated(self) -> bool:
        return bool(self.mutations)

    def _id(self, kind: str) -> str:
        value = self._next.get(kind, 0) + 1
        self._next[kind] = value
        return f"{kind}-{value}"

    def _mutate(self, kind: str) -> bool:
        self.mutations.append(kind)
        return kind not in self.freeze_mutations

    def version(self) -> str:
        return "0.4.33"

    def get_runtime(self, runtime_id: str | None = None, daemon_id: str | None = None) -> RuntimeInfo:
        return self.runtime

    def list_skills(self) -> tuple[SkillState, ...]:
        return tuple(self.skills.values())

    def import_skill(self, url: str) -> MutationResult:
        if self._mutate("skill.import"):
            identifier = self._id("skill")
            name = url.rstrip("/").rsplit("/", 1)[-1]
            self.skills[identifier] = SkillState(identifier, name, url)
        return MutationResult("ignored-acknowledgement")

    def list_projects(self) -> tuple[ProjectState, ...]:
        return tuple(self.projects.values())

    def create_project(self, *, title: str, description: str) -> MutationResult:
        if self._mutate("project.create"):
            identifier = self._id("project")
            self.projects[identifier] = ProjectState(identifier, title, description)
            self.resources[identifier] = {}
        return MutationResult("ignored-acknowledgement")

    def update_project(self, project_id: str, *, title: str, description: str) -> MutationResult:
        if self._mutate("project.update"):
            self.projects[project_id] = ProjectState(project_id, title, description)
        return MutationResult("ignored-acknowledgement")

    def list_project_resources(self, project_id: str) -> tuple[ProjectResourceState, ...]:
        return tuple(self.resources[project_id].values())

    def add_project_worktree(
        self,
        project_id: str,
        *,
        local_path: str,
        daemon_id: str,
        execution_mode: str,
    ) -> MutationResult:
        if self._mutate("worktree.create"):
            identifier = self._id("worktree")
            self.resources[project_id][identifier] = ProjectResourceState(
                identifier,
                project_id,
                "local_directory",
                local_path,
                daemon_id,
                execution_mode,
            )
        return MutationResult("ignored-acknowledgement")

    def update_project_worktree(
        self,
        project_id: str,
        resource_id: str,
        *,
        daemon_id: str,
        execution_mode: str,
    ) -> MutationResult:
        if self._mutate("worktree.update"):
            resource = self.resources[project_id][resource_id]
            self.resources[project_id][resource_id] = replace(
                resource,
                daemon_id=daemon_id,
                execution_mode=execution_mode,
            )
        return MutationResult("ignored-acknowledgement")

    def list_agents(self) -> tuple[AgentState, ...]:
        return tuple(self.agents.values())

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
        if self._mutate("agent.create"):
            identifier = self._id("agent")
            self.agents[identifier] = AgentState(
                identifier,
                name,
                description,
                instructions,
                runtime_id,
                visibility,
                max_concurrent_tasks,
            )
            self.bindings[identifier] = set()
            self.environments[identifier] = {}
        return MutationResult("ignored-acknowledgement")

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
        if self._mutate("agent.update"):
            self.agents[agent_id] = AgentState(
                agent_id,
                name,
                description,
                instructions,
                runtime_id,
                visibility,
                max_concurrent_tasks,
            )
        return MutationResult("ignored-acknowledgement")

    def list_agent_skill_ids(self, agent_id: str) -> tuple[str, ...]:
        return tuple(sorted(self.bindings[agent_id]))

    def add_agent_skill(self, agent_id: str, skill_id: str) -> MutationResult:
        if self._mutate("agent.skill.add"):
            self.bindings[agent_id].add(skill_id)
        return MutationResult("ignored-acknowledgement")

    def get_agent_environment(self, agent_id: str) -> AgentEnvironment:
        return AgentEnvironment(agent_id, tuple(sorted(self.environments[agent_id])))

    def set_agent_environment(self, agent_id: str, values) -> MutationResult:
        self.secret_sets.append((agent_id, dict(values)))
        self.mutations.append("agent.environment.set")
        if self.environment_failure is not None:
            raise RuntimeError(self.environment_failure)
        if "agent.environment.set" not in self.freeze_mutations:
            self.environments[agent_id] = dict(values)
        return MutationResult("ignored-acknowledgement")

    def list_squads(self) -> tuple[SquadState, ...]:
        return tuple(self.squads.values())

    def create_squad(
        self,
        *,
        name: str,
        description: str,
        instructions: str,
        leader_id: str,
    ) -> MutationResult:
        if self._mutate("squad.create"):
            identifier = self._id("squad")
            self.squads[identifier] = SquadState(
                identifier, name, description, instructions, leader_id
            )
            self.members[identifier] = {
                leader_id: SquadMemberState(leader_id, "agent", "leader")
            }
        return MutationResult("ignored-acknowledgement")

    def update_squad(
        self,
        squad_id: str,
        *,
        name: str,
        description: str,
        instructions: str,
        leader_id: str,
    ) -> MutationResult:
        if self._mutate("squad.update"):
            self.squads[squad_id] = SquadState(
                squad_id, name, description, instructions, leader_id
            )
        return MutationResult("ignored-acknowledgement")

    def list_squad_members(self, squad_id: str) -> tuple[SquadMemberState, ...]:
        return tuple(self.members[squad_id].values())

    def add_squad_member(self, squad_id: str, agent_id: str, *, role: str) -> MutationResult:
        if self._mutate("squad.member.add"):
            self.members[squad_id][agent_id] = SquadMemberState(agent_id, "agent", role)
        return MutationResult("ignored-acknowledgement")

    def update_squad_member(self, squad_id: str, agent_id: str, *, role: str) -> MutationResult:
        if self._mutate("squad.member.update"):
            self.members[squad_id][agent_id] = SquadMemberState(agent_id, "agent", role)
        return MutationResult("ignored-acknowledgement")

    def list_autopilots(self) -> tuple[AutopilotState, ...]:
        return tuple(self.autopilots.values())

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
        if self._mutate("autopilot.create"):
            identifier = self._id("autopilot")
            self.autopilots[identifier] = AutopilotState(
                identifier,
                title,
                description,
                execution_mode,
                project_id,
                assignee_id,
                "agent",
                status,
            )
            self.triggers[identifier] = {}
        return MutationResult("ignored-acknowledgement")

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
        if self._mutate("autopilot.update"):
            self.autopilots[autopilot_id] = AutopilotState(
                autopilot_id,
                title,
                description,
                execution_mode,
                project_id,
                assignee_id,
                "agent",
                status,
            )
        return MutationResult("ignored-acknowledgement")

    def list_autopilot_triggers(self, autopilot_id: str) -> tuple[TriggerState, ...]:
        return tuple(self.triggers[autopilot_id].values())

    def add_autopilot_trigger(
        self,
        autopilot_id: str,
        *,
        cron_expression: str,
        timezone: str,
        label: str,
    ) -> MutationResult:
        if self._mutate("trigger.create"):
            identifier = self._id("trigger")
            self.triggers[autopilot_id][identifier] = TriggerState(
                identifier,
                autopilot_id,
                "schedule",
                cron_expression,
                timezone,
                True,
                label,
            )
        return MutationResult("ignored-acknowledgement")

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
        if self._mutate("trigger.update"):
            self.triggers[autopilot_id][trigger_id] = TriggerState(
                trigger_id,
                autopilot_id,
                "schedule",
                cron_expression,
                timezone,
                enabled,
                label,
            )
        return MutationResult("ignored-acknowledgement")


class ProvisionerTests(unittest.TestCase):
    def setUp(self):
        self.manifest = load_manifest(FIXTURE)
        self.multica = StatefulMultica(self.manifest)
        self.github = FakeGitHub(self.manifest)
        self.provisioner = Provisioner(self.multica, self.github)
        self.secret = "DATABASE_SECRET_SENTINEL"

    def secrets(self, name: str) -> str:
        self.assertEqual(name, "DATABASE_URL")
        return self.secret

    def apply(self, lock: FrameworkLock | None = None):
        return self.provisioner.reconcile(
            self.manifest,
            FrameworkLock.empty() if lock is None else lock,
            apply=True,
            secret_lookup=self.secrets,
        )

    def test_plan_creates_control_and_one_project_per_repository(self):
        result = self.provisioner.reconcile(
            self.manifest, FrameworkLock.empty(), apply=False, secret_lookup=no_secrets
        )
        self.assertEqual(
            tuple(action.key for action in result.actions if action.kind == "project.create"),
            ("control", "api", "notifications", "web"),
        )
        self.assertFalse(self.multica.was_mutated)
        self.assertEqual(result.lock, FrameworkLock.empty())

    def test_dry_run_is_deterministic_and_does_not_lookup_secrets(self):
        first = self.provisioner.reconcile(
            self.manifest, FrameworkLock.empty(), apply=False, secret_lookup=no_secrets
        )
        second = self.provisioner.reconcile(
            self.manifest, FrameworkLock.empty(), apply=False, secret_lookup=no_secrets
        )
        self.assertEqual(first.actions, second.actions)
        self.assertFalse(self.multica.was_mutated)

    def test_creates_fixed_control_roles_and_one_engineer_per_repo(self):
        result = self.provisioner.reconcile(
            self.manifest, FrameworkLock.empty(), apply=False, secret_lookup=no_secrets
        )
        self.assertEqual(
            result.desired_agent_keys,
            (
                "delivery-lead",
                "independent-reviewer",
                "integration-qa",
                "workflow-watcher",
                "api-engineer",
                "notifications-engineer",
                "web-engineer",
            ),
        )

    def test_actions_follow_the_fixed_phase_order(self):
        result = self.provisioner.reconcile(
            self.manifest, FrameworkLock.empty(), apply=False, secret_lookup=no_secrets
        )
        phases = {
            "skill": 0,
            "project": 1,
            "worktree": 2,
            "agent": 3,
            "squad": 4,
            "autopilot": 5,
            "trigger": 6,
            "lock": 7,
        }
        ordinals = [phases[action.kind.split(".", 1)[0]] for action in result.actions]
        self.assertEqual(ordinals, sorted(ordinals))

    def test_watcher_schedule_must_be_exactly_thirty_minutes(self):
        manifest = replace(
            self.manifest,
            policy=replace(self.manifest.policy, watcher_cron="0 * * * *"),
        )
        with self.assertRaisesRegex(ProvisionError, "30-minute"):
            self.provisioner.reconcile(
                manifest,
                FrameworkLock.empty(),
                apply=False,
                secret_lookup=no_secrets,
            )
        self.assertFalse(self.multica.was_mutated)

    def test_same_skill_name_different_origin_is_fatal_before_mutation(self):
        self.multica.skills["skill-foreign"] = SkillState(
            "skill-foreign",
            "using-superpowers",
            "https://github.com/foreign/repository/tree/main/skills/using-superpowers",
        )
        with self.assertRaisesRegex(ProvisionError, "same-name/different-origin"):
            self.provisioner.reconcile(
                self.manifest,
                FrameworkLock.empty(),
                apply=True,
                secret_lookup=self.secrets,
            )
        self.assertFalse(self.multica.was_mutated)

    def test_duplicate_target_project_is_fatal_before_mutation(self):
        for identifier in ("project-a", "project-b"):
            self.multica.projects[identifier] = ProjectState(
                identifier, self.manifest.repositories["api"].project_title, "old"
            )
            self.multica.resources[identifier] = {}
        with self.assertRaisesRegex(ProvisionError, "duplicate Project"):
            self.apply()
        self.assertFalse(self.multica.was_mutated)

    def test_foreign_resource_in_target_project_is_fatal_before_mutation(self):
        project_id = "project-api"
        self.multica.projects[project_id] = ProjectState(
            project_id, self.manifest.repositories["api"].project_title, "old"
        )
        self.multica.resources[project_id] = {
            "resource-foreign": ProjectResourceState(
                "resource-foreign",
                project_id,
                "github_repo",
                "/foreign",
                self.manifest.instance.daemon_id,
                "worktree",
            )
        }
        with self.assertRaisesRegex(ProvisionError, "foreign target resource"):
            self.apply()
        self.assertFalse(self.multica.was_mutated)

    def test_foreign_worktree_mode_is_fatal_before_mutation(self):
        project_id = "project-api"
        path = str(self.manifest.repositories["api"].local_path)
        self.multica.projects[project_id] = ProjectState(
            project_id, self.manifest.repositories["api"].project_title, "old"
        )
        self.multica.resources[project_id] = {
            "resource-api": ProjectResourceState(
                "resource-api",
                project_id,
                "local_directory",
                path,
                self.manifest.instance.daemon_id,
                "shared_checkout",
            )
        }
        with self.assertRaisesRegex(ProvisionError, "foreign target resource"):
            self.apply()
        self.assertFalse(self.multica.was_mutated)

    def test_apply_builds_complete_restricted_topology(self):
        result = self.apply()
        self.assertTrue(result.actions)
        self.assertTrue(
            all(
                agent.visibility == "workspace" and agent.max_concurrent_tasks == 1
                for agent in self.multica.agents.values()
            )
        )
        agent_ids = result.lock.resource_ids["agent"]
        squad_id = result.lock.resource_ids["squad"]["delivery"]
        members = self.multica.members[squad_id]
        self.assertNotIn(agent_ids["workflow-watcher"], members)
        self.assertEqual(
            set(members),
            {agent_ids[key] for key in result.desired_agent_keys if key != "workflow-watcher"},
        )
        autopilot_id = result.lock.resource_ids["autopilot"]["workflow-watcher"]
        autopilot = self.multica.autopilots[autopilot_id]
        self.assertEqual(autopilot.execution_mode, "run_only")
        self.assertEqual(autopilot.assignee_id, agent_ids["workflow-watcher"])
        trigger_id = result.lock.resource_ids["trigger"]["workflow-watcher"]
        trigger = self.multica.triggers[autopilot_id][trigger_id]
        self.assertEqual(trigger.cron_expression, "*/30 * * * *")
        self.assertEqual(trigger.timezone, "Asia/Shanghai")

    def test_role_skill_scope_is_minimal_and_engineers_are_repository_scoped(self):
        result = self.apply()
        skill_ids = result.lock.resource_ids["skill"]
        agent_ids = result.lock.resource_ids["agent"]

        def keys_for(agent_key: str) -> set[str]:
            bound = self.multica.bindings[agent_ids[agent_key]]
            return {key for key, identifier in skill_ids.items() if identifier in bound}

        self.assertEqual(
            keys_for("api-engineer"),
            {"using-superpowers", "test-driven-development"},
        )
        self.assertEqual(keys_for("notifications-engineer"), {"using-superpowers"})
        self.assertEqual(keys_for("workflow-watcher"), {"using-superpowers"})
        self.assertEqual(keys_for("integration-qa"), {"using-superpowers"})

    def test_secret_is_routed_only_to_manifest_approved_recipients(self):
        result = self.apply()
        agent_ids = result.lock.resource_ids["agent"]
        recipients = {agent_id for agent_id, _ in self.multica.secret_sets}
        self.assertEqual(
            recipients,
            {agent_ids["api-engineer"], agent_ids["integration-qa"]},
        )
        self.assertTrue(
            all(values == {"DATABASE_URL": self.secret} for _, values in self.multica.secret_sets)
        )
        self.assertNotIn(self.secret, repr(result))
        self.assertNotIn(self.secret, repr(result.lock))

    def test_secret_lookup_failure_is_redacted(self):
        def failing_lookup(name: str) -> str:
            raise RuntimeError(self.secret)

        with self.assertRaisesRegex(ProvisionError, "secret lookup failed") as caught:
            self.provisioner.reconcile(
                self.manifest,
                FrameworkLock.empty(),
                apply=True,
                secret_lookup=failing_lookup,
            )
        self.assertNotIn(self.secret, str(caught.exception))

    def test_environment_setter_failure_is_redacted(self):
        self.multica.environment_failure = self.secret
        with self.assertRaisesRegex(ProvisionError, "environment reconciliation failed") as caught:
            self.apply()
        self.assertNotIn(self.secret, str(caught.exception))

    def test_authoritative_post_read_rejects_unapplied_acknowledgement(self):
        old_lock = FrameworkLock.empty()
        self.multica.freeze_mutations.add("project.create")
        with self.assertRaisesRegex(ProvisionError, "Project reconciliation failed"):
            self.apply(old_lock)
        self.assertEqual(old_lock, FrameworkLock.empty())

    def test_second_apply_is_noop(self):
        first = self.apply()
        mutations_after_first = len(self.multica.mutations)
        second = self.apply(first.lock)
        self.assertEqual(second.actions, ())
        self.assertEqual(second.mutation_count, 0)
        self.assertEqual(len(self.multica.mutations), mutations_after_first)

    def test_unrelated_resources_and_engineer_bindings_are_preserved(self):
        first = self.apply()
        unrelated_project = ProjectState("project-unrelated", "Unrelated", "leave me")
        self.multica.projects[unrelated_project.id] = unrelated_project
        self.multica.resources[unrelated_project.id] = {}
        unrelated_skill = SkillState(
            "skill-unrelated", "unrelated", "https://github.com/public/unrelated"
        )
        self.multica.skills[unrelated_skill.id] = unrelated_skill
        api_agent = first.lock.resource_ids["agent"]["api-engineer"]
        self.multica.bindings[api_agent].add(unrelated_skill.id)
        second = self.apply(first.lock)
        self.assertEqual(second.actions, ())
        self.assertIn(unrelated_project.id, self.multica.projects)
        self.assertIn(unrelated_skill.id, self.multica.bindings[api_agent])

    def test_foreign_watcher_binding_is_a_hard_failure(self):
        first = self.apply()
        foreign = SkillState(
            "skill-foreign", "foreign", "https://github.com/public/foreign"
        )
        self.multica.skills[foreign.id] = foreign
        watcher_id = first.lock.resource_ids["agent"]["workflow-watcher"]
        self.multica.bindings[watcher_id].add(foreign.id)
        mutations_before = len(self.multica.mutations)
        with self.assertRaisesRegex(ProvisionError, "foreign target skill binding"):
            self.apply(first.lock)
        self.assertEqual(len(self.multica.mutations), mutations_before)

    def test_lock_preserves_unknown_ids_and_records_versions_hash_and_all_targets(self):
        lock = FrameworkLock(
            "old",
            "old",
            1,
            1,
            "old",
            "old",
            MappingProxyType(
                {"external": MappingProxyType({"keep": "external-id"})}
            ),
        )
        result = self.apply(lock)
        self.assertEqual(result.lock.skill_version, "1.0.0")
        self.assertEqual(result.lock.engine_version, "1.0.0")
        self.assertEqual(result.lock.supported_multica_cli, ">=0.4,<0.5")
        self.assertEqual(len(result.lock.manifest_digest), 64)
        self.assertEqual(result.lock.resource_ids["external"]["keep"], "external-id")
        self.assertEqual(
            set(result.lock.resource_ids),
            {
                "external",
                "skill",
                "project",
                "worktree",
                "agent",
                "squad",
                "autopilot",
                "trigger",
            },
        )

    def test_lock_id_pointing_at_a_different_target_is_fatal_before_mutation(self):
        lock = FrameworkLock(
            "",
            "",
            1,
            1,
            "",
            "",
            MappingProxyType(
                {"project": MappingProxyType({"control": "project-foreign"})}
            ),
        )
        with self.assertRaisesRegex(ProvisionError, "foreign lock identity"):
            self.apply(lock)
        self.assertFalse(self.multica.was_mutated)

    def test_locked_targets_update_in_place_after_instance_scoped_names_change(self):
        first = self.apply()
        project_id = first.lock.resource_ids["project"]["api"]
        agent_id = first.lock.resource_ids["agent"]["api-engineer"]
        squad_id = first.lock.resource_ids["squad"]["delivery"]
        autopilot_id = first.lock.resource_ids["autopilot"]["workflow-watcher"]
        self.multica.projects[project_id] = replace(
            self.multica.projects[project_id], title="stale Project title"
        )
        self.multica.agents[agent_id] = replace(
            self.multica.agents[agent_id], name="stale Agent name"
        )
        self.multica.squads[squad_id] = replace(
            self.multica.squads[squad_id], name="stale Squad name"
        )
        self.multica.autopilots[autopilot_id] = replace(
            self.multica.autopilots[autopilot_id], title="stale Autopilot title"
        )

        result = self.apply(first.lock)

        self.assertIn("project.update", tuple(action.kind for action in result.actions))
        self.assertIn("agent.update", tuple(action.kind for action in result.actions))
        self.assertIn("squad.update", tuple(action.kind for action in result.actions))
        self.assertIn("autopilot.update", tuple(action.kind for action in result.actions))
        self.assertNotIn("project.create", tuple(action.kind for action in result.actions))
        self.assertNotIn("agent.create", tuple(action.kind for action in result.actions))
        self.assertEqual(result.lock.resource_ids["project"]["api"], project_id)
        self.assertEqual(result.lock.resource_ids["agent"]["api-engineer"], agent_id)
        self.assertEqual(result.lock.resource_ids["squad"]["delivery"], squad_id)
        self.assertEqual(
            result.lock.resource_ids["autopilot"]["workflow-watcher"], autopilot_id
        )

    def test_github_default_branch_mismatch_is_fatal_before_mutation(self):
        repository = self.manifest.repositories["api"].github
        self.github.repositories[repository] = RepositoryInfo(
            repository, "private", "foreign-default"
        )
        with self.assertRaisesRegex(ProvisionError, "default branch"):
            self.apply()
        self.assertFalse(self.multica.was_mutated)


if __name__ == "__main__":
    unittest.main()
