import copy
import contextlib
import io
import json
import os
import subprocess
import unittest
from dataclasses import replace
from unittest.mock import patch

from tools.multica.eventra_adapter import build_eventra_config
from tools.multica.provision import (
    MulticaRunner,
    Provisioner,
    main,
    prompt_backend_env,
    recover_backend_env,
)


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
        ("autopilot", "list"): (0, {"--output"}, set()),
        ("autopilot", "get"): (1, {"--output"}, set()),
        ("autopilot", "create"): (
            0,
            {"--title", "--description", "--agent", "--mode", "--project", "--output"},
            {"--title", "--description", "--agent", "--mode", "--project"},
        ),
        ("autopilot", "update"): (
            1,
            {"--title", "--description", "--agent", "--mode", "--project", "--status", "--output"},
            set(),
        ),
        ("autopilot", "trigger-add"): (
            1,
            {"--kind", "--cron", "--timezone", "--label", "--output"},
            {"--kind", "--cron", "--timezone"},
        ),
        ("autopilot", "trigger-update"): (
            2,
            {"--cron", "--timezone", "--label", "--enabled", "--output"},
            set(),
        ),
    }
    BOOLEAN_FLAGS = {"--custom-env-stdin", "--enabled"}
    MUTATIONS = {
        ("skill", "import"), ("agent", "create"), ("agent", "update"),
        ("agent", "env", "set"), ("agent", "skills", "add"),
        ("squad", "create"), ("squad", "update"), ("squad", "member", "add"),
        ("squad", "member", "set-role"), ("project", "create"),
        ("project", "update"), ("project", "resource", "add"),
        ("project", "resource", "update"),
        ("autopilot", "create"), ("autopilot", "update"),
        ("autopilot", "trigger-add"), ("autopilot", "trigger-update"),
    }

    def __init__(self):
        self.calls = []
        self.stdin_object_ids = []
        self.runtimes = [{
            "id": "runtime-id",
            "daemon_id": "daemon-id",
            "status": "online",
            "metadata": {"capabilities": ["local-worktree-v1"]},
        }]
        self.skills, self.agents, self.envs, self.bindings = {}, {}, {}, {}
        self.squads, self.projects, self.autopilots = {}, {}, {}
        self.response_overrides = {}
        self.freeze_mutations = set()
        self.freeze_updates = set()
        self.replace_bindings_on_add = False
        self.omit_execution_mode_on_resource_reads = False
        self.corrupt_env_after_set = None
        self.env_replacement_after_agent_update = None
        self.squad_create_leader_issue = None
        self.restore_leader_on_squad_update = False
        self._next = {kind: 1 for kind in ("skill", "agent", "squad", "project", "resource", "autopilot", "trigger")}

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
            "id": resource_id, "project_id": project_id,
            "resource_type": "local_directory", "resource_ref": ref, **overrides,
        }
        return resource_id

    def seed_autopilot(self, title, **overrides):
        autopilot_id = self._id("autopilot")
        self.autopilots[autopilot_id] = {
            "id": autopilot_id,
            "title": title,
            "description": "old",
            "execution_mode": "run_only",
            "project_id": "project-old",
            "assignee_id": "agent-old",
            "assignee_type": "agent",
            "status": "active",
            "triggers": [],
            **overrides,
        }
        return autopilot_id

    def run(self, args, *, stdin_json=None):
        command, positionals, flags = self._parse(args)
        if stdin_json is not None and "--custom-env-stdin" not in flags:
            raise AssertionError("stdin JSON supplied without a supported stdin flag")
        if "--custom-env-stdin" in flags and stdin_json is None:
            raise AssertionError("stdin flag requires stdin JSON")
        self.stdin_object_ids.append(None if stdin_json is None else id(stdin_json))
        self.calls.append({"args": list(args), "command": command, "positionals": positionals, "flags": flags, "stdin_json": copy.deepcopy(stdin_json)})
        override = self.response_overrides.get(command)
        if command in self.freeze_mutations:
            return copy.deepcopy(override if override is not None else {"ok": True})

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
                if self.env_replacement_after_agent_update is not None:
                    self.envs[agent_id] = copy.deepcopy(
                        self.env_replacement_after_agent_update
                    )
            return copy.deepcopy(override if override is not None else self.agents[agent_id])
        if command == ("agent", "env", "get"):
            agent_id = positionals[0]
            return self._response(
                command,
                {"agent_id": agent_id, "custom_env": copy.deepcopy(self.envs[agent_id])},
            )
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
            skill_ids = set(flags["--skill-ids"].split(","))
            if self.replace_bindings_on_add:
                self.bindings[positionals[0]] = skill_ids
            else:
                self.bindings[positionals[0]].update(skill_ids)
            return self._response(command, {"ok": True})

        if command == ("squad", "list"):
            return self._response(command, [{"id": x["id"], "name": x["name"]} for x in self.squads.values()])
        if command == ("squad", "get"):
            return self._response(command, self._public(self.squads[positionals[0]], "members"))
        if command == ("squad", "create"):
            squad_id = self._id("squad")
            leader_id = flags["--leader"]
            item = {
                "id": squad_id,
                "name": flags["--name"],
                "description": flags.get("--description", ""),
                "instructions": "",
                "leader_id": leader_id,
                "members": {
                    leader_id: {
                        "id": f"membership-{squad_id}-{leader_id}",
                        "squad_id": squad_id,
                        "member_id": leader_id,
                        "member_type": "agent",
                        "role": "leader",
                    }
                },
            }
            if self.squad_create_leader_issue == "missing":
                item["members"] = {}
            elif self.squad_create_leader_issue == "wrong role":
                item["members"][leader_id]["role"] = "member"
            elif self.squad_create_leader_issue == "extra member":
                item["members"]["agent-extra"] = {
                    "id": f"membership-{squad_id}-agent-extra",
                    "squad_id": squad_id,
                    "member_id": "agent-extra",
                    "member_type": "agent",
                    "role": "observer",
                }
            self.squads[squad_id] = item
            return copy.deepcopy(override if override is not None else self._public(item, "members"))
        if command == ("squad", "update"):
            squad_id = positionals[0]
            if "squad" not in self.freeze_updates:
                mapping = {"--name": "name", "--description": "description", "--instructions": "instructions", "--leader": "leader_id"}
                self.squads[squad_id].update({target: flags[source] for source, target in mapping.items() if source in flags})
                if self.restore_leader_on_squad_update:
                    leader_id = self.squads[squad_id]["leader_id"]
                    self.squads[squad_id]["members"][leader_id] = {
                        "id": f"membership-{squad_id}-{leader_id}",
                        "squad_id": squad_id,
                        "member_id": leader_id,
                        "member_type": "agent",
                        "role": "leader",
                    }
            return copy.deepcopy(override if override is not None else self._public(self.squads[squad_id], "members"))
        if command == ("squad", "member", "list"):
            return self._response(command, list(self.squads[positionals[0]]["members"].values()))
        if command == ("squad", "member", "add"):
            squad_id, member_id = positionals[0], flags["--member-id"]
            member = {
                "id": f"membership-{squad_id}-{member_id}",
                "squad_id": squad_id,
                "member_id": member_id,
                "member_type": flags.get("--type", "agent"),
                "role": flags.get("--role", "member"),
            }
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
            value = copy.deepcopy(
                list(self.projects[positionals[0]]["resources"].values())
            )
            if self.omit_execution_mode_on_resource_reads:
                for item in value:
                    item["resource_ref"].pop("execution_mode", None)
            return self._response(command, value)
        if command == ("project", "resource", "add"):
            project_id, resource_id = positionals[0], self._id("resource")
            if any(
                item["resource_type"] == "local_directory"
                and item["resource_ref"]["daemon_id"] == flags["--daemon-id"]
                for item in self.projects[project_id]["resources"].values()
            ):
                raise RuntimeError(
                    "this daemon already has a local_directory attached to the project"
                )
            item = {"id": resource_id, "project_id": project_id, "resource_type": flags["--type"], "resource_ref": {"local_path": flags["--local-path"], "daemon_id": flags["--daemon-id"], "execution_mode": flags["--execution-mode"]}}
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
        if command == ("autopilot", "list"):
            return self._response(
                command,
                {
                    "autopilots": [
                        self._autopilot_public(item) for item in self.autopilots.values()
                    ],
                    "total": len(self.autopilots),
                },
            )
        if command == ("autopilot", "get"):
            item = self.autopilots[positionals[0]]
            return self._response(command, self._autopilot_detail(item))
        if command == ("autopilot", "create"):
            autopilot_id = self._id("autopilot")
            self.autopilots[autopilot_id] = {
                "id": autopilot_id,
                "title": flags["--title"],
                "description": flags["--description"],
                "execution_mode": flags["--mode"],
                "project_id": flags["--project"],
                "assignee_id": flags["--agent"],
                "assignee_type": "agent",
                "status": "active",
                "triggers": [],
            }
            return copy.deepcopy(override if override is not None else {"ok": True})
        if command == ("autopilot", "update"):
            item = self.autopilots[positionals[0]]
            if "autopilot" not in self.freeze_updates:
                mapping = {
                    "--title": "title", "--description": "description",
                    "--agent": "assignee_id", "--mode": "execution_mode",
                    "--project": "project_id", "--status": "status",
                }
                item.update({target: flags[source] for source, target in mapping.items() if source in flags})
            return copy.deepcopy(override if override is not None else {"ok": True})
        if command == ("autopilot", "trigger-add"):
            autopilot_id = positionals[0]
            trigger_id = self._id("trigger")
            self.autopilots[autopilot_id]["triggers"].append(
                self._trigger(trigger_id, autopilot_id, flags)
            )
            return copy.deepcopy(override if override is not None else {"ok": True})
        if command == ("autopilot", "trigger-update"):
            autopilot_id, trigger_id = positionals
            trigger = next(
                item for item in self.autopilots[autopilot_id]["triggers"]
                if item["id"] == trigger_id
            )
            if "trigger" not in self.freeze_updates:
                if "--cron" in flags:
                    trigger["cron_expression"] = flags["--cron"]
                if "--timezone" in flags:
                    trigger["timezone"] = flags["--timezone"]
                if "--label" in flags:
                    trigger["label"] = flags["--label"]
                if "--enabled" in flags:
                    trigger["enabled"] = True
            return copy.deepcopy(override if override is not None else {"ok": True})
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

    @staticmethod
    def _autopilot_public(item):
        return {key: copy.deepcopy(value) for key, value in item.items() if key != "triggers"}

    @classmethod
    def _autopilot_detail(cls, item):
        return {
            "autopilot": cls._autopilot_public(item),
            "collaborators": [],
            "triggers": copy.deepcopy(item["triggers"]),
        }

    @staticmethod
    def _trigger(trigger_id, autopilot_id, flags):
        timezone = flags["--timezone"]
        return {
            "id": trigger_id,
            "autopilot_id": autopilot_id,
            "kind": flags["--kind"],
            "cron_expression": flags["--cron"],
            "timezone": timezone,
            "enabled": True,
            "label": flags.get("--label"),
            "has_signing_secret": False,
            "has_webhook_token": False,
            "provider": None,
            "signing_secret_hint": None,
            "webhook_path": None,
            "webhook_token": None,
            "webhook_token_hint": None,
            "webhook_url": None,
        }

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
    def test_retries_allowlisted_read_after_transient_cli_failure(self, run):
        run.side_effect = (
            subprocess.CompletedProcess([], 2, "", "temporary private failure"),
            subprocess.CompletedProcess([], 0, '{"id":"skill-1"}', ""),
        )

        result = MulticaRunner().run(
            ["skill", "get", "skill-1", "--output", "json"]
        )

        self.assertEqual(result, {"id": "skill-1"})
        self.assertEqual(run.call_count, 2)

    @patch("tools.multica.provision.subprocess.run")
    def test_read_retry_is_bounded_to_three_total_attempts(self, run):
        run.return_value = subprocess.CompletedProcess(
            [], 2, "", "temporary private failure"
        )

        with self.assertRaisesRegex(RuntimeError, "failed with exit 2"):
            MulticaRunner().run(["agent", "skills", "list", "agent-1"])

        self.assertEqual(run.call_count, 3)

    @patch("tools.multica.provision.subprocess.run")
    def test_mutation_and_unknown_commands_are_never_retried(self, run):
        run.return_value = subprocess.CompletedProcess([], 2, "", "private")
        runner = MulticaRunner()

        for argv in (
            ["agent", "update", "agent-1", "--output", "json"],
            ["issue", "rerun", "PRO-35", "--output", "json"],
        ):
            before = run.call_count
            with self.subTest(argv=argv):
                with self.assertRaisesRegex(RuntimeError, "failed with exit 2"):
                    runner.run(argv)
                self.assertEqual(run.call_count - before, 1)

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

    @patch("tools.multica.provision.subprocess.run")
    def test_counts_attempted_mutations_from_the_allowlist(self, run):
        run.side_effect = (
            subprocess.CompletedProcess([], 0, "[]", ""),
            subprocess.CompletedProcess([], 0, "{}", ""),
            subprocess.CompletedProcess([], 9, "", "private stderr"),
        )
        runner = MulticaRunner()

        runner.run(["agent", "list", "--output", "json"])
        runner.run(["agent", "create", "--output", "json"])
        with self.assertRaisesRegex(RuntimeError, "failed with exit 9"):
            runner.run(["agent", "env", "set", "agent-1", "--output", "json"])

        self.assertEqual(runner.mutation_count, 2)


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

    def test_fake_squad_create_includes_the_server_managed_leader_member(self):
        self.runner.run(
            [
                "squad", "create", "--name", "fixture", "--description", "fixture",
                "--leader", "agent-leader", "--output", "json",
            ]
        )

        squad = self.runner.squads["squad-1"]
        self.assertEqual(
            squad["members"],
            {
                "agent-leader": {
                    "id": "membership-squad-1-agent-leader",
                    "squad_id": "squad-1",
                    "member_id": "agent-leader",
                    "member_type": "agent",
                    "role": "leader",
                }
            },
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
        self.assertIn(
            "project create --title Eventra Backend Local Development --description",
            rendered,
        )
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
        backend_project = self.runner.projects[result.backend_project_id]
        self.assertEqual(len(project["resources"]), 1)
        self.assertEqual(len(backend_project["resources"]), 1)
        self.assertEqual(
            {
                (x["resource_ref"]["local_path"], x["resource_type"], x["resource_ref"]["execution_mode"])
                for target in (project, backend_project)
                for x in target["resources"].values()
            },
            {(self.config.resources[0].local_path, "local_directory", "worktree"), (self.config.resources[1].local_path, "local_directory", "worktree")},
        )
        self.assertEqual(
            next(iter(project["resources"].values()))["resource_ref"]["local_path"],
            self.config.resources[0].local_path,
        )
        self.assertEqual(
            next(iter(backend_project["resources"].values()))["resource_ref"]["local_path"],
            self.config.resources[1].local_path,
        )
        self.assertEqual(
            {
                member_id: member["role"]
                for member_id, member in self.runner.squads[result.squad_id]["members"].items()
            },
            {
                result.agent_ids["delivery_lead"]: "leader",
                result.agent_ids["frontend_engineer"]: "frontend_engineer",
                result.agent_ids["backend_engineer"]: "backend_engineer",
                result.agent_ids["integration_qa"]: "integration_qa",
                result.agent_ids["independent_reviewer"]: "independent_reviewer",
            },
        )
        leader_mutations = [
            call for call in self.runner.calls
            if call["command"] in {("squad", "member", "add"), ("squad", "member", "set-role")}
            and call["flags"]["--member-id"] == result.agent_ids["delivery_lead"]
        ]
        self.assertEqual(leader_mutations, [])

    def test_fresh_apply_creates_one_run_only_watcher_and_schedule(self):
        result = self.provisioner.reconcile(
            self.config, apply=True, backend_env=self.backend_env
        )
        watcher = self.runner.autopilots[result.autopilot_id]
        expected_description = (
            self.config.watcher.description_file.read_text()
            .replace("__FRONTEND_PROJECT_ID__", result.project_id)
            .replace("__BACKEND_PROJECT_ID__", result.backend_project_id)
        )
        self.assertEqual(watcher["execution_mode"], "run_only")
        self.assertEqual(watcher["project_id"], result.project_id)
        self.assertEqual(watcher["assignee_id"], result.agent_ids["delivery_lead"])
        self.assertEqual(watcher["description"], expected_description)
        self.assertNotIn("__FRONTEND_PROJECT_ID__", watcher["description"])
        self.assertEqual(len(watcher["triggers"]), 1)
        self.assertEqual(watcher["triggers"][0]["timezone"], "Asia/Shanghai")
        self.assertEqual(
            watcher["triggers"][0]["cron_expression"],
            "*/30 * * * *",
        )

    def test_existing_watcher_and_trigger_drift_are_updated_authoritatively(self):
        result = self.provisioner.reconcile(
            self.config, apply=True, backend_env=self.backend_env
        )
        watcher = self.runner.autopilots[result.autopilot_id]
        watcher["description"] = "drift"
        watcher["project_id"] = result.backend_project_id
        watcher["triggers"][0]["cron_expression"] = "0 0 * * *"
        watcher["triggers"][0]["timezone"] = "UTC"
        watcher["triggers"][0]["enabled"] = False
        before = self.runner.mutation_count

        second = self.provisioner.reconcile(
            self.config, apply=True, backend_env=None
        )

        self.assertEqual(second.autopilot_id, result.autopilot_id)
        self.assertEqual(self.runner.mutation_count - before, 2)
        self.assertEqual(watcher["project_id"], result.project_id)
        self.assertTrue(watcher["triggers"][0]["enabled"])
        self.assertEqual(watcher["triggers"][0]["timezone"], "Asia/Shanghai")

    def test_watcher_reconciliation_preserves_unrelated_autopilot(self):
        unrelated_id = self.runner.seed_autopilot(
            "Unrelated Watcher",
            description="keep-me",
            project_id="project-unrelated",
            assignee_id="agent-unrelated",
        )
        result = self.provisioner.reconcile(
            self.config, apply=True, backend_env=self.backend_env
        )
        self.assertNotEqual(result.autopilot_id, unrelated_id)
        self.assertEqual(self.runner.autopilots[unrelated_id]["description"], "keep-me")

    def test_malformed_target_watcher_fails_before_any_mutation(self):
        watcher_id = self.runner.seed_autopilot(self.config.watcher.title)
        flags = {
            "--kind": "schedule",
            "--cron": self.config.watcher.cron,
            "--timezone": self.config.watcher.timezone,
            "--label": self.config.watcher.label,
        }
        self.runner.autopilots[watcher_id]["triggers"] = [
            self.runner._trigger("trigger-1", watcher_id, flags),
            self.runner._trigger("trigger-2", watcher_id, flags),
        ]
        with self.assertRaisesRegex(RuntimeError, "malformed autopilot detail"):
            self.provisioner.reconcile(
                self.config, apply=True, backend_env=self.backend_env
            )
        self.assertEqual(self.runner.mutation_count, 0)

    def test_invalid_server_managed_leader_fails_before_member_mutation(self):
        first = self.provisioner.reconcile(
            self.config, apply=True, backend_env=self.backend_env
        )
        leader_id = first.agent_ids["delivery_lead"]
        squad = self.runner.squads[first.squad_id]
        cases = {
            "missing": lambda: squad["members"].pop(leader_id),
            "wrong type": lambda: squad["members"][leader_id].update(member_type="group"),
            "wrong member id": lambda: squad["members"][leader_id].update(member_id="agent-wrong"),
            "wrong role": lambda: squad["members"][leader_id].update(role="member"),
        }
        for name, corrupt in cases.items():
            with self.subTest(name=name):
                state = copy.deepcopy(squad["members"])
                corrupt()
                mutation_count = self.runner.mutation_count
                with self.assertRaisesRegex(RuntimeError, "Squad leader reconciliation failed"):
                    self.provisioner.reconcile(
                        self.config, apply=True, backend_env=None
                    )
                self.assertEqual(self.runner.mutation_count, mutation_count)
                squad["members"] = state

    def test_fresh_create_invalid_member_state_fails_before_update_can_repair_it(self):
        for issue in ("missing", "wrong role", "extra member"):
            with self.subTest(issue=issue):
                runner = FakeRunner()
                runner.squad_create_leader_issue = issue
                runner.restore_leader_on_squad_update = True

                with self.assertRaisesRegex(RuntimeError, "Squad leader reconciliation failed"):
                    Provisioner(runner).reconcile(
                        self.config, apply=True, backend_env=self.backend_env
                    )

                blocked_commands = {
                    ("squad", "update"),
                    ("squad", "member", "add"),
                    ("squad", "member", "set-role"),
                }
                self.assertFalse(
                    any(call["command"] in blocked_commands for call in runner.calls)
                )

    def test_unrelated_sixth_target_squad_member_fails_before_member_mutation(self):
        first = self.provisioner.reconcile(
            self.config, apply=True, backend_env=self.backend_env
        )
        squad = self.runner.squads[first.squad_id]
        squad["members"]["unrelated-agent"] = {
            "id": "membership-unrelated-agent",
            "squad_id": first.squad_id,
            "member_id": "unrelated-agent",
            "member_type": "agent",
            "role": "observer",
        }
        mutation_count = self.runner.mutation_count

        with self.assertRaisesRegex(RuntimeError, "unsafe Squad member state"):
            self.provisioner.reconcile(self.config, apply=True, backend_env=None)

        self.assertEqual(self.runner.mutation_count, mutation_count)

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
        self.assertEqual(second.agent_ids, first.agent_ids)
        self.assertEqual(second.skill_ids, first.skill_ids)
        self.assertEqual(second.squad_id, first.squad_id)
        self.assertEqual(second.project_id, first.project_id)
        self.assertEqual(second.backend_project_id, first.backend_project_id)
        self.assertEqual(second.resource_ids, first.resource_ids)
        self.assertGreater(first.mutation_count, 0)
        self.assertEqual(second.mutation_count, 0)
        self.assertEqual(self.runner.mutation_count, mutation_count)
        self.assertEqual(self.runner.envs, envs)

    def test_partial_frontend_project_state_creates_only_backend_project_and_resource(self):
        first = self.provisioner.reconcile(
            self.config, apply=True, backend_env=self.backend_env
        )
        del self.runner.projects[first.backend_project_id]
        self.runner.calls.clear()

        recovered = self.provisioner.reconcile(
            self.config, apply=True, backend_env=None
        )

        mutations = [
            call for call in self.runner.calls
            if call["command"] in FakeRunner.MUTATIONS
        ]
        self.assertEqual(
            [call["command"] for call in mutations],
            [
                ("project", "create"),
                ("project", "resource", "add"),
                ("autopilot", "update"),
            ],
        )
        self.assertEqual(
            mutations[0]["flags"]["--title"], self.config.backend_project_title
        )
        self.assertEqual(
            mutations[1]["flags"]["--local-path"],
            self.config.resources[1].local_path,
        )
        self.assertEqual(recovered.project_id, first.project_id)
        self.assertNotEqual(recovered.backend_project_id, first.backend_project_id)
        self.assertEqual(recovered.autopilot_id, first.autopilot_id)

    def test_rejects_duplicate_frontend_and_backend_project_titles_before_reads(self):
        config = replace(
            self.config, backend_project_title=self.config.project_title
        )

        with self.assertRaisesRegex(ValueError, "titles must be distinct"):
            self.provisioner.reconcile(
                config, apply=True, backend_env=self.backend_env
            )

        self.assertEqual(self.runner.calls, [])

    def test_no_env_apply_rejects_recipient_drift_after_agent_update(self):
        for source in self.config.skills.values():
            self.runner.seed_skill(source.key, source.url)
        agent_ids = {
            agent.role: self._matching_agent(agent) for agent in self.config.agents
        }
        for role in ("backend_engineer", "integration_qa"):
            self.runner.envs[agent_ids[role]] = copy.deepcopy(self.backend_env)
        backend_id = agent_ids["backend_engineer"]
        self.runner.agents[backend_id]["description"] = "stale description"
        drifted_env = {
            **self.backend_env,
            "MAIL_PASSWORD": "different-valid-password",
        }
        self.runner.env_replacement_after_agent_update = drifted_env

        with self.assertRaisesRegex(
            RuntimeError, "agent environment reconciliation failed"
        ) as caught:
            self.provisioner.reconcile(
                self.config, apply=True, backend_env=None
            )

        mutations = [
            call for call in self.runner.calls if call["command"] in FakeRunner.MUTATIONS
        ]
        self.assertEqual(
            [(call["command"], call["positionals"]) for call in mutations],
            [(("agent", "update"), [backend_id])],
        )
        self.assertFalse(
            any(call["command"] == ("agent", "env", "set") for call in self.runner.calls)
        )
        rendered = str(caught.exception)
        for private_value in (
            *self.backend_env,
            *self.backend_env.values(),
            *drifted_env.values(),
        ):
            self.assertNotIn(private_value, rendered)

    def test_apply_json_contains_only_state_ids_and_mutation_count(self):
        runner = FakeRunner()
        stdout = io.StringIO()
        with (
            patch("tools.multica.provision.MulticaRunner", return_value=runner),
            patch("tools.multica.provision.prompt_backend_env", return_value=self.backend_env),
            contextlib.redirect_stdout(stdout),
        ):
            self.assertEqual(
                main(
                    [
                        "--runtime-id", "runtime-id",
                        "--daemon-id", "daemon-id",
                        "--apply",
                        "--prompt-backend-env",
                    ]
                ),
                0,
            )

        output = json.loads(stdout.getvalue())
        self.assertEqual(
            set(output),
            {
                "agent_ids", "skill_ids", "squad_id", "project_id",
                "backend_project_id", "resource_ids", "autopilot_id",
                "mutation_count",
            },
        )
        self.assertEqual(output["mutation_count"], runner.mutation_count)
        rendered = stdout.getvalue()
        for secret in self.backend_env.values():
            self.assertNotIn(secret, rendered)

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

    def test_accepts_real_agent_environment_envelope(self):
        result = self.provisioner.reconcile(
            self.config, apply=True, backend_env=self.backend_env
        )

        self.assertEqual(
            self.runner.envs[result.agent_ids["backend_engineer"]], self.backend_env
        )

    def test_mutation_acknowledgements_do_not_define_state(self):
        acknowledgements = ({}, {"ok": True}, [{"unrelated": "acknowledgement"}])
        self.runner.response_overrides.update(
            {
                command: copy.deepcopy(acknowledgements[index % len(acknowledgements)])
                for index, command in enumerate(sorted(FakeRunner.MUTATIONS))
            }
        )

        first = self.provisioner.reconcile(
            self.config, apply=True, backend_env=self.backend_env
        )
        first_mutations = {
            call["command"] for call in self.runner.calls
            if call["command"] in FakeRunner.MUTATIONS
        }

        lead_id = first.agent_ids["delivery_lead"]
        backend_id = first.agent_ids["backend_engineer"]
        frontend_id = first.agent_ids["frontend_engineer"]
        self.runner.agents[lead_id]["description"] = "stale agent description"
        self.runner.envs[backend_id]["MAIL_PASSWORD"] = "stale mail password"
        self.runner.squads[first.squad_id]["description"] = "stale Squad description"
        self.runner.squads[first.squad_id]["members"][frontend_id]["role"] = "stale_role"
        self.runner.projects[first.project_id]["description"] = "stale Project context"
        resource_id = first.resource_ids[self.config.resources[0].local_path]
        self.runner.projects[first.project_id]["resources"][resource_id]["resource_ref"][
            "execution_mode"
        ] = "in_place"
        self.runner.autopilots[first.autopilot_id]["description"] = "stale watcher"
        self.runner.autopilots[first.autopilot_id]["triggers"][0][
            "timezone"
        ] = "UTC"
        self.runner.autopilots[first.autopilot_id]["triggers"][0][
            "cron_expression"
        ] = "0 0 * * *"

        second = self.provisioner.reconcile(
            self.config, apply=True, backend_env=self.backend_env
        )
        all_mutations = first_mutations | {
            call["command"] for call in self.runner.calls
            if call["command"] in FakeRunner.MUTATIONS
        }

        self.assertEqual(second.agent_ids, first.agent_ids)
        self.assertEqual(second.skill_ids, first.skill_ids)
        self.assertEqual(second.squad_id, first.squad_id)
        self.assertEqual(second.project_id, first.project_id)
        self.assertEqual(second.backend_project_id, first.backend_project_id)
        self.assertEqual(second.resource_ids, first.resource_ids)
        self.assertEqual(second.autopilot_id, first.autopilot_id)
        self.assertGreater(first.mutation_count, 0)
        self.assertGreater(second.mutation_count, 0)
        self.assertEqual(all_mutations, FakeRunner.MUTATIONS)
        self.assertEqual(self.runner.envs[backend_id], self.backend_env)
        self.assertEqual(
            self.runner.squads[first.squad_id]["members"][frontend_id]["role"],
            "frontend_engineer",
        )
        self.assertEqual(
            self.runner.projects[first.project_id]["resources"][resource_id][
                "resource_ref"
            ]["execution_mode"],
            "worktree",
        )

    def test_every_mutation_requires_authoritative_post_state(self):
        cases = (
            (("skill", "import"), ("skill", "list")),
            (("agent", "create"), ("agent", "list")),
            (("agent", "update"), ("agent", "list")),
            (("agent", "env", "set"), ("agent", "env", "get")),
            (("agent", "skills", "add"), ("agent", "skills", "list")),
            (("squad", "create"), ("squad", "list")),
            (("squad", "update"), ("squad", "list")),
            (("squad", "member", "add"), ("squad", "member", "list")),
            (("squad", "member", "set-role"), ("squad", "member", "list")),
            (("project", "create"), ("project", "list")),
            (("project", "update"), ("project", "list")),
            (("project", "resource", "add"), ("project", "resource", "list")),
            (("project", "resource", "update"), ("project", "resource", "list")),
        )
        for mutation, authoritative_read in cases:
            with self.subTest(mutation=mutation):
                runner = FakeRunner()
                provisioner = Provisioner(runner)
                result = provisioner.reconcile(
                    self.config, apply=True, backend_env=self.backend_env
                )
                lead_id = result.agent_ids["delivery_lead"]
                backend_id = result.agent_ids["backend_engineer"]
                frontend_id = result.agent_ids["frontend_engineer"]
                first_skill_id = result.skill_ids[self.config.agents[0].skill_keys[0]]
                first_path = self.config.resources[0].local_path
                first_resource_id = result.resource_ids[first_path]

                if mutation == ("skill", "import"):
                    del runner.skills[first_skill_id]
                elif mutation == ("agent", "create"):
                    del runner.agents[lead_id]
                    del runner.envs[lead_id]
                    del runner.bindings[lead_id]
                elif mutation == ("agent", "update"):
                    runner.agents[lead_id]["description"] = "stale"
                elif mutation == ("agent", "env", "set"):
                    runner.envs[backend_id]["MAIL_PASSWORD"] = "stale"
                elif mutation == ("agent", "skills", "add"):
                    runner.bindings[lead_id].remove(first_skill_id)
                elif mutation == ("squad", "create"):
                    del runner.squads[result.squad_id]
                elif mutation == ("squad", "update"):
                    runner.squads[result.squad_id]["description"] = "stale"
                elif mutation == ("squad", "member", "add"):
                    del runner.squads[result.squad_id]["members"][frontend_id]
                elif mutation == ("squad", "member", "set-role"):
                    runner.squads[result.squad_id]["members"][frontend_id]["role"] = "stale"
                elif mutation == ("project", "create"):
                    del runner.projects[result.project_id]
                elif mutation == ("project", "update"):
                    runner.projects[result.project_id]["description"] = "stale"
                elif mutation == ("project", "resource", "add"):
                    del runner.projects[result.project_id]["resources"][first_resource_id]
                elif mutation == ("project", "resource", "update"):
                    runner.projects[result.project_id]["resources"][first_resource_id][
                        "resource_ref"
                    ]["execution_mode"] = "in_place"

                runner.calls.clear()
                runner.response_overrides[mutation] = {"ok": True}
                runner.freeze_mutations.add(mutation)
                with self.assertRaises(RuntimeError):
                    provisioner.reconcile(
                        self.config, apply=True, backend_env=self.backend_env
                    )

                mutation_index = next(
                    index for index, call in enumerate(runner.calls)
                    if call["command"] == mutation
                )
                self.assertLess(mutation_index + 1, len(runner.calls))
                self.assertEqual(
                    runner.calls[mutation_index + 1]["command"], authoritative_read
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

    def test_resource_update_fails_when_post_read_omits_execution_mode(self):
        project_id = self.runner.seed_project(
            self.config.project_title,
            self.config.project_context_file.read_text(),
        )
        path = self.config.resources[0].local_path
        self.runner.seed_resource(
            project_id, path, resource_ref={"execution_mode": "in_place"}
        )
        self.runner.omit_execution_mode_on_resource_reads = True
        self.runner.response_overrides[("project", "resource", "update")] = {
            "ok": True
        }

        with self.assertRaisesRegex(RuntimeError, "resource reconciliation"):
            self.provisioner.reconcile(
                self.config, apply=True, backend_env=self.backend_env
            )

        update_index = next(
            index for index, call in enumerate(self.runner.calls)
            if call["command"] == ("project", "resource", "update")
        )
        self.assertEqual(
            self.runner.calls[update_index + 1]["command"],
            ("project", "resource", "list"),
        )

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
        with self.assertRaisesRegex(RuntimeError, "malformed|missing or duplicated"):
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

    def test_malformed_detail_fails_closed_and_create_ack_is_ignored(self):
        agent = self.config.agents[0]
        runner = FakeRunner()
        agent_id = runner.seed_agent(agent.name)
        runner.response_overrides[("agent", "get")] = {"id": agent_id, "name": agent.name}
        with self.assertRaisesRegex(RuntimeError, "malformed agent detail"):
            Provisioner(runner).reconcile(self.config, apply=True, backend_env=self.backend_env)
        self.assertEqual(runner.mutation_count, 0)

        runner = FakeRunner()
        runner.response_overrides[("agent", "create")] = {"id": "agent-1", "name": "Wrong"}
        result = Provisioner(runner).reconcile(
            self.config, apply=True, backend_env=self.backend_env
        )
        self.assertEqual(
            runner.agents[result.agent_ids[agent.role]]["name"], agent.name
        )

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

    def test_update_acknowledgements_need_not_echo_the_target_id(self):
        agent = self.config.agents[0]
        runner = FakeRunner()
        agent_id = runner.seed_agent(agent.name)
        runner.response_overrides[("agent", "update")] = {"id": "wrong-agent", "name": agent.name}
        result = Provisioner(runner).reconcile(
            self.config, apply=True, backend_env=self.backend_env
        )
        self.assertEqual(result.agent_ids[agent.role], agent_id)

        runner = FakeRunner()
        leader_id = runner.seed_agent(agent.name)
        runner.squads["squad-1"] = {
            "id": "squad-1", "name": self.config.blueprint.squad_name,
            "description": "old", "instructions": "old", "leader_id": leader_id,
            "members": {
                leader_id: {
                    "id": f"membership-squad-1-{leader_id}",
                    "squad_id": "squad-1",
                    "member_id": leader_id,
                    "member_type": "agent",
                    "role": "leader",
                }
            },
        }
        runner._next["squad"] = 2
        runner.response_overrides[("squad", "update")] = {
            "id": "wrong-squad", "name": self.config.blueprint.squad_name,
        }
        result = Provisioner(runner).reconcile(
            self.config, apply=True, backend_env=self.backend_env
        )
        self.assertEqual(result.squad_id, "squad-1")

        runner = FakeRunner()
        project_id = runner.seed_project(self.config.project_title)
        runner.response_overrides[("project", "update")] = {
            "id": "wrong-project", "title": self.config.project_title,
        }
        result = Provisioner(runner).reconcile(
            self.config, apply=True, backend_env=self.backend_env
        )
        self.assertEqual(result.project_id, project_id)

    def test_fresh_squad_instructions_update_ack_is_ignored(self):
        runner = FakeRunner()
        runner.response_overrides[("squad", "update")] = {
            "id": "wrong-squad", "name": self.config.blueprint.squad_name,
        }
        result = Provisioner(runner).reconcile(
            self.config, apply=True, backend_env=self.backend_env
        )
        self.assertEqual(
            runner.squads[result.squad_id]["instructions"],
            self.config.blueprint.squad_instructions_file.read_text(),
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

    def test_binding_add_fails_if_unrelated_binding_is_not_preserved(self):
        agent = self.config.agents[0]
        agent_id = self._matching_agent(agent)
        self.runner.bindings[agent_id].add("unrelated-skill")
        self.runner.replace_bindings_on_add = True
        self.runner.response_overrides[("agent", "skills", "add")] = {"ok": True}

        with self.assertRaisesRegex(RuntimeError, "skill reconciliation"):
            self.provisioner.reconcile(
                self.config, apply=True, backend_env=self.backend_env
            )

    def test_reconciliation_preserves_unrelated_top_level_state(self):
        unrelated_skill_id = self.runner.seed_skill(
            "unrelated-skill",
            "https://github.com/example/public-skills/tree/main/skills/unrelated",
        )
        unrelated_agent_id = self.runner.seed_agent(
            "Unrelated Agent",
            description="unrelated description",
            instructions="unrelated instructions",
            runtime_id="runtime-id",
            visibility="workspace",
            max_concurrent_tasks=1,
        )
        self.runner.bindings[unrelated_agent_id].add(unrelated_skill_id)
        unrelated_squad_id = self.runner._id("squad")
        unrelated_membership_id = (
            f"membership-{unrelated_squad_id}-{unrelated_agent_id}"
        )
        self.runner.squads[unrelated_squad_id] = {
            "id": unrelated_squad_id,
            "name": "Unrelated Squad",
            "description": "unrelated squad description",
            "instructions": "unrelated squad instructions",
            "leader_id": unrelated_agent_id,
            "members": {
                unrelated_agent_id: {
                    "id": unrelated_membership_id,
                    "squad_id": unrelated_squad_id,
                    "member_id": unrelated_agent_id,
                    "member_type": "agent",
                    "role": "leader",
                }
            },
        }
        unrelated_project_id = self.runner.seed_project(
            "Unrelated Project", "unrelated project description"
        )
        unrelated_resource_id = self.runner.seed_resource(
            unrelated_project_id, "/tmp/unrelated-project"
        )

        def unrelated_state():
            return {
                "skill": self.runner.skills[unrelated_skill_id],
                "agent": self.runner.agents[unrelated_agent_id],
                "environment": self.runner.envs[unrelated_agent_id],
                "bindings": sorted(self.runner.bindings[unrelated_agent_id]),
                "squad": self.runner.squads[unrelated_squad_id],
                "project": self.runner.projects[unrelated_project_id],
            }

        before = copy.deepcopy(unrelated_state())
        before_bytes = json.dumps(
            before, sort_keys=True, separators=(",", ":")
        ).encode()

        self.provisioner.reconcile(
            self.config, apply=True, backend_env=self.backend_env
        )

        after = copy.deepcopy(unrelated_state())
        self.assertEqual(after, before)
        self.assertEqual(
            json.dumps(after, sort_keys=True, separators=(",", ":")).encode(),
            before_bytes,
        )
        unrelated_ids = {
            unrelated_skill_id,
            unrelated_agent_id,
            unrelated_squad_id,
            unrelated_membership_id,
            unrelated_project_id,
            unrelated_resource_id,
        }
        for call in self.runner.calls:
            if call["command"] not in FakeRunner.MUTATIONS:
                continue
            targeted_ids = {
                item for argument in call["args"] for item in argument.split(",")
            }
            self.assertTrue(unrelated_ids.isdisjoint(targeted_ids), call["args"])


class RecoveryModeTests(unittest.TestCase):
    def setUp(self):
        self.config = build_eventra_config("runtime-id", "daemon-id")
        self.backend_env = {
            "JWT_SECRET": "r" * 64,
            "MAIL_USERNAME": "recovery@example.test",
            "MAIL_PASSWORD": "recovery-password",
        }

    def _agent(self, role):
        return next(agent for agent in self.config.agents if agent.role == role)

    def _matching_agent(self, runner, agent):
        return runner.seed_agent(
            agent.name,
            description=agent.description,
            instructions=agent.instructions_file.read_text(),
            runtime_id=self.config.runtime_id,
            visibility="workspace",
            max_concurrent_tasks=1,
        )

    def _seed_recovery_backend(self, runner, env=None):
        agent_id = self._matching_agent(runner, self._agent("backend_engineer"))
        runner.envs[agent_id] = copy.deepcopy(self.backend_env if env is None else env)
        return agent_id

    def _seed_env_recipients(self, runner, backend_env, qa_env):
        backend_id = self._seed_recovery_backend(runner, backend_env)
        qa_id = self._matching_agent(runner, self._agent("integration_qa"))
        runner.envs[qa_id] = copy.deepcopy(qa_env)
        return backend_id, qa_id

    def test_recovers_exact_existing_backend_environment_in_memory_only(self):
        runner = FakeRunner()
        backend_id = self._seed_recovery_backend(runner)
        stdout, stderr = io.StringIO(), io.StringIO()
        with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
            recovered = recover_backend_env(self.config, runner)

        self.assertEqual(recovered, self.backend_env)
        self.assertEqual(
            [(call["command"], call["positionals"]) for call in runner.calls],
            [(("agent", "list"), []), (("agent", "env", "get"), [backend_id])],
        )
        for value in self.backend_env.values():
            self.assertNotIn(value, stdout.getvalue())
            self.assertNotIn(value, stderr.getvalue())
            self.assertFalse(any(value in argument for call in runner.calls for argument in call["args"]))

    def test_missing_or_duplicate_backend_fails_before_mutation(self):
        for duplicate in (False, True):
            with self.subTest(duplicate=duplicate):
                runner = FakeRunner()
                if duplicate:
                    self._seed_recovery_backend(runner)
                    self._seed_recovery_backend(runner)
                with self.assertRaisesRegex(RuntimeError, "backend environment") as caught:
                    recover_backend_env(self.config, runner)
                self.assertEqual(runner.mutation_count, 0)
                for value in self.backend_env.values():
                    self.assertNotIn(value, str(caught.exception))

    def test_recovery_rejects_invalid_environment_state_before_mutation(self):
        invalid_envs = (
            {"agent_id": "wrong-agent", "custom_env": self.backend_env},
            {"agent_id": "agent-1", "custom_env": {"JWT_SECRET": "r" * 64}},
            {"agent_id": "agent-1", "custom_env": {**self.backend_env, "EXTRA": "x"}},
            {"agent_id": "agent-1", "custom_env": {**self.backend_env, "JWT_SECRET": "short"}},
        )
        for envelope in invalid_envs:
            with self.subTest(envelope=envelope):
                runner = FakeRunner()
                self._seed_recovery_backend(runner)
                runner.response_overrides[("agent", "env", "get")] = envelope
                with self.assertRaisesRegex((RuntimeError, ValueError), "environment") as caught:
                    recover_backend_env(self.config, runner)
                self.assertEqual(runner.mutation_count, 0)
                for value in self.backend_env.values():
                    self.assertNotIn(value, str(caught.exception))

    def test_environment_mode_flags_are_mutually_exclusive(self):
        stderr = io.StringIO()
        with contextlib.redirect_stderr(stderr), self.assertRaises(SystemExit) as caught:
            main(
                [
                    "--runtime-id", "runtime-id",
                    "--daemon-id", "daemon-id",
                    "--prompt-backend-env",
                    "--reuse-backend-env",
                ]
            )
        self.assertEqual(caught.exception.code, 2)
        self.assertIn("not allowed with argument", stderr.getvalue())

    def test_recovery_skips_matching_backend_set_and_copies_qa_stdin(self):
        runner = FakeRunner()
        backend_id = self._seed_recovery_backend(runner)
        recovered = recover_backend_env(self.config, runner)
        Provisioner(runner).reconcile(self.config, apply=True, backend_env=recovered)

        backend_sets = [
            call for call in runner.calls
            if call["command"] == ("agent", "env", "set")
            and call["positionals"] == [backend_id]
        ]
        self.assertEqual(backend_sets, [])
        qa_id = next(
            agent_id for agent_id, agent in runner.agents.items()
            if agent["name"] == self._agent("integration_qa").name
        )
        qa_create_index = next(
            index for index, call in enumerate(runner.calls)
            if call["command"] == ("agent", "create")
            and call["flags"]["--name"] == self._agent("integration_qa").name
        )
        self.assertNotEqual(runner.stdin_object_ids[qa_create_index], id(recovered))
        self.assertEqual(runner.calls[qa_create_index]["stdin_json"], recovered)
        self.assertEqual(runner.envs[qa_id], recovered)
        self.assertTrue(any(
            call["command"] == ("agent", "env", "get")
            and call["positionals"] == [qa_id]
            for call in runner.calls[qa_create_index + 1 :]
        ))
        result = Provisioner(runner).reconcile(self.config, apply=True, backend_env=None)
        for value in self.backend_env.values():
            self.assertNotIn(value, repr(result))

    def test_normal_apply_requires_exact_equal_recipient_environment_maps(self):
        invalid_pairs = (
            ({**self.backend_env, "EXTRA": "x"}, self.backend_env),
            (self.backend_env, {**self.backend_env, "EXTRA": "x"}),
            (self.backend_env, {**self.backend_env, "MAIL_PASSWORD": "different"}),
            ({**self.backend_env, "JWT_SECRET": "short"}, self.backend_env),
            (self.backend_env, {**self.backend_env, "JWT_SECRET": "short"}),
        )
        for backend_env, qa_env in invalid_pairs:
            with self.subTest(backend_keys=set(backend_env), qa_keys=set(qa_env)):
                runner = FakeRunner()
                self._seed_env_recipients(runner, backend_env, qa_env)
                with self.assertRaisesRegex(ValueError, "backend environment") as caught:
                    Provisioner(runner).reconcile(self.config, apply=True, backend_env=None)
                self.assertEqual(runner.mutation_count, 0)
                for value in (*backend_env.values(), *qa_env.values()):
                    self.assertNotIn(value, str(caught.exception))


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
