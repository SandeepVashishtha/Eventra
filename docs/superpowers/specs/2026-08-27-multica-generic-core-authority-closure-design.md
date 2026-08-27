# Multica Generic Core Authority Closure Design

## Context

This follow-up closes five load-bearing findings left by the final review of
`docs/superpowers/plans/2026-08-26-multica-generic-core.md`. It extends, rather
than replaces, the approved generic multi-repository delivery design in
`2026-08-26-multica-generic-multi-repo-delivery-skill-design.md`.

The current branch already has strict manifests, typed metadata, exact-SHA
GitHub evidence, idempotent workflow mutations, controlled local processes,
Eventra compatibility, and 460 passing tests. The remaining defects share one
cause: authority is enforced at one callback or protocol boundary but can be
bypassed by a retry, a direct wakeup, or an untrusted implementation.

## Goal

Make merge recovery, local smoke execution, Stage progression, post-merge
evidence handling, and public Multica reads authoritative across every entry
path and retry.

## Non-goals

- Do not add deployment or rollback behavior.
- Do not automatically run `git checkout`, `git reset`, or mutate a product
  repository's working tree.
- Do not create temporary Git worktrees or copy untracked local environment
  files.
- Do not implement the Plan 2 CLI or framework upgrade flow.
- Do not change Eventra compatibility IDs, skill bindings, or legacy payloads.
- Do not add another generic command escape hatch.

## Design principles

1. A retry derives truth from authoritative external reads, never from the
   previous mutation response.
2. Authority belongs to concrete boundary code. A caller cannot make evidence
   authoritative merely by returning the expected fields from a test-shaped
   protocol.
3. Progression gates live at the central state-transition entry point, not only
   in one callback that happens to call it.
4. Once all pull requests are merged, missing pre-merge evidence is corruption
   requiring human action, not work that can be recreated against merged
   history.
5. Every token in an allowed command shape is validated for both position and
   grammar before a runner sees it.

## 1. Authoritative merge-prefix recovery

`GenericWorkflow.execute_merge_plan()` will scan every pull request in the
confirmed merge order before it preflights or mutates a resumed merge.

For each repository, the scan validates:

- exact GitHub repository and pull-request number;
- exact candidate head SHA;
- state is one of the closed domain values;
- a merged pull request has both `merged_at` and a valid
  `merge_commit_sha`;
- merged pull requests form one contiguous prefix of the confirmed order.

The recovered mapping stores merge commit SHAs, not candidate head SHAs. If it
extends the persisted prefix, the workflow records a distinct monotonic
`merge:recover:<repository>` transition and authoritatively rereads it before
continuing. It then preflights only the unmerged suffix.

The following fail closed without overwriting a true prefix:

- any pull-request read is unavailable or malformed;
- the persisted prefix is not a prefix of the authoritative observation;
- a later pull request is merged while an earlier one is unmerged;
- a merged pull request has the wrong head SHA or no merge commit SHA.

Unreadable and non-contiguous observations return structured uncertainty for
human inspection. They never write `blocked` with an empty `merged_shas` map.
A complete recovered prefix is finalized as `merged` without issuing another
merge mutation.

## 2. Concrete local exact-SHA command boundary

Create `tools/multica_delivery/exact_sha.py` with a concrete
`LocalExactShaCommandRunner`. The class, rather than an injected protocol,
owns SHA verification and command execution.

The only injectable seam is a low-level closed command backend used by tests.
The production backend invokes `subprocess.run()` with:

- an immutable argv tuple converted directly to a list;
- `shell=False`;
- an explicit working directory;
- stdin disabled;
- captured output that is never copied into workflow metadata or errors.

`LocalExactShaCommandRunner` validates each manifest repository by executing
exactly `("git", "rev-parse", "HEAD")`, requiring exit code zero and exactly
one lowercase 40-character SHA line. It validates all candidate repositories:

1. before any service starts;
2. after all services start;
3. immediately before each repository or integration smoke command;
4. immediately after each command returns.

The command working directory must equal the manifest path for its declared
repository. A nonzero command exit is an authoritative test failure only when
the before-and-after SHA bindings are valid. Git failure, malformed output,
wrong SHA, a checkout changing during startup, or a checkout changing during a
command yields blocked, non-authoritative evidence.

`OwnedSmokeExecutor` accepts a `LocalExactShaCommandRunner`. If none is
provided, it constructs the production runner. Tests use the real concrete
runner with a deterministic fake low-level backend; arbitrary objects that
self-report `ExactShaVerification` are rejected.

This boundary never checks out a commit. Operators or Agents must place every
local repository at the exact merged candidate before smoke. A mismatch blocks
and explains which repository failed without exposing command output or
environment values.

## 3. Central Stage terminal barrier

`GenericWorkflow.resume_parent()` becomes the single enforcement point for
successor Stage progression.

