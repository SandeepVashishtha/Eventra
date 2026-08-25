# Eventra Unattended Multica Delivery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Eventra delivery advance automatically from implementation through exact-SHA review, QA, bounded repair, merge, and local smoke using Multica's native stage barrier plus an idempotent recovery Watcher.

**Architecture:** A deterministic Python workflow helper completes child phases by writing a strict metadata envelope and then setting the child `done`, which opens Multica's native stage barrier. Delivery Lead remains the coordinator that creates later stages and evaluates evidence; a scheduled run-only Autopilot uses a narrow recovery policy to rerun only stalled existing work. The Eventra provisioner reconciles the Watcher and updated instructions with authoritative read-after-write verification.

**Tech Stack:** Python 3 standard library, Multica CLI 0.4.33 JSON contracts, `unittest`, Git/GitHub CLI, Markdown Agent/Squad/Project instructions.

**Spec:** `docs/superpowers/specs/2026-08-25-eventra-unattended-delivery-design.md`

## Global Constraints

- Multica CLI contract floor is exactly the observed 0.4.33 shapes covered by fixtures and strict parsers.
- Child Issue `done` means phase execution finished; PASS/FAIL/BLOCKED exists only in `eventra.phase.result` metadata.
- Native ordered Stage completion is the primary parent wakeup path; Watcher recovery is exceptional and idempotent.
- Review and QA verdicts apply only to exact 40-character commit SHAs.
- At most two complete repair attempts are allowed.
- Automatic merge is allowed only after every exact-SHA gate passes; production deployment is always manual.
- Frontend authority is `/Users/didi/Eventra-workspace/Eventra`; backend authority is `/Users/didi/Eventra-workspace/Eventra-Backend`; nested `Eventra/Backend` is forbidden.
- Existing Agents, Skills, Projects, resources, environment values, unrelated Autopilots, user stash, and unknown processes must be preserved.
- No secret may appear in argv, Issue metadata, comments, logs, reports, fixtures, exceptions, or committed files.

---

## File responsibility map

- `tools/multica/issue_contracts.py`: strict parsers for Issue, children, runs, and metadata reads.
- `tools/multica/workflow.py`: phase metadata validation, terminal transition, stalled-work decisions, recovery, and Agent/Watcher CLI entrypoints.
- `tools/multica/contracts.py`: strict Autopilot list/get and schedule-trigger parsers.
- `tools/multica/eventra_adapter.py`: immutable Eventra Watcher specification.
- `tools/multica/provision.py`: exact-name Watcher and schedule reconciliation.
- `tools/multica/contract_audit.py`: scalar-free Autopilot diagnostics.
- `tools/multica/instructions/*.md`: executable Stage, verdict, retry, merge, and recovery contracts.
- `tools/multica/tests/`: fixture, parser, workflow, provision, and operator-contract coverage.
- `tools/multica/README.md` and `docs/multica/pilot-issues.md`: operator and pilot procedure.

---

### Task 1: Deterministic child phase completion

**Files:**
- Create: `tools/multica/issue_contracts.py`
- Create: `tools/multica/workflow.py`
- Create: `tools/multica/tests/test_issue_contracts.py`
- Create: `tools/multica/tests/test_workflow.py`

**Interfaces:**
- Consumes: `MulticaRunner.run(args: list[str], *, stdin_json=None)` from `tools.multica.provision`.
- Produces: `PhaseCompletion`, `build_phase_metadata()`, `finish_phase()`, `build_workflow_parser()`, and strict Issue parser functions used by Task 2.

- [ ] **Step 1: Write strict Issue contract tests**

Add table-driven tests that accept sanitized PRO-35/PRO-36 shapes and reject wrong IDs, duplicate child IDs, foreign parents, invalid stage/status values, non-string metadata, duplicate task IDs, and runs attached to another Issue.

```python
class IssueContractTests(unittest.TestCase):
    def test_children_require_one_parent_and_unique_ids(self):
        parsed = parse_issue_children(valid_children(), "parent-1")
        self.assertEqual(parsed[0]["parent_issue_id"], "parent-1")

        duplicate = valid_children()
        duplicate["stages"][0]["issues"].append(
            copy.deepcopy(duplicate["stages"][0]["issues"][0])
        )
        with self.assertRaisesRegex(RuntimeError, "malformed issue children"):
            parse_issue_children(duplicate, "parent-1")
```

