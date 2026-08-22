"""Frozen, sanitized Multica 0.4.31 read-contract tests."""

import copy
import json
from pathlib import Path
import unittest

from tools.multica.contracts import (
    parse_agent_detail,
    parse_agent_environment,
    parse_agent_list,
    parse_agent_skill_list,
    parse_project_detail,
    parse_project_list,
    parse_project_resources,
    parse_runtime_list,
    parse_skill_detail,
    parse_skill_list,
    parse_squad_detail,
    parse_squad_list,
    parse_squad_members,
)


FIXTURE_PROVENANCE = (
    "All fixtures are synthetic scalar replacements for the 2026-08-23 "
    "read-only Multica 0.4.31 probe; detail fixtures capture strict "
    "first-create reads where preflight had no representative object."
)
FIXTURES = Path(__file__).parent / "fixtures" / "multica_0_4_31"


def fixture(name):
    with (FIXTURES / name).open(encoding="utf-8") as handle:
        return json.load(handle)


class MulticaReadContractTests(unittest.TestCase):
    def test_valid_fixtures_normalize_only_reconciliation_fields_without_mutation(self):
        cases = (
            (
                "runtime-list.json", parse_runtime_list, ("runtime-synthetic",),
                [{"id": "runtime-synthetic", "daemon_id": "daemon-synthetic", "status": "online", "metadata": {"capabilities": ["local-worktree-v1", "synthetic-capability"]}}],
            ),
            ("skill-list.json", parse_skill_list, (), [{"id": "skill-synthetic", "name": "synthetic-skill"}]),
            (
                "skill-get.json", parse_skill_detail, ("skill-synthetic",),
                {"id": "skill-synthetic", "name": "synthetic-skill", "config": {"origin": {"source_url": "https://example.invalid/synthetic/skill"}}},
            ),
            ("agent-list.json", parse_agent_list, (), [{"id": "agent-synthetic", "name": "Synthetic Agent"}]),
            (
                "agent-get.json", parse_agent_detail, ("agent-synthetic",),
                {"id": "agent-synthetic", "name": "Synthetic Agent", "description": "Synthetic description", "instructions": "Synthetic instructions", "runtime_id": "runtime-synthetic", "visibility": "workspace", "max_concurrent_tasks": 1},
            ),
            ("agent-skill-list.json", parse_agent_skill_list, (), [{"id": "skill-synthetic", "name": "synthetic-skill"}]),
            ("squad-list.json", parse_squad_list, (), [{"id": "squad-synthetic", "name": "Synthetic Squad"}]),
            (
                "squad-get.json", parse_squad_detail, ("squad-synthetic",),
                {"id": "squad-synthetic", "name": "Synthetic Squad", "description": "Synthetic Squad description", "instructions": "Synthetic Squad instructions", "leader_id": "agent-synthetic"},
            ),
            (
                "squad-member-list.json", parse_squad_members, ("squad-synthetic",),
                [{"member_id": "agent-member", "member_type": "agent", "role": "synthetic_role"}],
            ),
            ("project-list.json", parse_project_list, (), [{"id": "project-synthetic", "title": "Synthetic Project"}]),
            (
                "project-get.json", parse_project_detail, ("project-synthetic",),
                {"id": "project-synthetic", "title": "Synthetic Project", "description": "Synthetic Project context"},
            ),
            (
                "project-local-resource-list.json", parse_project_resources, ("project-synthetic",),
                [{"id": "resource-synthetic", "resource_type": "local_directory", "resource_ref": {"local_path": "/synthetic/project", "daemon_id": "daemon-synthetic"}}],
            ),
        )
        for name, parser, args, expected in cases:
            with self.subTest(name=name):
                value = fixture(name)
                original = copy.deepcopy(value)
                self.assertEqual(parser(value, *args), expected)
                self.assertEqual(value, original)

    def test_agent_environment_requires_matching_envelope_and_string_map_without_leaking_content(self):
        envelope = fixture("agent-env-get.json")
        self.assertEqual(
            parse_agent_environment(envelope, "agent-backend"),
            envelope["custom_env"],
        )
        for malformed in (
            envelope["custom_env"],
            {**envelope, "agent_id": "other-agent"},
            {**envelope, "custom_env": {"KEY": 7}},
        ):
            with self.subTest(malformed_type=type(malformed).__name__):
                with self.assertRaisesRegex(RuntimeError, "malformed agent environment") as caught:
                    parse_agent_environment(malformed, "agent-backend")
                self.assertNotIn("KEY", str(caught.exception))
                self.assertNotIn("other-agent", str(caught.exception))

    def test_runtime_list_normalizes_unrelated_degraded_records_to_ids(self):
        target = fixture("runtime-list.json")[0]
        unrelated_id = "unrelated-degraded-runtime"

        self.assertEqual(
            parse_runtime_list([target, {"id": unrelated_id}], "runtime-synthetic"),
            [
                {
                    "id": "runtime-synthetic",
                    "daemon_id": "daemon-synthetic",
                    "status": "online",
                    "metadata": {
                        "capabilities": [
                            "local-worktree-v1",
                            "synthetic-capability",
                        ]
                    },
                },
                {"id": unrelated_id},
            ],
        )

    def test_runtime_list_rejects_missing_or_duplicate_ids_and_malformed_target(self):
        value = fixture("runtime-list.json")
        bad_capabilities = copy.deepcopy(value)
        bad_capabilities[0]["metadata"]["capabilities"] = ["local-worktree-v1", 7]
        for malformed in (
            {"id": "runtime-synthetic"},
            [{**value[0], "id": ""}],
            [value[0], copy.deepcopy(value[0])],
            bad_capabilities,
        ):
            with self.subTest(malformed=malformed):
                with self.assertRaisesRegex(RuntimeError, "malformed runtime list"):
                    parse_runtime_list(malformed, "runtime-synthetic")

        for unrelated in ({}, {"id": ""}):
            with self.subTest(unrelated=unrelated):
                with self.assertRaisesRegex(RuntimeError, "malformed runtime list"):
                    parse_runtime_list([value[0], unrelated], "runtime-synthetic")

    def test_skill_contracts_reject_duplicate_ids_wrong_targets_and_bad_origin(self):
        listing = fixture("skill-list.json")
        detail = fixture("skill-get.json")
        bad_origin = copy.deepcopy(detail)
        bad_origin["config"]["origin"] = {"source_url": 7}
        for malformed in (
            [{**listing[0], "name": ""}],
            [listing[0], copy.deepcopy(listing[0])],
        ):
            with self.subTest(listing=malformed):
                with self.assertRaisesRegex(RuntimeError, "malformed skill list"):
                    parse_skill_list(malformed)
        for malformed, expected in (
            ({**detail, "id": "other-skill"}, "skill detail"),
            (bad_origin, "skill detail"),
        ):
            with self.subTest(detail=malformed):
                with self.assertRaisesRegex(RuntimeError, f"malformed {expected}"):
                    parse_skill_detail(malformed, "skill-synthetic")

    def test_agent_contracts_reject_duplicate_ids_wrong_targets_and_invalid_required_fields(self):
        listing = fixture("agent-list.json")
        detail = fixture("agent-get.json")
        for malformed in (
            [{**listing[0], "name": ""}],
            [listing[0], copy.deepcopy(listing[0])],
        ):
            with self.subTest(listing=malformed):
                with self.assertRaisesRegex(RuntimeError, "malformed agent list"):
                    parse_agent_list(malformed)
        for malformed in (
            {**detail, "id": "other-agent"},
            {key: value for key, value in detail.items() if key != "runtime_id"},
            {**detail, "max_concurrent_tasks": "1"},
        ):
            with self.subTest(detail=malformed):
                with self.assertRaisesRegex(RuntimeError, "malformed agent detail"):
                    parse_agent_detail(malformed, "agent-synthetic")

    def test_agent_skill_list_rejects_non_string_binding_ids_and_duplicates(self):
        value = fixture("agent-skill-list.json")
        for malformed in (
            [{**value[0], "id": 7}],
            [{**value[0], "name": ""}],
            [value[0], copy.deepcopy(value[0])],
        ):
            with self.subTest(malformed=malformed):
                with self.assertRaisesRegex(RuntimeError, "malformed agent skill list"):
                    parse_agent_skill_list(malformed)

    def test_squad_contracts_reject_duplicate_ids_missing_names_and_wrong_targets(self):
        listing = fixture("squad-list.json")
        detail = fixture("squad-get.json")
        for malformed in (
            [{**listing[0], "name": ""}],
            [listing[0], copy.deepcopy(listing[0])],
        ):
            with self.subTest(listing=malformed):
                with self.assertRaisesRegex(RuntimeError, "malformed squad list"):
                    parse_squad_list(malformed)
        for malformed in (
            {**detail, "id": "other-squad"},
            {key: value for key, value in detail.items() if key != "leader_id"},
        ):
            with self.subTest(detail=malformed):
                with self.assertRaisesRegex(RuntimeError, "malformed squad detail"):
                    parse_squad_detail(malformed, "squad-synthetic")

    def test_squad_members_reject_wrong_squad_ids_duplicate_record_ids_and_bad_bindings(self):
        value = fixture("squad-member-list.json")
        for malformed in (
            [{**value[0], "squad_id": "other-squad"}],
            [value[0], copy.deepcopy(value[0])],
            [{**value[0], "member_id": 7}],
        ):
            with self.subTest(malformed=malformed):
                with self.assertRaisesRegex(RuntimeError, "malformed squad member list"):
                    parse_squad_members(malformed, "squad-synthetic")

    def test_project_contracts_reject_duplicate_ids_missing_titles_and_wrong_targets(self):
        listing = fixture("project-list.json")
        detail = fixture("project-get.json")
        for malformed in (
            [{**listing[0], "title": ""}],
            [listing[0], copy.deepcopy(listing[0])],
        ):
            with self.subTest(listing=malformed):
                with self.assertRaisesRegex(RuntimeError, "malformed project list"):
                    parse_project_list(malformed)
        for malformed in (
            {**detail, "id": "other-project"},
            {**detail, "description": 7},
        ):
            with self.subTest(detail=malformed):
                with self.assertRaisesRegex(RuntimeError, "malformed project detail"):
                    parse_project_detail(malformed, "project-synthetic")

    def test_project_resources_reject_wrong_project_duplicate_ids_and_malformed_refs(self):
        value = fixture("project-local-resource-list.json")
        for malformed in (
            [{**value[0], "project_id": "other-project"}],
            [value[0], copy.deepcopy(value[0])],
            [{**value[0], "resource_ref": {"local_path": "/synthetic/project", "daemon_id": 7}}],
        ):
            with self.subTest(malformed=malformed):
                with self.assertRaisesRegex(RuntimeError, "malformed project resource list"):
                    parse_project_resources(malformed, "project-synthetic")

    def test_project_resource_execution_mode_is_optional_but_strict_when_present(self):
        value = fixture("project-local-resource-list.json")
        self.assertNotIn(
            "execution_mode",
            parse_project_resources(value, "project-synthetic")[0]["resource_ref"],
        )

        observed = copy.deepcopy(value)
        observed[0]["resource_ref"]["execution_mode"] = "worktree"
        self.assertEqual(
            parse_project_resources(observed, "project-synthetic")[0]["resource_ref"][
                "execution_mode"
            ],
            "worktree",
        )

        malformed = copy.deepcopy(value)
        malformed[0]["resource_ref"]["execution_mode"] = 7
        with self.assertRaisesRegex(RuntimeError, "malformed project resource list"):
            parse_project_resources(malformed, "project-synthetic")


if __name__ == "__main__":
    unittest.main()
