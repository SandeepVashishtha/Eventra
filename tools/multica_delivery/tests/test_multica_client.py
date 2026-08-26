"""Behavioral tests for the injectable Multica boundary."""

import unittest

from tools.multica_delivery.multica_client import (
    AgentState,
    AutopilotState,
    CommandFailure,
    CommandResult,
    MulticaClient,
    MulticaContractError,
    ProjectResourceState,
    ProjectState,
    RuntimeInfo,
    SkillState,
    SkillImportCapability,
    SquadMemberState,
    SquadState,
    TransientCommandError,
    TriggerState,
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
    def test_provisioning_reads_decode_exact_immutable_state(self):
        autopilot = {
            "id": "autopilot-1",
            "title": "Watcher",
            "description": "bounded recovery",
            "execution_mode": "run_only",
            "project_id": "project-1",
            "assignee_id": "agent-1",
            "assignee_type": "agent",
            "status": "active",
        }
        trigger = {
            "id": "trigger-1",
            "autopilot_id": "autopilot-1",
            "kind": "schedule",
            "cron_expression": "*/30 * * * *",
            "timezone": "Asia/Shanghai",
            "enabled": True,
            "label": "stalled-work recovery",
            "provider": None,
            "signing_secret_hint": None,
            "webhook_path": None,
            "webhook_token": None,
            "webhook_token_hint": None,
            "webhook_url": None,
            "has_signing_secret": False,
            "has_webhook_token": False,
        }
        runner = FakeRunner(
            {"data": {"skills": [{"id": "skill-1", "name": "using-superpowers"}]}},
            {"data": {"skill": {"id": "skill-1", "name": "using-superpowers", "config": {"origin": {"source_url": "https://github.com/example/skills/tree/main/using-superpowers"}}}}},
            {"data": {"projects": [{"id": "project-1", "title": "Control"}]}},
            {"data": {"project": {"id": "project-1", "title": "Control", "description": "control project"}}},
            {"data": {"resources": [{"id": "worktree-1", "project_id": "project-1", "resource_type": "local_directory", "resource_ref": {"local_path": "/tmp/repository", "daemon_id": "daemon-1", "execution_mode": "worktree"}}]}},
            {"data": {"agents": [{"id": "agent-1", "name": "Lead"}]}},
            {"data": {"agent": {"id": "agent-1", "name": "Lead", "description": "coordinates", "instructions": "coordinate", "runtime_id": "runtime-1", "visibility": "workspace", "max_concurrent_tasks": 1}}},
            {"data": {"skills": [{"id": "skill-1"}]}},
            {"data": {"squads": [{"id": "squad-1", "name": "Delivery"}]}},
            {"data": {"squad": {"id": "squad-1", "name": "Delivery", "description": "team", "instructions": "deliver", "leader_id": "agent-1"}}},
            {"data": {"members": [{"id": "member-1", "squad_id": "squad-1", "member_id": "agent-1", "member_type": "agent", "role": "leader"}]}},
            {"data": {"autopilots": [autopilot], "total": 1}},
            {"data": {"autopilot": autopilot, "collaborators": [], "triggers": [trigger]}},
        )
        client = MulticaClient(runner)

        self.assertEqual(client.list_skills(), (SkillState("skill-1", "using-superpowers", "https://github.com/example/skills/tree/main/using-superpowers"),))
        projects = client.list_projects()
        self.assertEqual(projects, (ProjectState("project-1", "Control", "control project"),))
        self.assertEqual(client.list_project_resources("project-1"), (ProjectResourceState("worktree-1", "project-1", "local_directory", "/tmp/repository", "daemon-1", "worktree"),))
        self.assertEqual(client.list_agents(), (AgentState("agent-1", "Lead", "coordinates", "coordinate", "runtime-1", "workspace", 1),))
        self.assertEqual(client.list_agent_skill_ids("agent-1"), ("skill-1",))
        self.assertEqual(client.list_squads(), (SquadState("squad-1", "Delivery", "team", "deliver", "agent-1"),))
        self.assertEqual(client.list_squad_members("squad-1"), (SquadMemberState("agent-1", "agent", "leader"),))
        self.assertEqual(client.list_autopilots(), (AutopilotState("autopilot-1", "Watcher", "bounded recovery", "run_only", "project-1", "agent-1", "agent", "active"),))
        self.assertEqual(client.list_autopilot_triggers("autopilot-1"), (TriggerState("trigger-1", "autopilot-1", "schedule", "*/30 * * * *", "Asia/Shanghai", True, "stalled-work recovery"),))
        with self.assertRaises(AttributeError):
            projects[0].title = "changed"

    def test_provisioning_mutations_use_closed_argv_and_typed_acknowledgements(self):
        runner = FakeRunner(
            {"data": {"project": {"id": "project-1"}}},
            {"data": {"project": {"id": "project-1"}}},
            {"data": {"resource": {"id": "worktree-1", "project_id": "project-1"}}},
            {"data": {"resource": {"id": "worktree-1", "project_id": "project-1"}}},
            {"data": {"agent": {"id": "agent-1"}}},
            {"data": {"agent": {"id": "agent-1"}}},
            {"data": {"agent": {"id": "agent-1"}}},
            {"data": {"squad": {"id": "squad-1"}}},
            {"data": {"squad": {"id": "squad-1"}}},
            {"data": {"member": {"member_id": "agent-2", "member_type": "agent"}}},
            {"data": {"member": {"member_id": "agent-2", "member_type": "agent"}}},
            {"data": {"autopilot": {"id": "autopilot-1"}}},
            {"data": {"autopilot": {"id": "autopilot-1"}}},
            {"data": {"trigger": {"id": "trigger-1", "autopilot_id": "autopilot-1"}}},
            {"data": {"trigger": {"id": "trigger-1", "autopilot_id": "autopilot-1"}}},
        )
        client = MulticaClient(runner)

        results = (
            client.create_project(title="Control", description="control"),
            client.update_project("project-1", title="Control", description="updated"),
            client.add_project_worktree("project-1", local_path="/tmp/repository", daemon_id="daemon-1", execution_mode="worktree"),
            client.update_project_worktree("project-1", "worktree-1", daemon_id="daemon-1", execution_mode="worktree"),
            client.create_agent(name="Lead", description="coordinates", instructions="coordinate", runtime_id="runtime-1", visibility="workspace", max_concurrent_tasks=1),
            client.update_agent("agent-1", name="Lead", description="coordinates", instructions="coordinate", runtime_id="runtime-1", visibility="workspace", max_concurrent_tasks=1),
            client.add_agent_skill("agent-1", "skill-1"),
            client.create_squad(name="Delivery", description="team", leader_id="agent-1"),
            client.update_squad("squad-1", name="Delivery", description="team", instructions="deliver", leader_id="agent-1"),
            client.add_squad_member("squad-1", "agent-2", role="independent-reviewer"),
            client.update_squad_member("squad-1", "agent-2", role="independent-reviewer"),
            client.create_autopilot(title="Watcher", description="bounded", execution_mode="run_only", project_id="project-1", assignee_id="agent-1", status="active"),
            client.update_autopilot("autopilot-1", title="Watcher", description="bounded", execution_mode="run_only", project_id="project-1", assignee_id="agent-1", status="active"),
            client.add_autopilot_trigger("autopilot-1", cron_expression="*/30 * * * *", timezone="Asia/Shanghai", label="stalled-work recovery"),
            client.update_autopilot_trigger("autopilot-1", "trigger-1", cron_expression="*/30 * * * *", timezone="Asia/Shanghai", enabled=True, label="stalled-work recovery"),
        )

        self.assertEqual(
            tuple(result.resource_id for result in results),
            ("project-1", "project-1", "worktree-1", "worktree-1", "agent-1", "agent-1", "agent-1", "squad-1", "squad-1", "agent-2", "agent-2", "autopilot-1", "autopilot-1", "trigger-1", "trigger-1"),
        )
        self.assertTrue(all(isinstance(argv, tuple) and input_text is None for argv, input_text in runner.calls))
        self.assertEqual(
            runner.calls[-1][0],
            (
                "multica", "autopilot", "trigger-update", "autopilot-1", "trigger-1",
                "--cron", "*/30 * * * *", "--timezone", "Asia/Shanghai",
                "--enabled", "--label", "stalled-work recovery", "--output", "json",
            ),
        )
        self.assertEqual(
            runner.calls[7][0],
            (
                "multica", "squad", "create", "--name", "Delivery",
                "--description", "team", "--leader", "agent-1", "--output", "json",
            ),
        )
        self.assertIn("--type", runner.calls[9][0])
        self.assertNotIn("--member-type", runner.calls[9][0])

    def test_non_authoritative_ok_acknowledgements_are_typed_then_discarded(self):
        runner = FakeRunner({"ok": True}, {"ok": True}, {"ok": True})
        client = MulticaClient(runner)

        binding = client.add_agent_skill("agent-1", "skill-1")
        autopilot = client.create_autopilot(
            title="Watcher",
            description="bounded",
            execution_mode="run_only",
            project_id="project-1",
            assignee_id="agent-1",
            status="active",
        )
        trigger = client.add_autopilot_trigger(
            "autopilot-1",
            cron_expression="*/30 * * * *",
            timezone="Asia/Shanghai",
            label="stalled-work recovery",
        )

        self.assertEqual(binding.resource_id, "agent-1")
        self.assertIsNone(autopilot.resource_id)
        self.assertIsNone(trigger.resource_id)

    def test_actual_created_skill_acknowledgement_is_strictly_decoded(self):
        runner = FakeRunner(
            {
                "skill": {"id": "skill-1", "name": "using-superpowers"},
                "status": "created",
            }
        )

        result = MulticaClient(runner).import_skill(
            "https://github.com/example/skills/tree/main/using-superpowers"
        )

        self.assertEqual(result.id, "skill-1")
        self.assertIn("--on-conflict", runner.calls[0][0])

    def test_provisioning_reads_preserve_empty_mutable_text_for_drift_repair(self):
        runner = FakeRunner(
            {"data": {"projects": [{"id": "project-1", "title": "Control"}]}},
            {"data": {"project": {"id": "project-1", "title": "Control", "description": ""}}},
        )

        self.assertEqual(
            MulticaClient(runner).list_projects(),
            (ProjectState("project-1", "Control", ""),),
        )

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

    def test_public_call_rejects_generic_mutations_before_execution(self):
        runner = FakeRunner({"data": {"agent": {"id": "agent-1"}}})

        with self.assertRaisesRegex(MulticaContractError, "unsupported Multica argv"):
            MulticaClient(runner).call(
                (
                    "multica",
                    "agent",
                    "create",
                    "--unsupported-secret",
                    "SENTINEL",
                )
            )

        self.assertEqual(runner.calls, [])

    def test_public_call_rejects_extra_read_arguments_before_execution(self):
        runner = FakeRunner({"data": {"issue": {"id": "issue-1"}}})

        with self.assertRaisesRegex(MulticaContractError, "unsupported Multica argv"):
            MulticaClient(runner).call(
                (
                    "multica",
                    "issue",
                    "get",
                    "issue-1",
                    "--output",
                    "json",
                    "--unsupported-secret",
                    "SENTINEL",
                )
            )

        self.assertEqual(runner.calls, [])

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

    def test_direct_failed_import_control_fields_cannot_produce_resource(self):
        secret = "SECRET_VALUE_SENTINEL"
        runner = FakeRunner(
            {
                "status": "failed",
                "meta": {},
                "skill": {"id": "skill-1", "name": secret},
            }
        )

        with self.assertRaisesRegex(MulticaContractError, "skill import") as caught:
            MulticaClient(runner).import_skill(
                "https://github.com/obra/superpowers/tree/main/skills/test-driven-development"
            )

        self.assertNotIn(secret, str(caught.exception))

    def test_direct_success_controls_require_mapping_meta(self):
        good = FakeRunner(
            {"status": "success", "success": True, "meta": {}, "skill": {"id": "skill-1"}}
        )
        bad = FakeRunner(
            {"status": "success", "success": True, "meta": [], "skill": {"id": "skill-1"}}
        )

        self.assertEqual(
            MulticaClient(good).import_skill("https://github.com/example/skills/tree/main/tdd").id,
            "skill-1",
        )
        with self.assertRaises(MulticaContractError):
            MulticaClient(bad).import_skill("https://github.com/example/skills/tree/main/tdd")

    def test_direct_unknown_contradictory_control_marker_is_rejected(self):
        runner = FakeRunner({"ok": False, "skill": {"id": "skill-1"}})

        with self.assertRaisesRegex(MulticaContractError, "skill import"):
            MulticaClient(runner).import_skill(
                "https://github.com/example/skills/tree/main/tdd"
            )

    def test_direct_read_domain_status_is_not_a_transport_failure(self):
        runner = FakeRunner({"id": "issue-1", "status": "open"})

        result = MulticaClient(runner).call(
            ("multica", "issue", "get", "issue-1", "--output", "json")
        )

        self.assertEqual(result["status"], "open")

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

    def test_environment_echo_acknowledgement_is_discarded_without_leaking(self):
        secret = "SECRET_VALUE_SENTINEL"
        runner = FakeRunner({"TOKEN": secret})

        result = MulticaClient(runner).set_agent_environment(
            "agent-1",
            {"TOKEN": secret},
        )

        self.assertEqual(result.resource_id, "agent-1")
        self.assertNotIn(secret, repr(result))


if __name__ == "__main__":
    unittest.main()
