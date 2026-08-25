# Eventra Multica adapter

This adapter composes the reusable five-role delivery blueprint with Eventra's
two authoritative local repositories. It is local-development automation only;
production deployment is not implemented and remains a human action.

## Inputs and safe execution

The provisioner requires a Multica `runtime_id` and `daemon_id`:

```bash
python3 -m tools.multica.provision --runtime-id RUNTIME_ID --daemon-id DAEMON_ID
```

That command is a dry run by default. Review its planned reconciliation before
using `--apply` to create or update Multica state:

```bash
python3 -m tools.multica.provision --runtime-id RUNTIME_ID --daemon-id DAEMON_ID --apply
```

Use `--prompt-backend-env` only when Backend Engineer and Integration QA need
the local backend environment. It prompts for the secret without echoing it
and passes it only through those agents' custom environment. Do not put a
secret in shell history, Issue text, logs, pull-request descriptions, or a
tracked environment file.

## Contract recovery runbook

Use this sequence only after an interrupted Eventra reconciliation. Do not
substitute identifiers from shell history or infer resource state from a prior
command's argv. The read-only audit is scalar-free: its output may establish
only JSON structure, keys, array lengths, and target-ID equality. If the
authoritative resource read cannot prove the worktree execution mode and
local-path state, stop before any mutation. Obtain a supported authoritative
read contract; do not guess from a create or update command.

Reusable recovery commands keep identifiers as placeholders:

1. Audit scalar-free read shapes before any recovery action.

```bash
python3 -m tools.multica.contract_audit \
  --runtime-id RUNTIME_ID \
  --daemon-id DAEMON_ID
```

2. Confirm the planned reconciliation without mutation.

```bash
python3 -m tools.multica.provision \
  --runtime-id RUNTIME_ID \
  --daemon-id DAEMON_ID
```

For the approved Eventra recovery target only, run the following in this exact
order after the audit and dry run succeed:

3. Run one recovery apply; it does not prompt for backend environment input.

```bash
python3 -m tools.multica.provision \
  --runtime-id de500649-cada-4419-9d5d-279045e2eaae \
  --daemon-id 019fab98-bbad-7d17-b0b7-26e56dbe1b6f \
  --apply \
  --reuse-backend-env
```

4. Prove idempotency with a normal apply and no environment-mode flag.

```bash
python3 -m tools.multica.provision \
  --runtime-id de500649-cada-4419-9d5d-279045e2eaae \
  --daemon-id 019fab98-bbad-7d17-b0b7-26e56dbe1b6f \
  --apply
```

The final command must report a `mutation_count` of `0`. If either apply
fails, stop; inspect only sanitized shapes and resume from verified state. Do
not delete or roll back partially reconciled resources automatically.

`--reuse-backend-env` reads the exact existing Backend Engineer custom
environment in the same process, validates it, and forwards that dictionary
only through stdin to Backend Engineer and Integration QA. It never puts an
environment value in argv, files, logs, exceptions, reports, or this runbook.

Merge recovery changes only through the personal `codeExploreHub/Eventra`
fork. Production deployment is a separate manual production deployment action;
this local-recovery process never deploys production.

## Inspection and reconciliation

Use the Multica CLI JSON views to inspect the resulting state, substituting
the identifiers printed by the provisioner. Multica 0.4.31 uses `--output
json`, positional object IDs, singular `squad member` and `project resource`
commands, and workspace-scoped list commands without runtime or daemon
filters:

```bash
multica runtime list --output json
multica daemon status --output json
multica agent list --output json
multica agent get AGENT_ID --output json
multica agent skills list AGENT_ID --output json
multica squad get SQUAD_ID --output json
multica squad member list SQUAD_ID --output json
multica project get PROJECT_ID --output json
multica project resource list PROJECT_ID --output json
multica skill list --output json
multica skill get SKILL_ID --output json
```

Compare every listed skill origin with the public GitHub URL map in
`eventra_adapter.py`. A pre-existing skill with the same name but a different
origin is a hard stop: resolve it explicitly before applying again. The
provisioner makes additive bindings with `agent skills add`; it never invokes
`agent skills set`, so it does not replace existing bindings.

