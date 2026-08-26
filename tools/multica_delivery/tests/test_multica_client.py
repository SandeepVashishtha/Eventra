"""Behavioral tests for the injectable Multica boundary."""

import unittest

from tools.multica_delivery.multica_client import (
    CommandFailure,
    CommandResult,
    MulticaClient,
    MulticaContractError,
    RuntimeInfo,
    SkillImportCapability,
    TransientCommandError,
)


class FakeRunner:
    def __init__(self, *replies):
        self.replies = list(replies)
        self.calls = []

    def run(self, argv, *, input_text=None):
        self.calls.append((argv, input_text))
        reply = self.replies.pop(0)
        if isinstance(reply, Exception):
            raise reply
        return reply


class MulticaClientTests(unittest.TestCase):
    def test_command_runner_contract_decodes_json_without_optional_keywords(self):
        class ArgvOnlyRunner:
            def __init__(self):
                self.argv = None

            def run(self, argv, *, input_text=None):
                self.argv = argv
                self.input_text = input_text
                return CommandResult(0, '{"data":{"projects":[]}}')

        runner = ArgvOnlyRunner()

        self.assertEqual(MulticaClient(runner).list_projects(), ())
        self.assertIsInstance(runner.argv, tuple)
        self.assertIsNone(runner.input_text)

    def test_public_call_centralizes_data_envelope(self):
        runner = FakeRunner({"success": True, "data": {"version": "0.4.33"}})

        result = MulticaClient(runner).call(("multica", "version", "--output", "json"))

        self.assertEqual(dict(result), {"version": "0.4.33"})

    def test_public_call_never_exposes_environment_values(self):
        runner = FakeRunner({"data": {"agent_id": "agent-1", "custom_env": {"TOKEN": "secret"}}})

        with self.assertRaisesRegex(MulticaContractError, "typed environment"):
            MulticaClient(runner).call(
                ("multica", "agent", "env", "get", "agent-1", "--output", "json")
            )

        self.assertEqual(runner.calls, [])

    def test_public_call_rejects_absolute_executable_and_global_option_bypasses(self):
        secret = "SECRET_VALUE_SENTINEL"
        for argv in (
            ("/opt/bin/multica", "agent", "env", "get", "agent-1"),
            ("multica", "--profile", "prod", "agent", "env", "get", "agent-1"),
        ):
            with self.subTest(argv=argv):
                runner = FakeRunner({"custom_env": {"TOKEN": secret}})
                with self.assertRaisesRegex(MulticaContractError, "unsupported Multica argv") as caught:
                    MulticaClient(runner).call(argv)
                self.assertNotIn(secret, str(caught.exception))
                self.assertEqual(runner.calls, [])

    def test_public_call_does_not_retry_mutation(self):
        runner = FakeRunner(TransientCommandError("temporary"), {"data": {"skill": {"id": "x"}}})

        with self.assertRaises(CommandFailure):
            MulticaClient(runner).call(
                ("multica", "skill", "import", "--url", "https://github.com/example/skill")
            )

        self.assertEqual(len(runner.calls), 1)

    def test_public_call_recursively_freezes_safe_nested_results(self):
        source = {"data": {"outer": {"items": [{"safe": "value"}]}}}

        result = MulticaClient(FakeRunner(source)).call(
            ("multica", "issue", "get", "issue-1", "--output", "json")
        )

        self.assertIsInstance(result["outer"]["items"], tuple)
        with self.assertRaises(TypeError):
            result["outer"]["new"] = "value"
        with self.assertRaises(TypeError):
            result["outer"]["items"][0]["safe"] = "changed"

    def test_failed_envelope_is_rejected_without_inspecting_nested_values(self):
        secret = "SECRET_VALUE_SENTINEL"
        runner = FakeRunner({"success": False, "data": {"safe": secret}, "error": "failed"})

        with self.assertRaisesRegex(MulticaContractError, "Multica call") as caught:
            MulticaClient(runner).call(("multica", "issue", "get", "issue-1"))

        self.assertNotIn(secret, str(caught.exception))
        self.assertIn("success", str(caught.exception))

    def test_unwraps_nested_created_resource(self):
        runner = FakeRunner({"data": {"skill": {"id": "skill-1", "name": "tdd"}}})

        created = MulticaClient(runner).import_skill(
            "https://github.com/obra/superpowers/tree/main/skills/test-driven-development"
        )

        self.assertEqual(created.id, "skill-1")
        self.assertEqual(len(runner.calls), 1)

    def test_malformed_environment_is_actionable_without_leaking_values(self):
        secret = "SECRET_VALUE_SENTINEL"
        runner = FakeRunner({"data": {"unexpected": [secret]}})

        with self.assertRaisesRegex(MulticaContractError, "agent environment") as caught:
            MulticaClient(runner).get_agent_environment("agent-1")

        self.assertIn("unexpected", str(caught.exception))
        self.assertNotIn(secret, str(caught.exception))

    def test_read_retries_once_after_transient_failure(self):
        runner = FakeRunner(TransientCommandError("temporary"), {"data": {"projects": []}})

        self.assertEqual(MulticaClient(runner).list_projects(), ())
        self.assertEqual(len(runner.calls), 2)

    def test_permanent_oserror_read_is_not_retried(self):
        runner = FakeRunner(PermissionError("denied"), {"data": {"projects": []}})

        with self.assertRaises(CommandFailure):
            MulticaClient(runner).list_projects()

        self.assertEqual(len(runner.calls), 1)

    def test_runtime_reachability_requires_online_target_daemon(self):
        runner = FakeRunner(
            [{"id": "runtime-1", "daemon_id": "daemon-1", "status": "offline"}]
        )

        with self.assertRaisesRegex(MulticaContractError, "not reachable"):
            MulticaClient(runner, "runtime-1", "daemon-1").get_runtime()

    def test_runtime_and_capability_reads_are_typed_and_frozen(self):
        runner = FakeRunner(
            [{"id": "runtime-1", "daemon_id": "daemon-1", "status": "online", "metadata": {"capabilities": ["local-worktree-v1"]}}],
            {"data": {"capability": {"dry_run": True}}},
        )
        client = MulticaClient(runner, "runtime-1", "daemon-1")

        runtime = client.get_runtime()
        capability = client.inspect_skill_import()

        self.assertIsInstance(runtime, RuntimeInfo)
        self.assertEqual(runtime.capabilities, ("local-worktree-v1",))
        self.assertIsInstance(capability, SkillImportCapability)
        self.assertTrue(capability.dry_run)
        with self.assertRaises(AttributeError):
            runtime.status = "offline"

    def test_mutation_is_not_retried(self):
        runner = FakeRunner(TransientCommandError("temporary"), {"data": {"skill": {"id": "x", "name": "x"}}})

        with self.assertRaises(CommandFailure):
            MulticaClient(runner).import_skill("https://github.com/example/skills/tree/main/tdd")

        self.assertEqual(len(runner.calls), 1)

    def test_skill_import_refuses_urls_that_could_put_credentials_in_argv(self):
        runner = FakeRunner({"data": {"skill": {"id": "x"}}})

        with self.assertRaisesRegex(MulticaContractError, "public GitHub URL"):
            MulticaClient(runner).import_skill("https://token@github.com/example/skills")

        self.assertEqual(runner.calls, [])

    def test_environment_values_use_stdin_and_never_argv_or_result(self):
        secret = "SECRET_VALUE_SENTINEL"
        runner = FakeRunner({"data": {"agent": {"id": "agent-1"}}})

        result = MulticaClient(runner).set_agent_environment("agent-1", {"TOKEN": secret})

        argv, input_text = runner.calls[0]
        self.assertNotIn(secret, repr(argv))
        self.assertIn(secret, input_text)
        self.assertNotIn(secret, repr(result))


if __name__ == "__main__":
    unittest.main()
