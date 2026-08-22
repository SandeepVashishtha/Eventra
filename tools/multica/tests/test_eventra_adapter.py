import unittest
from dataclasses import FrozenInstanceError, is_dataclass

from tools.multica.eventra_adapter import (
    PUBLIC_SKILL_URLS,
    LocalResource,
    ProjectConfig,
    SkillSource,
    build_eventra_config,
)


class EventraAdapterTests(unittest.TestCase):
    def setUp(self):
        self.config = build_eventra_config("runtime-id", "daemon-id")

    def test_builds_the_named_project_for_the_supplied_runtime_and_daemon(self):
        self.assertEqual(self.config.project_title, "Eventra Local Development")
        self.assertEqual(self.config.runtime_id, "runtime-id")
        self.assertEqual(self.config.daemon_id, "daemon-id")

    def test_registers_only_the_two_authoritative_worktree_repositories(self):
        self.assertEqual(
            self.config.resources,
            (
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
        )

    def test_forbids_the_nested_backend_duplicate(self):
        self.assertIn(
            "/Users/didi/Eventra-workspace/Eventra/Backend",
            self.config.forbidden_paths,
        )

    def test_uses_only_the_approved_public_skill_map(self):
        expected = {
            "using-superpowers",
            "brainstorming",
            "writing-plans",
            "executing-plans",
            "test-driven-development",
            "systematic-debugging",
            "requesting-code-review",
            "receiving-code-review",
            "verification-before-completion",
            "vercel-react-best-practices",
            "rest-api-conventions",
            "testing-pyramid",
            "spring-security-jwt",
            "playwright-cli",
        }
        self.assertEqual(set(PUBLIC_SKILL_URLS), expected)
        self.assertEqual(set(self.config.skills), expected)
        self.assertTrue(all(source.url.startswith("https://github.com/") for source in self.config.skills.values()))
        self.assertEqual(
            {key: source.url for key, source in self.config.skills.items()},
            PUBLIC_SKILL_URLS,
        )

    def test_rejects_non_public_and_excluded_skill_origins_from_the_configuration(self):
        rendered_urls = " ".join(source.url for source in self.config.skills.values()).lower()
        for forbidden in (
            "aprim-opc",
            "skills.sh",
        ):
            self.assertNotIn(forbidden, rendered_urls)
        for excluded in (
            "using-git-worktrees",
            "dispatching-parallel-agents",
            "subagent-driven-development",
            "finishing-a-development-branch",
        ):
            self.assertNotIn(excluded, self.config.skills)

    def test_injects_backend_environment_only_for_backend_engineering_and_integration_qa(self):
        self.assertEqual(
            [agent.role for agent in self.config.agents if agent.needs_backend_env],
            ["backend_engineer", "integration_qa"],
        )

    def test_exposes_frozen_dataclass_contracts(self):
        values = (
            (SkillSource("key", "https://github.com/example/repo"), "url"),
            (self.config.resources[0], "local_path"),
            (self.config, "project_title"),
        )
        for value, field in values:
            self.assertTrue(is_dataclass(value))
            with self.assertRaises(FrozenInstanceError):
                setattr(value, field, "unexpected")


if __name__ == "__main__":
    unittest.main()
