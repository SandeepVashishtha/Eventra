import copy
import json
import os
import subprocess
import unittest
from dataclasses import replace
from unittest.mock import patch

from tools.multica.eventra_adapter import build_eventra_config
from tools.multica.provision import MulticaRunner, Provisioner, prompt_backend_env


class FakeRunner:
    """Stateful fake whose argv grammar is frozen independently from production."""

    IMPORTED_NAMES_BY_URL = {
        "https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices":
            "vercel-react-best-practices",
    }

    SCHEMAS = {
        ("runtime", "list"): (0, {"--output"}, set()),
        ("skill", "list"): (0, {"--output"}, set()),
        ("skill", "get"): (1, {"--output"}, set()),
        ("skill", "import"): (0, {"--url", "--on-conflict", "--output"}, {"--url", "--on-conflict"}),
        ("agent", "list"): (0, {"--output"}, set()),
        ("agent", "get"): (1, {"--output"}, set()),
        ("agent", "create"): (
            0,
            {"--name", "--description", "--instructions", "--runtime-id", "--visibility", "--max-concurrent-tasks", "--custom-env-stdin", "--output"},
            {"--name", "--description", "--instructions", "--runtime-id", "--visibility", "--max-concurrent-tasks"},
        ),
        ("agent", "update"): (
            1,
            {"--name", "--description", "--instructions", "--runtime-id", "--visibility", "--max-concurrent-tasks", "--output"},
            set(),
        ),
        ("agent", "env", "get"): (1, {"--output"}, set()),
        ("agent", "env", "set"): (1, {"--custom-env-stdin", "--output"}, {"--custom-env-stdin"}),
        ("agent", "skills", "list"): (1, {"--output"}, set()),
        ("agent", "skills", "add"): (1, {"--skill-ids", "--output"}, {"--skill-ids"}),
        ("squad", "list"): (0, {"--output"}, set()),
        ("squad", "get"): (1, {"--output"}, set()),
        ("squad", "create"): (0, {"--name", "--description", "--leader", "--output"}, {"--name", "--leader"}),
        ("squad", "update"): (1, {"--name", "--description", "--instructions", "--leader", "--output"}, set()),
        ("squad", "member", "list"): (1, {"--output"}, set()),
        ("squad", "member", "add"): (1, {"--member-id", "--type", "--role", "--output"}, {"--member-id"}),
        ("squad", "member", "set-role"): (1, {"--member-id", "--member-type", "--role", "--output"}, {"--member-id", "--role"}),
        ("project", "list"): (0, {"--output"}, set()),
        ("project", "get"): (1, {"--output"}, set()),
        ("project", "create"): (0, {"--title", "--description", "--output"}, {"--title"}),
        ("project", "update"): (1, {"--title", "--description", "--output"}, set()),
        ("project", "resource", "list"): (1, {"--output"}, set()),
        ("project", "resource", "add"): (
            1,
            {"--type", "--local-path", "--daemon-id", "--execution-mode", "--output"},
            {"--type", "--local-path", "--daemon-id", "--execution-mode"},
        ),
        ("project", "resource", "update"): (2, {"--daemon-id", "--execution-mode", "--output"}, set()),
    }
    BOOLEAN_FLAGS = {"--custom-env-stdin"}
    MUTATIONS = {
        ("skill", "import"), ("agent", "create"), ("agent", "update"),
        ("agent", "env", "set"), ("agent", "skills", "add"),
        ("squad", "create"), ("squad", "update"), ("squad", "member", "add"),
        ("squad", "member", "set-role"), ("project", "create"),
        ("project", "update"), ("project", "resource", "add"),
        ("project", "resource", "update"),
    }

    def __init__(self):
        self.calls = []
        self.runtimes = [{
            "id": "runtime-id",
            "daemon_id": "daemon-id",
            "status": "online",
            "metadata": {"capabilities": ["local-worktree-v1"]},
        }]
        self.skills, self.agents, self.envs, self.bindings = {}, {}, {}, {}
        self.squads, self.projects = {}, {}
        self.response_overrides = {}
        self.freeze_updates = set()
        self.corrupt_env_after_set = None
        self._next = {kind: 1 for kind in ("skill", "agent", "squad", "project", "resource")}

    @property
    def mutation_count(self):
        return sum(call["command"] in self.MUTATIONS for call in self.calls)

    def seed_skill(self, name, source_url):
        skill_id = self._id("skill")
        self.skills[skill_id] = self._skill_detail(skill_id, name, source_url)
        return skill_id

    def seed_agent(self, name, **overrides):
        agent_id = self._id("agent")
        self.agents[agent_id] = {
            "id": agent_id, "name": name, "description": "old", "instructions": "old",
            "runtime_id": "old-runtime", "visibility": "private", "max_concurrent_tasks": 9,
            **overrides,
        }
        self.envs[agent_id], self.bindings[agent_id] = {}, set()
        return agent_id

    def seed_project(self, title, description="old"):
        project_id = self._id("project")
        self.projects[project_id] = {"id": project_id, "title": title, "description": description, "resources": {}}
        return project_id

    def seed_resource(self, project_id, local_path, **overrides):
        resource_id = self._id("resource")
        ref = {"local_path": local_path, "daemon_id": "daemon-id", "execution_mode": "worktree"}
        ref.update(overrides.pop("resource_ref", {}))
        self.projects[project_id]["resources"][resource_id] = {
            "id": resource_id, "resource_type": "local_directory", "resource_ref": ref, **overrides,
        }
        return resource_id

    def run(self, args, *, stdin_json=None):
        command, positionals, flags = self._parse(args)
        if stdin_json is not None and "--custom-env-stdin" not in flags:
            raise AssertionError("stdin JSON supplied without a supported stdin flag")
        if "--custom-env-stdin" in flags and stdin_json is None:
            raise AssertionError("stdin flag requires stdin JSON")
        self.calls.append({"args": list(args), "command": command, "positionals": positionals, "flags": flags, "stdin_json": copy.deepcopy(stdin_json)})
        override = self.response_overrides.get(command)

        if command == ("runtime", "list"):
            return self._response(command, self.runtimes)
        if command == ("skill", "list"):
            return self._response(command, [{"id": x["id"], "name": x["name"]} for x in self.skills.values()])
        if command == ("skill", "get"):
            return self._response(command, self.skills[positionals[0]])
        if command == ("skill", "import"):
            skill_id, url = self._id("skill"), flags["--url"]
            item = self._skill_detail(
                skill_id,
                self.IMPORTED_NAMES_BY_URL.get(
                    url, url.rstrip("/").rsplit("/", 1)[-1]
                ),
                url,
            )
            self.skills[skill_id] = item
            response = {
                "skill": item,
                "status": "created",
            }
            return copy.deepcopy(override if override is not None else response)

        if command == ("agent", "list"):
            return self._response(command, [{"id": x["id"], "name": x["name"]} for x in self.agents.values()])
        if command == ("agent", "get"):
            return self._response(command, self.agents[positionals[0]])
        if command == ("agent", "create"):
            agent_id = self._id("agent")
            item = self._agent_from_flags(agent_id, flags)
            self.agents[agent_id], self.envs[agent_id], self.bindings[agent_id] = item, copy.deepcopy(stdin_json or {}), set()
            return copy.deepcopy(override if override is not None else item)
        if command == ("agent", "update"):
            agent_id = positionals[0]
            if "agent" not in self.freeze_updates:
                self.agents[agent_id].update(self._agent_from_flags(agent_id, flags))
            return copy.deepcopy(override if override is not None else self.agents[agent_id])
        if command == ("agent", "env", "get"):
            return self._response(command, self.envs[positionals[0]])
        if command == ("agent", "env", "set"):
            agent_id = positionals[0]
            if "env" not in self.freeze_updates:
                self.envs[agent_id] = copy.deepcopy(stdin_json)
                if self.corrupt_env_after_set is not None:
                    self.envs[agent_id][self.corrupt_env_after_set] = "wrong-value"
            return copy.deepcopy(override if override is not None else self.envs[agent_id])
        if command == ("agent", "skills", "list"):
            value = [{"id": skill_id, "name": self.skills.get(skill_id, {}).get("name", "external")} for skill_id in sorted(self.bindings[positionals[0]])]
            return self._response(command, value)
        if command == ("agent", "skills", "add"):
            self.bindings[positionals[0]].update(flags["--skill-ids"].split(","))
            return self._response(command, {"ok": True})

        if command == ("squad", "list"):
            return self._response(command, [{"id": x["id"], "name": x["name"]} for x in self.squads.values()])
        if command == ("squad", "get"):
            return self._response(command, self._public(self.squads[positionals[0]], "members"))
        if command == ("squad", "create"):
            squad_id = self._id("squad")
            item = {"id": squad_id, "name": flags["--name"], "description": flags.get("--description", ""), "instructions": "", "leader_id": flags["--leader"], "members": {}}
            self.squads[squad_id] = item
            return copy.deepcopy(override if override is not None else self._public(item, "members"))
        if command == ("squad", "update"):
            squad_id = positionals[0]
            if "squad" not in self.freeze_updates:
                mapping = {"--name": "name", "--description": "description", "--instructions": "instructions", "--leader": "leader_id"}
                self.squads[squad_id].update({target: flags[source] for source, target in mapping.items() if source in flags})
            return copy.deepcopy(override if override is not None else self._public(self.squads[squad_id], "members"))
        if command == ("squad", "member", "list"):
            return self._response(command, list(self.squads[positionals[0]]["members"].values()))
        if command == ("squad", "member", "add"):
            squad_id, member_id = positionals[0], flags["--member-id"]
            member = {"member_id": member_id, "member_type": flags.get("--type", "agent"), "role": flags.get("--role", "member")}
            self.squads[squad_id]["members"][member_id] = member
            return self._response(command, member)
        if command == ("squad", "member", "set-role"):
            squad_id, member_id = positionals[0], flags["--member-id"]
            self.squads[squad_id]["members"][member_id]["role"] = flags["--role"]
            return self._response(command, self.squads[squad_id]["members"][member_id])

        if command == ("project", "list"):
            return self._response(command, [{"id": x["id"], "title": x["title"]} for x in self.projects.values()])
        if command == ("project", "get"):
            return self._response(command, self._public(self.projects[positionals[0]], "resources"))
        if command == ("project", "create"):
            project_id = self._id("project")
            item = {"id": project_id, "title": flags["--title"], "description": flags.get("--description", ""), "resources": {}}
            self.projects[project_id] = item
            return copy.deepcopy(override if override is not None else self._public(item, "resources"))
        if command == ("project", "update"):
            project_id = positionals[0]
            if "project" not in self.freeze_updates:
                if "--title" in flags:
                    self.projects[project_id]["title"] = flags["--title"]
                if "--description" in flags:
                    self.projects[project_id]["description"] = flags["--description"]
            return copy.deepcopy(override if override is not None else self._public(self.projects[project_id], "resources"))
        if command == ("project", "resource", "list"):
            return self._response(command, list(self.projects[positionals[0]]["resources"].values()))
        if command == ("project", "resource", "add"):
            project_id, resource_id = positionals[0], self._id("resource")
            item = {"id": resource_id, "resource_type": flags["--type"], "resource_ref": {"local_path": flags["--local-path"], "daemon_id": flags["--daemon-id"], "execution_mode": flags["--execution-mode"]}}
            self.projects[project_id]["resources"][resource_id] = item
            return copy.deepcopy(override if override is not None else item)
        if command == ("project", "resource", "update"):
            project_id, resource_id = positionals
            if "resource" not in self.freeze_updates:
                ref = self.projects[project_id]["resources"][resource_id]["resource_ref"]
                if "--daemon-id" in flags:
                    ref["daemon_id"] = flags["--daemon-id"]
                if "--execution-mode" in flags:
                    ref["execution_mode"] = flags["--execution-mode"]
            return copy.deepcopy(override if override is not None else self.projects[project_id]["resources"][resource_id])
        raise AssertionError(f"unimplemented fake command: {command}")

    def _parse(self, args):
        if not isinstance(args, list) or not all(isinstance(value, str) for value in args):
            raise AssertionError("argv must be a list of strings")
        matches = [command for command in self.SCHEMAS if tuple(args[: len(command)]) == command]
        if not matches:
            raise AssertionError(f"unknown command: {args!r}")
        command = max(matches, key=len)
        positional_count, allowed, required = self.SCHEMAS[command]
        tail, positionals = list(args[len(command) :]), []
        while tail and not tail[0].startswith("--"):
            positionals.append(tail.pop(0))
        if len(positionals) != positional_count:
            raise AssertionError(f"wrong positional count for {command}: {positionals!r}")
        flags = {}
        while tail:
            flag = tail.pop(0)
            if flag not in allowed or flag in flags:
                raise AssertionError(f"unknown or duplicate flag for {command}: {flag}")
            if flag in self.BOOLEAN_FLAGS:
                flags[flag] = True
            else:
                if not tail or tail[0].startswith("--"):
                    raise AssertionError(f"missing value for {flag}")
                flags[flag] = tail.pop(0)
        if required.difference(flags):
            raise AssertionError(f"missing flags for {command}: {required.difference(flags)!r}")
        if flags.get("--output", "json") != "json":
            raise AssertionError("strict JSON output is required")
        return command, positionals, flags

    def _response(self, command, default):
        return copy.deepcopy(self.response_overrides.get(command, default))

    def _agent_from_flags(self, agent_id, flags):
        mapping = {"--name": "name", "--description": "description", "--instructions": "instructions", "--runtime-id": "runtime_id", "--visibility": "visibility", "--max-concurrent-tasks": "max_concurrent_tasks"}
        value = {"id": agent_id}
        value.update({target: int(flags[source]) if source == "--max-concurrent-tasks" else flags[source] for source, target in mapping.items() if source in flags})
        return value

    def _id(self, kind):
        value = f"{kind}-{self._next[kind]}"
        self._next[kind] += 1
        return value

    @staticmethod
    def _public(item, excluded):
        return copy.deepcopy({key: value for key, value in item.items() if key != excluded})

    @staticmethod
    def _skill_detail(skill_id, name, source_url):
        url_parts = source_url.split("/")
        return {
            "config": {
                "origin": {
                    "owner": url_parts[3],
                    "path": "/".join(url_parts[7:]),
                    "ref": url_parts[6],
                    "repo": url_parts[4],
                    "source_url": source_url,
                    "type": "github",
                }
            },
            "content": "---\nname: fixture\n---\n",
            "created_at": "2026-08-22T16:25:50Z",
            "created_by": "user-id",
            "description": "fixture skill",
            "files": [],
            "id": skill_id,
            "name": name,
            "updated_at": "2026-08-22T16:25:50Z",
            "workspace_id": "workspace-id",
        }


