import re
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
            "`mutation_count` of `0`",
            "cannot prove the worktree",
            "codeExploreHub/Eventra",
            "manual production deployment",
            "stdin",
        )
        for fragment in required_fragments:
            with self.subTest(fragment=fragment):
                self.assertIn(fragment, recovery)

        blocks = [
            " ".join(match.group(1).replace("\\\n", " ").split())
            for match in re.finditer(r"```bash\n(.*?)\n```", recovery, re.DOTALL)
        ]
        self.assertEqual(4, len(blocks))
        audit, dry_run, recovery_apply, normal_apply = blocks

        self.assertEqual(
            "python3 -m tools.multica.contract_audit --runtime-id RUNTIME_ID --daemon-id DAEMON_ID",
            audit,
        )
        self.assertEqual(
            "python3 -m tools.multica.provision --runtime-id RUNTIME_ID --daemon-id DAEMON_ID",
            dry_run,
        )

        approved_runtime = "de500649-cada-4419-9d5d-279045e2eaae"
        approved_daemon = "019fab98-bbad-7d17-b0b7-26e56dbe1b6f"
        self.assertEqual(
            f"python3 -m tools.multica.provision --runtime-id {approved_runtime} "
            f"--daemon-id {approved_daemon} --apply --reuse-backend-env",
            recovery_apply,
        )
        self.assertEqual(
            f"python3 -m tools.multica.provision --runtime-id {approved_runtime} "
            f"--daemon-id {approved_daemon} --apply",
            normal_apply,
        )

        reusable = "\n".join((audit, dry_run))
        eventra_specific = "\n".join((recovery_apply, normal_apply))
        uuid_pattern = r"\b[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}\b"
        self.assertEqual([], re.findall(uuid_pattern, reusable))
        self.assertEqual(
            {approved_runtime, approved_daemon},
            set(re.findall(uuid_pattern, eventra_specific)),
        )
        self.assertNotIn("--prompt-backend-env", recovery_apply)
        self.assertNotIn("--prompt-backend-env", normal_apply)
        self.assertNotIn("--reuse-backend-env", normal_apply)

        command_text = "\n".join(blocks)
        forbidden_command_patterns = (
            r"(?m)(?:^|[;\s])(?:export\s+)?[A-Za-z_][A-Za-z0-9_]*=",
            r"\b[A-Za-z_][A-Za-z0-9_]*(?:_SENTINEL|_VALUE|_SECRET|_PASSWORD)\b",
            r"Aprim-OPC|SkillsHub",
        )
        for pattern in forbidden_command_patterns:
            with self.subTest(pattern=pattern):
                self.assertIsNone(re.search(pattern, command_text))


if __name__ == "__main__":
    unittest.main()