Multica 0.4.31 permits only one `local_directory` per Project on the same
daemon. The adapter therefore maintains two fixed Projects under one Squad:
`Eventra Local Development` is the parent-Issue entry point and owns the
frontend worktree; `Eventra Backend Local Development` owns the backend
worktree and backend child Issues. The nested frontend `Backend` directory is
forbidden. Re-running a dry run or an already-applied matching configuration
is reconciliation, not permission to create duplicates.

## Delivery operation

Use the project context and each repository's `AGENTS.md` as the operating
contract. Frontend work uses `npm run test:local-contract`, `npm run
dev:local`, and `npm run smoke:local`; backend work uses
`scripts/test-local.sh`, `scripts/run-local.sh`, and
`scripts/smoke-local.sh`. Cross-stack work freezes the API contract first,
keeps one pull request per repository, and records exact reviewed and tested
commit SHAs. A partial two-repository merge stops immediately and requires
human escalation; it does not trigger rollback or deployment.

Cross-stack gates respect the one-worktree Project boundary. Reviewer tasks run
once per Project and are combined by Delivery Lead. QA verifies the backend SHA
in the backend Project, then Backend Engineer keeps that verified SHA running
on port 8080 while Integration QA tests the frontend SHA from the frontend
Project through the shared daemon network. If the exact service handoff cannot
be maintained and verified, the gate blocks rather than being waived.

## Native Stage automation and Watcher

The native Stage barrier is the primary wakeup path. Every execution child
finishes with `python3 -B -m tools.multica.workflow finish-phase`; Delivery Lead
uses `python3 -B -m tools.multica.workflow plan-parent` after Multica wakes the
parent. Phase `done` means execution finished, while metadata records
`pass|fail|blocked`. FAIL and BLOCKED therefore wake the parent instead of
leaving a child permanently `in_review`.

When planning returns `complete_parent`, Delivery Lead runs
`python3 -B -m tools.multica.workflow finish-parent PRO-M`. The helper reads the
authoritative merged-smoke state twice, refuses human-approval or changing
state, and moves a verified unattended local-development parent directly to
`done`. It does not deploy production.

Provisioning reconciles one run-only **Eventra · Stalled Work Watcher** with a
30-minute `Asia/Shanghai` schedule. Its rendered task invokes
`python3 -B -m tools.multica.workflow watch` for only the two configured
Projects. It performs at most one verified rerun and is a recovery fallback,
not a second coordinator.

For the one-time existing PRO-35 recovery, first merge and apply these updated
instructions and prove the second apply reports zero mutations. Reread PRO-35,
PRO-36, PR #6, current head, and runs, then invoke exactly once:

```text
multica issue rerun PRO-35 --output json
```

The updated Delivery Lead must recover the existing PRO-36 assignment and PR;
it must not create another child or PR. Do not manually mark PRO-36 PASS. The
Frontend Engineer records the real build result, posts evidence, and calls
`finish-phase`. Native Stages then drive review, QA, bounded repair, merge, and
local smoke. Production remains untouched.

## Pilot dispatch and evidence runbook

Use [the pilot Issue bodies](../../docs/multica/pilot-issues.md) to exercise
the `frontend-only`, `backend-only`, and `cross-stack` routing modes. For each
pilot, create one parent Issue, bind it to `Eventra Local Development`, assign
it to `Eventra Local Delivery`, and move it from backlog to todo. The Delivery
Lead keeps frontend children there, routes backend children to `Eventra Backend
Local Development`, keeps the parent in progress, and records all evidence
before closure.

Each implementer hands the Delivery Lead its repository, branch, PR, changed
paths, commands and exit codes, concerns, and an exact SHA. The Delivery Lead
sends that immutable SHA (or the cross-stack SHA pair) to Independent Reviewer
and Integration QA. Their decisions apply only to those exact SHAs; any new
commit repeats the affected gate. The full per-pilot test matrix, frozen API
contracts, cross-stack `buildVersion` variant, and copy-ready Issue text are in
the linked runbook.

Automatic merge is permitted only when the final exact SHA set has passed the
required tests, builds, repository checks, independent review, Integration QA,
and mergeability checks. Cross-stack PRs wait for one coordinated gate decision
and merge in API-compatible order; a partial merge stops and escalates. After
merge, record merged local smoke evidence. Local services may be started for
that smoke test, but production deployment remains human-triggered and is never
automatic.