class MulticaRunnerTests(unittest.TestCase):
    @patch("tools.multica.provision.subprocess.run")
    def test_uses_argv_strict_json_bounded_timeout_and_secret_stdin(self, run):
        secret = "s" * 64
        run.return_value = subprocess.CompletedProcess([], 0, '{"id":"agent-1"}', "")
        with patch.dict(os.environ, {"MULTICA_HTTP_TIMEOUT": "9999s"}):
            result = MulticaRunner().run(["agent", "create", "--custom-env-stdin", "--output", "json"], stdin_json={"JWT_SECRET": secret})
        self.assertEqual(result, {"id": "agent-1"})
        kwargs = run.call_args.kwargs
        self.assertIsInstance(run.call_args.args[0], list)
        self.assertEqual(kwargs["input"], json.dumps({"JWT_SECRET": secret}))
        self.assertEqual(kwargs["env"]["MULTICA_HTTP_TIMEOUT"], "90s")
        self.assertEqual(kwargs["timeout"], 95)
        self.assertNotIn("shell", kwargs)
        self.assertNotIn(secret, repr(run.call_args.args[0]))

    @patch("tools.multica.provision.subprocess.run")
    def test_redacts_errors_and_rejects_malformed_json(self, run):
        secret = "z" * 64
        run.return_value = subprocess.CompletedProcess([], 7, "", f"JWT_SECRET={secret}")
        with self.assertRaisesRegex(RuntimeError, "failed with exit 7") as caught:
            MulticaRunner().run(["agent", "create"], stdin_json={"JWT_SECRET": secret})
        self.assertNotIn(secret, str(caught.exception))
        self.assertNotIn("JWT_SECRET", str(caught.exception))
        for stdout in ("not-json PRIVATE", '"scalar PRIVATE"'):
            run.return_value = subprocess.CompletedProcess([], 0, stdout, "")
            with self.assertRaisesRegex(RuntimeError, "invalid JSON response") as malformed:
                MulticaRunner().run(["agent", "list", "--output", "json"])
            self.assertNotIn("PRIVATE", str(malformed.exception))


