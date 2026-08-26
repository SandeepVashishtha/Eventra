# Eventra Generic Multica Framework Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the working Eventra local-delivery automation onto the reusable generic framework without disrupting current repositories, resource IDs, closed issues, or the manually deployed local environment.

**Architecture:** First capture and test the current live topology read-only, then generate a dedicated control repository locally and prove configuration parity against fake clients. External creation and live reconciliation are two separate explicit approval gates. Cutover preserves the current squad agents, dedicated Watcher, Autopilot, trigger, and repository Projects in place; it adds a control Project/repository binding and switches only new parent issues after an idle-window audit.

**Tech Stack:** Python 3.11+, generic `tools.multica_delivery` core, `multica-multi-repo-delivery` Codex skill, Multica CLI, GitHub CLI, GitHub Projects, Eventra React frontend, Eventra Spring Boot backend.

**Spec:** `docs/superpowers/specs/2026-08-26-multica-generic-multi-repo-delivery-skill-design.md`

## Global Constraints

- The GitHub owner is `codeExploreHub`; never create or fork resources under `Aprim-OPC` / Saboriza OPC.
- The frontend repository remains `codeExploreHub/Eventra` at `/Users/didi/Eventra-workspace/Eventra`.
- The backend repository remains `codeExploreHub/Eventra-Backend` at `/Users/didi/Eventra-workspace/Eventra-Backend`.
- The dedicated control repository is `codeExploreHub/eventra-delivery-control` at `/Users/didi/Eventra-workspace/Eventra-Delivery-Control`.
- Runtime ID remains `de500649-cada-4419-9d5d-279045e2eaae` and daemon ID remains `019fab98-bbad-7d17-b0b7-26e56dbe1b6f`.
- Watcher agent ID remains `7fed6058-d0ab-42b7-9092-42df03c10890`, Autopilot ID remains `4103d5e7-1b3b-4856-94a1-9ffe1b096812`, and trigger ID remains `7a6dea91-03a1-4e70-8709-9d5a97ec7f77` unless a read-only audit proves a resource no longer exists.
- Preserve all current live resource IDs when the resource has the correct semantic role; create only the missing control repository/Project/binding and generic metadata.
- Wait for zero active Eventra parent deliveries before live cutover; closed issues remain untouched.
- Current repository Projects remain repository execution Projects; the new control Project owns only new parent delivery issues.
- The dedicated Watcher remains independent and may issue at most one recovery action per stalled transition.
- Eventra is local/development: quality-gate success may auto-merge, but this framework forbids deployment; any deployment or service restart remains a separate manual action.
- Production auto-merge and auto-deploy remain forbidden.
- Secrets remain local environment values; `.env.local`, backend secrets, and mail credentials are ignored and never committed, logged, placed in issues, or written to `framework.lock`.
- Local process management may stop/restart only processes carrying a matching framework ownership record.
- Cross-stack merge is all-or-nothing at preflight: any missing/stale evidence or changed PR head blocks all merges; no automatic rollback is attempted.
- Repository creation/push and live Multica apply each require their own explicit approval after the exact dry-run is shown.
- Keep the current Eventra adapter available until all three real pilots and the idempotency rerun pass.

---

## File Map

- `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/delivery.yaml`: Eventra desired state for frontend/backend/control resources.
- `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/framework.lock`: preserved and newly reconciled live IDs/hashes.
- `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/AGENTS.md`: product-level operating and ownership policy.
- `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/README.md`: local setup, plan/apply, pilot, and recovery instructions.
- `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/.gitignore`: local secret, plan-receipt, log, and ownership-record exclusions.
- `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/tests/test_eventra_manifest.py`: product-specific manifest assertions.
- `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/tests/test_migration_plan.py`: ID preservation and allowed-action assertions.
- `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/evidence/`: redacted audit/plan/pilot evidence safe to commit.
- `tools/multica/eventra_adapter.py`: retained compatibility adapter until final acceptance.
- `docs/multica-eventra-migration.md`: migration and rollback runbook in the existing Eventra repository.

### Task 1: Freeze a Read-Only Eventra Baseline

**Files:**
- Create: `docs/multica-eventra-migration.md`
- Create: `tools/multica_delivery/tests/test_eventra_live_snapshot.py`
- Create at execution time: `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/evidence/baseline-redacted.json`