- [ ] **Step 2: Run the contract tests and require RED**

Run:

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -B -m unittest tools.multica.tests.test_issue_contracts -v
```

Expected: import failure because `tools.multica.issue_contracts` does not exist.

- [ ] **Step 3: Implement strict Issue parsers**

```python
ACTIVE_RUN_STATUSES = frozenset(
    {"queued", "dispatched", "running", "waiting_local_directory"}
)
TERMINAL_PHASE_STATUSES = frozenset({"done"})

def parse_issue_metadata(value: object) -> dict[str, str]:
    if not isinstance(value, dict) or not all(
        isinstance(key, str) and key and isinstance(item, str)
        for key, item in value.items()
    ):
        raise RuntimeError("malformed issue metadata")
    return dict(value)
```

In the same module implement public functions `parse_issue_detail(value,
expected)`, `parse_issue_children(value, parent_id)`, and
`parse_issue_runs(value, issue_id)`. Each begins with an exact `dict`/`list`
type guard, extracts only the fields named by the tests, validates all IDs and
relationships before returning, and raises the fixed contract-specific error
on the first invalid record.

Normalize Issue detail to `id`, `identifier`, `parent_issue_id`, `stage`,
`status`, `assignee_id`, `assignee_type`, `project_id`, and `updated_at`.
Normalize every run to `id`, `issue_id`, `status`, `created_at`, and a derived
`activity_at` selected from `completed_at`, `started_at`, `dispatched_at`, then
`created_at`. Require nonempty string IDs, exact identifier match, parent
relation, integer stage `>=1`, supported statuses, ISO-8601 task timestamps,
and exact child/run ownership. Error messages are generic and never
interpolate response values.

- [ ] **Step 4: Run Issue contract tests and require GREEN**

Run the command from Step 2. Expected: all tests pass.

- [ ] **Step 5: Write phase completion RED tests**

Cover exact metadata, SHA validation by affected repository, explicit string typing, read-after-write, terminal status last, idempotent second execution, partial metadata failure leaving the Issue nonterminal, and rejection of a non-child or unstaged Issue.

```python
def test_finish_phase_writes_verified_metadata_before_done(self):
    completion = PhaseCompletion(
        kind="implementation",
        result="pass",
        attempt=0,
        evidence_comment="comment-1",
        frontend_sha="a" * 40,
        backend_sha=None,
        pr_url="https://github.com/codeExploreHub/Eventra/pull/6",
    )
    finish_phase(runner, "PRO-36", completion)
    mutations = [call.command for call in runner.calls if call.mutation]
    self.assertEqual(mutations[-1], ("issue", "status"))
    self.assertEqual(runner.issue_status, "done")
    self.assertEqual(runner.metadata["eventra.phase.result"], "pass")
```

- [ ] **Step 6: Run workflow tests and require RED**

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -B -m unittest tools.multica.tests.test_workflow -v
```

Expected: missing `PhaseCompletion` and `finish_phase`.

- [ ] **Step 7: Implement phase completion and CLI**

