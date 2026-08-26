# Eventra independent workflow Watcher design

Date: 2026-08-26
Status: approved by user

## Problem and observed evidence

Eventra's stalled-work Autopilot is currently assigned directly to **Eventra
Delivery Lead**. Both the scheduled recovery run and parent-Issue coordination
therefore consume the same Agent's single task slot. This creates avoidable
queueing between the delivery control plane and its recovery safety net.

The scheduled Watcher is also failing before it can inspect a parent Issue.
The exact Multica 0.4.34 error is caused by passing
`eventra.workflow.version="1"` directly to the `--metadata strings` flag. Cobra
parses that flag as a CSV-backed string slice, so an embedded JSON quote must
be escaped as a quoted CSV field. A host-level read-only reproduction showed:

- the current argument exits with a CSV parse error;
- an unquoted value succeeds but is interpreted as the JSON number `1` and
  does not match string-valued workflow metadata; and
- the CSV-escaped string argument returns the active PRO-45 parent.

This design supersedes only the Watcher assignment described in
`2026-08-25-eventra-unattended-delivery-design.md`. The unattended delivery
state machine, quality gates, bounded recovery rules, automatic development
merge authority, and human-triggered production deployment remain unchanged.

## Goals

- Give scheduled recovery a dedicated task slot that cannot delay Delivery
  Lead or be delayed by ordinary parent-Issue coordination.
- Keep the five-role delivery Squad unchanged and reusable.
- Preserve the existing Watcher Autopilot and schedule identities while
  migrating only its assignee.
- Fix the Multica 0.4.34 string-metadata query without changing the stored
  metadata contract.
- Keep reconciliation dry-run-first, idempotent, exact-name scoped, and free of
  secret leakage.
- Preserve the Watcher's existing fail-closed, at-most-one-recovery behavior.

## Non-goals

- No increase to Delivery Lead concurrency.
- No second Squad and no sixth delivery-team member.
- No change to Issue classification, stage progression, quality gates, merge
  policy, repair limits, or production deployment policy.
- No backend credential, mail credential, or JWT secret for the Watcher.
- No mutation, restart, cancellation, or special handling of PRO-45 or PRO-46.
- No cleanup of unrelated Agents, Squads, Autopilots, triggers, worktrees,
  branches, or local processes.

## Selected architecture

Provision one workspace-visible operational Agent named **Eventra Workflow
Watcher** on the same local worktree-capable runtime. It has
`max_concurrent_tasks=1`, receives no custom environment, and is not a member of
**Eventra Local Delivery**.

The reusable blueprint distinguishes two categories explicitly:

- `agents`: the five delivery Agents that are eligible for Squad membership;
- `operational_agents`: infrastructure Agents that may own Autopilots but must
  never receive Squad Issue routing.

The standard multi-repository blueprint defines one project-neutral
`workflow_watcher` operational role. Eventra composes its stack-specific skills
onto delivery roles as before and exposes the combined Agent catalog to the
Provisioner. Squad reconciliation continues to derive its exact member set
only from `blueprint.agents`, so the operational Agent cannot enter the Squad by
accident.

The Watcher Agent receives only these approved public skills:

- `using-superpowers`;
- `systematic-debugging`; and
- `verification-before-completion`.

It does not receive planning, implementation, worktree, nested-dispatch,
frontend, backend, security, review, or deployment skills. Persistent Agent
instructions restrict it to executing and verifying the bounded workflow
recovery command. It may report a deterministic failure but may not edit
business code, create delivery work, waive a gate, review a PR, merge, or
deploy.

## Provisioning and migration

The Eventra Watcher specification names `workflow_watcher` as its target role.
The Provisioner creates or reconciles all six named Agents and their additive
public-skill bindings, but reconciles exactly five Squad members.

Autopilot reconciliation resolves the assignee from the Watcher specification
instead of from `blueprint.leader_role`. For the existing exact-title
**Eventra · Stalled Work Watcher**, it performs an in-place `autopilot update`
that changes the assignee to **Eventra Workflow Watcher** while preserving:

- the Autopilot ID;
- run-only execution mode;
- frontend Project association;
- active status;
- the existing schedule trigger ID;
- cron expression `*/30 * * * *`;
- timezone `Asia/Shanghai`; and
- the existing bounded run description after Project-ID rendering.

