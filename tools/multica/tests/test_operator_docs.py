import unittest
from pathlib import Path


class OperatorDocsTests(unittest.TestCase):
    def test_pilot_backend_checks_use_deterministic_test_wrapper(self):
        pilot = Path("docs/multica/pilot-issues.md").read_text()
        normalized_pilot = " ".join(pilot.split())
        backend_only = pilot.split("## Pilot 2 — backend-only", 1)[1].split(
            "## Pilot 3 — cross-stack", 1
        )[0]
        cross_stack = pilot.split("## Pilot 3 — cross-stack", 1)[1]

        self.assertNotIn(
            "./mvnw -s .mvn/settings-public.xml test", normalized_pilot
        )
        for section_name, section in (
            ("backend-only", backend_only),
            ("cross-stack", cross_stack),
        ):
            normalized_section = " ".join(section.split())
            with self.subTest(section=section_name):
                self.assertIn(
                    "scripts/test-local.sh -Dtest=...", normalized_section
                )
                self.assertIn(
                    "complete suite as `scripts/test-local.sh`", normalized_section
                )

    def test_inspection_examples_match_multica_0_4_31(self):
        readme = Path("tools/multica/README.md").read_text()

        supported_commands = (
            "multica runtime list --output json",
            "multica daemon status --output json",
            "multica agent list --output json",
            "multica agent get AGENT_ID --output json",
            "multica agent skills list AGENT_ID --output json",
            "multica squad get SQUAD_ID --output json",
            "multica squad member list SQUAD_ID --output json",
            "multica project get PROJECT_ID --output json",
            "multica project resource list PROJECT_ID --output json",
            "multica skill list --output json",
            "multica skill get SKILL_ID --output json",
        )
        for command in supported_commands:
            with self.subTest(command=command):
                self.assertIn(command, readme)

        obsolete_fragments = (
            " --json",
            "--runtime-id",
            "--daemon-id",
            "agent skills list --agent-id",
            "squad members",
            "--squad-id",
            "project resources",
            "--project-id",
        )
        inspection_section = readme.split("## Inspection and reconciliation", 1)[1].split("## Delivery operation", 1)[0]
        for fragment in obsolete_fragments:
            with self.subTest(fragment=fragment):
                self.assertNotIn(fragment, inspection_section)

    def test_contract_recovery_runbook(self):
        """Recovery must stop on unobservable worktrees and preserve env boundaries."""

        readme = Path("tools/multica/README.md").read_text()
        self.assertIn("## Contract recovery runbook", readme)
        recovery = readme.split("## Contract recovery runbook", 1)[1].split(
            "## Inspection and reconciliation", 1
        )[0]

        required_fragments = (
            "python3 -m tools.multica.contract_audit",
            "python3 -m tools.multica.provision ",
            "--reuse-backend-env",
            "`mutation_count` of `0`",
            "cannot prove the worktree",
            "codeExploreHub/Eventra",
            "manual production deployment",
            "stdin",
        )
        for fragment in required_fragments:
            with self.subTest(fragment=fragment):
                self.assertIn(fragment, recovery)

        audit_index = recovery.index("python3 -m tools.multica.contract_audit")
        dry_run_index = recovery.index(
            "python3 -m tools.multica.provision ", audit_index
        )
        recovery_apply_index = recovery.index("# 3. One recovery apply")
        normal_apply_index = recovery.index("# 4. Prove idempotency")
        normal_apply_block = recovery[normal_apply_index:].split("```", 1)[0]
        self.assertLess(audit_index, dry_run_index)
        self.assertLess(dry_run_index, recovery_apply_index)
        self.assertLess(recovery_apply_index, normal_apply_index)
        self.assertIn("--apply", normal_apply_block)
        self.assertNotIn("--prompt-backend-env", normal_apply_block)
        self.assertNotIn("--reuse-backend-env", normal_apply_block)

        forbidden_fragments = (
            "Aprim-OPC",
            "SkillsHub",
            "JWT_SECRET=",
            "MAIL_PASSWORD=",
        )
        for fragment in forbidden_fragments:
            with self.subTest(fragment=fragment):
                self.assertNotIn(fragment, recovery)


if __name__ == "__main__":
    unittest.main()
