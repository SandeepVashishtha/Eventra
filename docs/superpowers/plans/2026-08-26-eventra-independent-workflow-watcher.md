# Eventra Independent Workflow Watcher Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provision an independent non-Squad Eventra Workflow Watcher Agent, migrate the existing scheduled Autopilot to it without replacing IDs, and repair Multica 0.4.34 string-metadata filtering.

**Architecture:** Keep `TeamBlueprint.agents` as the exact five-person delivery Squad and add a separate `operational_agents` catalog for infrastructure roles. Eventra exposes both catalogs to Agent reconciliation, while Squad reconciliation reads only delivery Agents and Autopilot reconciliation resolves its assignee from `AutopilotSpec.agent_role`. Encode the fixed workflow-version metadata filter as a JSON string inside one CSV field before passing it to Multica's argv boundary.

**Tech Stack:** Python 3 standard library, frozen dataclasses, `unittest`, Multica CLI 0.4.34, Git.

**Spec:** `docs/superpowers/specs/2026-08-26-eventra-independent-workflow-watcher-design.md`

## Global Constraints

- **Eventra Local Delivery** remains an exact five-Agent Squad.
- **Eventra Workflow Watcher** is workspace-visible, has `max_concurrent_tasks=1`, and is never a Squad member.
- Only Backend Engineer and Integration QA receive `JWT_SECRET`, `MAIL_USERNAME`, and `MAIL_PASSWORD`.
- Skills come only from the approved public GitHub map; never use SkillsHub or `skills.sh`.
- Preserve the existing Watcher Autopilot ID, schedule trigger ID, run-only mode, active status, cron `*/30 * * * *`, and timezone `Asia/Shanghai`.
- Recovery remains fail-closed, scoped to the two Eventra Projects, and applies at most one rerun per invocation.
- Do not modify, restart, cancel, or specially advance PRO-45 or PRO-46.
- Automatic merge authority after development quality gates is unchanged; production deployment remains human-triggered.
- Preserve unrelated Agents, Squad members, skill bindings, Autopilots, triggers, worktrees, branches, stashes, and local processes.

## File Structure

- `tools/multica/blueprint.py`: reusable separation between five delivery Agents and operational Agents.
- `tools/multica/instructions/workflow_watcher.md`: project-neutral persistent authority contract for the operational Agent.
- `tools/multica/eventra_adapter.py`: Eventra Agent composition and explicit Watcher target role.
- `tools/multica/provision.py`: reconcile all Agents, only delivery Squad members, and the role-selected Autopilot assignee.
- `tools/multica/workflow.py`: CSV-safe JSON-string metadata filter for Multica 0.4.34.
- `tools/multica/README.md`: operator-visible independent-Agent topology and live verification procedure.
- `tools/multica/tests/test_blueprint.py`: reusable topology and minimal-skill contract.
- `tools/multica/tests/test_eventra_adapter.py`: six-Agent Eventra catalog and Watcher target contract.
- `tools/multica/tests/test_provision.py`: exact five-member Squad, no Watcher secrets, in-place Autopilot migration, and idempotency.
- `tools/multica/tests/test_workflow.py`: exact CSV-escaped metadata argv and existing recovery behavior.
- `tools/multica/tests/test_operator_docs.py`: runbook assertions for the independent Watcher.

---

### Task 1: Model the independent operational Agent

**Files:**
- Modify: `tools/multica/blueprint.py`
- Create: `tools/multica/instructions/workflow_watcher.md`
- Modify: `tools/multica/eventra_adapter.py`
- Test: `tools/multica/tests/test_blueprint.py`
- Test: `tools/multica/tests/test_eventra_adapter.py`

**Interfaces:**
- Consumes: existing `AgentSpec`, `TeamBlueprint`, `_eventra_agents()`, and public skill map.
- Produces: `TeamBlueprint.operational_agents: tuple[AgentSpec, ...]`, role `workflow_watcher`, and `AutopilotSpec.agent_role: str` for later Provisioner work.

- [ ] **Step 1: Write failing reusable-blueprint tests**

Add assertions that preserve the five delivery roles and introduce exactly one non-delivery role:

```python
def test_has_one_project_neutral_operational_watcher(self):
    self.assertEqual(
        [agent.role for agent in self.blueprint.operational_agents],
        ["workflow_watcher"],
    )
    watcher = self.blueprint.operational_agents[0]
    self.assertEqual(
        watcher.skill_keys,
        (
            "using-superpowers",
            "systematic-debugging",
            "verification-before-completion",
        ),
    )
    self.assertFalse(watcher.needs_backend_env)
    self.assertTrue(watcher.instructions_file.is_file())
```

