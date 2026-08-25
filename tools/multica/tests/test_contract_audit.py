"""Safety boundaries for the read-only Multica contract audit."""

import contextlib
import copy
import io
import json
import unittest

from tools.multica.provision import MUTATION_COMMAND_PREFIXES
from tools.multica.contract_audit import build_parser, collect_contract_audit


SENTINELS = {
    "runtime_id": "RUNTIME_ID_SENTINEL",
    "daemon_id": "DAEMON_ID_SENTINEL",
    "skill_id": "SKILL_ID_SENTINEL",
    "skill_name": "SKILL_NAME_SENTINEL",
    "skill_url": "https://example.invalid/SKILL_URL_SENTINEL",
    "agent_id": "AGENT_ID_SENTINEL",
    "agent_name": "AGENT_NAME_SENTINEL",
    "description": "DESCRIPTION_SENTINEL",
    "instructions": "INSTRUCTIONS_SENTINEL",
    "env_key": "ENV_KEY_SENTINEL",
    "env_value": "ENV_VALUE_SENTINEL",
    "squad_id": "SQUAD_ID_SENTINEL",
    "squad_name": "SQUAD_NAME_SENTINEL",
    "member_id": "MEMBER_ID_SENTINEL",
    "role": "ROLE_SENTINEL",
    "project_id": "PROJECT_ID_SENTINEL",
    "project_title": "PROJECT_TITLE_SENTINEL",
    "resource_id": "RESOURCE_ID_SENTINEL",
    "resource_path": "/RESOURCE_PATH_SENTINEL",
    "backend_project_id": "BACKEND_PROJECT_ID_SENTINEL",
    "autopilot_id": "AUTOPILOT_ID_SENTINEL",
    "trigger_id": "TRIGGER_ID_SENTINEL",
}


class RecordingRunner:
    """In-memory read boundary; stderr must never become audit output."""

    def __init__(self, replies):
        self.replies = replies
        self.calls = []
        self.captured_stderr = "STDERR_SENTINEL"

    def run(self, args, *, stdin_json=None):
        self.calls.append((list(args), stdin_json))
        return self.replies[tuple(args)]


