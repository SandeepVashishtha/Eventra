"""Strict, sanitized Multica 0.4.33 Issue read-contract tests."""

import copy
import unittest

from tools.multica.issue_contracts import (
    parse_issue_children,
    parse_issue_detail,
    parse_issue_list,
    parse_issue_metadata,
    parse_issue_runs,
)


PARENT_ID = "01a00000-0000-7000-8000-000000000001"
CHILD_ID = "01a00000-0000-7000-8000-000000000002"
PROJECT_ID = "00000000-0000-4000-8000-000000000003"
AGENT_ID = "00000000-0000-4000-8000-000000000004"
RUN_ID = "01a00000-0000-7000-8000-000000000005"


def issue_detail(**overrides):
    value = {
        "assignee_id": AGENT_ID,
        "assignee_type": "agent",
        "created_at": "2026-08-25T08:33:39Z",
        "creator_id": AGENT_ID,
        "creator_type": "agent",
        "description": "Synthetic child description",
        "due_date": None,
        "id": CHILD_ID,
        "identifier": "PRO-36",
        "labels": [],
        "last_activity_at": "2026-08-25T08:50:06.346659Z",
        "metadata": {},
        "number": 36,
        "parent_issue_id": PARENT_ID,
        "position": -8,
        "priority": "none",
        "project_id": PROJECT_ID,
        "properties": {},
        "revision": 4,
        "stage": 1,
        "start_date": None,
        "status": "in_review",
        "status_category": "in_review",
        "title": "Synthetic frontend child",
        "updated_at": "2026-08-25T08:50:06Z",
        "workspace_id": "00000000-0000-4000-8000-000000000006",
    }
    value.update(overrides)
    return value


def issue_children():
    return {
        "stages": [
            {
                "stage": 1,
                "total": 1,
                "done": 0,
                "issues": [issue_detail()],
            }
        ],
        "total": 1,
        "unstaged": [],
    }


def issue_run(**overrides):
    value = {
        "agent_id": AGENT_ID,
        "attempt": 1,
        "attribution": {
            "delegated_from_task_id": "01a00000-0000-7000-8000-000000000007",
            "evidence": {"kind": "issue_assignment", "ref_id": CHILD_ID},
            "initiator": {"id": AGENT_ID, "name": "Synthetic User"},
            "originator": {"id": AGENT_ID, "name": "Synthetic User"},
            "precise": True,
            "source": "delegation",
        },
        "branch_name": "agent/synthetic/abcdef123456",
        "completed_at": "2026-08-25T08:50:28Z",
        "created_at": "2026-08-25T08:33:39Z",
        "delivered_comment_ids": [],
        "dispatched_at": "2026-08-25T08:33:39Z",
        "durable_work_dir": "/synthetic/Eventra",
        "error": None,
        "id": RUN_ID,
        "issue_id": CHILD_ID,
        "kind": "direct",
        "max_attempts": 2,
        "priority": 0,
        "result": {
            "branch_name": "agent/synthetic/abcdef123456",
            "durable_work_dir": "/synthetic/Eventra",
            "output": "Synthetic output",
            "pr_url": "",
            "session_id": "01a00000-0000-7000-8000-000000000008",
            "work_dir": "/synthetic/worktree",
        },
        "runtime_id": "00000000-0000-4000-8000-000000000009",
        "started_at": "2026-08-25T08:34:04Z",
        "status": "completed",
        "usage": [],
        "work_dir": "/synthetic/worktree",
        "workspace_id": "00000000-0000-4000-8000-000000000006",
    }
    value.update(overrides)
    return value


