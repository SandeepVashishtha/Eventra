# Eventra unattended Multica delivery design

Date: 2026-08-25
Status: approved by user

## Problem and observed evidence

Eventra's five-agent Squad can classify a parent Issue and delegate an
implementation child, but the first real pilot stopped after implementation.
For PRO-35 and PRO-36, Multica reported all of the following at the same time:

- the PRO-36 Agent run was `completed`;
- PRO-36 itself was `in_review`;
- PRO-35 Stage 1 reported `done: 0/1`;
- the Delivery Lead received no successor run; and
- no second `squad_leader_evaluated` activity appeared on PRO-35.

Multica 0.4.33 documents the native rule on `issue create --stage`: the parent
assignee is woken only when every sub-Issue in a stage finishes. The current
instructions confuse run completion, phase completion, and gate approval, so
the stage barrier never opens.

Autopilot 0.4.33 supports schedule and webhook triggers, but not an internal
Issue-status event trigger. The native stage barrier must therefore be the
primary event-driven coordinator. A scheduled Autopilot is only a bounded
recovery safety net.

## Goals

- Advance ordinary frontend-only, backend-only, and cross-stack Issues without
  human coordination after the parent is assigned to the Squad.
- Use Multica's native ordered stage barrier to wake Delivery Lead immediately.
- Automate implementation, independent review, Integration QA, bounded repair,
  merge, and merged local smoke verification.
- Preserve exact-SHA evidence: a verdict applies only to the SHA it names.
- Make every transition idempotent so retries and the Watcher do not duplicate
  children, runs, comments, PRs, or merges.
- Keep production deployment human-triggered.
- Escalate only ambiguity, new authority or secrets, partial merge, or exhausted
  bounded repair.

## Non-goals

- No production deployment automation.
- No waiver of independent review, QA, required tests, or mergeability checks.
- No generic workflow engine for unrelated Multica teams in this change.
- No destructive cleanup of user worktrees, branches, stashes, or unknown local
  processes.
- No replacement for GitHub or Multica as a source of current state.

## Authority boundary

The user has approved automatic merge after quality gates. Delivery Lead may
coordinate Issues and merge an approved PR, but may not edit business code or
deploy production. Implementers may edit only their assigned repository.
Independent Reviewer and Integration QA may record verdicts but may not approve
their own implementation. The Watcher may recover an existing intended run; it
may not invent work, waive a gate, merge, or deploy.

Human input is required only for:

- ambiguous or conflicting requirements;
- a new credential, permission, destructive action, or external authority;
- two exhausted complete repair rounds;
- a partial cross-repository merge; or
- production deployment.

## Core semantic rule

An Issue status and a phase verdict have different meanings:

- child Issue `done` means the assigned phase execution has finished and its
  evidence is ready for the parent coordinator;
- `eventra.phase.result=pass|fail|blocked` describes the phase outcome; and
- only Delivery Lead may interpret the complete evidence set and advance or
  close the parent.

Therefore a review child that finds a defect finishes as `done` with result
`fail`. It must not remain `in_review`, because doing so permanently closes the
native stage barrier. Likewise, a completed diagnostic attempt may finish with
result `blocked`; `done` does not falsely claim that the delivery passed.

## Structured metadata contract

Every staged child uses string-valued Issue metadata:

| Key | Values / meaning |
| --- | --- |
| `eventra.workflow.version` | Exact supported contract version, initially `1` |
| `eventra.phase.kind` | `implementation`, `review`, `qa`, `repair`, or `smoke` |
| `eventra.phase.result` | `pass`, `fail`, or `blocked` |
| `eventra.phase.sha.frontend` | Exact 40-character frontend SHA when affected |
| `eventra.phase.sha.backend` | Exact 40-character backend SHA when affected |
| `eventra.phase.attempt` | Repair attempt number, starting at `0` |
| `eventra.phase.evidence_comment` | Comment UUID containing the full handoff |
| `eventra.phase.pr` | Canonical PR URL for implementation or repair |

The parent records:

| Key | Meaning |
| --- | --- |
| `eventra.workflow.classification` | `frontend-only`, `backend-only`, or `cross-stack` |
| `eventra.workflow.next_stage` | Next stage ordinal Delivery Lead is allowed to create |
| `eventra.workflow.attempt` | Current repair attempt |
| `eventra.workflow.frontend_sha` | Current candidate frontend SHA |
| `eventra.workflow.backend_sha` | Current candidate backend SHA |
| `eventra.workflow.merge_state` | `not_ready`, `ready`, `merged`, or `partial` |
| `eventra.workflow.last_action` | Stable action key used for retry deduplication |