Extend the technology-neutral serialization test to inspect both
`blueprint.agents` and `blueprint.operational_agents`.

- [ ] **Step 2: Run the focused blueprint test and verify RED**

Run:

```bash
python3 -B -m unittest tools.multica.tests.test_blueprint.BlueprintTests.test_has_one_project_neutral_operational_watcher -v
```

Expected: FAIL because `TeamBlueprint` has no `operational_agents` attribute.

- [ ] **Step 3: Add the operational catalog and persistent instructions**

Add the field without changing the meaning of `agents`:

```python
@dataclass(frozen=True)
class TeamBlueprint:
    squad_name: str
    squad_description: str
    squad_instructions_file: Path = field(repr=False)
    leader_role: str
    agents: tuple[AgentSpec, ...]
    operational_agents: tuple[AgentSpec, ...]
```

Construct the operational role with this exact public-skill boundary:

```python
operational_agents = (
    AgentSpec(
        "workflow_watcher",
        f"{name_prefix} Workflow Watcher",
        "Runs bounded workflow recovery without coordinating delivery or editing business code.",
        instructions / "workflow_watcher.md",
        common + ("systematic-debugging", "verification-before-completion"),
    ),
)
```

Create `workflow_watcher.md` with explicit requirements to run the rendered
Autopilot command exactly once, verify its structured result, fail closed on
errors, and never plan Issues, edit business code, waive gates, review, merge,
deploy, print secrets, or create nested work.

- [ ] **Step 4: Write failing Eventra composition tests**

Add these contract assertions:

```python
def test_exposes_five_delivery_agents_plus_one_operational_watcher(self):
    self.assertEqual(len(self.config.blueprint.agents), 5)
    self.assertEqual(len(self.config.blueprint.operational_agents), 1)
    self.assertEqual(len(self.config.agents), 6)
    self.assertEqual(self.config.agents[-1].role, "workflow_watcher")
    self.assertFalse(self.config.agents[-1].needs_backend_env)

def test_watcher_targets_the_operational_role(self):
    self.assertEqual(self.config.watcher.agent_role, "workflow_watcher")
```

Update the expected `AutopilotSpec` fixture with
`agent_role="workflow_watcher"`.

- [ ] **Step 5: Run the focused adapter tests and verify RED**

Run:

```bash
python3 -B -m unittest \
  tools.multica.tests.test_eventra_adapter.EventraAdapterTests.test_exposes_five_delivery_agents_plus_one_operational_watcher \
  tools.multica.tests.test_eventra_adapter.EventraAdapterTests.test_watcher_targets_the_operational_role -v
```

Expected: FAIL because the Eventra catalog still contains five Agents and
`AutopilotSpec` has no `agent_role`.

- [ ] **Step 6: Compose all Agents and add the explicit target role**

Add `agent_role: str` to `AutopilotSpec`. Make `_eventra_agents()` iterate over
both blueprint catalogs:

```python
catalog = blueprint.agents + blueprint.operational_agents
return tuple(
    replace(
        agent,
        skill_keys=agent.skill_keys + additions.get(agent.role, ()),
        needs_backend_env=agent.role in backend_env_roles,
    )
    for agent in catalog
)
```

Set `agent_role="workflow_watcher"` in the Eventra Watcher specification.

- [ ] **Step 7: Run the complete blueprint and adapter tests**

Run:

```bash
python3 -B -m unittest \
  tools.multica.tests.test_blueprint \
  tools.multica.tests.test_eventra_adapter -v
```

Expected: PASS; delivery roles remain exactly five, the sixth role is
operational, and only Backend Engineer plus Integration QA need backend env.

- [ ] **Step 8: Commit the topology model**

```bash
git add \
  tools/multica/blueprint.py \
  tools/multica/eventra_adapter.py \
  tools/multica/instructions/workflow_watcher.md \
  tools/multica/tests/test_blueprint.py \
  tools/multica/tests/test_eventra_adapter.py
git commit -m "feat: add independent workflow watcher role"
```

---

### Task 2: Reconcile six Agents but exactly five Squad members

**Files:**
- Modify: `tools/multica/provision.py`
- Test: `tools/multica/tests/test_provision.py`

**Interfaces:**
- Consumes: `config.agents` containing all six roles, `config.blueprint.agents` containing only delivery roles, and `config.watcher.agent_role` from Task 1.
- Produces: role-complete `ProvisioningResult.agent_ids`, exact delivery-only Squad membership, and Autopilot assignment to `agent_ids[config.watcher.agent_role]`.

- [ ] **Step 1: Write failing fresh-state topology tests**