class IssueContractTests(unittest.TestCase):
    def test_detail_normalizes_only_workflow_fields_without_mutation(self):
        value = issue_detail()
        original = copy.deepcopy(value)

        self.assertEqual(
            parse_issue_detail(value, "PRO-36"),
            {
                "id": CHILD_ID,
                "identifier": "PRO-36",
                "parent_issue_id": PARENT_ID,
                "stage": 1,
                "status": "in_review",
                "assignee_id": AGENT_ID,
                "assignee_type": "agent",
                "project_id": PROJECT_ID,
                "updated_at": "2026-08-25T08:50:06Z",
            },
        )
        self.assertEqual(value, original)

    def test_detail_rejects_wrong_identifier_and_invalid_workflow_fields(self):
        malformed_values = (
            issue_detail(identifier="PRO-37"),
            issue_detail(id=""),
            issue_detail(parent_issue_id=7),
            issue_detail(stage=0),
            issue_detail(stage=True),
            issue_detail(status="mystery"),
            issue_detail(assignee_id=None),
            issue_detail(assignee_type="robot"),
            issue_detail(project_id=""),
            issue_detail(updated_at="yesterday"),
        )
        for malformed in malformed_values:
            with self.subTest(field_values=malformed):
                with self.assertRaisesRegex(RuntimeError, "malformed issue detail"):
                    parse_issue_detail(malformed, "PRO-36")

    def test_detail_allows_member_assignee_for_structured_human_wait_detection(self):
        parsed = parse_issue_detail(
            issue_detail(assignee_id=AGENT_ID, assignee_type="member"),
            "PRO-36",
        )
        self.assertEqual(parsed["assignee_type"], "member")

    def test_issue_list_requires_exact_project_pagination_and_unique_records(self):
        envelope = {
            "has_more": False,
            "issues": [issue_detail()],
            "limit": 50,
            "offset": 0,
            "total": 1,
        }
        self.assertEqual(
            parse_issue_list(envelope, PROJECT_ID)["issues"][0]["identifier"],
            "PRO-36",
        )
        for malformed in (
            {**envelope, "has_more": True},
            {**envelope, "total": 2},
            {**envelope, "issues": [issue_detail(), issue_detail()], "total": 2},
            {**envelope, "issues": [issue_detail(project_id="other-project")]},
            {key: item for key, item in envelope.items() if key != "offset"},
        ):
            with self.subTest(shape=malformed):
                with self.assertRaisesRegex(RuntimeError, "malformed issue list"):
                    parse_issue_list(malformed, PROJECT_ID)

    def test_children_require_one_parent_unique_ids_and_consistent_stage_counts(self):
        value = issue_children()
        original = copy.deepcopy(value)
        parsed = parse_issue_children(value, PARENT_ID)
        self.assertEqual(parsed[0]["parent_issue_id"], PARENT_ID)
        self.assertEqual(parsed[0]["stage"], 1)
        self.assertEqual(value, original)

        duplicate = issue_children()
        duplicate["stages"][0]["issues"].append(
            copy.deepcopy(duplicate["stages"][0]["issues"][0])
        )
        duplicate["stages"][0]["total"] = 2
        duplicate["total"] = 2

        wrong_parent = issue_children()
        wrong_parent["stages"][0]["issues"][0]["parent_issue_id"] = "other-parent"

        wrong_stage = issue_children()
        wrong_stage["stages"][0]["issues"][0]["stage"] = 2

        wrong_done = issue_children()
        wrong_done["stages"][0]["done"] = 1

        wrong_total = issue_children()
        wrong_total["total"] = 2

        for malformed in (
            duplicate,
            wrong_parent,
            wrong_stage,
            wrong_done,
            wrong_total,
            {"stages": [], "total": 0},
        ):
            with self.subTest(shape=malformed):
                with self.assertRaisesRegex(RuntimeError, "malformed issue children"):
                    parse_issue_children(malformed, PARENT_ID)

    def test_children_include_valid_unstaged_children_with_null_stage(self):
        value = {"stages": [], "total": 1, "unstaged": [issue_detail(stage=None)]}
        parsed = parse_issue_children(value, PARENT_ID)
        self.assertEqual(len(parsed), 1)
        self.assertIsNone(parsed[0]["stage"])

    def test_runs_require_unique_ids_exact_issue_ownership_and_valid_activity_time(self):
        value = [issue_run()]
        original = copy.deepcopy(value)
        self.assertEqual(
            parse_issue_runs(value, CHILD_ID),
            [
                {
                    "id": RUN_ID,
                    "issue_id": CHILD_ID,
                    "status": "completed",
                    "created_at": "2026-08-25T08:33:39Z",
                    "activity_at": "2026-08-25T08:50:28Z",
                }
            ],
        )
        self.assertEqual(value, original)

        duplicate = [issue_run(), issue_run()]
        for malformed in (
            duplicate,
            [issue_run(issue_id="other-issue")],
            [issue_run(status="unknown")],
            [issue_run(created_at="not-a-time")],
            [issue_run(completed_at=7)],
            {"runs": value},
        ):
            with self.subTest(shape=malformed):
                with self.assertRaisesRegex(RuntimeError, "malformed issue runs"):
                    parse_issue_runs(malformed, CHILD_ID)

    def test_active_run_uses_latest_available_timestamp(self):
        value = issue_run(
            status="running",
            completed_at=None,
            started_at="2026-08-25T08:34:04Z",
        )
        self.assertEqual(
            parse_issue_runs([value], CHILD_ID)[0]["activity_at"],
            "2026-08-25T08:34:04Z",
        )

    def test_metadata_requires_nonempty_string_keys_and_string_values(self):
        value = {"eventra.workflow.version": "1", "optional": ""}
        self.assertEqual(parse_issue_metadata(value), value)
        for malformed in (
            [],
            {"": "1"},
            {"eventra.workflow.version": 1},
        ):
            with self.subTest(shape=malformed):
                with self.assertRaisesRegex(RuntimeError, "malformed issue metadata"):
                    parse_issue_metadata(malformed)


if __name__ == "__main__":
    unittest.main()
