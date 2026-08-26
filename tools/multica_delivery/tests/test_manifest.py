from pathlib import Path
from types import MappingProxyType
import tempfile
import unittest

from tools.multica_delivery.manifest import (
    ManifestError,
    load_lock,
    load_manifest,
    load_manifest_text,
    manifest_digest,
)


FIXTURE = Path(__file__).parent / "fixtures" / "three-repository-delivery.yaml"


class ManifestTests(unittest.TestCase):
    @staticmethod
    def _with_role_skills(text: str) -> str:
        return text.replace(
            "policies:\n",
            "role_skills:\n"
            "  delivery-lead: [using-superpowers]\n"
            "  independent-reviewer: [using-superpowers, test-driven-development]\n"
            "  integration-qa: [using-superpowers]\n"
            "  workflow-watcher: [using-superpowers]\n"
            "policies:\n",
            1,
        )

    def test_loads_n_repository_manifest(self):
        manifest = load_manifest(FIXTURE)
        self.assertEqual(manifest.instance.key, "sample-commerce")
        self.assertEqual(tuple(manifest.repositories), ("web", "api", "notifications"))
        self.assertEqual(manifest.repositories["web"].depends_on, ("api",))
        self.assertTrue(manifest.policy.automatic_merge)
        self.assertEqual(manifest.policy.deployment, "forbidden")

    def test_digest_is_stable_for_equivalent_key_order(self):
        first = load_manifest(FIXTURE)
        text = FIXTURE.read_text().replace(
            "      focused_test: ./scripts/test-focused.sh\n"
            "      test: ./scripts/test.sh\n"
            "      build: ./scripts/build.sh\n"
            "      start: ./scripts/start.sh\n"
            "      smoke: ./scripts/smoke.sh\n",
            "      smoke: ./scripts/smoke.sh\n"
            "      start: ./scripts/start.sh\n"
            "      build: ./scripts/build.sh\n"
            "      test: ./scripts/test.sh\n"
            "      focused_test: ./scripts/test-focused.sh\n",
            1,
        )
        second = load_manifest_text(text)
        self.assertEqual(manifest_digest(first), manifest_digest(second))

    def test_rejects_production_automatic_merge(self):
        text = FIXTURE.read_text().replace("environment: development", "environment: production")
        with self.assertRaisesRegex(ManifestError, "automatic_merge"):
            load_manifest_text(text)

    def test_rejects_unknown_and_alias_policy_environments(self):
        for environment in ("prod", "dev", "staging", "Development"):
            with self.subTest(environment=environment):
                text = FIXTURE.read_text().replace(
                    "environment: development",
                    f"environment: {environment}",
                )
                with self.assertRaisesRegex(ManifestError, "environment"):
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

    def test_rejects_duplicate_repository_github_slug(self):
        text = FIXTURE.read_text().replace(
            "codeExploreHub/sample-commerce-api", "codeExploreHub/sample-commerce-web"
        )
        with self.assertRaisesRegex(ManifestError, "duplicate GitHub repository"):
            load_manifest_text(text)

    def test_rejects_control_github_slug_reused_by_repository(self):
        text = FIXTURE.read_text().replace(
            "codeExploreHub/sample-commerce-api",
            "codeExploreHub/sample-commerce-delivery-control",
        )
        with self.assertRaisesRegex(ManifestError, "duplicate GitHub repository"):
            load_manifest_text(text)

    def test_rejects_control_project_reused_by_repository(self):
        text = FIXTURE.read_text().replace(
            "project: Sample Commerce API", "project: Sample Commerce Delivery Control"
        )
        with self.assertRaisesRegex(ManifestError, "duplicate Project"):
            load_manifest_text(text)

    def test_rejects_integration_suite_missing_dependency_closure(self):
        text = FIXTURE.read_text().replace("repositories: [api, web]", "repositories: [web]").replace(
            "start_order: [api, web]", "start_order: [web]"
        )
        with self.assertRaisesRegex(ManifestError, "dependency closure"):
            load_manifest_text(text)

    def test_rejects_boolean_schema_version(self):
        text = FIXTURE.read_text().replace("schema_version: 1", "schema_version: true", 1)
        with self.assertRaisesRegex(ManifestError, "schema_version"):
            load_manifest_text(text)

    def test_rejects_boolean_lock_version_fields(self):
        lock = """\
skill_version: 1.0.0
engine_version: 1.0.0
manifest_schema_version: 1
workflow_metadata_version: 1
supported_multica_cli: '>=0.4'
manifest_digest: abcdef
resource_ids: {}
"""
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "framework.lock"
            for field in ("manifest_schema_version", "workflow_metadata_version"):
                with self.subTest(field=field):
                    invalid = lock.replace(f"{field}: 1", f"{field}: true")
                    path.write_text(invalid, encoding="utf-8")
                    with self.assertRaisesRegex(ManifestError, field):
                        load_lock(path)

    def test_loads_complete_explicit_fixed_role_skill_bindings(self):
        manifest = load_manifest_text(
            self._with_role_skills(FIXTURE.read_text(encoding="utf-8"))
        )

        self.assertEqual(
            manifest.role_skills,
            {
                "delivery-lead": ("using-superpowers",),
                "independent-reviewer": (
                    "using-superpowers",
                    "test-driven-development",
                ),
                "integration-qa": ("using-superpowers",),
                "workflow-watcher": ("using-superpowers",),
            },
        )
        self.assertIsInstance(manifest.role_skills, MappingProxyType)
        with self.assertRaises(TypeError):
            manifest.role_skills["delivery-lead"] = ()

    def test_rejects_incomplete_duplicate_or_undeclared_role_skills(self):
        text = self._with_role_skills(FIXTURE.read_text(encoding="utf-8"))
        cases = (
            (
                text.replace(
                    "  workflow-watcher: [using-superpowers]\n",
                    "",
                    1,
                ),
                "every fixed role",
            ),
            (
                text.replace(
                    "  integration-qa: [using-superpowers]\n",
                    "  integration-qa: [using-superpowers, using-superpowers]\n",
                    1,
                ),
                "non-empty and unique",
            ),
            (
                text.replace(
                    "  delivery-lead: [using-superpowers]\n",
                    "  delivery-lead: [unknown-skill]\n",
                    1,
                ),
                "undeclared skill",
            ),
        )
        for malformed, error in cases:
            with self.subTest(error=error):
                with self.assertRaisesRegex(ManifestError, error):
                    load_manifest_text(malformed)