Update the complete-state test to require six Agent IDs but only these five
Squad memberships:

```python
self.assertEqual(len(result.agent_ids), 6)
self.assertNotIn(
    result.agent_ids["workflow_watcher"],
    self.runner.squads[result.squad_id]["members"],
)
self.assertEqual(
    watcher["assignee_id"],
    result.agent_ids["workflow_watcher"],
)
```

Also assert the Watcher Agent is absent from `runner.envs` and no
`agent env get/set` command targets its ID.

- [ ] **Step 2: Write a failing in-place migration test**

Create converged state, capture both IDs, drift only the assignee to Delivery
Lead, and reconcile again:

```python
def test_existing_watcher_migrates_in_place_to_operational_agent(self):
    first = self.provisioner.reconcile(
        self.config, apply=True, backend_env=self.backend_env
    )
    watcher = self.runner.autopilots[first.autopilot_id]
    trigger_id = watcher["triggers"][0]["id"]
    watcher["assignee_id"] = first.agent_ids["delivery_lead"]
    before = self.runner.mutation_count

    second = self.provisioner.reconcile(
        self.config, apply=True, backend_env=None
    )

    self.assertEqual(second.autopilot_id, first.autopilot_id)
    self.assertEqual(watcher["triggers"][0]["id"], trigger_id)
    self.assertEqual(
        watcher["assignee_id"], second.agent_ids["workflow_watcher"]
    )
    self.assertEqual(self.runner.mutation_count - before, 1)
```

- [ ] **Step 3: Run focused Provisioner tests and verify RED**

Run:

```bash
python3 -B -m unittest \
  tools.multica.tests.test_provision.ProvisionerTests.test_apply_uses_frozen_cli_and_builds_complete_state \
  tools.multica.tests.test_provision.ProvisionerTests.test_fresh_apply_creates_one_run_only_watcher_and_schedule \
  tools.multica.tests.test_provision.ProvisionerTests.test_existing_watcher_migrates_in_place_to_operational_agent -v
```

Expected: FAIL because Squad reconciliation currently adds every
`config.agents` entry and Autopilot reconciliation still receives Delivery
Lead's ID.

- [ ] **Step 4: Validate the catalog and target boundary before preflight**

In `_validate_config()`, derive exact role sets:

```python
configured_roles = {agent.role for agent in config.agents}
delivery_roles = {agent.role for agent in config.blueprint.agents}
operational_roles = {
    agent.role for agent in config.blueprint.operational_agents
}
if configured_roles != delivery_roles | operational_roles:
    raise ValueError("configured Agent catalog does not match the blueprint")
if (
    config.watcher.agent_role not in operational_roles
    or config.watcher.agent_role in delivery_roles
):
    raise ValueError("watcher must target an operational Agent")
```

Retain the existing unique-role and exact backend-env-recipient checks.

- [ ] **Step 5: Restrict Squad reconciliation and select the Watcher assignee**

Change both membership dictionaries in `_reconcile_squad()` to iterate over
`config.blueprint.agents`. Leave Agent creation, preflight, env validation, and
skill binding loops on `config.agents` so all six Agents are reconciled.

Call Autopilot reconciliation with:

```python
agent_ids[config.watcher.agent_role]
```

Rename `_reconcile_autopilot()`'s parameter from `delivery_lead_id` to
`watcher_agent_id` and use it for every `--agent` argument and desired
`assignee_id`.

- [ ] **Step 6: Add validation tests for unsafe target drift**

Use frozen-dataclass replacement to verify that a missing role and a delivery
role both fail before any runner call:

```python
for role in ("missing_operator", "delivery_lead"):
    with self.subTest(role=role):
        runner = FakeRunner()
        watcher = replace(self.config.watcher, agent_role=role)
        with self.assertRaisesRegex(ValueError, "operational Agent"):
            Provisioner(runner).reconcile(
                replace(self.config, watcher=watcher),
                apply=True,
                backend_env=self.backend_env,
            )
        self.assertEqual(runner.calls, [])
```

- [ ] **Step 7: Run the complete Provisioner test module**

Run:

```bash
python3 -B -m unittest tools.multica.tests.test_provision -v
```

Expected: PASS, including fresh creation, exact five-member Squad, in-place
Autopilot migration, unrelated-state preservation, secret boundaries, and
second-apply idempotency.

- [ ] **Step 8: Commit reconciliation changes**

```bash
git add tools/multica/provision.py tools/multica/tests/test_provision.py
git commit -m "feat: assign watcher autopilot to operational agent"
```

---

### Task 3: Encode Multica 0.4.34 string metadata safely

