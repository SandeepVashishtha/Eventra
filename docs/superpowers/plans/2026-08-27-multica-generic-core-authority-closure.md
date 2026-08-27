# Multica Generic Core Authority Closure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the five residual authority gaps so the generic multi-repository delivery branch can pass a fresh whole-branch review.

**Architecture:** Replace the self-reporting smoke runner seam with one concrete boundary that owns raw command parsing and SHA verification. Recover merge truth from ordered authoritative PR reads before every resumed merge, and move progression rules into the central decision/resume paths. Finish by applying one stable ID grammar to every public scoped Multica read.

**Tech Stack:** Python 3.11+, standard-library `dataclasses`, `subprocess`, `unittest`, temporary Git repositories, existing immutable Multica delivery models.

**Spec:** `docs/superpowers/specs/2026-08-27-multica-generic-core-authority-closure-design.md`

## Global Constraints

- Never deploy, roll back, push, merge a live PR, or call live Multica/GitHub during implementation or tests.
- Never run `git checkout` or `git reset` against a product repository; exact-SHA smoke is read-only and fails closed on mismatch.
- A retry derives merge truth from authoritative PR reads, not mutation acknowledgements or stale metadata.
- Production command execution uses immutable argv with `shell=False`; stdout, stderr, secrets, and environment values never enter metadata or errors.
- Stage progression is authorized centrally; no callback, watcher, timer, or direct resume may bypass it.
- After all PRs are merged, missing or stale pre-merge evidence human-blocks and never dispatches or repairs work.
- Public Multica scoped IDs match `[A-Za-z0-9][A-Za-z0-9._:-]{0,255}` exactly.
- Preserve Eventra compatibility IDs, role skills, legacy payloads, no-deployment policy, and all previously approved ledger rulings.
- Use `/Users/didi/Eventra-workspace/Eventra/.worktrees/multica-generic-core/.venv/bin/python`; PyYAML must remain exactly `6.0.2`.

---

### Task 1: Concrete exact-SHA local command boundary

**Files:**
- Create: `tools/multica_delivery/exact_sha.py`
- Create: `tools/multica_delivery/tests/test_exact_sha.py`
- Modify: `tools/multica_delivery/workflow.py`
- Modify: `tools/multica_delivery/tests/test_workflow.py`
- Modify: `docs/multica-delivery-core.md`
- Modify: `tools/multica_delivery/tests/test_documentation.py`

**Interfaces:**
- Consumes: `DeliveryManifest`, manifest repository paths, repository and integration smoke argv, `OwnedSmokeExecutor` process ownership.
- Produces: `ClosedCommandResult`, `ClosedCommandBackend`, `SubprocessCommandBackend`, `ExactShaVerification`, `ExactShaCommandResult`, and concrete `LocalExactShaCommandRunner`.
- `OwnedSmokeExecutor(..., command_runner: LocalExactShaCommandRunner | None = None)` constructs the production runner when omitted and rejects arbitrary self-reporting objects.

- [ ] **Step 1: Write failing concrete-runner boundary tests**

Create tests that use a real temporary Git repository with two synthetic commits. The first tests must assert these literal behaviors:

```python
runner = LocalExactShaCommandRunner(manifest)
verification = runner.verify(
    "api",
    first_sha,
    api_path,
    argv=("git", "rev-parse", "HEAD"),
)
self.assertEqual(verification.observed_sha, first_sha)

with self.assertRaises(ExactShaBoundaryError):
    runner.verify("api", second_sha, api_path, argv=("git", "rev-parse", "HEAD"))
```

Also add deterministic backend tests for nonzero Git exit, empty/multiline/uppercase/malformed stdout, wrong cwd, and a smoke command whose checkout changes between its before and after observations.

- [ ] **Step 2: Run the new test and verify RED**

Run:

```bash
.venv/bin/python -B -m unittest tools.multica_delivery.tests.test_exact_sha -v
```

Expected: import failure for `tools.multica_delivery.exact_sha` or missing `LocalExactShaCommandRunner`; no production implementation exists yet.

- [ ] **Step 3: Implement the closed subprocess and SHA parser**

Implement these public shapes in `exact_sha.py`:

