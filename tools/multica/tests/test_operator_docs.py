import re
import unittest
from pathlib import Path


class OperatorDocsTests(unittest.TestCase):
    def test_every_execution_role_uses_terminal_phase_helper(self):
        instructions = Path("tools/multica/instructions")
        for name in (
            "frontend_engineer.md",
            "backend_engineer.md",
            "independent_reviewer.md",
            "integration_qa.md",
        ):
            rendered = (instructions / name).read_text()
            with self.subTest(role=name):
                self.assertIn("tools.multica.workflow finish-phase", rendered)
                self.assertIn("done means phase execution finished", rendered)
                self.assertIn("pass|fail|blocked", rendered)

    def test_delivery_lead_uses_native_stages_and_deterministic_parent_plan(self):
        rendered = Path(
            "tools/multica/instructions/delivery_lead.md"
        ).read_text()
        for fragment in (
            "tools.multica.workflow plan-parent",
            "--stage",
            "eventra.workflow.next_stage",
            "eventra.workflow.last_action",
            "two complete repair attempts",
            "Closes PRO-N",
            "Related to PRO-M",
            "production deployment is always human-triggered",
        ):
            with self.subTest(fragment=fragment):
                self.assertIn(fragment, rendered)

    def test_unattended_parent_completion_and_exact_sha_checkout_are_explicit(self):
        instructions = Path("tools/multica/instructions")
        lead = (instructions / "delivery_lead.md").read_text()
        reviewer = (instructions / "independent_reviewer.md").read_text()
        qa = (instructions / "integration_qa.md").read_text()
        squad = (instructions / "squad.md").read_text()
        readme = Path("tools/multica/README.md").read_text()

        for fragment in (
            "tools.multica.workflow finish-parent",
            "directly to `done`",
            "production deployment is always human-triggered",
            "authoritative control repository",
        ):
            with self.subTest(role="lead", fragment=fragment):
                self.assertIn(fragment, " ".join(lead.split()))

        for role, rendered in (("reviewer", reviewer), ("qa", qa)):
            normalized = " ".join(rendered.split())
            for fragment in (
                "git switch --detach FULL_SHA",
                "FETCH_HEAD",
                "runtime-managed `AGENTS.md`, `.agent_context/`, and `.multica/`",
                "authoritative control repository",
            ):
                with self.subTest(role=role, fragment=fragment):
                    self.assertIn(fragment, normalized)

        for role, rendered in (("squad", squad), ("runbook", readme)):
            normalized = " ".join(rendered.split())
            with self.subTest(role=role):
                self.assertIn("tools.multica.workflow finish-parent", normalized)
                self.assertIn("directly to `done`", normalized)

    def test_runbook_documents_watcher_and_one_time_pro_35_recovery(self):
        readme = Path("tools/multica/README.md").read_text()
        for fragment in (
            "Eventra · Stalled Work Watcher",
            "native Stage barrier",
            "python3 -B -m tools.multica.workflow watch",
            "multica issue rerun PRO-35 --output json",
            "Do not manually mark PRO-36 PASS",
        ):
            with self.subTest(fragment=fragment):
                self.assertIn(fragment, readme)

    def test_runbook_documents_independent_watcher_agent(self):
        readme = Path("tools/multica/README.md").read_text()
        normalized = " ".join(readme.split())
        for fragment in (
            "Eventra Workflow Watcher",
            "not a member of `Eventra Local Delivery`",
            "does not receive backend environment values",
            "preserves the existing Autopilot and trigger IDs",
            "Multica 0.4.34",
        ):
            with self.subTest(fragment=fragment):
                self.assertIn(fragment, normalized)

    def test_cross_stack_qa_has_executable_dual_project_service_handoff(self):
        project_context = Path(
            "tools/multica/instructions/eventra_project.md"
        ).read_text()
        backend_context = Path(
            "tools/multica/instructions/eventra_backend_project.md"
        ).read_text()
        pilot = Path("docs/multica/pilot-issues.md").read_text()

        for rendered in (project_context, backend_context, pilot):
            self.assertIn("port 8080", rendered)
            self.assertIn("exact SHA", rendered)
        self.assertIn("keeps the backend child active", pilot)
        self.assertIn("one Reviewer task per Project", pilot)

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