Values are passed with explicit `--type string`. Secrets, environment names,
raw webhook payloads, tokens, and prompt content are forbidden metadata.

## Stage state machine

### Parent initialization

The user creates one parent in **Eventra Local Development**, assigns it to
**Eventra Local Delivery**, and moves it to `todo`. Delivery Lead:

1. validates scope and acceptance criteria;
2. classifies repository impact;
3. records parent workflow metadata;
4. moves the parent to `in_progress`; and
5. creates every affected implementation child in Stage 1.

Frontend children stay in **Eventra Local Development**. Backend children are
created in **Eventra Backend Local Development** with the same parent and stage.

### Stage 1: implementation

Each implementer works test-first, commits, opens one PR for its repository,
and posts the required exact-SHA handoff. The PR body must contain exact close
intent for its implementation child (`Closes PRO-N`) and a related-parent link
(`Related to PRO-M`) so Multica/GitHub can discover the PR instead of relying
only on a pasted URL.

Before setting the child to `done`, the implementer writes the complete metadata
contract and verifies it by reading it back. A successful implementation uses
`pass`. A finished attempt with an unmet mandatory check uses `blocked`; a
known implementation defect uses `fail`. Every child then becomes `done`,
opening the Stage 1 barrier after the last affected repository finishes.

### Stage 2: independent gates

When awakened, Delivery Lead rereads all Stage 1 Issues, evidence comments,
linked PRs, and exact current heads. It rejects missing or inconsistent
evidence. If implementation evidence is acceptable, it creates in one new
stage:

- one Independent Reviewer child for each affected repository; and
- the required Integration QA child or children for the same exact SHA set.

For frontend-only or backend-only delivery, review and QA may execute in
parallel. For cross-stack delivery, Reviewer tasks remain per-Project.
Integration QA follows the existing same-daemon service handoff: verify the
backend candidate, have Backend Engineer keep that exact SHA running on port
8080, then verify the frontend candidate against `localhost:8080`.

Review and QA children always finish as `done` with `pass`, `fail`, or
`blocked`, exact SHAs, commands, exits, and evidence-comment metadata.

### Repair stages

If any gate is not `pass`, Delivery Lead creates exactly one repair stage for
the owning repository or repositories. The repair child receives every finding,
the rejected SHA, current PR, and attempt number. It updates the existing PR,
produces a new exact SHA, and finishes with structured evidence.

Delivery Lead then creates a fresh review/QA stage for the replacement SHA set.
No earlier PASS carries forward. At most two complete repair attempts are
allowed. After the second fresh gate set still fails, the parent becomes
`blocked` with the exact evidence and required human decision.

Stage ordinals are monotonically increasing and never reused. Delivery Lead
reads `eventra.workflow.next_stage`, validates that no children already occupy
the proposed action key, creates the complete barrier group, and only then
advances the metadata value.

### Merge and smoke

Delivery Lead may automatically merge only when all of these current facts
agree:

- every affected implementation/repair PR head equals the exact candidate SHA;
- all Reviewer verdicts for that SHA set are `pass`;
- all Integration QA verdicts for that SHA set are `pass`;
- every required local test/build and configured repository check passes;
- each PR is open and mergeable; and
- no new commit has invalidated a verdict.

Cross-stack PRs merge consecutively in API-compatible order after one combined
gate decision. If the second merge fails after the first succeeds, Delivery
Lead records `merge_state=partial`, blocks the parent, and stops without deploy
or automatic revert.

After merge, Delivery Lead creates a smoke stage assigned to Integration QA.
QA verifies the merged frontend/backend SHA set locally, records `pass|fail|
blocked`, and finishes the child. On PASS, Delivery Lead records merged SHAs and
sets the parent to `done`. On failure it routes bounded repair or blocks under
the same attempt policy. Production remains untouched.

## Idempotency and concurrency

Every coordinator action has a stable key derived from parent identifier,
workflow version, stage kind, attempt, repository scope, and exact SHA set.
Before acting, Delivery Lead and Watcher reread:

- parent metadata;
- all staged children;
- active and terminal runs;
- comments and evidence UUIDs;
- linked PRs and current heads; and
- current merge state.

If the action already exists or a matching run is queued, dispatched, running,
or waiting for a local directory, they do nothing. They never create a parallel
repair PR or a duplicate stage. A stale branch name or status claim is not
evidence.