Before it dispatches a `REPAIR` or any successor work, it compares the current
metadata Stage ordinal and attempt with the current child set and
`active_work`. If any child belonging to that Stage is still active or not
terminal, the result is `wait` with zero mutation. Only after the complete
Stage is terminal may the workflow aggregate all findings and allocate the one
shared next repair attempt.

`record_phase_completion()` may keep an early no-op optimization, but correctness
must not depend on that callback. Direct watcher, timer, status, or operator
wakeups through `resume_parent()` obey the same barrier.

Historical children from older Stage ordinals do not block the current Stage.
Malformed active-work relationships continue to fail through the existing
state-integrity checks.

## 4. Comprehensive all-merged consistency gate

`decide_parent_action()` performs an all-merged consistency gate immediately
after it establishes merge coherence and before implementation dispatch or
repair logic.

For every affected repository and required integration suite, the gate
requires current, exact-candidate evidence for:

- implementation completion;
- independent review;
- repository QA;
- required integration QA.

Missing, pending, failed, blocked, stale, wrong-attempt, or wrong-SHA evidence
returns `BLOCK` for human action. It never returns `DISPATCH` or `REPAIR` after
all pull requests are merged. Only a complete, coherent pre-merge evidence set
can advance an all-merged parent to smoke or completion evaluation.

Pre-merge behavior is unchanged: missing evidence may still dispatch work and
terminal failures may still consume the shared repair attempt after the Stage
barrier is satisfied.

## 5. Closed public Multica identifier grammar

Every public one-ID read command uses one shared stable identifier validator.
The accepted grammar is:

```text
[A-Za-z0-9][A-Za-z0-9._:-]{0,255}
```

The identifier cannot be empty, start with `-`, contain whitespace, contain a
slash, or add another argv token. `_is_public_read()` validates the complete
command shape and the ID token before invoking the runner. Typed mutation
methods remain the only mutation surface.

Table-driven tests cover every public one-ID read prefix with a valid UUID and
with option-like values such as `--all`, `--help`, and `-x`. Rejection occurs
before the fake runner records a call.

## Failure semantics

- Unreadable merge truth: `uncertain`, zero destructive or compensating write.
- Non-contiguous remote merge: `uncertain` for human inspection, preserving any
  already authoritative local prefix.
- Checkout-binding failure: blocked/non-authoritative smoke evidence; owned
  processes are cleaned up only through verified process ownership.
- Active sibling in the current Stage: `wait`, zero successor mutation.
- Missing evidence after merge: human `BLOCK`, no new child or repair.
- Invalid Multica ID token: local boundary error, runner call count remains
  zero.

## Test strategy

Tests must be written and observed failing before production changes.

### Merge recovery

- First merge commits; acknowledgement and immediate reread are unavailable;
  retry recovers the authoritative prefix and continues without re-merging it.
- Full remote prefix is recovered and finalized without a merge call.
- Unavailable, wrong-head, missing-commit-SHA, and non-contiguous observations
  never become blocked-empty.

### Concrete runner

- Use real temporary Git repositories for the production subprocess backend.
- Stale HEAD before startup prevents service startup.
- HEAD changes after startup, before a command, or during a command prevent
  authoritative PASS.
- Nonzero or malformed `git rev-parse` output fails closed.
- A smoke command's nonzero exit is an authoritative FAIL only when both SHA
  observations match.
- An arbitrary self-reporting fake cannot be passed as the trusted runner.

### Workflow and decisions

- Direct `resume_parent()` with one failed and one active same-Stage child
  waits and creates no repair.
- When the sibling becomes terminal, one aggregated repair attempt is created.
- An all-merged snapshot independently missing implementation, review,
  repository QA, or integration QA evidence blocks and creates no child.

### Multica command boundary

- Every one-ID read shape accepts a valid ID.
- Every one-ID read shape rejects option-like, whitespace, slash, empty, and
  extra-token variants before runner execution.

## Compatibility and security

- Existing Eventra adapter tests and all generic tests remain green.
- No live Multica or GitHub calls run in tests.
- Temporary Git repositories contain synthetic commits only.
- No secret value, command output, environment value, or webhook body is
  persisted or included in errors.
- No merge rollback, deployment, automatic checkout, reset, push, or repository
  write is introduced.

## Acceptance criteria

1. Each of the five residual review findings has a focused RED-to-GREEN
   regression.
2. The production exact-SHA runner is concrete and is the default
   `OwnedSmokeExecutor` wiring.
3. Merge retry recovers and persists an authoritative contiguous prefix before
   any preflight or merge mutation.
4. Direct parent resume cannot bypass the current Stage barrier.
5. All-merged missing implementation evidence cannot dispatch work.
6. Option-like tokens cannot occupy any public Multica ID slot.
7. The complete `tools` test suite, compileall, `git diff --check`, and safety
   scans pass from the final commit.
8. A fresh whole-branch review reports no Critical or Important findings.