```python
@dataclass(frozen=True)
class PhaseCompletion:
    kind: Literal["implementation", "review", "qa", "repair", "smoke"]
    result: Literal["pass", "fail", "blocked"]
    attempt: int
    evidence_comment: str
    frontend_sha: str | None
    backend_sha: str | None
    pr_url: str | None

def build_phase_metadata(value: PhaseCompletion) -> dict[str, str]:
    result = {
        "eventra.workflow.version": "1",
        "eventra.phase.kind": value.kind,
        "eventra.phase.result": value.result,
        "eventra.phase.attempt": str(value.attempt),
        "eventra.phase.evidence_comment": value.evidence_comment,
    }
    if value.frontend_sha is not None:
        result["eventra.phase.sha.frontend"] = _validated_sha(
            value.frontend_sha
        )
    if value.backend_sha is not None:
        result["eventra.phase.sha.backend"] = _validated_sha(value.backend_sha)
    if value.pr_url is not None:
        result["eventra.phase.pr"] = _validated_pr_url(value.pr_url)
    return result

def finish_phase(runner, issue_key: str, value: PhaseCompletion) -> str:
    detail = parse_issue_detail(
        runner.run(["issue", "get", issue_key, "--output", "json"]), issue_key
    )
    if detail["parent_issue_id"] is None or detail["stage"] is None:
        raise RuntimeError("phase completion requires a staged child issue")
    wanted = build_phase_metadata(value)
    before = parse_issue_metadata(
        runner.run(["issue", "metadata", "list", issue_key, "--output", "json"])
    )
    if detail["status"] == "done":
        if all(before.get(key) == item for key, item in wanted.items()):
            return str(detail["id"])
        raise RuntimeError("terminal phase metadata conflicts with request")
    if detail["status"] in {"blocked", "cancelled"}:
        raise RuntimeError("phase issue is not mutable")
    for key, item in wanted.items():
        runner.run([
            "issue", "metadata", "set", issue_key,
            "--key", key, "--value", item, "--type", "string",
            "--output", "json",
        ])
    observed = parse_issue_metadata(
        runner.run(["issue", "metadata", "list", issue_key, "--output", "json"])
    )
    if any(observed.get(key) != item for key, item in wanted.items()):
        raise RuntimeError("phase metadata reconciliation failed")
    runner.run(["issue", "status", issue_key, "done", "--output", "json"])
    final = parse_issue_detail(
        runner.run(["issue", "get", issue_key, "--output", "json"]), issue_key
    )
    if final["status"] != "done":
        raise RuntimeError("phase completion failed")
    return str(final["id"])
```

Expose:

```text
python3 -B -m tools.multica.workflow finish-phase ISSUE \
  --kind implementation --result pass --attempt 0 \
  --frontend-sha aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa \
  --evidence-comment 00000000-0000-4000-8000-000000000001 \
  --pr https://github.com/codeExploreHub/Eventra/pull/6
```

Use argv lists, accept no environment values, and print only identifier, terminal status, phase kind/result, and mutation count.

Validate `attempt >= 0`, require the evidence comment to be a UUID, require
each supplied SHA to match lowercase `[0-9a-f]{40}`, require at least one SHA
for implementation/review/QA/repair, and accept only canonical HTTPS PR URLs
under `github.com/codeExploreHub/Eventra` or
`github.com/codeExploreHub/Eventra-Backend`. Validation occurs before the
first mutation.

- [ ] **Step 8: Run Task 1 and full suites**

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -B -m unittest \
  tools.multica.tests.test_issue_contracts tools.multica.tests.test_workflow -v
PYTHONDONTWRITEBYTECODE=1 python3 -B -m unittest discover -s tools/multica/tests
git diff --check
```

Expected: all tests pass and no bytecode debris.

- [ ] **Step 9: Commit Task 1**

```bash
git add tools/multica/issue_contracts.py tools/multica/workflow.py \
  tools/multica/tests/test_issue_contracts.py tools/multica/tests/test_workflow.py
git commit -m "feat: add deterministic Multica phase completion"
```

---

### Task 2: Deterministic parent decisions and stalled-work recovery

**Files:**
- Modify: `tools/multica/workflow.py`
- Modify: `tools/multica/tests/test_workflow.py`
- Create fixtures under: `tools/multica/tests/fixtures/multica_0_4_33/`

**Interfaces:**
- Consumes: Task 1 parsers and `ACTIVE_RUN_STATUSES`.
- Produces: `ParentDecision`, `decide_parent_action()`, `RecoveryDecision`,
  `decide_recovery()`, `recover_once()`, and the `plan-parent`/`watch` CLIs used
  by Task 3/4.

- [ ] **Step 1: Write parent state-machine and PRO-35 recovery RED tests**

Use stateful fake snapshots to prove all required coordinator decisions:

- all Stage 1 PASS results produce one exact-SHA gate-stage action;
- a gate FAIL produces one repair action and never merge;
- replacement SHA invalidates all earlier gate PASS results;
- the second complete failed repair cycle produces `block_parent` and no third;
- exact-SHA review + QA PASS produces merge only when PR heads, checks, and
  mergeability agree;
- partial cross-stack merge produces `block_parent` and no revert/deploy;
- merged PRs produce one smoke-stage action, smoke PASS produces parent done;
- an already-recorded `eventra.workflow.last_action` produces NOOP; and
- duplicate leader execution produces no duplicate child, run, PR, or merge.

Define the expected public decision shape:

```python
@dataclass(frozen=True)
class ParentDecision:
    kind: Literal[
        "noop", "create_gate_stage", "create_repair_stage",
        "merge", "create_smoke_stage", "complete_parent", "block_parent",
    ]
    action_key: str | None
    reason: str
