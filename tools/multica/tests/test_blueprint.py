import unittest
from dataclasses import is_dataclass
from pathlib import Path

from tools.multica.blueprint import AgentSpec, TeamBlueprint, build_multi_repo_blueprint


class BlueprintTests(unittest.TestCase):
    def setUp(self):
        self.blueprint = build_multi_repo_blueprint("Sample")

    def test_has_exactly_five_unique_roles_in_delivery_order(self):
        self.assertEqual(
            [agent.role for agent in self.blueprint.agents],
            [
                "delivery_lead",
                "frontend_engineer",
                "backend_engineer",
                "integration_qa",
                "independent_reviewer",
            ],
        )

    def test_exposes_frozen_typed_blueprint_contract(self):
        self.assertTrue(is_dataclass(AgentSpec))
        self.assertTrue(is_dataclass(TeamBlueprint))
        self.assertEqual(self.blueprint.squad_name, "Sample Local Delivery")
        self.assertEqual(self.blueprint.leader_role, "delivery_lead")
        self.assertIsInstance(self.blueprint.squad_instructions_file, Path)
        self.assertTrue(all(isinstance(agent.instructions_file, Path) for agent in self.blueprint.agents))

    def test_blueprint_has_no_project_or_technology_context(self):
        serialized = repr(self.blueprint).lower()
        for forbidden in ("eventra", "/users/didi", "spring", "react"):
            self.assertNotIn(forbidden, serialized)

    def test_excludes_worktree_and_nested_dispatch_skills(self):
        bound = {skill for agent in self.blueprint.agents for skill in agent.skill_keys}
        for forbidden in (
            "using-git-worktrees",
            "dispatching-parallel-agents",
            "subagent-driven-development",
            "finishing-a-development-branch",
        ):
            self.assertNotIn(forbidden, bound)

    def test_assigns_backend_environment_only_to_backend_engineer(self):
        self.assertEqual(
            [agent.role for agent in self.blueprint.agents if agent.needs_backend_env],
            ["backend_engineer"],
        )

    def test_squad_contract_preserves_exact_sha_merge_gates(self):
        contract = self.blueprint.squad_instructions_file.read_text()

        self.assertIn("each affected pull request remains mergeable", contract)
        self.assertIn(
            "pull request head still equals the exact SHA reviewed by Independent Reviewer "
            "and verified by Integration QA",
            contract,
        )
        self.assertIn("all required repository checks still succeed", contract)

    def test_squad_contract_freezes_interfaces_before_safe_parallel_work(self):
        contract = self.blueprint.squad_instructions_file.read_text().lower()

        self.assertIn("freeze the interface contract before implementation", contract)
        self.assertIn(
            "only run frontend and backend work in parallel when the contract is frozen "
            "and neither child has a real dependency on the other",
            contract,
        )
        self.assertIn("otherwise, sequence work by dependency", contract)


if __name__ == "__main__":
    unittest.main()