## Eventra stalled-work Watcher

Provision one active run-only Autopilot named **Eventra · Stalled Work
Watcher**, assigned to Delivery Lead and associated with **Eventra Local
Development**. It runs every 30 minutes in `Asia/Shanghai`.

The native stage barrier remains the primary path. The Watcher only detects and
recovers factual drift:

- a fully finished stage with no successor leader run after its final activity;
- `in_progress` or non-human `in_review` work with no matching active run;
- a completed run whose Issue never received its required metadata/terminal
  transition;
- a merged PR or completed gate whose Issue state is stale; or
- an active parent with no executable successor.

For an eligible Issue it performs at most one action: rerun the existing
intended assignee or parent coordinator. It verifies a new task ID and active
run state before reporting recovery. It does not increment repair attempts for
dispatch recovery. It ignores healthy active runs and structured human approval
waits. All reads and actions are limited to the two Eventra Projects and this
workflow version.

The Watcher stores no secret and accepts no webhook. Its provisioned schedule
and description are reconciled idempotently and audited with scalar-safe CLI
contracts.

## Component changes

### Agent and Squad instructions

Update Delivery Lead, Frontend Engineer, Backend Engineer, Independent Reviewer,
Integration QA, Squad, and both Project contexts with the terminal phase rule,
metadata schema, stage construction, retry limits, idempotency checks, and merge
authority.

### Provisioner and contract audit

Extend the Eventra adapter with the one Watcher specification. Extend strict CLI
contracts and reconciliation for:

- `autopilot list/get/create/update`;
- `autopilot trigger-add/update`; and
- authoritative post-write reads.

Dry-run remains mutation-free. Apply creates or updates only the exact-name
Eventra Watcher and its exact schedule trigger, preserving unrelated Autopilots.
A second apply must report zero mutations. Audit output remains scalar-free and
never requests webhook secrets.

### Documentation and pilot

Update the operator runbook and pilot Issues with exact stage semantics. PRO-35
is the first recovery pilot after deployment: reread PRO-36 and PR #6, record
the existing build blocker, then rerun Delivery Lead exactly once. Do not mark
the implementation PASS or merge until the missing build and all new exact-SHA
gates pass.

## Failure handling

- Missing metadata, malformed SHA, absent evidence comment, unlinked PR, or
  conflicting current head fails closed and wakes/blocks the coordinator.
- A transient command or network failure receives one bounded same-phase retry;
  repeated failure becomes a structured `blocked` result for Delivery Lead.
- A child left nonterminal after a completed run is recovered by the Watcher;
  the Watcher does not fabricate its verdict.
- Unknown local port ownership is never terminated. Only the process owner may
  stop the exact service it started.
- A Multica CLI contract change stops provisioning before mutation and requires
  a sanitized contract update.

## Testing and verification

Stateful fake-CLI tests must prove:

- a completed run with an `in_review` child reproduces the PRO-35 stall;
- every child in a stage becoming `done` produces one parent successor action;
- FAIL verdicts wake the parent and create one repair stage, not a merge;
- replacement SHAs invalidate all earlier verdicts;
- two failed complete repair rounds block without a third;
- duplicate leader/Watcher executions create no duplicate child, run, PR, or
  merge action;
- a partial cross-stack merge stops safely;
- Watcher creation, update, and second-apply idempotency;
- malformed Autopilot and trigger responses fail closed; and
- no secret or scalar audit value appears in argv, output, exceptions, or files.

Connected verification must demonstrate:

1. scalar-free read audit passes on Multica 0.4.33;
2. provisioner dry-run has zero mutations;
3. one apply updates instructions and creates the Watcher;
4. a following normal apply reports `mutation_count=0`;
5. PRO-35 resumes through Delivery Lead without a user review action;
6. review and QA Agents issue exact-SHA verdicts;
7. merge occurs only if every gate passes; and
8. no production deployment occurs.

## Acceptance criteria

- Ordinary delivery advances from Stage 1 through review, QA, bounded repair,
  merge, and smoke without human coordination.
- Parent wakeups use native stage completion; Watcher intervention is visible
  and exceptional.
- `done` is never interpreted as PASS without matching structured evidence.
- Every automatic merge is supported by current exact-SHA review, QA, tests,
  checks, and mergeability evidence.
- Human involvement is limited to the approved authority boundary.
- Existing Eventra repositories, secrets, Project resources, user stash, and
  production environment remain safe.
