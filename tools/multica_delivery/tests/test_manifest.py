from pathlib import Path
from types import MappingProxyType
import unittest

from tools.multica_delivery.manifest import (
    ManifestError,
    load_manifest,
    load_manifest_text,
    manifest_digest,
)


FIXTURE = Path(__file__).parent / "fixtures" / "three-repository-delivery.yaml"


class ManifestTests(unittest.TestCase):
    def test_loads_n_repository_manifest(self):
        manifest = load_manifest(FIXTURE)
        self.assertEqual(manifest.instance.key, "sample-commerce")
        self.assertEqual(tuple(manifest.repositories), ("web", "api", "notifications"))
        self.assertEqual(manifest.repositories["web"].depends_on, ("api",))
        self.assertTrue(manifest.policy.automatic_merge)
        self.assertEqual(manifest.policy.deployment, "forbidden")

    def test_digest_is_stable_for_equivalent_key_order(self):
        first = load_manifest(FIXTURE)
        second = load_manifest(FIXTURE)
        self.assertEqual(manifest_digest(first), manifest_digest(second))

    def test_rejects_production_automatic_merge(self):
        text = FIXTURE.read_text().replace("environment: development", "environment: production")
        with self.assertRaisesRegex(ManifestError, "automatic_merge"):
            load_manifest_text(text)

    def test_rejects_duplicate_yaml_keys(self):
        text = FIXTURE.read_text().replace(
            "schema_version: 1", "schema_version: 1\nschema_version: 1"
        )
        with self.assertRaisesRegex(ManifestError, "duplicate key"):
            load_manifest_text(text)

    def test_models_have_read_only_mappings(self):
        manifest = load_manifest(FIXTURE)
        self.assertIsInstance(manifest.repositories, MappingProxyType)
        with self.assertRaises(TypeError):
            manifest.repositories["other"] = manifest.repositories["api"]

    def test_rejects_missing_mandatory_command(self):
        text = FIXTURE.read_text().replace("      smoke: npm run smoke\n", "", 1)
        with self.assertRaisesRegex(ManifestError, "smoke"):
            load_manifest_text(text)

    def test_rejects_unknown_dependency(self):
        text = FIXTURE.read_text().replace("depends_on: [api]", "depends_on: [missing]", 1)
        with self.assertRaisesRegex(ManifestError, "unknown dependency"):
            load_manifest_text(text)

    def test_rejects_duplicate_service_port(self):
        text = FIXTURE.read_text().replace("port: 8090", "port: 8080")
        with self.assertRaisesRegex(ManifestError, "duplicate service port"):
            load_manifest_text(text)