```

Then encode parent `in_progress`, Stage 1 `done=0/1`, child `in_review`, child
latest run `completed`, and no successor parent run. Also cover a healthy
active child, a finished stage with active parent successor, human approval
wait, malformed state, and deterministic oldest-first selection.

Encode parent `in_progress`, Stage 1 `done=0/1`, child `in_review`, child latest run `completed`, and no successor parent run. Also cover a healthy active child, a finished stage with active parent successor, human approval wait, malformed state, and deterministic oldest-first selection.

```python
def test_completed_child_run_left_in_review_recovers_child_once(self):
    decision = decide_recovery(stalled_pro_35_snapshot())
    self.assertEqual(
        decision,
        RecoveryDecision(
            kind="rerun_child",
            issue_key="PRO-36",
            reason="terminal run without terminal phase transition",
        ),
    )

def test_finished_stage_without_successor_recovers_parent_once(self):
    decision = decide_recovery(finished_stage_without_parent_run())
    self.assertEqual(decision.kind, "rerun_parent")
    self.assertEqual(decision.issue_key, "PRO-35")
```

- [ ] **Step 2: Run focused tests and require RED**

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -B -m unittest \
  tools.multica.tests.test_workflow.WorkflowRecoveryTests -v
```

Expected: missing recovery interfaces.

- [ ] **Step 3: Implement pure parent and recovery decisions**

Implement `decide_parent_action(snapshot)` as a closed state table over parsed
parent metadata, ordered children, current PR heads/checks/mergeability, and
exact-SHA verdicts. It returns only the `ParentDecision` above and never
mutates. Its stable `action_key` is
`VERSION:PARENT:KIND:ATTEMPT:SCOPE:FRONTEND_SHA:BACKEND_SHA`; the function
returns NOOP when that key already exists. Missing or conflicting evidence
returns `block_parent`, never PASS or merge.

```python
@dataclass(frozen=True)
class ChildRunSnapshot:
    identifier: str
    stage: int
    issue_status: str
    latest_run_status: str | None
    latest_run_updated_at: str | None
    has_active_run: bool
    has_phase_completion: bool

@dataclass(frozen=True)
class WorkflowSnapshot:
    parent_identifier: str
    has_human_approval_wait: bool
    has_malformed_state: bool
    latest_stage_finished: bool
    has_later_parent_run: bool
    active_parent_has_no_executable_successor: bool
    children: Sequence[ChildRunSnapshot]

    def first_terminal_run_without_phase_completion(
        self,
    ) -> ChildRunSnapshot | None:
        candidates = sorted(
            (
                child for child in self.children
                if child.latest_run_status in {"completed", "failed"}
                and not child.has_phase_completion
            ),
            key=lambda child: (
                child.latest_run_updated_at or "",
                child.identifier,
            ),
        )
        return candidates[0] if candidates else None

@dataclass(frozen=True)
class RecoveryDecision:
    kind: Literal["noop", "rerun_child", "rerun_parent"]
    issue_key: str | None
    reason: str

def decide_recovery(snapshot: WorkflowSnapshot) -> RecoveryDecision:
    if snapshot.has_human_approval_wait or snapshot.has_malformed_state:
        return RecoveryDecision("noop", None, "state is not auto-recoverable")
    stalled_child = snapshot.first_terminal_run_without_phase_completion()
    if stalled_child is not None and not stalled_child.has_active_run:
        return RecoveryDecision(
            "rerun_child", stalled_child.identifier,
            "terminal run without terminal phase transition",
        )
    if snapshot.latest_stage_finished and not snapshot.has_later_parent_run:
        return RecoveryDecision(
            "rerun_parent", snapshot.parent_identifier,
            "finished stage without successor parent run",
        )
    if snapshot.active_parent_has_no_executable_successor:
        return RecoveryDecision(
            "rerun_parent", snapshot.parent_identifier,
            "active parent without executable successor",
        )
    return RecoveryDecision("noop", None, "workflow has an active successor")
```