**Interfaces:**
- Consumes: read-only Multica/GitHub queries, current local repository metadata, and existing Eventra config.
- Produces: a redacted `EventraBaseline` with live IDs, project titles, agent roles, Autopilot/trigger bindings, repository remotes/default branches, and active-parent count.

- [ ] **Step 1: Write a failing baseline parser test around a committed redacted fixture**

```python
def test_baseline_requires_preserved_watcher_resources(self):
    baseline = EventraBaseline.from_json(self.fixture.read_text())
    self.assertEqual(baseline.runtime_id, "de500649-cada-4419-9d5d-279045e2eaae")
    self.assertEqual(baseline.daemon_id, "019fab98-bbad-7d17-b0b7-26e56dbe1b6f")
    self.assertEqual(baseline.watcher_agent_id, "7fed6058-d0ab-42b7-9092-42df03c10890")
    self.assertEqual(baseline.autopilot_id, "4103d5e7-1b3b-4856-94a1-9ffe1b096812")
    self.assertEqual(baseline.trigger_id, "7a6dea91-03a1-4e70-8709-9d5a97ec7f77")

def test_baseline_contains_no_environment_values(self):
    text = self.fixture.read_text()
    self.assertNotIn("JWT_SECRET", text)
    self.assertNotIn("MAIL_PASSWORD", text)
```

- [ ] **Step 2: Run the parser test and observe the missing snapshot type**

Run: `python3 -B -m unittest tools.multica_delivery.tests.test_eventra_live_snapshot -v`

Expected: FAIL importing `EventraBaseline`.

- [ ] **Step 3: Add a read-only snapshot command to the compatibility adapter**

```python
@dataclass(frozen=True)
class EventraBaseline:
    captured_at: str
    runtime_id: str
    daemon_id: str
    squad_id: str
    project_ids_by_title: Mapping[str, str]
    agent_ids_by_role: Mapping[str, str]
    watcher_agent_id: str
    autopilot_id: str
    trigger_id: str
    active_parent_identifiers: tuple[str, ...]
    repositories: Mapping[str, RepositoryBaseline]
```

The command may call only list/get/view operations. Serialize sorted keys and exclude all environment maps, credential values, issue bodies/comments, and local `.env*` contents. Include only active parent identifiers and statuses needed for the idle-window gate.

- [ ] **Step 4: Capture the live baseline with host execution**

Run read-only GitHub CLI queries with host execution from the first attempt, per `AGENTS.md`; do not interpret sandboxed auth failures. Run the generic contract audit and Eventra snapshot command. Write the redacted result to `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/evidence/baseline-redacted.json` only after locally creating the destination in Task 2; until then retain it in `/private/tmp/eventra-baseline-redacted.json`.

Expected: both GitHub repositories are visible, current Multica resources resolve, and the report explicitly lists the active parent identifiers. If the active-parent tuple is nonempty, finish this task but do not proceed to live cutover Tasks 6-7.

- [ ] **Step 5: Run legacy and baseline tests**

Run: `python3 -B -m unittest tools.multica_delivery.tests.test_eventra_live_snapshot tools.multica.tests.test_eventra_adapter -v`

Expected: all tests PASS.

- [ ] **Step 6: Commit the read-only tooling and runbook start**

```bash
git add docs/multica-eventra-migration.md tools/multica_delivery/tests/test_eventra_live_snapshot.py tools/multica/eventra_adapter.py
git commit -m "test: capture eventra migration baseline"
```

### Task 2: Generate the Local Eventra Control Repository

**Files:**
- Create: `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/delivery.yaml`
- Create: `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/framework.lock`
- Create: `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/AGENTS.md`
- Create: `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/README.md`
- Create: `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/.gitignore`
- Create: `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/instructions/squad.md`
- Create: `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/instructions/delivery-lead.md`
- Create: `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/instructions/independent-reviewer.md`
- Create: `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/instructions/integration-qa.md`
- Create: `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/instructions/workflow-watcher.md`
- Create: `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/instructions/repositories/frontend.md`
- Create: `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/instructions/repositories/backend.md`
- Create: `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/tools/multica_delivery/`
- Create: `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/docs/operator-workflow.md`
- Create: `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/tests/test_eventra_manifest.py`
- Create: `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/evidence/baseline-redacted.json`

