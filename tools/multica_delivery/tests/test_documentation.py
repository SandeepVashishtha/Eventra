from pathlib import Path
import re
import unittest


ROOT = Path(__file__).resolve().parents[3]
CORE_DOC = ROOT / "docs" / "multica-delivery-core.md"


class CoreDocumentationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.text = CORE_DOC.read_text(encoding="utf-8")
        cls.normalized = " ".join(cls.text.split())

    @classmethod
    def section(cls, heading):
        match = re.search(
            rf"^## {re.escape(heading)}\n(?P<body>.*?)(?=^## |\Z)",
            cls.text,
            flags=re.MULTILINE | re.DOTALL,
        )
        if match is None:
            raise AssertionError(f"missing documentation section: {heading}")
        return match.group("body")

    @classmethod
    def normalized_section(cls, heading):
        return " ".join(cls.section(heading).split())

    def test_documents_pinned_install_and_verification_commands(self):
        for command in (
            "python3 -m pip install -r requirements-multica.txt",
            "python3 -B -m unittest discover -s tools -p 'test_*.py' -v",
            "python3 -B -m compileall -q tools/multica tools/multica_delivery",
        ):
            with self.subTest(command=command):
                self.assertIn(command, self.text)

    def test_documents_manifest_and_lock_paths(self):
        self.assertIn("delivery-control/delivery.yaml", self.text)
        self.assertIn("delivery-control/framework.lock", self.text)

    def test_install_section_states_the_complete_import_and_test_guarantee(self):
        install = self.normalized_section("Install and verify")
        self.assertIn(
            "Importing modules and running tests never mutate Multica, GitHub, "
            "local services, or secrets.",
            install,
        )

    def test_effect_section_states_the_complete_apply_authority_boundary(self):
        effects = self.normalized_section(
            "Effect, merge, deployment, and Watcher policy"
        )
        self.assertIn(
            "Only `Provisioner.reconcile(..., apply=True, ...)` authorizes the "
            "planned Multica resource reconciliation.",
            effects,
        )
        self.assertIn(
            "That approval does not authorize GitHub repository creation, "
            "commit, push, business-code changes, pull-request merge, or deployment.",
            effects,
        )

    def test_plan_2_owns_the_unimplemented_cli_confirmation_boundary(self):
        introduction = self.text.split("## Control repository inputs", 1)[0]
        self.assertIn(
            "Plan 2 owns the user-facing CLI confirmation boundary",
            " ".join(introduction.split()),
        )

    def test_documents_public_skill_source_policy(self):
        inputs = self.normalized_section("Control repository inputs")
        self.assertIn("operator-approved public GitHub URLs only", inputs)
        self.assertIn(
            "does not query or import from the company-internal SkillsHub",
            inputs,
        )

    def test_documents_eventra_compatibility_boundary(self):
        compatibility = self.normalized_section(
            "Eventra compatibility and migration boundary"
        )
        self.assertIn(
            "Eventra compatibility adapter remains operational",
            compatibility,
        )
        self.assertIn("eventra_manifest(workspace)", compatibility)

    def test_documents_merge_deployment_and_watcher_policies(self):
        effects = self.normalized_section(
            "Effect, merge, deployment, and Watcher policy"
        )
        for statement in (
            "development/local quality gates may authorize automatic merge",
            "deployment is always a separate, manually triggered external action",
            "production forbids automatic merge and deployment",
            "independent Workflow Watcher",
        ):
            with self.subTest(statement=statement):
                self.assertIn(statement, effects)

    def test_documents_only_pre_merge_evidence_the_current_core_proves(self):
        effects = self.normalized_section(
            "Effect, merge, deployment, and Watcher policy"
        )
        self.assertIn(
            "Before merging, the current Core proves exact-SHA implementation "
            "PASS evidence, independent review and repository/integration QA "
            "evidence, required GitHub checks, and merge preflight.",
            effects,
        )
        self.assertIn(
            "`focused_test`, `test`, and `build` are manifest and Agent contracts, "
            "and inputs for a future executor; the current Core neither executes "
            "them nor records structured exact-SHA results for them.",
            effects,
        )
        self.assertIn(
            "After merging, `OwnedSmokeExecutor` runs declared repository smoke "
            "and applicable integration commands against the authoritative merged "
            "SHA map. Before starting any service, and again after startup, it "
            "binds every local checkout with the closed argv `git rev-parse HEAD`; "
            "stale or incomplete checkout evidence blocks command execution.",
            effects,
        )
        self.assertIn(
            "Every command result must also carry the same structured exact-SHA "
            "map, so a runner returning only a boolean cannot create authoritative "
            "smoke evidence.",
            effects,
        )
        self.assertNotRegex(effects, r"exact-SHA tests(?:,| and) builds")

    def test_reserves_plan_2_lifecycle_command_names_without_claiming_a_cli_exists(self):
        lifecycle = self.section("Plan 2 lifecycle names")
        self.assertIn(
            "No generic user-facing CLI is implemented in this core",
            self.normalized,
        )
        command_names = tuple(
            re.findall(r"^- `([a-z][a-z-]*)`:", lifecycle, flags=re.MULTILINE)
        )
        self.assertEqual(
            command_names,
            (
                "discover",
                "init",
                "validate",
                "plan",
                "apply",
                "doctor",
                "upgrade",
            ),
        )

    def test_forbids_contradictory_authority_or_nonexistent_cli_instructions(self):
        forbidden = (
            r"python3\s+(?:-B\s+)?-m\s+tools\.multica_delivery(?:\s|\.)",
            r"(?:may|can|will|does)\s+automatically\s+deploy",
            r"automatic deployment is (?:allowed|enabled|supported)",
            r"production.{0,80}(?:may|can|allows|permits).{0,40}automatic merge",
            r"production.{0,80}automatic merge (?:is|remains) "
            r"(?:allowed|enabled|supported)",
            r"(?:may|can|will|should)\s+(?:query|import).{0,40}SkillsHub",
            r"(?:may|can|will|should)\s+use.{0,20}SkillsHub",
            r"SkillsHub.{0,40}(?:allowed|supported) skill source",
        )
        for pattern in forbidden:
            with self.subTest(pattern=pattern):
                self.assertNotRegex(self.normalized, re.compile(pattern, re.IGNORECASE))


if __name__ == "__main__":
    unittest.main()