- [ ] **Step 4: Write mutation/idempotency RED tests**

Require one `issue rerun`, authoritative run verification, second-call NOOP while the new run is active, mutation acknowledgement ignored, and failure when no new active task ID appears.

- [ ] **Step 5: Implement `plan-parent`, `recover_once`, and `watch` CLIs**

`plan-parent PARENT` performs authoritative reads and emits only the
`ParentDecision` fields; it is read-only and never prints comments, metadata
values, PR bodies, or environment data. Delivery Lead uses the decision to
perform the named Multica/GitHub action, rereads authoritative state, and then
records `eventra.workflow.last_action` with explicit string typing.

Reread immediately before mutation, execute only `multica issue rerun ISSUE --output json`, then list runs and require a new task in `queued|dispatched|running|waiting_local_directory`.

Expose:

```text
python3 -B -m tools.multica.workflow watch \
  --project-id 6e387e12-6c4a-425d-8944-a211a6a88fba \
  --backend-project-id 45f1cb03-4499-44d3-83f4-7b8ddba37ba9 \
  --apply
```

Dry mode prints counts/decision kinds only. Apply performs at most one recovery action per invocation. List only active Issues carrying `eventra.workflow.version=1`; never scan unrelated Projects.

- [ ] **Step 6: Run Task 2 and full suites**

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -B -m unittest tools.multica.tests.test_workflow -v
PYTHONDONTWRITEBYTECODE=1 python3 -B -m unittest discover -s tools/multica/tests
git diff --check
```

- [ ] **Step 7: Commit Task 2**

```bash
git add tools/multica/workflow.py tools/multica/tests/test_workflow.py \
  tools/multica/tests/fixtures/multica_0_4_33
git commit -m "feat: recover stalled Multica stages idempotently"
```

---

### Task 3: Provision and audit the Eventra Watcher

**Files:**
- Modify: `tools/multica/contracts.py`
- Modify: `tools/multica/eventra_adapter.py`
- Modify: `tools/multica/provision.py`
- Modify: `tools/multica/contract_audit.py`
- Create: `tools/multica/instructions/stalled_work_watcher.md`
- Create: `tools/multica/tests/fixtures/multica_0_4_33/autopilot-list.json`
- Create: `tools/multica/tests/fixtures/multica_0_4_33/autopilot-get.json`
- Modify: `tools/multica/tests/test_contracts.py`
- Modify: `tools/multica/tests/test_contract_audit.py`
- Modify: `tools/multica/tests/test_eventra_adapter.py`
- Modify: `tools/multica/tests/test_provision.py`

**Interfaces:**
- Consumes: Delivery Lead and frontend Project IDs reconciled by `Provisioner`.
- Produces: `AutopilotSpec`, `parse_autopilot_list()`, `parse_autopilot_detail()`, `ProvisioningResult.autopilot_id`, and one active scheduled Watcher.

- [ ] **Step 1: Freeze sanitized 0.4.33 fixtures and write parser RED tests**

The list fixture uses the observed top-level keys `autopilots` and `total` with
one complete target record. The get fixture uses the exact top-level keys
`autopilot`, `collaborators`, and `triggers` with one complete enabled schedule
record whose cron is `TZ=Asia/Shanghai */30 * * * *`. Reject duplicate
IDs/titles, wrong target ID, webhook or multiple triggers, non-agent assignee,
malformed cron/timezone/enabled, and secret-bearing target responses.

- [ ] **Step 2: Run parser tests and require RED**

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -B -m unittest \
  tools.multica.tests.test_contracts.MulticaAutopilotContractTests -v
```

- [ ] **Step 3: Implement strict Autopilot parsers**