**Interfaces:**
- Consumes: the confirmed Eventra discovery report, baseline snapshot, and Skill `init` generator.
- Produces: a local, committed control repository with no GitHub remote and no live mutations.

- [ ] **Step 1: Produce and review confirmed Eventra discovery input**

The confirmed values must include two repository keys, `frontend` and `backend`; GitHub slugs `codeExploreHub/Eventra` and `codeExploreHub/Eventra-Backend`; local paths shown in Global Constraints; frontend focused-test/test/build/start/smoke argv derived from `package.json`; backend focused-test/test/build/start/smoke Maven/Java argv including `-s .mvn/settings-public.xml`; dependency edge `frontend -> backend` for cross-stack API changes; integration and smoke suites for browser-to-local-backend and backend API health; environment `development`; automatic merge true; framework deployment `forbidden`; and secret references by variable name only.

- [ ] **Step 2: Use Skill `init` to create only local files**

Run:

```bash
python3 -B /Users/didi/Eventra-workspace/Eventra/skills/multica-multi-repo-delivery/scripts/multica_delivery.py init \
  --workspace /Users/didi/Eventra-workspace \
  --discovery-report /private/tmp/eventra-discovery.json \
  --confirmations /private/tmp/eventra-confirmations.json \
  --engine-source /Users/didi/Eventra-workspace/Eventra/tools/multica_delivery \
  --destination /Users/didi/Eventra-workspace/Eventra-Delivery-Control
```

Expected: `delivery.yaml`, `framework.lock`, `AGENTS.md`, `README.md`, `.gitignore`, role/repository instructions, versioned `tools/multica_delivery`, tests, and docs are created; no Git initialization, commit, GitHub operation, or Multica mutation occurs.

- [ ] **Step 3: Seed preserved IDs from the redacted baseline**

Use a deterministic migration helper that copies resource IDs by semantic key into `framework.lock`, records the current framework version and manifest hash, and refuses duplicate/missing semantic keys. It must preserve the five exact runtime/daemon/Watcher values in Global Constraints and all current squad/control/repository agent IDs discovered in Task 1. It leaves the missing control Project ID and control repository resource ID absent so the plan reports creates.

- [ ] **Step 4: Write product-specific manifest tests**

```python
def test_eventra_manifest_is_local_auto_merge_framework_deploy_forbidden(self):
    manifest = load_manifest(ROOT / "delivery.yaml")
    self.assertEqual(tuple(manifest.repositories), ("frontend", "backend"))
    self.assertEqual(manifest.policy.environment, "development")
    self.assertTrue(manifest.policy.automatic_merge)
    self.assertEqual(manifest.policy.deployment, "forbidden")

def test_eventra_secrets_are_names_only(self):
    text = (ROOT / "delivery.yaml").read_text()
    for name in ("JWT_SECRET", "MAIL_USERNAME", "MAIL_PASSWORD"):
        self.assertIn(name, text)
    self.assertNotIn("unused@example.com", text)
```

- [ ] **Step 5: Validate locally and initialize the local Git repository without committing**

Run: `python3 -B -m unittest discover -s /Users/didi/Eventra-workspace/Eventra-Delivery-Control/tests -p 'test_*.py' -v`

Expected: all tests PASS.

Run: `git init -b main /Users/didi/Eventra-workspace/Eventra-Delivery-Control`

Expected: an uncommitted local repository with no remote.

- [ ] **Step 6: Stop and request separate approval for the initial local commit**

Show the complete generated file list, `git diff --no-index /dev/null` summaries as applicable, test result, absence of secret values, and proposed message `chore: initialize eventra delivery control`. This commit approval does not authorize GitHub repository creation or push.

- [ ] **Step 7: Create the initial commit after approval**

Run inside the new repository: `git add delivery.yaml framework.lock AGENTS.md README.md .gitignore instructions tools tests docs evidence/baseline-redacted.json && git commit -m "chore: initialize eventra delivery control"`

Expected: one local commit and no remote configured.

### Task 3: Prove Migration Parity with Fake Clients

**Files:**
- Create: `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/tests/test_migration_plan.py`
- Create: `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/evidence/fake-plan.json`
- Modify: `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/README.md`