```python
@dataclass(frozen=True)
class ClosedCommandResult:
    returncode: int
    stdout: str
    stderr: str

class ClosedCommandBackend(Protocol):
    def run(self, argv: tuple[str, ...], cwd: Path) -> ClosedCommandResult: ...

class SubprocessCommandBackend:
    def run(self, argv: tuple[str, ...], cwd: Path) -> ClosedCommandResult: ...

class LocalExactShaCommandRunner:
    def __init__(
        self,
        manifest: DeliveryManifest,
        backend: ClosedCommandBackend | None = None,
    ) -> None: ...

    def verify(
        self,
        repository_key: str,
        expected_sha: str,
        cwd: Path,
        *,
        argv: tuple[str, ...],
    ) -> ExactShaVerification: ...

    def run(
        self,
        repository_key: str,
        candidate_shas: Mapping[str, str],
        argv: tuple[str, ...],
        cwd: Path,
    ) -> ExactShaCommandResult: ...
```

`SubprocessCommandBackend` must call `subprocess.run(list(argv), cwd=cwd, shell=False, stdin=subprocess.DEVNULL, capture_output=True, text=True, check=False)`. Do not include captured output in raised error messages.

`LocalExactShaCommandRunner.run()` verifies every candidate repository before and after the command. A nonzero smoke command produces `passed=False` only when both SHA maps match exactly; Git verification failure raises `ExactShaBoundaryError`.

- [ ] **Step 4: Watch the concrete runner tests turn GREEN**

Run the focused test again. Expected: every concrete parser, real temporary Git repository, and command-time mismatch test passes.

- [ ] **Step 5: Write failing `OwnedSmokeExecutor` wiring tests**

Add tests proving:

```python
with self.assertRaises(TypeError):
    OwnedSmokeExecutor(manifest, process_manager, SelfReportingFakeRunner())
```

Add executor tests for stale HEAD before startup, HEAD changing in a process-manager startup hook, and HEAD changing during a smoke command. Assert zero authoritative PASS evidence and no service startup for the pre-start mismatch.

- [ ] **Step 6: Wire the concrete runner and remove the self-reporting protocol**

Move `ExactShaVerification` and `ExactShaCommandResult` to `exact_sha.py`. Import them into `workflow.py`, delete the `ExactShaCommandRunner` protocol, default `OwnedSmokeExecutor` to `LocalExactShaCommandRunner(manifest)`, and require an injected runner to be an instance of that concrete class. Keep pre-start and post-start verification in `OwnedSmokeExecutor`; per-command verification stays inside the concrete runner.

Update the operator document to name the concrete boundary and retain the statement that Core never checks out or resets repositories.

- [ ] **Step 7: Verify Task 1 and commit**

Run:

```bash
.venv/bin/python -B -m unittest \
  tools.multica_delivery.tests.test_exact_sha \
  tools.multica_delivery.tests.test_workflow \
  tools.multica_delivery.tests.test_documentation -q
.venv/bin/python -B -m unittest discover -s tools/multica_delivery/tests -p 'test_*.py' -q
PYTHONPYCACHEPREFIX=/private/tmp/multica-authority-task1-pycache \
  .venv/bin/python -B -m compileall -q tools/multica tools/multica_delivery
git diff --check
```

Expected: all commands exit zero. Commit:

```bash
git add tools/multica_delivery/exact_sha.py tools/multica_delivery/workflow.py \
  tools/multica_delivery/tests/test_exact_sha.py \
  tools/multica_delivery/tests/test_workflow.py \
  tools/multica_delivery/tests/test_documentation.py docs/multica-delivery-core.md
git commit -m "fix: bind local smoke to concrete exact sha runner"
```

---

### Task 2: Recover authoritative merge prefixes across retries

**Files:**
- Modify: `tools/multica_delivery/workflow.py`
- Modify: `tools/multica_delivery/tests/test_workflow.py`

**Interfaces:**
- Consumes: confirmed merge order, `PullRequestInfo.merged_at`, `PullRequestInfo.merge_commit_sha`, current candidate heads, persisted `merge_state` and `merged_shas`.
- Produces: an internal authoritative prefix observation used before resumed preflight or merge mutation.

- [ ] **Step 1: Write the commit-then-unreadable retry regression**

Extend the stateful GitHub fake so the first merge commits remotely, the immediate PR read fails, and the next workflow call can read it. Assert:

```python
first = workflow.execute_merge_plan("PRO-101")
second = workflow.execute_merge_plan("PRO-101")

self.assertEqual(first.next_action, "uncertain")
self.assertEqual(second.merge_state, "merged")
self.assertEqual(github.merge_calls.count((api_slug, 12)), 1)
self.assertEqual(
    dict(store.states["PRO-101"].snapshot.merged_shas),
    {"api": api_merge_sha, "web": web_merge_sha},
)
```

- [ ] **Step 2: Verify the regression is RED**

Run only the new workflow test. Expected: the retry returns blocked with an empty prefix or attempts to preflight the already merged PR.

- [ ] **Step 3: Add malformed and non-contiguous prefix tests**

Write separate failing tests for an unavailable read, wrong candidate head, missing merge commit SHA, a persisted prefix longer than the remote prefix, and `web` merged while earlier `api` is unmerged. Each test asserts `uncertain`, zero new merge calls, and no blocked-empty overwrite.

- [ ] **Step 4: Implement prefix observation and reconciliation**

Add an immutable internal result and helper:

```python
@dataclass(frozen=True)
class _MergePrefixObservation:
    merged_shas: Mapping[str, str]
    remaining: tuple[str, ...]

def _read_merge_prefix(
    self,
    state: WorkflowState,
    order: tuple[str, ...],
) -> _MergePrefixObservation: ...
```

The helper reads every ordered PR, validates identity/head/merged fields, and rejects non-contiguous observations. In `execute_merge_plan()`, call it before the resumed replay check. If the authoritative prefix extends the persisted prefix, record one distinct `merge:recover:<last-repository>` transition and reread it. If it covers the full order, record the final merged transition without another GitHub mutation. Preflight only `remaining`.

- [ ] **Step 5: Verify recovery, replay, and existing merge behavior**

Run all workflow tests. Expected: new retry tests pass; existing fresh merge, partial merge, malformed acknowledgement, and no-rollback tests remain green.

- [ ] **Step 6: Commit Task 2**

```bash
git add tools/multica_delivery/workflow.py tools/multica_delivery/tests/test_workflow.py
git commit -m "fix: recover authoritative merge prefixes on retry"
```

---

### Task 3: Centralize Stage and all-merged evidence gates

**Files:**
- Modify: `tools/multica_delivery/decisions.py`
- Modify: `tools/multica_delivery/workflow.py`
- Modify: `tools/multica_delivery/tests/test_decisions.py`
- Modify: `tools/multica_delivery/tests/test_workflow.py`

**Interfaces:**
- Consumes: `ParentSnapshot`, current metadata ordinal/attempt, `WorkflowChild.active/status`, `WorkflowState.active_work`, current implementation/review/QA/integration evidence.
- Produces: comprehensive all-merged `BLOCK` decisions and central zero-mutation `wait` results for active current-Stage siblings.

- [ ] **Step 1: Write all-merged consistency RED tests**

Use a valid merged snapshot and independently remove or corrupt each evidence class:

```python
for field in ("children", "reviews", "qa", "integration_qa"):
    with self.subTest(field=field):
        decision = decide_parent_action(manifest, snapshot_missing(field))
        self.assertEqual(decision.kind, DecisionKind.BLOCK)
        self.assertEqual(decision.repositories, ())
```

Include missing, pending, failed, and stale-SHA implementation evidence. Verify the current implementation dispatches or repairs at least one case before the fix.

- [ ] **Step 2: Implement the comprehensive all-merged gate**

Add `_all_merged_evidence_problem(manifest, snapshot, affected) -> str | None`. Invoke it immediately after merge coherence and production policy are evaluated, before implementation dispatch/repair. It validates every affected implementation, review, repository QA, and required integration QA record against the current candidate map. Any inconsistency returns a human `BLOCK` decision.

- [ ] **Step 3: Write the direct-resume Stage barrier RED test**

Build one failed current-Stage review child and one active same-ordinal, same-attempt sibling. Call `resume_parent()` directly and assert:

```python
self.assertEqual(result.next_action, "wait")
self.assertEqual(result.mutation_count, 0)
self.assertEqual(store.created_children, [])
self.assertEqual(store.states["PRO-101"].snapshot.attempt, 0)
```

Then mark the sibling terminal, resume again, and assert one aggregated repair at attempt 1.