```python
def parse_autopilot_list(value: object) -> list[dict[str, object]]:
    if not isinstance(value, dict) or set(value) != {"autopilots", "total"}:
        raise RuntimeError("malformed autopilot list")
    records = value["autopilots"]
    if not isinstance(records, list) or value["total"] != len(records):
        raise RuntimeError("malformed autopilot list")
    return [_normalize_autopilot(item, "autopilot list") for item in records]

def parse_autopilot_detail(
    value: object, expected_id: str
) -> tuple[dict[str, object], list[dict[str, object]]]:
    if not isinstance(value, dict) or set(value) != {
        "autopilot", "collaborators", "triggers"
    }:
        raise RuntimeError("malformed autopilot detail")
    autopilot = _normalize_autopilot(value["autopilot"], "autopilot detail")
    if autopilot["id"] != expected_id or value["collaborators"] != []:
        raise RuntimeError("malformed autopilot detail")
    triggers = _normalize_schedule_triggers(value["triggers"], expected_id)
    return autopilot, triggers
```

Ignore mutation response bodies; verify via fresh list/get. Never use `--show-secrets`.

- [ ] **Step 4: Add immutable Watcher config and RED tests**

```python
@dataclass(frozen=True)
class AutopilotSpec:
    title: str
    description_file: Path
    cron: str
    timezone: str

watcher=AutopilotSpec(
    title="Eventra · Stalled Work Watcher",
    description_file=Path(__file__).with_name("instructions")
        / "stalled_work_watcher.md",
    cron="*/30 * * * *",
    timezone="Asia/Shanghai",
)
```

- [ ] **Step 5: Extend FakeRunner and add reconciliation RED tests**

Add exact grammars for `autopilot list/get/create/update` and `trigger-add/update`. Test fresh create, trigger-only recovery, drift update, unrelated preservation, malformed target fail-closed, dry run, and second apply zero mutations.

```python
def test_fresh_apply_creates_one_watcher_and_schedule(self):
    result = self.provisioner.reconcile(
        self.config, apply=True, backend_env=self.backend_env
    )
    watcher = self.runner.autopilots[result.autopilot_id]
    self.assertEqual(watcher["execution_mode"], "run_only")
    self.assertEqual(watcher["project_id"], result.project_id)
    self.assertEqual(watcher["triggers"][0]["timezone"], "Asia/Shanghai")
```

- [ ] **Step 6: Implement authoritative Watcher reconciliation**

```python
def _reconcile_autopilot(
    self,
    config: ProjectConfig,
    detail: dict[str, object] | None,
    delivery_lead_id: str,
    frontend_project_id: str,
) -> str:
    wanted = self._desired_autopilot(
        config, delivery_lead_id, frontend_project_id
    )
    if detail is None:
        self.runner.run(self._autopilot_create_args(wanted))
        detail = self._autopilot_by_title(wanted["title"])
    elif not self._matches(detail, wanted):
        self.runner.run(self._autopilot_update_args(detail["id"], wanted))
        detail = self._autopilot_by_title(
            wanted["title"], expected_id=detail["id"]
        )
    self._reconcile_autopilot_schedule(config, detail["id"])
    final = self._autopilot_get(detail["id"])
    self._assert_autopilot_state(final, wanted, config.watcher)
    return str(detail["id"])
```

Create/update only the exact-name target, then reread and verify. Reconcile exactly one enabled schedule. Reject foreign target triggers rather than deleting them.

- [ ] **Step 7: Extend scalar-free audit**

Audit Autopilot list, exact target get, and schedule structure using only types, keys, lengths, and target-ID equality. Do not read unrelated webhook credentials.

- [ ] **Step 8: Run Task 3 and full suites**

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -B -m unittest \
  tools.multica.tests.test_contracts tools.multica.tests.test_eventra_adapter \
  tools.multica.tests.test_provision tools.multica.tests.test_contract_audit -v
PYTHONDONTWRITEBYTECODE=1 python3 -B -m unittest discover -s tools/multica/tests
git diff --check
```

- [ ] **Step 9: Commit Task 3**

```bash
git add tools/multica/contracts.py tools/multica/eventra_adapter.py \
  tools/multica/provision.py tools/multica/contract_audit.py \
  tools/multica/instructions/stalled_work_watcher.md tools/multica/tests