def audit_replies():
    s = SENTINELS
    return {
        ("runtime", "list", "--output", "json"): [
            {
                "id": s["runtime_id"],
                "daemon_id": s["daemon_id"],
                "status": "online",
                "metadata": {"capabilities": ["local-worktree-v1"]},
            }
        ],
        ("skill", "list", "--output", "json"): [
            {"id": s["skill_id"], "name": "using-superpowers"}
        ],
        ("skill", "get", s["skill_id"], "--output", "json"): {
            "id": s["skill_id"],
            "name": s["skill_name"],
            "description": s["description"],
            "config": {"origin": {"source_url": s["skill_url"]}},
        },
        ("agent", "list", "--output", "json"): [
            {"id": s["agent_id"], "name": "Eventra Backend Engineer"}
        ],
        ("agent", "get", s["agent_id"], "--output", "json"): {
            "id": s["agent_id"],
            "name": s["agent_name"],
            "description": s["description"],
            "instructions": s["instructions"],
            "runtime_id": s["runtime_id"],
            "visibility": "workspace",
            "max_concurrent_tasks": 1,
        },
        ("agent", "env", "get", s["agent_id"], "--output", "json"): {
            "agent_id": s["agent_id"],
            "custom_env": {s["env_key"]: s["env_value"]},
        },
        ("squad", "list", "--output", "json"): [
            {"id": s["squad_id"], "name": "Eventra Local Delivery"}
        ],
        ("squad", "get", s["squad_id"], "--output", "json"): {
            "id": s["squad_id"],
            "name": s["squad_name"],
            "description": s["description"],
            "instructions": s["instructions"],
            "leader_id": s["agent_id"],
        },
        ("squad", "member", "list", s["squad_id"], "--output", "json"): [
            {
                "id": s["member_id"],
                "squad_id": s["squad_id"],
                "member_id": s["agent_id"],
                "member_type": "agent",
                "role": s["role"],
            }
        ],
        ("project", "list", "--output", "json"): [
            {"id": s["project_id"], "title": "Eventra Local Development"}
        ],
        ("project", "get", s["project_id"], "--output", "json"): {
            "id": s["project_id"],
            "title": s["project_title"],
            "description": s["description"],
        },
        ("project", "resource", "list", s["project_id"], "--output", "json"): [
            {
                "id": s["resource_id"],
                "project_id": s["project_id"],
                "resource_type": "local_directory",
                "resource_ref": {
                    "local_path": s["resource_path"],
                    "daemon_id": s["daemon_id"],
                    "execution_mode": "worktree",
                },
            }
        ],
        ("autopilot", "list", "--output", "json"): {
            "autopilots": [
                {
                    "id": s["autopilot_id"],
                    "title": "Eventra · Stalled Work Watcher",
                    "description": s["description"],
                    "execution_mode": "run_only",
                    "project_id": s["project_id"],
                    "assignee_id": s["agent_id"],
                    "assignee_type": "agent",
                    "status": "active"
                }
            ],
            "total": 1
        },
        ("autopilot", "get", s["autopilot_id"], "--output", "json"): {
            "autopilot": {
                "id": s["autopilot_id"],
                "title": "Eventra · Stalled Work Watcher",
                "description": s["description"],
                "execution_mode": "run_only",
                "project_id": s["project_id"],
                "assignee_id": s["agent_id"],
                "assignee_type": "agent",
                "status": "active"
            },
            "collaborators": [],
            "triggers": [
                {
                    "id": s["trigger_id"],
                    "autopilot_id": s["autopilot_id"],
                    "kind": "schedule",
                    "cron_expression": "TZ=Asia/Shanghai */30 * * * *",
                    "timezone": "Asia/Shanghai",
                    "enabled": True,
                    "label": "Eventra stalled-work recovery",
                    "has_signing_secret": False,
                    "has_webhook_token": False,
                    "provider": None,
                    "signing_secret_hint": None,
                    "webhook_path": None,
                    "webhook_token": None,
                    "webhook_token_hint": None,
                    "webhook_url": None
                }
            ]
        }
    }