If any other desired field has drifted, normal authoritative reconciliation
updates it. Unrelated Autopilots and triggers are never targeted. A second
apply against the converged state must produce zero mutations.

The new operational Agent is not a backend-environment recipient. Existing
backend environment validation remains exact: only Backend Engineer and
Integration QA may receive `JWT_SECRET`, `MAIL_USERNAME`, and `MAIL_PASSWORD`.
Applying this migration may reuse the already reconciled recipient environment
and does not require exposing it to the Watcher.

## Multica 0.4.34 metadata compatibility

The workflow parent listing keeps server-side Project, status, and metadata
filtering. The string value is encoded for the CLI's CSV-backed `strings` flag
as a quoted CSV field whose internal JSON quotes are doubled. This preserves
the intended JSON string comparison rather than silently querying the numeric
value `1`.

The Python runner continues to pass arguments as an argv list without a shell.
No secret, Issue body, or arbitrary user value is interpolated into the fixed
filter. Pagination, top-level-parent filtering, deterministic ordering, and
two-Project scoping remain unchanged.

## Safety and concurrency

The independent Agent removes task-slot contention but does not make recovery
more aggressive. Every scheduled run still:

1. reads only the two configured Eventra Projects;
2. considers only workflow version `1` parents in `in_progress` or `in_review`;
3. rereads child, run, assignee, and phase evidence before deciding;
4. ignores healthy active work and human approval waits;
5. recovers at most one intended run; and
6. performs no merge, deployment, gate waiver, or direct business-code edit.

The Watcher and Delivery Lead may now execute concurrently. Existing
idempotency keys, active-run checks, and post-dispatch verification remain the
concurrency boundary: if Delivery Lead has already advanced the workflow, the
Watcher observes the new state and returns `noop`.

## Test strategy

Automated tests must prove all of the following:

- the reusable blueprint contains five ordered delivery roles plus one
  project-neutral operational Watcher role;
- Eventra creates six Agents but exactly five Squad members;
- the operational Agent has the minimal approved public-skill set and no
  backend environment;
- a fresh Watcher Autopilot targets the operational Agent;
- an existing Watcher migrates in place without replacing its Autopilot or
  trigger IDs;
- unrelated Agents, Squad members, skills, Autopilots, and triggers remain
  untouched;
- malformed target state still fails before unsafe mutation;
- the fixed CLI argument queries string-valued workflow version `1` metadata;
- pagination and at-most-one recovery behavior remain intact; and
- a second complete Provisioner apply has zero mutations.

The full `tools.multica` unit suite, contract audit, operator-document tests,
and compile/static checks run before any live apply. A dry run against the live
runtime must identify the existing objects and remain mutation-free. After
apply, read-only checks verify the new Agent, unchanged five-person Squad,
preserved Autopilot and trigger IDs, migrated assignee, active schedule, and a
successful bounded Watcher execution.

## Rollout and rollback

Rollout is additive first: create and verify the independent Agent and skill
bindings, then update the existing Autopilot assignee. No schedule overlap is
introduced because no second Autopilot or trigger is created.

If live post-write verification fails, the Provisioner stops and reports the
failed invariant without modifying Issue workflow state. The existing
Autopilot remains the only scheduled object. A rollback, if explicitly
authorized, is an in-place assignee update back to Delivery Lead; deleting the
new Agent or any Autopilot is outside this change and is not automatic.

## Acceptance criteria

- **Eventra Workflow Watcher** exists, is workspace-visible, has concurrency 1,
  and is not in **Eventra Local Delivery**.
- **Eventra Local Delivery** still contains exactly Delivery Lead, Frontend
  Engineer, Backend Engineer, Integration QA, and Independent Reviewer.
- The existing **Eventra · Stalled Work Watcher** and schedule trigger retain
  their IDs and target the new Agent.
- A scheduled or manually triggered Watcher run can list a string-versioned
  parent without the previous CSV parse failure.
- Delivery Lead and Watcher no longer share an Agent task slot.
- Re-running Provisioner after convergence performs zero mutations.
- No production deployment or unrelated local/project state is changed.