git commit -m "feat: provision Eventra stalled-work watcher"
```

---

### Task 4: Make every Agent follow the Stage protocol

**Files:**
- Modify: `tools/multica/instructions/delivery_lead.md`
- Modify: `tools/multica/instructions/frontend_engineer.md`
- Modify: `tools/multica/instructions/backend_engineer.md`
- Modify: `tools/multica/instructions/independent_reviewer.md`
- Modify: `tools/multica/instructions/integration_qa.md`
- Modify: `tools/multica/instructions/squad.md`
- Modify: `tools/multica/instructions/eventra_project.md`
- Modify: `tools/multica/instructions/eventra_backend_project.md`
- Modify: `tools/multica/README.md`
- Modify: `docs/multica/pilot-issues.md`
- Modify: `tools/multica/tests/test_blueprint.py`
- Modify: `tools/multica/tests/test_operator_docs.py`

**Interfaces:**
- Consumes: Task 1 `finish-phase` and Task 2/3 Watcher.
- Produces: exact instructions causing native Stage wakeups and automatic gate/repair/merge/smoke progression.

- [ ] **Step 1: Write operator-contract RED tests**

```python
def test_every_execution_role_finishes_through_phase_helper(self):
    for path in (
        "frontend_engineer.md", "backend_engineer.md",
        "independent_reviewer.md", "integration_qa.md",
    ):
        text = (INSTRUCTIONS / path).read_text()
        self.assertIn("tools.multica.workflow finish-phase", text)
        self.assertIn("done means phase execution finished", text)

def test_delivery_lead_uses_monotonic_native_stages(self):
    text = (INSTRUCTIONS / "delivery_lead.md").read_text()
    self.assertIn("--stage", text)
    self.assertIn("tools.multica.workflow plan-parent", text)
    self.assertIn("eventra.workflow.next_stage", text)
    self.assertIn("two complete repair attempts", text)
```

- [ ] **Step 2: Run operator tests and require RED**

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -B -m unittest \
  tools.multica.tests.test_blueprint tools.multica.tests.test_operator_docs -v
```

- [ ] **Step 3: Update implementer instructions**

Require rereading child/parent/current PR/head, resuming rather than duplicating, posting complete evidence, calling `finish-phase` with implementation/repair and exact result, verifying `done`, and never leaving `in_review`. A Google Fonts `ECONNRESET` build is `blocked`, not PASS.

- [ ] **Step 4: Update Reviewer and QA instructions**

Require exact candidate SHA verification, actionable evidence, and terminal `finish-phase pass|fail|blocked`. They never self-approve or leave a gate Issue `in_review`.

- [ ] **Step 5: Update Delivery Lead and Squad instructions**

Require Delivery Lead to call read-only `plan-parent` before each transition,
then encode initialization, native stage groups, structured evidence validation,
monotonic `next_stage`, fresh re-gating, two repair attempts, automatic merge,
partial-merge stop, smoke stage, and parent completion. Include an argv-array
example such as `["multica", "issue", "create", "--parent", "PRO-35",
"--stage", "2", "--title", "PRO-35 exact-SHA review", "--output", "json"]`.

- [ ] **Step 6: Update Project contexts and runbooks**

Document repository routing, PR close intent, phase-result metadata, Watcher fallback, and one-time PRO-35 recovery. Preserve manual production deployment.

- [ ] **Step 7: Run Task 4 and full suites**

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -B -m unittest \
  tools.multica.tests.test_blueprint tools.multica.tests.test_operator_docs -v
PYTHONDONTWRITEBYTECODE=1 python3 -B -m unittest discover -s tools/multica/tests
python3 -B -m compileall -q tools/multica
git diff --check
```

Remove generated `__pycache__` before committing.

- [ ] **Step 8: Commit Task 4**

```bash
git add tools/multica/instructions tools/multica/README.md \
  docs/multica/pilot-issues.md tools/multica/tests/test_blueprint.py \
  tools/multica/tests/test_operator_docs.py
git commit -m "feat: automate Eventra delivery stages"
```

---

### Task 5: Review, merge, provision, and recover PRO-35

**Files:**
- Modify only for review fixes discovered before merge.
- Operational state: personal fork PR, authoritative frontend master, Multica Eventra objects, PRO-35/PRO-36.

**Interfaces:**
- Consumes: Tasks 1-4 and user authorization for automatic merge after quality gates.
- Produces: merged tooling, idempotent live Multica state, and automatically advancing PRO-35 without production deployment.

- [ ] **Step 1: Run fresh local verification**

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -B -m unittest discover -s tools/multica/tests
git diff --check
git status --short
git rev-parse HEAD
```