**Files:**
- Modify: `tools/multica/workflow.py`
- Test: `tools/multica/tests/test_workflow.py`

**Interfaces:**
- Consumes: fixed key `eventra.workflow.version`, fixed string value `1`, and `MulticaRunner.run(list[str])`.
- Produces: `_string_metadata_filter(key: str, value: str) -> str` and the exact argv value `"eventra.workflow.version=""1"""` including the outer CSV quotes.

- [ ] **Step 1: Write failing encoder and watcher-argv tests**

Import `_string_metadata_filter` into `test_workflow.py` and add:

```python
def test_string_metadata_filter_is_json_string_inside_one_csv_field(self):
    self.assertEqual(
        _string_metadata_filter("eventra.workflow.version", "1"),
        '"eventra.workflow.version=""1"""',
    )
```

Change `FakeWatchRunner._assert_list_flags()` to expect that same escaped
value. Keep the existing dry-run, at-most-once, pagination, foreign-Project,
and malformed-page tests unchanged.

- [ ] **Step 2: Run focused workflow tests and verify RED**

Run:

```bash
python3 -B -m unittest \
  tools.multica.tests.test_workflow.WatchWorkflowTests.test_string_metadata_filter_is_json_string_inside_one_csv_field \
  tools.multica.tests.test_workflow.WatchWorkflowTests.test_watch_dry_run_detects_but_does_not_mutate_stalled_pro_35 -v
```

Expected: FAIL because the encoder does not exist and current argv contains an
unescaped quote.

- [ ] **Step 3: Implement a standard-library CSV encoder**

Add `csv` and `io` imports and implement:

```python
def _string_metadata_filter(key: str, value: str) -> str:
    if not isinstance(key, str) or not key or not isinstance(value, str):
        raise ValueError("metadata string filter is invalid")
    buffer = io.StringIO(newline="")
    csv.writer(buffer, lineterminator="").writerow(
        [f"{key}={json.dumps(value)}"]
    )
    return buffer.getvalue()
```

Compute the version filter once in `_list_workflow_parents()` and pass it as
the value after `--metadata`. Do not invoke a shell and do not change stored
metadata types.

- [ ] **Step 4: Run the complete workflow test module**

Run:

```bash
python3 -B -m unittest tools.multica.tests.test_workflow -v
```

Expected: PASS; watcher discovery, pagination, deterministic ordering,
at-most-one recovery, and fail-closed verification remain unchanged.

- [ ] **Step 5: Commit the CLI compatibility fix**

```bash
git add tools/multica/workflow.py tools/multica/tests/test_workflow.py
git commit -m "fix: encode watcher metadata filter for multica"
```

---

### Task 4: Document and test the independent operating topology

**Files:**
- Modify: `tools/multica/README.md`
- Test: `tools/multica/tests/test_operator_docs.py`

**Interfaces:**
- Consumes: Agent name, non-Squad boundary, preserved schedule, and live verification invariants from Tasks 1–3.
- Produces: an operator runbook that distinguishes the five-Agent Squad from the sixth operational Agent.

- [ ] **Step 1: Write a failing operator-document test**

Add:

```python
def test_runbook_documents_independent_watcher_agent(self):
    readme = Path("tools/multica/README.md").read_text()
    normalized = " ".join(readme.split())
    for fragment in (
        "Eventra Workflow Watcher",
        "not a member of `Eventra Local Delivery`",
        "does not receive backend environment values",
        "preserves the existing Autopilot and trigger IDs",
        "Multica 0.4.34",
    ):
        with self.subTest(fragment=fragment):
            self.assertIn(fragment, normalized)
```

- [ ] **Step 2: Run the focused documentation test and verify RED**

Run:

```bash
python3 -B -m unittest tools.multica.tests.test_operator_docs.OperatorDocsTests.test_runbook_documents_independent_watcher_agent -v
```

Expected: FAIL because the runbook still describes only the scheduled
Autopilot and does not document the new operational Agent.

- [ ] **Step 3: Update the runbook without rewriting historical specs**

Change the introduction to describe a reusable five-role delivery blueprint
plus one operational Watcher Agent. In “Native Stage automation and Watcher,”
document the exact Agent name, non-Squad membership, concurrency 1, no backend
environment, Multica 0.4.34 string-filter compatibility, in-place Autopilot
migration, preserved IDs, and unchanged production boundary.

Add read-only post-apply checks using the existing CLI forms:

```bash
multica agent get WATCHER_AGENT_ID --output json
multica squad member list SQUAD_ID --output json
multica autopilot get AUTOPILOT_ID --output json
```