class ContractAuditTests(unittest.TestCase):
    def test_audit_discards_all_scalar_sentinels_and_reports_environment_shape(self):
        runner = RecordingRunner(audit_replies())

        report = collect_contract_audit(
            SENTINELS["runtime_id"], SENTINELS["daemon_id"], runner
        )

        rendered = json.dumps(report, sort_keys=True)
        for sentinel in SENTINELS.values():
            with self.subTest(sentinel=sentinel):
                self.assertNotIn(sentinel, rendered)
        self.assertNotIn("STDERR_SENTINEL", rendered)
        self.assertEqual(
            report["agents"]["environments"][0]["fields"]["custom_env"],
            {"type": "object", "key_count": 1, "value_types": ["string"]},
        )
        self.assertTrue(
            report["agents"]["environments"][0]["fields"]["agent_id"][
                "target_id_matches"
            ]
        )
        self.assertTrue(
            report["autopilots"]["detail"]["fields"]["autopilot"]["fields"]["id"][
                "target_id_matches"
            ]
        )
        self.assertEqual(
            report["autopilots"]["detail"]["fields"]["triggers"]["length"],
            1,
        )

    def test_audit_commands_are_fixed_reads_with_no_mutation_prefix(self):
        runner = RecordingRunner(audit_replies())

        collect_contract_audit(SENTINELS["runtime_id"], SENTINELS["daemon_id"], runner)

        mutation_calls = {
            prefix
            for args, stdin_json in runner.calls
            for prefix in MUTATION_COMMAND_PREFIXES
            if tuple(args[: len(prefix)]) == prefix
        }
        self.assertEqual(mutation_calls, set())
        self.assertTrue(all(stdin_json is None for _, stdin_json in runner.calls))

    def test_audit_reads_both_eventra_projects_when_both_exist(self):
        replies = copy.deepcopy(audit_replies())
        backend_id = SENTINELS["backend_project_id"]
        replies[("project", "list", "--output", "json")].append(
            {"id": backend_id, "title": "Eventra Backend Local Development"}
        )
        replies[("project", "get", backend_id, "--output", "json")] = {
            "id": backend_id,
            "title": "Eventra Backend Local Development",
            "description": "BACKEND_DESCRIPTION_SENTINEL",
        }
        replies[("project", "resource", "list", backend_id, "--output", "json")] = []

        report = collect_contract_audit(
            SENTINELS["runtime_id"], SENTINELS["daemon_id"], RecordingRunner(replies)
        )

        self.assertEqual(len(report["projects"]["details"]), 2)
        self.assertEqual(len(report["projects"]["target_resources"]), 2)
        self.assertNotIn("BACKEND_DESCRIPTION_SENTINEL", json.dumps(report))

    def test_audit_accepts_an_unrelated_degraded_runtime_without_scalars(self):
        replies = copy.deepcopy(audit_replies())
        replies[("runtime", "list", "--output", "json")].append(
            {"id": "UNRELATED_DEGRADED_RUNTIME"}
        )

        report = collect_contract_audit(
            SENTINELS["runtime_id"], SENTINELS["daemon_id"], RecordingRunner(replies)
        )

        self.assertEqual(report["runtime_list"]["length"], 2)
        self.assertNotIn("UNRELATED_DEGRADED_RUNTIME", json.dumps(report, sort_keys=True))

    def test_audit_rejects_unexpected_environment_envelope_key_without_output(self):
        replies = copy.deepcopy(audit_replies())
        sentinel = "ENV_KEY_SHOULD_NOT_ESCAPE"
        replies[("agent", "env", "get", SENTINELS["agent_id"], "--output", "json")][
            sentinel
        ] = "unexpected"
        runner = RecordingRunner(replies)
        stdout = io.StringIO()

        with contextlib.redirect_stdout(stdout):
            with self.assertRaisesRegex(RuntimeError, "malformed agent environment") as caught:
                collect_contract_audit(
                    SENTINELS["runtime_id"], SENTINELS["daemon_id"], runner
                )

        self.assertNotIn(sentinel, str(caught.exception))
        self.assertNotIn(sentinel, stdout.getvalue())

    def test_audit_samples_existing_squad_and_project_when_eventra_records_are_absent(self):
        replies = copy.deepcopy(audit_replies())
        replies[("squad", "list", "--output", "json")][0]["name"] = "OTHER_SQUAD"
        replies[("project", "list", "--output", "json")][0]["title"] = "OTHER_PROJECT"
        runner = RecordingRunner(replies)

        report = collect_contract_audit(
            SENTINELS["runtime_id"], SENTINELS["daemon_id"], runner
        )

        self.assertEqual(len(report["squads"]["details"]), 1)
        self.assertIn("members", report["squads"])
        self.assertEqual(len(report["projects"]["details"]), 1)
        self.assertIn("resources", report["projects"])

    def test_audit_uses_later_unrelated_local_resource_when_first_project_is_github_only(self):
        replies = copy.deepcopy(audit_replies())
        first_project_id = "FIRST_UNRELATED_PROJECT"
        later_project_id = "LATER_UNRELATED_PROJECT"
        replies[("project", "list", "--output", "json")] = [
            {"id": first_project_id, "title": "FIRST_UNRELATED_TITLE"},
            {"id": later_project_id, "title": "LATER_UNRELATED_TITLE"},
        ]
        replies[("project", "get", first_project_id, "--output", "json")] = {
            "id": first_project_id,
            "title": "FIRST_UNRELATED_TITLE",
            "description": "FIRST_UNRELATED_DESCRIPTION",
        }
        replies[("project", "resource", "list", first_project_id, "--output", "json")] = [
            {
                "id": "GITHUB_RESOURCE_SENTINEL",
                "project_id": first_project_id,
                "resource_type": "github_repo",
                "resource_ref": {"repository": "GITHUB_REPOSITORY_SENTINEL"},
            }
        ]
        replies[("project", "resource", "list", later_project_id, "--output", "json")] = [
            {
                "id": "LATER_LOCAL_RESOURCE_SENTINEL",
                "project_id": later_project_id,
                "resource_type": "local_directory",
                "resource_ref": {
                    "local_path": "/LATER_LOCAL_PATH_SENTINEL",
                    "daemon_id": SENTINELS["daemon_id"],
                },
            }
        ]
        runner = RecordingRunner(replies)

        report = collect_contract_audit(
            SENTINELS["runtime_id"], SENTINELS["daemon_id"], runner
        )

        self.assertTrue(report["projects"]["local_resource_contract_available"])
        self.assertIn(
            ("project", "resource", "list", later_project_id, "--output", "json"),
            [tuple(args) for args, _ in runner.calls],
        )
        rendered = json.dumps(report, sort_keys=True)
        self.assertNotIn("GITHUB_RESOURCE_SENTINEL", rendered)
        self.assertNotIn("GITHUB_REPOSITORY_SENTINEL", rendered)
        self.assertNotIn("LATER_LOCAL_RESOURCE_SENTINEL", rendered)
        self.assertNotIn("LATER_LOCAL_PATH_SENTINEL", rendered)

    def test_audit_reports_unavailable_local_contract_when_unrelated_projects_have_no_local_resources(self):
        replies = copy.deepcopy(audit_replies())
        replies[("project", "list", "--output", "json")][0]["title"] = "OTHER_PROJECT"
        replies[("project", "resource", "list", SENTINELS["project_id"], "--output", "json")] = [
            {
                "id": "GITHUB_RESOURCE_SENTINEL",
                "project_id": SENTINELS["project_id"],
                "resource_type": "github_repo",
                "resource_ref": {"repository": "GITHUB_REPOSITORY_SENTINEL"},
            }
        ]

        report = collect_contract_audit(
            SENTINELS["runtime_id"], SENTINELS["daemon_id"], RecordingRunner(replies)
        )

        self.assertFalse(report["projects"]["local_resource_contract_available"])
        rendered = json.dumps(report, sort_keys=True)
        self.assertNotIn("GITHUB_RESOURCE_SENTINEL", rendered)
        self.assertNotIn("GITHUB_REPOSITORY_SENTINEL", rendered)

    def test_audit_strictly_rejects_foreign_resource_for_exact_eventra_project(self):
        replies = copy.deepcopy(audit_replies())
        foreign_resource = "FOREIGN_RESOURCE_SENTINEL"
        replies[("project", "resource", "list", SENTINELS["project_id"], "--output", "json")] = [
            {
                "id": foreign_resource,
                "project_id": SENTINELS["project_id"],
                "resource_type": "github_repo",
                "resource_ref": {
                    "local_path": "/FOREIGN_LOCAL_PATH_SENTINEL",
                    "daemon_id": SENTINELS["daemon_id"],
                    "execution_mode": "worktree",
                },
            }
        ]

        with self.assertRaisesRegex(RuntimeError, "malformed project resource list") as caught:
            collect_contract_audit(
                SENTINELS["runtime_id"], SENTINELS["daemon_id"], RecordingRunner(replies)
            )

        self.assertNotIn(foreign_resource, str(caught.exception))

    def test_cli_rejects_apply_and_unknown_command_flags(self):
        parser = build_parser()
        for argv in (
            ("--runtime-id", "runtime", "--daemon-id", "daemon", "--apply"),
            ("--runtime-id", "runtime", "--daemon-id", "daemon", "agent", "list"),
            ("--runtime-id", "runtime", "--daemon-id", "daemon", "--unknown"),
        ):
            with self.subTest(argv=argv):
                with contextlib.redirect_stderr(io.StringIO()):
                    with self.assertRaises(SystemExit):
                        parser.parse_args(argv)


if __name__ == "__main__":
    unittest.main()