- [ ] **Step 4: Implement the central barrier**

Add a helper on `GenericWorkflow` that selects children belonging to the current metadata Stage ordinal and attempt. Before `resume_parent()` dispatches `REPAIR` or successor work, return `wait` when any selected child is active or has an active status, or when the parent-level `active_work` marker is true. Historical child ordinals alone do not block. Keep `_state_problem()` as the malformed-relationship fail-closed boundary.

- [ ] **Step 5: Run decision and workflow regression suites**

```bash
.venv/bin/python -B -m unittest \
  tools.multica_delivery.tests.test_decisions \
  tools.multica_delivery.tests.test_workflow -q
```

Expected: all merged corruption cases block, direct resume cannot overlap Stages, and ordinary pre-merge dispatch/repair remains unchanged.

- [ ] **Step 6: Commit Task 3**

```bash
git add tools/multica_delivery/decisions.py tools/multica_delivery/workflow.py \
  tools/multica_delivery/tests/test_decisions.py \
  tools/multica_delivery/tests/test_workflow.py
git commit -m "fix: centralize parent progression gates"
```

---

### Task 4: Close scoped Multica IDs and verify the follow-up

**Files:**
- Modify: `tools/multica_delivery/multica_client.py`
- Modify: `tools/multica_delivery/tests/test_multica_client.py`
- Modify: `docs/multica-delivery-core.md`
- Modify: `tools/multica_delivery/tests/test_documentation.py`

**Interfaces:**
- Consumes: `_PUBLIC_READ_ONE_ID` complete command shapes.
- Produces: one `_PUBLIC_ID` full-match validator shared by every public one-ID read.

- [ ] **Step 1: Write table-driven option-smuggling RED tests**

For every prefix in `_PUBLIC_READ_ONE_ID`, test a valid UUID and these invalid ID tokens:

```python
invalid_ids = ("", "--all", "--help", "-x", "has space", "owner/name", "a" * 257)
```

For invalid tokens, assert `MulticaContractError` and `runner.calls == []`. Add an extra-token case such as `(<prefix>, "project-1", "--all", "--output", "json")`.

- [ ] **Step 2: Verify the tests are RED**

Run the focused Multica client test. Expected: at least `--all` in the required ID position reaches the fake runner.

- [ ] **Step 3: Implement the stable ID grammar**

Add:

```python
_PUBLIC_ID = re.compile(r"[A-Za-z0-9][A-Za-z0-9._:-]{0,255}\Z")

def _is_public_identifier(value: object) -> bool:
    return isinstance(value, str) and _PUBLIC_ID.fullmatch(value) is not None
```

Replace the truthiness check in `_is_public_read()` with this validator. Do not normalize, lowercase, split, or accept aliases.

- [ ] **Step 4: Run the full verification matrix**

```bash
.venv/bin/python -B -m unittest discover -s tools/multica_delivery/tests -p 'test_*.py' -q
.venv/bin/python -B -m unittest discover -s tools/multica/tests -p 'test_*.py' -q
.venv/bin/python -B -m unittest discover -s tools -p 'test_*.py' -q
PYTHONPYCACHEPREFIX=/private/tmp/multica-authority-final-pycache \
  .venv/bin/python -B -m compileall -q tools/multica tools/multica_delivery
git diff --check
.venv/bin/python -c 'import yaml; assert yaml.__version__ == "6.0.2"'
```

Run safety searches proving there is no `shell=True`, deployment/rollback method, automatic checkout/reset, product-specific branch in generic production code, secret assignment, or documented nonexistent CLI.

- [ ] **Step 5: Commit Task 4**

```bash
git add tools/multica_delivery/multica_client.py \
  tools/multica_delivery/tests/test_multica_client.py \
  docs/multica-delivery-core.md \
  tools/multica_delivery/tests/test_documentation.py
git commit -m "fix: close scoped multica read identifiers"
```

- [ ] **Step 6: Request a fresh whole-branch review**

Generate one review package from merge base `4d3fe3167c8df14d0ca30a51d29362e330b0a65d` to the final HEAD. The reviewer must explicitly verdict the five follow-up findings and inspect concrete production wiring, retry entry paths, direct resume, all-merged implementation evidence, and every one-ID read shape. No merge, push, PR, or workspace cleanup occurs before an Approved verdict.
