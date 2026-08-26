from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[3]
CORE_DOC = ROOT / "docs" / "multica-delivery-core.md"


class CoreDocumentationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.text = CORE_DOC.read_text(encoding="utf-8")
        cls.normalized = " ".join(cls.text.split())

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

    def test_documents_side_effect_and_apply_boundaries(self):
        self.assertIn("Importing modules and running tests never mutates", self.normalized)
        self.assertIn("apply=True", self.text)
        self.assertIn("Plan 2 owns the user-facing CLI confirmation boundary", self.normalized)

    def test_documents_public_skill_source_policy(self):
        self.assertIn("operator-approved public GitHub URLs only", self.normalized)
        self.assertIn(
            "does not query or import from the company-internal SkillsHub",
            self.normalized,
        )

    def test_documents_eventra_compatibility_boundary(self):
        self.assertIn("Eventra compatibility adapter remains operational", self.normalized)
        self.assertIn("eventra_manifest(workspace)", self.text)

    def test_documents_merge_deployment_and_watcher_policies(self):
        for statement in (
            "development/local quality gates may authorize automatic merge",
            "deployment is always a separate, manually triggered external action",
            "production forbids automatic merge and deployment",
            "independent Workflow Watcher",
        ):
            with self.subTest(statement=statement):
                self.assertIn(statement, self.normalized)

    def test_reserves_plan_2_lifecycle_command_names_without_claiming_a_cli_exists(self):
        self.assertIn(
            "No generic user-facing CLI is implemented in this core",
            self.normalized,
        )
        for command in (
            "discover",
            "init",
            "validate",
            "plan",
            "apply",
            "doctor",
            "upgrade",
        ):
            with self.subTest(command=command):
                self.assertIn(f"`{command}`", self.text)


if __name__ == "__main__":
    unittest.main()