class ProvisionerTests(unittest.TestCase):
    def setUp(self):
        self.config = build_eventra_config("runtime-id", "daemon-id")
        self.runner = FakeRunner()
        self.provisioner = Provisioner(self.runner)
        self.backend_env = {"JWT_SECRET": "q" * 64, "MAIL_USERNAME": "unused@example.com", "MAIL_PASSWORD": "unused"}

    def _matching_agent(self, agent):
        return self.runner.seed_agent(
            agent.name, description=agent.description, instructions=agent.instructions_file.read_text(),
            runtime_id=self.config.runtime_id, visibility="workspace", max_concurrent_tasks=1,
        )

    def test_apply_uses_frozen_cli_and_builds_complete_state(self):
        result = self.provisioner.reconcile(self.config, apply=True, backend_env=self.backend_env)
        self.assertEqual(set(result.agent_ids), {agent.role for agent in self.config.agents})
        rendered = "\n".join(" ".join(call["args"]) for call in self.runner.calls)
        self.assertNotIn("daemon get", rendered)
        self.assertNotIn("agent skills set", rendered)
        self.assertNotIn("JWT_SECRET", rendered)
        self.assertIn("--max-concurrent-tasks 1", rendered)
        self.assertIn("squad create --name Eventra Local Delivery", rendered)
        self.assertIn("--leader agent-1", rendered)
        self.assertIn("squad update squad-1 --instructions", rendered)
        self.assertIn("--member-id agent-2 --type agent --role frontend_engineer", rendered)
        self.assertIn("project create --title Eventra Local Development --description", rendered)
        self.assertIn("--execution-mode worktree", rendered)
        for value in self.backend_env.values():
            self.assertNotIn(value, rendered)
        secret_calls = [call for call in self.runner.calls if call["stdin_json"] is not None]
        self.assertEqual(len(secret_calls), 2)
        self.assertTrue(all(call["command"] == ("agent", "create") for call in secret_calls))
        self.assertTrue(all(call["stdin_json"] == self.backend_env for call in secret_calls))
        self.assertEqual({call["flags"]["--name"] for call in secret_calls}, {"Eventra Backend Engineer", "Eventra Integration QA"})
        argv = [call["args"] for call in self.runner.calls]
        self.assertEqual(argv[0], ["runtime", "list", "--output", "json"])
        lead = self.config.agents[0]
        self.assertIn(
            [
                "agent", "create", "--name", lead.name,
                "--description", lead.description,
                "--instructions", lead.instructions_file.read_text(),
                "--runtime-id", "runtime-id", "--visibility", "workspace",
                "--max-concurrent-tasks", "1", "--output", "json",
            ],
            argv,
        )
        self.assertIn(
            [
                "squad", "create", "--name", self.config.blueprint.squad_name,
                "--description", self.config.blueprint.squad_description,
                "--leader", result.agent_ids["delivery_lead"], "--output", "json",
            ],
            argv,
        )
        self.assertIn(
            [
                "squad", "update", result.squad_id, "--instructions",
                self.config.blueprint.squad_instructions_file.read_text(), "--output", "json",
            ],
            argv,
        )
        self.assertIn(
            [
                "project", "create", "--title", self.config.project_title,
                "--description", self.config.project_context_file.read_text(), "--output", "json",
            ],
            argv,
        )
        self.assertIn(
            [
                "project", "resource", "add", result.project_id,
                "--type", "local_directory", "--local-path", self.config.resources[0].local_path,
                "--daemon-id", "daemon-id", "--execution-mode", "worktree", "--output", "json",
            ],
            argv,
        )
        project = self.runner.projects[result.project_id]
        self.assertEqual(project["description"], self.config.project_context_file.read_text())
        self.assertIn("stable backend signing secret", project["description"])
        self.assertEqual(len(project["resources"]), 2)
        self.assertEqual(
            {(x["resource_ref"]["local_path"], x["resource_type"], x["resource_ref"]["execution_mode"]) for x in project["resources"].values()},
            {(self.config.resources[0].local_path, "local_directory", "worktree"), (self.config.resources[1].local_path, "local_directory", "worktree")},
        )

    def test_fresh_apply_without_required_env_fails_before_mutation(self):
        with self.assertRaisesRegex(ValueError, "backend environment"):
            self.provisioner.reconcile(self.config, apply=True, backend_env=None)
        self.assertEqual(self.runner.mutation_count, 0)

    def test_backend_env_requires_exact_keys_before_any_runner_call(self):
        cases = (
            {key: value for key, value in self.backend_env.items() if key != "MAIL_PASSWORD"},
            {**self.backend_env, "UNEXPECTED_PRIVATE_KEY": "private-extra-value"},
        )
        for backend_env in cases:
            with self.subTest(keys=set(backend_env)):
                runner = FakeRunner()
                with self.assertRaisesRegex(ValueError, "backend environment") as caught:
                    Provisioner(runner).reconcile(
                        self.config, apply=True, backend_env=backend_env
                    )
                self.assertEqual(runner.calls, [])
                rendered = str(caught.exception)
                for key, value in backend_env.items():
                    self.assertNotIn(key, rendered)
                    self.assertNotIn(value, rendered)

    def test_existing_recipient_without_env_fails_before_mutation(self):
        for agent in self.config.agents:
            self._matching_agent(agent)
        with self.assertRaisesRegex(ValueError, "backend environment"):
            self.provisioner.reconcile(self.config, apply=True, backend_env=None)
        self.assertEqual(self.runner.mutation_count, 0)

    def test_existing_recipient_gets_env_via_stdin_set_and_verification(self):
        recipient = next(agent for agent in self.config.agents if agent.role == "backend_engineer")
        agent_id = self._matching_agent(recipient)
        self.provisioner.reconcile(self.config, apply=True, backend_env=self.backend_env)
        env_sets = [call for call in self.runner.calls if call["command"] == ("agent", "env", "set")]
        self.assertEqual(len(env_sets), 1)
        self.assertEqual(env_sets[0]["positionals"], [agent_id])
        self.assertEqual(env_sets[0]["flags"], {"--custom-env-stdin": True, "--output": "json"})
        self.assertEqual(env_sets[0]["stdin_json"], self.backend_env)
        self.assertEqual(self.runner.envs[agent_id], self.backend_env)

    def test_wrong_env_post_write_state_is_detected(self):
        recipient = next(agent for agent in self.config.agents if agent.role == "backend_engineer")
        self._matching_agent(recipient)
        self.runner.freeze_updates.add("env")
        with self.assertRaisesRegex(RuntimeError, "environment reconciliation"):
            self.provisioner.reconcile(self.config, apply=True, backend_env=self.backend_env)

    def test_wrong_env_value_after_set_fails_closed_without_value_in_error(self):
        recipient = next(agent for agent in self.config.agents if agent.role == "backend_engineer")
        self._matching_agent(recipient)
        self.runner.corrupt_env_after_set = "MAIL_PASSWORD"
        with self.assertRaisesRegex(RuntimeError, "environment reconciliation") as caught:
            self.provisioner.reconcile(self.config, apply=True, backend_env=self.backend_env)
        rendered = str(caught.exception)
        for value in self.backend_env.values():
            self.assertNotIn(value, rendered)

    def test_second_apply_without_env_preserves_values_and_is_idempotent(self):
        first = self.provisioner.reconcile(self.config, apply=True, backend_env=self.backend_env)
        mutation_count, envs = self.runner.mutation_count, copy.deepcopy(self.runner.envs)
        second = self.provisioner.reconcile(self.config, apply=True, backend_env=None)
        self.assertEqual(second, first)
        self.assertEqual(self.runner.mutation_count, mutation_count)
        self.assertEqual(self.runner.envs, envs)

    def test_dry_run_has_zero_mutations_even_without_env(self):
        result = self.provisioner.reconcile(self.config, apply=False, backend_env=None)
        self.assertEqual(self.runner.mutation_count, 0)
        self.assertTrue(all(value is None for value in result.agent_ids.values()))

    def test_list_is_index_and_agent_detail_is_reconciled_via_get(self):
        agent = self.config.agents[0]
        agent_id = self.runner.seed_agent(agent.name)
        result = self.provisioner.reconcile(self.config, apply=True, backend_env=self.backend_env)
        self.assertEqual(result.agent_ids[agent.role], agent_id)
        self.assertEqual(len([x for x in self.runner.agents.values() if x["name"] == agent.name]), 1)
        self.assertTrue(any(call["command"] == ("agent", "get") and call["positionals"] == [agent_id] for call in self.runner.calls))
        self.assertEqual(self.runner.agents[agent_id]["runtime_id"], "runtime-id")

    def test_empty_editable_detail_fields_are_valid_and_reconciled(self):
        agent = self.config.agents[0]
        agent_id = self.runner.seed_agent(agent.name, description="", instructions="")
        result = self.provisioner.reconcile(self.config, apply=True, backend_env=self.backend_env)
        self.assertEqual(result.agent_ids[agent.role], agent_id)
        self.assertEqual(self.runner.agents[agent_id]["description"], agent.description)
        self.assertEqual(self.runner.agents[agent_id]["instructions"], agent.instructions_file.read_text())

    def test_matching_skill_origin_is_read_from_get_and_reused(self):
        source = self.config.skills["using-superpowers"]
        skill_id = self.runner.seed_skill(source.key, source.url)
        result = self.provisioner.reconcile(self.config, apply=True, backend_env=self.backend_env)
        self.assertEqual(result.skill_ids[source.key], skill_id)
        self.assertTrue(any(call["command"] == ("skill", "get") and call["positionals"] == [skill_id] for call in self.runner.calls))
        self.assertFalse(any(call["command"] == ("skill", "import") and source.url in call["args"] for call in self.runner.calls))

    def test_accepts_multica_0_4_31_nested_skill_import_response(self):
        result = self.provisioner.reconcile(
            self.config, apply=True, backend_env=self.backend_env
        )

        skill_id = result.skill_ids["using-superpowers"]
        self.assertEqual(skill_id, "skill-1")
        self.assertTrue(
            any(
                call["command"] == ("skill", "get")
                and call["positionals"] == [skill_id]
                for call in self.runner.calls
            )
        )

    def test_binds_manifest_skill_name_when_it_differs_from_url_path(self):
        result = self.provisioner.reconcile(
            self.config, apply=True, backend_env=self.backend_env
        )

        skill_id = result.skill_ids["vercel-react-best-practices"]
        frontend_id = result.agent_ids["frontend_engineer"]
        self.assertEqual(
            self.runner.skills[skill_id]["name"],
            "vercel-react-best-practices",
        )
        self.assertIn(skill_id, self.runner.bindings[frontend_id])

    def test_same_name_skill_from_other_origin_fails_closed(self):
        self.runner.seed_skill(
            "using-superpowers",
            "https://github.com/attacker/repo/tree/main/skills/using-superpowers",
        )
        with self.assertRaisesRegex(RuntimeError, "unapproved origin"):
            self.provisioner.reconcile(self.config, apply=True, backend_env=self.backend_env)
        self.assertEqual(self.runner.mutation_count, 0)

    def test_in_place_resource_update_has_project_and_resource_positionals(self):
        project_id = self.runner.seed_project(self.config.project_title, self.config.project_context_file.read_text())
        path = self.config.resources[0].local_path
        resource_id = self.runner.seed_resource(project_id, path, resource_ref={"execution_mode": "in_place"})
        result = self.provisioner.reconcile(self.config, apply=True, backend_env=self.backend_env)
        self.assertEqual(result.resource_ids[path], resource_id)
        update = next(call for call in self.runner.calls if call["command"] == ("project", "resource", "update"))
        self.assertEqual(update["positionals"], [project_id, resource_id])
        self.assertEqual(update["flags"]["--execution-mode"], "worktree")

    def test_nested_target_runtime_capability_allows_unrelated_degraded_record_in_dry_run(self):
        config = build_eventra_config(
            "de500649-cada-4419-9d5d-279045e2eaae",
            "019fab98-bbad-7d17-b0b7-26e56dbe1b6f",
        )
        self.runner.runtimes = [
            {
                "id": "de500649-cada-4419-9d5d-279045e2eaae",
                "daemon_id": "019fab98-bbad-7d17-b0b7-26e56dbe1b6f",
                "status": "online",
                "metadata": {"capabilities": ["local-worktree-v1"]},
            },
            {
                "id": "offline-profile-runtime",
                "status": "offline",
                "metadata": {"profile_error": "sanitized profile failure"},
            },
        ]

        result = Provisioner(self.runner).reconcile(config, apply=False, backend_env=None)

        self.assertEqual(self.runner.mutation_count, 0)
        self.assertTrue(all(value is None for value in result.agent_ids.values()))

    def test_missing_or_malformed_runtime_capability_fails_closed(self):
        cases = (
            [],
            [{"id": "runtime-id", "daemon_id": "daemon-id", "status": "online", "metadata": {}}],
            [{"id": "runtime-id", "daemon_id": "daemon-id", "status": "online", "metadata": {"capabilities": []}}],
            [{"id": "other"}],
        )
        for value in cases:
            with self.subTest(value=value):
                runner = FakeRunner()
                runner.runtimes = value
                with self.assertRaisesRegex(RuntimeError, "runtime|local-worktree-v1"):
                    Provisioner(runner).reconcile(self.config, apply=True, backend_env=self.backend_env)
                self.assertEqual(runner.mutation_count, 0)

    def test_target_runtime_strict_schema_failures_stop_before_mutation(self):
        target = {
            "id": "runtime-id",
            "daemon_id": "daemon-id",
            "status": "online",
            "metadata": {"capabilities": ["local-worktree-v1"]},
        }
        cases = (
            ({**target, "daemon_id": "wrong-daemon"}, "daemon does not match"),
            ({**target, "status": "offline"}, "malformed runtime list"),
            ({key: value for key, value in target.items() if key != "metadata"}, "malformed runtime list"),
            ({**target, "metadata": {"capabilities": ["local-worktree-v1", 1]}}, "malformed runtime list"),
            ({**target, "metadata": {"capabilities": []}}, "local-worktree-v1"),
        )
        for runtime, message in cases:
            with self.subTest(runtime=runtime):
                runner = FakeRunner()
                runner.runtimes = [runtime]
                with self.assertRaisesRegex(RuntimeError, message):
                    Provisioner(runner).reconcile(self.config, apply=True, backend_env=self.backend_env)
                self.assertEqual(runner.mutation_count, 0)

        runner = FakeRunner()
        runner.runtimes = [target, copy.deepcopy(target)]
        with self.assertRaisesRegex(RuntimeError, "missing or duplicated"):
            Provisioner(runner).reconcile(self.config, apply=True, backend_env=self.backend_env)
        self.assertEqual(runner.mutation_count, 0)

    def test_runtime_records_require_nonempty_ids_even_when_not_targeted(self):
        target = {
            "id": "runtime-id",
            "daemon_id": "daemon-id",
            "status": "online",
            "metadata": {"capabilities": ["local-worktree-v1"]},
        }
        for unrelated in ({}, {"id": ""}):
            with self.subTest(unrelated=unrelated):
                runner = FakeRunner()
                runner.runtimes = [target, unrelated]
                with self.assertRaisesRegex(RuntimeError, "malformed runtime list"):
                    Provisioner(runner).reconcile(self.config, apply=True, backend_env=self.backend_env)
                self.assertEqual(runner.mutation_count, 0)

    def test_invalid_list_records_fail_closed_including_non_targets(self):
        cases = ((("agent", "list"), [{"id": "other"}]), (("skill", "list"), [{"name": "other"}]), (("squad", "list"), [{"id": "other", "name": 7}]), (("project", "list"), [{"id": "other", "name": "wrong-field"}]))
        for command, response in cases:
            with self.subTest(command=command):
                runner = FakeRunner()
                runner.response_overrides[command] = response
                with self.assertRaisesRegex(RuntimeError, "malformed"):
                    Provisioner(runner).reconcile(self.config, apply=True, backend_env=self.backend_env)
                self.assertEqual(runner.mutation_count, 0)

    def test_malformed_detail_and_create_response_fail_closed(self):
        agent = self.config.agents[0]
        runner = FakeRunner()
        agent_id = runner.seed_agent(agent.name)
        runner.response_overrides[("agent", "get")] = {"id": agent_id, "name": agent.name}
        with self.assertRaisesRegex(RuntimeError, "malformed agent detail"):
            Provisioner(runner).reconcile(self.config, apply=True, backend_env=self.backend_env)
        self.assertEqual(runner.mutation_count, 0)

        runner = FakeRunner()
        runner.response_overrides[("agent", "create")] = {"id": "agent-1", "name": "Wrong"}
        with self.assertRaisesRegex(RuntimeError, "agent create"):
            Provisioner(runner).reconcile(self.config, apply=True, backend_env=self.backend_env)

    def test_wrong_post_write_state_is_detected(self):
        for frozen, expected in (("agent", "agent reconciliation"), ("squad", "Squad reconciliation"), ("project", "Project reconciliation")):
            with self.subTest(frozen=frozen):
                runner = FakeRunner()
                if frozen == "agent":
                    runner.seed_agent(self.config.agents[0].name)
                elif frozen == "squad":
                    leader = runner.seed_agent(self.config.agents[0].name)
                    runner.squads["squad-1"] = {"id": "squad-1", "name": self.config.blueprint.squad_name, "description": "old", "instructions": "old", "leader_id": leader, "members": {}}
                    runner._next["squad"] = 2
                else:
                    runner.seed_project(self.config.project_title)
                runner.freeze_updates.add(frozen)
                with self.assertRaisesRegex(RuntimeError, expected):
                    Provisioner(runner).reconcile(self.config, apply=True, backend_env=self.backend_env)

    def test_update_responses_must_echo_the_exact_target_id(self):
        agent = self.config.agents[0]
        runner = FakeRunner()
        runner.seed_agent(agent.name)
        runner.response_overrides[("agent", "update")] = {"id": "wrong-agent", "name": agent.name}
        with self.assertRaisesRegex(RuntimeError, "agent update"):
            Provisioner(runner).reconcile(self.config, apply=True, backend_env=self.backend_env)

        runner = FakeRunner()
        leader_id = runner.seed_agent(agent.name)
        runner.squads["squad-1"] = {
            "id": "squad-1", "name": self.config.blueprint.squad_name,
            "description": "old", "instructions": "old", "leader_id": leader_id, "members": {},
        }
        runner._next["squad"] = 2
        runner.response_overrides[("squad", "update")] = {
            "id": "wrong-squad", "name": self.config.blueprint.squad_name,
        }
        with self.assertRaisesRegex(RuntimeError, "Squad update"):
            Provisioner(runner).reconcile(self.config, apply=True, backend_env=self.backend_env)

        runner = FakeRunner()
        runner.seed_project(self.config.project_title)
        runner.response_overrides[("project", "update")] = {
            "id": "wrong-project", "title": self.config.project_title,
        }
        with self.assertRaisesRegex(RuntimeError, "Project update"):
            Provisioner(runner).reconcile(self.config, apply=True, backend_env=self.backend_env)

    def test_fresh_squad_instructions_update_must_echo_target_id_and_name(self):
        runner = FakeRunner()
        runner.response_overrides[("squad", "update")] = {
            "id": "wrong-squad", "name": self.config.blueprint.squad_name,
        }
        with self.assertRaisesRegex(RuntimeError, "Squad update"):
            Provisioner(runner).reconcile(
                self.config, apply=True, backend_env=self.backend_env
            )

    def test_local_validation_rejects_overlong_short_secret_and_mutated_recipients(self):
        unsafe = replace(self.config, agents=(replace(self.config.agents[0], description="x" * 256), *self.config.agents[1:]))
        with self.assertRaisesRegex(ValueError, "255"):
            self.provisioner.reconcile(unsafe, apply=True, backend_env=self.backend_env)
        self.assertEqual(self.runner.calls, [])
        with self.assertRaisesRegex(ValueError, "64"):
            self.provisioner.reconcile(self.config, apply=True, backend_env={**self.backend_env, "JWT_SECRET": "short"})
        self.assertEqual(self.runner.calls, [])
        mutated = tuple(replace(agent, needs_backend_env=(agent.role == "frontend_engineer")) for agent in self.config.agents)
        with self.assertRaisesRegex(ValueError, "environment recipients"):
            self.provisioner.reconcile(replace(self.config, agents=mutated), apply=True, backend_env=self.backend_env)
        self.assertEqual(self.runner.calls, [])

    def test_additive_binding_and_unsafe_resource_guards(self):
        agent = self.config.agents[0]
        agent_id = self._matching_agent(agent)
        self.runner.bindings[agent_id].add("unrelated-skill")
        self.provisioner.reconcile(self.config, apply=True, backend_env=self.backend_env)
        self.assertIn("unrelated-skill", self.runner.bindings[agent_id])
        for path in ("/Users/didi/Eventra-workspace/Eventra/Backend", "/Users/didi/surprise"):
            runner = FakeRunner()
            project_id = runner.seed_project(self.config.project_title)
            runner.seed_resource(project_id, path)
            with self.assertRaisesRegex(RuntimeError, "unsafe resource state"):
                Provisioner(runner).reconcile(self.config, apply=True, backend_env=self.backend_env)
            self.assertEqual(runner.mutation_count, 0)
        runner = FakeRunner()
        project_id = runner.seed_project(self.config.project_title)
        path = self.config.resources[0].local_path
        runner.seed_resource(project_id, path)
        runner.seed_resource(project_id, path)
        with self.assertRaisesRegex(RuntimeError, "unsafe resource state"):
            Provisioner(runner).reconcile(self.config, apply=True, backend_env=self.backend_env)
        self.assertEqual(runner.mutation_count, 0)
        runner = FakeRunner()
        project_id = runner.seed_project(self.config.project_title)
        runner.seed_resource(project_id, path, resource_ref={"execution_mode": "shared_checkout"})
        with self.assertRaisesRegex(RuntimeError, "unsafe resource state"):
            Provisioner(runner).reconcile(self.config, apply=True, backend_env=self.backend_env)
        self.assertEqual(runner.mutation_count, 0)


class PromptTests(unittest.TestCase):
    def test_hidden_prompt_returns_secret_and_local_defaults(self):
        with patch("tools.multica.provision.getpass.getpass", side_effect=["k" * 64, ""]), patch("builtins.input", return_value=""):
            self.assertEqual(prompt_backend_env(), {"JWT_SECRET": "k" * 64, "MAIL_USERNAME": "unused@example.com", "MAIL_PASSWORD": "unused"})

    def test_short_secret_is_rejected(self):
        with patch("tools.multica.provision.getpass.getpass", return_value="short"):
            with self.assertRaisesRegex(ValueError, "at least 64"):
                prompt_backend_env()


if __name__ == "__main__":
    unittest.main()