**Interfaces:**
- Consumes: Eventra manifest/lock, redacted baseline, and fake clients initialized from baseline state.
- Produces: a plan whose only creates are the dedicated control Project and control repository binding, with instruction/agent/Watcher updates only when hashes differ.

- [ ] **Step 1: Write failing allowed-action tests**

```python
def test_migration_preserves_existing_semantic_resource_ids(self):
    receipt = build_plan(self.manifest_path, self.lock_path, clients_from(self.baseline))
    replaced = tuple(a for a in receipt.actions if a.kind.endswith(".delete") or a.kind.endswith(".replace"))
    self.assertEqual(replaced, ())

def test_only_control_project_and_binding_are_new(self):
    receipt = build_plan(self.manifest_path, self.lock_path, clients_from(self.baseline))
    creates = tuple((a.kind, a.key) for a in receipt.actions if a.operation == "create")
    self.assertEqual(creates, (("project", "control"), ("repository-binding", "control")))

def test_watcher_resources_update_in_place(self):
    receipt = build_plan(self.manifest_path, self.lock_path, clients_from(self.baseline))
    watcher_actions = tuple(a for a in receipt.actions if a.key in {"watcher", "stalled-work-watcher"})
    self.assertTrue(all(a.operation != "create" for a in watcher_actions))
```

- [ ] **Step 2: Run the fake migration tests and inspect the first mismatch**

Run: `python3 -B -m unittest discover -s /Users/didi/Eventra-workspace/Eventra-Delivery-Control/tests -p 'test_*.py' -v`

Expected before compatibility adjustments: FAIL with the first unexpected create/update/delete action.

- [ ] **Step 3: Correct semantic-key mapping, not live state**

Adjust only `delivery.yaml`, `framework.lock`, or the pure migration helper until existing project/agent/squad/Watcher IDs map to their generic semantic keys. Do not weaken the assertion, create fake IDs, or invoke live apply. Intentional instruction updates are permitted as in-place update actions only when the receipt shows old/new content hashes and no secret-bearing content.

- [ ] **Step 4: Assert full generated instruction policy**

Add tests that every repository Engineer is scoped to exactly one repository Project/path/slug; Delivery Lead operates on the control Project; Independent Reviewer and Integration QA record exact candidate SHA; Watcher has no Engineer assignment and one-recovery metadata; merge is local/development-only; framework deployment is forbidden; production merge/deploy instructions are prohibitions.

- [ ] **Step 5: Generate and commit the fake plan evidence**

Write the canonical redacted receipt to `evidence/fake-plan.json`. Run tests twice and assert the same plan hash. Then commit:

```bash
git add delivery.yaml framework.lock README.md tests evidence/fake-plan.json
git commit -m "test: prove eventra generic migration parity"
```

### Task 4: Separate Approval Gates — Create, Then Push the Dedicated GitHub Control Repository

**Files:**
- Modify after approval: `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/.git/config`
- Create externally after approval: GitHub repository `codeExploreHub/eventra-delivery-control`

**Interfaces:**
- Consumes: clean local control repository, authenticated GitHub CLI, explicit creation approval naming `codeExploreHub/eventra-delivery-control`, and a later separate push approval.
- Produces: a private-or-public repository exactly as the user approves, with `origin` pointing only to the user account and `main` pushed.

- [ ] **Step 1: Stop and request only the repository-creation approval**

Show: owner/name, requested visibility, local path, current local commit SHA, and the fact that this step creates an empty GitHub repository without pushing or changing Multica. This approval is not implied by approval of the Spec, this plan, or the local commit.

- [ ] **Step 2: Recheck ownership and local cleanliness after approval**

Run with host execution: `gh auth status` and `gh repo view codeExploreHub/eventra-delivery-control --json nameWithOwner,url,visibility`.

Expected: auth is known at host level; the target either does not exist or is an empty repository owned by `codeExploreHub`. If it exists with content or a different owner, stop without pushing.

Run locally: `git -C /Users/didi/Eventra-workspace/Eventra-Delivery-Control status --short`

Expected: no output.

- [ ] **Step 3: Create only the empty GitHub repository after exact approval**

Use `gh repo create codeExploreHub/eventra-delivery-control` with the approved visibility flag and no `--source`, `--remote`, or `--push`. Do not specify `Aprim-OPC`, transfer ownership, add collaborators, or create secrets.

