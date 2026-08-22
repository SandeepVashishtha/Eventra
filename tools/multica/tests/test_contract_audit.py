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