- [ ] **Step 2: Request independent code review**

Review `origin/master..HEAD` for contract strictness, secret handling, native Stage semantics, recovery idempotency, merge authority, and unrelated state preservation. Fix findings with focused tests until clean.

- [ ] **Step 3: Push and merge the personal-fork PR**

```bash
git push -u origin codex/eventra-unattended-delivery
gh pr create --repo codeExploreHub/Eventra \
  --base master --head codex/eventra-unattended-delivery \
  --title "feat: automate Eventra Multica delivery stages" \
  --body-file /private/tmp/eventra-unattended-delivery-pr.md
gh pr view --repo codeExploreHub/Eventra codex/eventra-unattended-delivery \
  --json headRefOid,mergeable,mergeStateStatus,statusCheckRollup
gh pr merge --repo codeExploreHub/Eventra codex/eventra-unattended-delivery \
  --merge --delete-branch
```

Create `/private/tmp/eventra-unattended-delivery-pr.md` with `apply_patch`.
Merge only the exact reviewed SHA. Do not deploy production.

- [ ] **Step 4: Fast-forward authoritative frontend master and reverify**

```bash
git -C /Users/didi/Eventra-workspace/Eventra pull --ff-only origin master
PYTHONDONTWRITEBYTECODE=1 python3 -B -m unittest discover \
  -s /Users/didi/Eventra-workspace/Eventra/tools/multica/tests
```

Preserve existing stash and temporary worktrees.

- [ ] **Step 5: Run connected audit and dry run**

```bash
python3 -B -m tools.multica.contract_audit \
  --runtime-id de500649-cada-4419-9d5d-279045e2eaae \
  --daemon-id 019fab98-bbad-7d17-b0b7-26e56dbe1b6f
python3 -B -m tools.multica.provision \
  --runtime-id de500649-cada-4419-9d5d-279045e2eaae \
  --daemon-id 019fab98-bbad-7d17-b0b7-26e56dbe1b6f
```

Expected: scalar-free audit succeeds; dry-run makes zero mutations.

- [ ] **Step 6: Apply live instructions/Watcher and prove idempotency**

```bash
python3 -B -m tools.multica.provision \
  --runtime-id de500649-cada-4419-9d5d-279045e2eaae \
  --daemon-id 019fab98-bbad-7d17-b0b7-26e56dbe1b6f --apply
python3 -B -m tools.multica.provision \
  --runtime-id de500649-cada-4419-9d5d-279045e2eaae \
  --daemon-id 019fab98-bbad-7d17-b0b7-26e56dbe1b6f --apply
```

Expected: first apply updates exact Eventra objects and creates Watcher; second reports `mutation_count=0` without a secret prompt.

- [ ] **Step 7: Recover PRO-35 through the updated child Agent**

Reread PRO-35/PRO-36, PR #6, head, and runs. Require PR #6 still points to `698d36401de909541084e09fb223fd1379e5762f`; if changed, use the current exact head and invalidate old evidence.

Run exactly once:

```bash
multica issue rerun PRO-35 --output json
```

The updated Delivery Lead rereads Stage 1, detects the completed child run with
no terminal phase envelope, and reruns the existing PRO-36 assignee without
creating another child or PR. The Frontend Engineer resumes the existing PR,
retries/resolves the build gate, posts evidence, and invokes `finish-phase`.
Do not manually mark PASS or issue a second manual rerun.

- [ ] **Step 8: Monitor native progression to a factual terminal outcome**

Use bounded `issue get/children/runs/timeline/comment` and GitHub PR reads. Expect automatic Delivery Lead wakeup, exact-SHA Review/QA children, structured verdicts, and repair or merge.

Stop only when:

- PRO-35 is `done`, PR #6 is merged at the exact gated SHA, merged local smoke passed, and production was not deployed; or
- PRO-35 is factually `blocked` under the approved human boundary with no safe automatic action remaining.

- [ ] **Step 9: Run final audit and record evidence**

Verify one active Watcher with one 30-minute schedule, no duplicate stages/runs, final merge SHAs, tests, mutation counts, PRO-35 outcome, and absence of production deployment. Never commit raw Issue payloads, IDs, webhook data, or environment values.