- [ ] **Step 4: Verify the empty repository read-only**

Run with host execution: `gh repo view codeExploreHub/eventra-delivery-control --json nameWithOwner,url,visibility,defaultBranchRef`.

Expected: owner/name and visibility are exact; no business-code or generated files exist remotely yet.

- [ ] **Step 5: Stop and request separate push approval**

Show the exact remote URL, local `main` commit SHA, generated file list, and target empty repository. State that this approval only adds `origin` and pushes `main`; it does not authorize Multica apply.

- [ ] **Step 6: Add the exact remote and push after approval**

Run inside the control repository:

```bash
git remote add origin https://github.com/codeExploreHub/eventra-delivery-control.git
git push -u origin main
```

- [ ] **Step 7: Verify the pushed repository read-only**

Run with host execution: `gh repo view codeExploreHub/eventra-delivery-control --json nameWithOwner,url,visibility,defaultBranchRef`.

Expected: owner/name is exact and default branch is `main`.

Run: `git -C /Users/didi/Eventra-workspace/Eventra-Delivery-Control remote -v`

Expected: fetch/push URLs both target `codeExploreHub/eventra-delivery-control`.

### Task 5: Live Contract Audit and Non-Mutating Plan

**Files:**
- Create: `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/evidence/contract-audit-redacted.json`
- Create: `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/evidence/live-plan.json`
- Modify: `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/README.md`

**Interfaces:**
- Consumes: live read-only clients, Eventra manifest/lock, and the pushed control repository.
- Produces: a passing audit and fresh 30-minute plan receipt; no resource mutations.

- [ ] **Step 1: Confirm the idle-window gate read-only**

Refresh the Eventra baseline. Expected: `active_parent_identifiers` is empty. If PRO-45 or any newer parent is still nonterminal, stop before plan/apply and let the current adapter finish it; do not migrate it.

- [ ] **Step 2: Run `validate` and `doctor`**

```bash
python3 -B /Users/didi/Eventra-workspace/Eventra/skills/multica-multi-repo-delivery/scripts/multica_delivery.py validate \
  --workspace /Users/didi/Eventra-workspace \
  --manifest /Users/didi/Eventra-workspace/Eventra-Delivery-Control/delivery.yaml

python3 -B /Users/didi/Eventra-workspace/Eventra/skills/multica-multi-repo-delivery/scripts/multica_delivery.py doctor \
  --workspace /Users/didi/Eventra-workspace \
  --manifest /Users/didi/Eventra-workspace/Eventra-Delivery-Control/delivery.yaml
```

Expected: validation passes; doctor reports only the missing control Project/binding and declared in-place instruction/version drift. Any missing preserved agent/squad/Watcher resource is a failure, not an automatic recreate.

- [ ] **Step 3: Generate the fresh live plan**

```bash
python3 -B /Users/didi/Eventra-workspace/Eventra/skills/multica-multi-repo-delivery/scripts/multica_delivery.py plan \
  --workspace /Users/didi/Eventra-workspace \
  --manifest /Users/didi/Eventra-workspace/Eventra-Delivery-Control/delivery.yaml \
  --output /Users/didi/Eventra-workspace/Eventra-Delivery-Control/evidence/live-plan.json
```

Expected: no mutation; receipt includes manifest/lock hashes, expiry, exact action list, and 64-character plan hash. It contains no environment values.

- [ ] **Step 4: Compare live and fake allowed action classes**

Run the migration-plan test against `evidence/live-plan.json`. Expected: no deletes, no replacements, no repository mutation, no process action, no issue mutation, preserved IDs remain updates/noops, and only control Project/binding are creates. If unexpected drift appears, correct config and regenerate a new plan; never edit the receipt.

- [ ] **Step 5: Commit only redacted audit evidence, not the expiring receipt**

`.gitignore` must exclude `evidence/live-plan.json`. Commit `evidence/contract-audit-redacted.json` and README updates only:

```bash
git add evidence/contract-audit-redacted.json README.md .gitignore
git commit -m "docs: record eventra preflight audit"
git push origin main
```

### Task 6: Approval Gate — Apply the Exact Live Plan and Cut Over New Parents

