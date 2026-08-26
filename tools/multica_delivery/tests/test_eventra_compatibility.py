from pathlib import Path
from types import MappingProxyType
import unittest

from tools.multica.eventra_adapter import (
    eventra_manifest,
    EVENTRA_COMPATIBILITY_LOCK_IDS,
)
from tools.multica_delivery.manifest import load_manifest


FIXTURE = Path(__file__).parent / "fixtures" / "eventra-delivery.yaml"


class EventraCompatibilityTests(unittest.TestCase):
    def setUp(self):
        self.workspace = Path("/Users/didi/Eventra-workspace")

    def test_eventra_translates_to_control_plus_two_repositories(self):
        manifest = eventra_manifest(self.workspace)

        self.assertEqual(
            manifest.control.github,
            "codeExploreHub/eventra-delivery-control",
        )
        self.assertEqual(tuple(manifest.repositories), ("frontend", "backend"))
        self.assertEqual(
            manifest.repositories["frontend"].github,
            "codeExploreHub/Eventra",
        )
        self.assertEqual(
            manifest.repositories["backend"].github,
            "codeExploreHub/Eventra-Backend",
        )

    def test_eventra_remains_local_development_manual_deploy(self):
        manifest = eventra_manifest(self.workspace)

        self.assertEqual(manifest.policy.environment, "development")
        self.assertTrue(manifest.policy.automatic_merge)
        self.assertEqual(manifest.policy.deployment, "forbidden")

    def test_translation_uses_the_supplied_workspace_without_mutating_product_identity(self):
        workspace = Path("/srv/products")
        manifest = eventra_manifest(workspace)

        self.assertEqual(
            manifest.control.local_path,
            workspace / "Eventra-Delivery-Control",
        )
        self.assertEqual(
            manifest.repositories["frontend"].local_path,
            workspace / "Eventra",
        )
        self.assertEqual(
            manifest.repositories["backend"].local_path,
            workspace / "Eventra-Backend",
        )
        self.assertEqual(manifest.instance.key, "eventra")

    def test_translation_matches_the_reviewed_eventra_fixture(self):
        self.assertEqual(eventra_manifest(self.workspace), load_manifest(FIXTURE))

    def test_compatibility_ids_are_read_only_data_and_keep_live_identity(self):
        manifest = eventra_manifest(self.workspace)
        self.assertEqual(
            manifest.instance.runtime_id,
            "de500649-cada-4419-9d5d-279045e2eaae",
        )
        self.assertEqual(
            manifest.instance.daemon_id,
            "019fab98-bbad-7d17-b0b7-26e56dbe1b6f",
        )
        self.assertIsInstance(EVENTRA_COMPATIBILITY_LOCK_IDS, MappingProxyType)
        self.assertEqual(
            EVENTRA_COMPATIBILITY_LOCK_IDS,
            {
                "agent": {
                    "workflow-watcher": "7fed6058-d0ab-42b7-9092-42df03c10890",
                },
                "autopilot": {
                    "workflow-watcher": "4103d5e7-1b3b-4856-94a1-9ffe1b096812",
                },
                "trigger": {
                    "workflow-watcher": "7a6dea91-03a1-4e70-8709-9d5a97ec7f77",
                },
            },
        )
        with self.assertRaises(TypeError):
            EVENTRA_COMPATIBILITY_LOCK_IDS["agent"] = {}
        with self.assertRaises(TypeError):
            EVENTRA_COMPATIBILITY_LOCK_IDS["agent"]["workflow-watcher"] = "other"

    def test_manifest_exposes_local_commands_dependencies_and_secret_names_only(self):
        manifest = eventra_manifest(self.workspace)
        frontend = manifest.repositories["frontend"]
        backend = manifest.repositories["backend"]

        self.assertEqual(frontend.depends_on, ("backend",))
        self.assertEqual(manifest.merge_order, ("backend", "frontend"))
        self.assertEqual(frontend.commands["start"], ("npm", "run", "dev:local"))
        self.assertEqual(backend.commands["test"], ("scripts/test-local.sh",))
        self.assertEqual(
            set(backend.secret_env),
            {"JWT_SECRET", "MAIL_USERNAME", "MAIL_PASSWORD"},
        )
        self.assertEqual(
            manifest.integration_suites[0].start_order,
            ("backend", "frontend"),
        )


if __name__ == "__main__":
    unittest.main()