State that the Agent must appear in the first result, must not appear in the
second, and must be the `assignee_id` in the third while the schedule trigger
ID remains unchanged.

- [ ] **Step 4: Run operator docs and contract-audit tests**

Run:

```bash
python3 -B -m unittest \
  tools.multica.tests.test_operator_docs \
  tools.multica.tests.test_contract_audit -v
```

Expected: PASS; audit continues to inspect all configured Agents while reading
custom environments only for Backend Engineer and Integration QA.

- [ ] **Step 5: Commit operator documentation**

```bash
git add tools/multica/README.md tools/multica/tests/test_operator_docs.py
git commit -m "docs: explain independent workflow watcher"
```

---

### Task 5: Verify locally and reconcile the live Multica instance

**Files:**
- Verify only: all files changed in Tasks 1–4
- Live state: exact Eventra runtime, five delivery Agents, new operational Agent, existing Squad, existing Autopilot, and existing schedule trigger

**Interfaces:**
- Consumes: completed code, tests, approved runtime ID `de500649-cada-4419-9d5d-279045e2eaae`, and daemon ID `019fab98-bbad-7d17-b0b7-26e56dbe1b6f`.
- Produces: tested commits, a converged live Agent/Autopilot topology, and read-only evidence without Issue mutation.

- [ ] **Step 1: Run the full Multica unit suite and static checks**

Run:

```bash
python3 -B -m unittest discover -s tools/multica/tests -v
python3 -B -m compileall -q tools/multica
git diff --check
```

Expected: all tests PASS, compile exits 0, and `git diff --check` prints no
output.

- [ ] **Step 2: Run scalar-safe contract audit and dry-run preflight**

Run on the host:

```bash
python3 -B -m tools.multica.contract_audit \
  --runtime-id de500649-cada-4419-9d5d-279045e2eaae \
  --daemon-id 019fab98-bbad-7d17-b0b7-26e56dbe1b6f
python3 -B -m tools.multica.provision \
  --runtime-id de500649-cada-4419-9d5d-279045e2eaae \
  --daemon-id 019fab98-bbad-7d17-b0b7-26e56dbe1b6f
```

Expected: both commands exit 0; audit prints shapes only; dry run reports the
new Watcher Agent as absent or drifted and performs zero mutations.

- [ ] **Step 3: Apply once and prove idempotency**

Run on the host without prompting for secret input:

```bash
python3 -B -m tools.multica.provision \
  --runtime-id de500649-cada-4419-9d5d-279045e2eaae \
  --daemon-id 019fab98-bbad-7d17-b0b7-26e56dbe1b6f \
  --apply
python3 -B -m tools.multica.provision \
  --runtime-id de500649-cada-4419-9d5d-279045e2eaae \
  --daemon-id 019fab98-bbad-7d17-b0b7-26e56dbe1b6f \
  --apply
```

Expected: first apply creates/reconciles **Eventra Workflow Watcher** and
updates the existing Autopilot assignee; second apply reports
`mutation_count=0`. Neither command prints or prompts for backend secrets.

- [ ] **Step 4: Verify IDs, membership, assignee, schedule, and bounded query**

Use the IDs returned by the Provisioner in read-only host commands:

```bash
multica agent get WATCHER_AGENT_ID --output json
multica squad member list f8e8ba1e-6e2c-41e2-81a3-16bb94da68cd --output json
multica autopilot get 4103d5e7-1b3b-4856-94a1-9ffe1b096812 --output json
python3 -B -m tools.multica.workflow watch \
  --project-id 6e387e12-6c4a-425d-8944-a211a6a88fba \
  --backend-project-id 45f1cb03-4499-44d3-83f4-7b8ddba37ba9
```

Expected: Watcher Agent has concurrency 1; the Squad still has exactly five
delivery members and excludes the Watcher; Autopilot ID remains
`4103d5e7-1b3b-4856-94a1-9ffe1b096812`; trigger ID remains
`7a6dea91-03a1-4e70-8709-9d5a97ec7f77`; Autopilot `assignee_id` equals the new
Agent ID; the dry-run Watcher exits 0 and lists workflow parents without the
old CSV parse failure. The final command omits `--apply`, so it cannot rerun or
advance PRO-45/PRO-46.

- [ ] **Step 5: Record final repository evidence**

Run:

```bash
git status --short --branch
git log --oneline --decorate -6
```

Expected: no uncommitted implementation changes; the design, topology,
Provisioner, CLI compatibility, and runbook commits are visible. Report test
counts, mutation counts, preserved IDs, new Agent ID, five-member Squad proof,
and dry-run Watcher result to the user without including environment values or
raw private payloads.