**Files:**
- Modify after successful apply: `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/framework.lock`
- Create after successful apply: `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/evidence/apply-redacted.json`

**Interfaces:**
- Consumes: an unexpired live plan receipt, exact plan hash, explicit user approval, and locally supplied secrets.
- Produces: reconciled generic Eventra resources and a lock containing the created control IDs plus preserved existing IDs.

- [ ] **Step 1: Stop and request approval for the exact plan hash**

Show the receipt hash, expiry, every create/update/noop grouped by resource, preserved IDs, absence of deletes/replacements, and rollback boundary. State that approval authorizes only this hash; expiry or any manifest/lock change requires a new plan and new approval.

- [ ] **Step 2: Recheck preconditions immediately before apply**

Refresh active parents and exact live resource IDs read-only; require zero active parents and matching baseline. Verify local frontend/backend/control worktrees have no automation-owned unfinished branches. Supply `JWT_SECRET`, `MAIL_USERNAME`, and `MAIL_PASSWORD` from the local environment or secure prompt; do not echo them.

- [ ] **Step 3: Apply the exact approved receipt**

```bash
python3 -B /Users/didi/Eventra-workspace/Eventra/skills/multica-multi-repo-delivery/scripts/multica_delivery.py apply \
  --workspace /Users/didi/Eventra-workspace \
  --manifest /Users/didi/Eventra-workspace/Eventra-Delivery-Control/delivery.yaml \
  --plan /Users/didi/Eventra-workspace/Eventra-Delivery-Control/evidence/live-plan.json \
  --approved-plan-hash "$EVENTRA_APPROVED_PLAN_HASH"
```

Before running the command, set `EVENTRA_APPROVED_PLAN_HASH` by copying the exact 64-character hash the user approved in Step 1; reject an empty or non-hex value locally. Expected: apply succeeds, updates `framework.lock` atomically, creates the control Project/binding, updates allowed instructions/metadata in place, and retains current agent/squad/Watcher/Autopilot/trigger IDs.

- [ ] **Step 4: Verify live state and rerun plan for idempotency**

Run `doctor`; expected: no failures. Run a fresh `plan`; expected: zero actions. Verify Watcher Autopilot/trigger still use IDs `4103d5e7-1b3b-4856-94a1-9ffe1b096812` and `7a6dea91-03a1-4e70-8709-9d5a97ec7f77`, Watcher agent remains `7fed6058-d0ab-42b7-9092-42df03c10890`, and the main delivery agent concurrency remains available for issue work.

- [ ] **Step 5: Commit the lock and redacted apply evidence**

Create `evidence/apply-redacted.json` from the apply result with no environment values or issue content. Then:

```bash
git add framework.lock evidence/apply-redacted.json
git commit -m "chore: record eventra generic framework cutover"
git push origin main
```

### Task 7: Three Real Pilots and Exact-SHA Acceptance

**Files:**
- Create: `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/evidence/pilot-frontend.md`
- Create: `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/evidence/pilot-backend.md`
- Create: `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/evidence/pilot-cross-stack.md`
- Modify: `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/README.md`

**Interfaces:**
- Consumes: three new control Project parent issues created after cutover.
- Produces: evidence that single-repository and cross-stack delivery automatically perform intake, planning, DAG dispatch, implementation, exact-SHA review/QA, repair boundedness, merge, two-read post-merge smoke, and parent completion while the framework performs no deployment.

- [ ] **Step 1: Create the frontend-only pilot issue after user selects the harmless change**

The issue begins in `Backlog`; transition it to `Todo` to trigger intake. Acceptance evidence must show: affected set `frontend`; exactly one frontend implementation child; no backend child; PR to `codeExploreHub/Eventra`; review and QA comments name the PR head SHA; quality gates pass; PR auto-merges; frontend smoke passes against the merged SHA on two authoritative reads; parent completes; no deployment/service restart runs.

- [ ] **Step 2: Create the backend-only pilot issue after user selects the harmless change**

Use the same state transition. Evidence must show affected set `backend`; no frontend child; backend Maven test uses Java 17+ and `.mvn/settings-public.xml`; PR to `codeExploreHub/Eventra-Backend`; exact-SHA gates; auto-merge; backend smoke passes against the merged SHA on two authoritative reads; parent completion; no deployment occurs.

- [ ] **Step 3: Create the cross-stack pilot issue after user selects the harmless contract change**

Evidence must show affected set `backend,frontend`; DAG dispatches backend before dependent frontend unless a confirmed frozen contract allows the same wave; separate PRs are created; integration QA exercises the locally configured frontend against the local backend; both PR heads/checks are re-read before any merge; merge order follows the DAG and confirmed manifest order; both merge or neither begins; repository and cross-stack smoke pass against exact merged SHAs on two authoritative reads; parent completes automatically; no deployment occurs.

- [ ] **Step 4: Exercise one safe repair path without manufacturing production failure**

On one pilot branch, submit an intentionally failing test as part of the approved pilot design, verify one repair child is dispatched and the attempt becomes 1, then fix it. Evidence must show no human parent resume, no duplicate child for the same idempotency key, and no more than two repair attempts are possible. Do not intentionally partially merge or alter live default branches.

- [ ] **Step 5: Verify Watcher does not monopolize delivery concurrency**

During a pilot, inspect Autopilot execution and delivery agent activity read-only. The independent Watcher agent may scan/recover but the primary `Eventra Local Delivery` execution capacity must remain available. If no stall occurs, record “no recovery required”; do not create artificial stalled live work.

- [ ] **Step 6: Record redacted pilot evidence and commit**

Each evidence file records parent/child identifiers, repository keys, PR URLs, exact candidate SHAs, gate results, merge timestamps, status transitions, and explicit “deployment not triggered”. Exclude credentials and full issue bodies. Then:

```bash
git add evidence/pilot-frontend.md evidence/pilot-backend.md evidence/pilot-cross-stack.md README.md
git commit -m "test: validate eventra generic delivery pilots"
git push origin main
```

### Task 8: Retire the Compatibility Path Only After Acceptance

**Files:**
- Modify: `tools/multica/README.md`
- Modify: `docs/multica-eventra-migration.md`
- Modify: `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/README.md`
- Modify only after all checks pass: `tools/multica/eventra_adapter.py`

**Interfaces:**
- Consumes: three passing pilot records, zero-action plan, healthy doctor report, and clean repositories.
- Produces: generic framework as the documented Eventra path; legacy adapter retained as a thin deprecation shim for one release rather than deleted immediately.

- [ ] **Step 1: Run complete verification in the Eventra repository**

Run:

```bash
python3 -B -m unittest discover -s tools -p 'test_*.py' -v
python3 -B -m unittest discover -s skills/multica-multi-repo-delivery/tests -p 'test_*.py' -v
python3 -B -m compileall -q tools/multica tools/multica_delivery skills/multica-multi-repo-delivery
git diff --check
```

Expected: all tests PASS, compilation succeeds silently, and diff check is clean.

- [ ] **Step 2: Run final live read-only verification**

Run `doctor` and a fresh `plan` against `/Users/didi/Eventra-workspace/Eventra-Delivery-Control/delivery.yaml`. Expected: doctor has no failures; plan has zero actions; no active parent is stranded; Watcher binding is healthy; both repositories’ default branches contain their completed pilot merges.

- [ ] **Step 3: Convert the Eventra adapter into a deprecation shim**

Keep existing CLI entry points and imports, but route them to the generic manifest/workflow and print one deprecation notice directing operators to the control repository commands. Preserve tests proving old commands resolve; do not delete legacy modules, live resources, projects, or closed issues in this migration.

- [ ] **Step 4: Document the manual rollback boundary**

Before the first generic parent issue, rollback consists of retargeting the existing Watcher trigger and intake entry point to their previous Project IDs using a newly approved reverse plan. After generic pilot merges, do not auto-rollback code or delete resources; diagnose forward or prepare a separately reviewed manual change. Local deployment/service restarts always remain manual.

- [ ] **Step 5: Commit and push final migration documentation**

In `/Users/didi/Eventra-workspace/Eventra`:

```bash
git add tools/multica/eventra_adapter.py tools/multica/README.md docs/multica-eventra-migration.md
git commit -m "docs: make generic multica delivery the eventra path"
```

In `/Users/didi/Eventra-workspace/Eventra-Delivery-Control`:

```bash
git add README.md
git commit -m "docs: finalize eventra generic delivery operations"
git push origin main
```
