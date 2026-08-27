# Generic Multica multi-repository delivery core

This document is the operator contract for the Plan 1 Python core in
`tools/multica_delivery`. The core models and coordinates one GitHub product
made of one or more repositories, one control Project, one Project and one
Engineer per managed repository, and one Multica daemon. It is a library
boundary, not the reusable onboarding skill or its command-line interface.

No generic user-facing CLI is implemented in this core. Plan 2 owns the
user-facing CLI confirmation boundary and the reusable
`multica-multi-repo-delivery` skill. Do not invent a command around a private
function or treat the module names below as executable entry points.

## Control repository inputs

The reviewed product manifest is authoritative and is stored at
`delivery-control/delivery.yaml`. Generated identities, compatibility
versions, and the manifest digest are stored separately at
`delivery-control/framework.lock`. Secret values belong in neither file: the
manifest names only environment variables and their permitted Agent roles.

`delivery.yaml` declares the instance and control repository, an
operator-approved skill registry, one to N managed repositories, local
commands and services, dependency edges, integration suites, merge order, and
policy. `framework.lock` records generated resource identities and version
compatibility; it is not a second source of desired state.

The manifest boundary is strict. It rejects unknown or duplicate fields,
invalid or duplicate repository/Project/path/port identities, missing required
commands, undeclared secrets or skills, non-public skill origins, invalid
dependency graphs and orders, an invalid repair budget, deployment, and
production automatic merge. Repository commands are argument arrays rather
than shell text.

Skill sources are operator-approved public GitHub URLs only. The framework
does not query or import from the company-internal SkillsHub. A same-name skill
from a different origin is a hard stop rather than an implicit replacement.

## Install and verify

From the control-repository root, install the one pinned dependency:

```bash
python3 -m pip install -r requirements-multica.txt
```

The pin is `PyYAML==6.0.2`. Run the complete legacy and generic test suite and
then compile both packages:

```bash
python3 -B -m unittest discover -s tools -p 'test_*.py' -v
python3 -B -m compileall -q tools/multica tools/multica_delivery
```

Importing modules and running tests never mutate Multica, GitHub, local
services, or secrets. Tests use in-memory fakes and temporary runtime state;
they do not contact live services.

## Public core boundary

Plan 2 may compose these tested interfaces without reading implementation
internals:

- `manifest.load_manifest`, `load_manifest_text`, `manifest_digest`, and
  `load_lock` decode the immutable `DeliveryManifest` and `FrameworkLock`.
- `topology.topological_waves` and `merge_order` enforce dependency-closed,
  deterministic execution and merge order.
- `metadata.encode_*` and `decode_*` exchange strict canonical JSON envelopes.
  Secrets, raw Issue bodies, tokens, and arbitrary object strings are not valid
  metadata.
- `decisions.decide_parent_action` is the pure parent state machine. Its
  evidence is tied to exact candidate SHAs and its repair budget is exactly two
  attempts.
- `contract_audit.audit_contracts` performs fixed, read-only capability and
  contract probes and returns pass/warn/fail entries.
- `Provisioner.reconcile(manifest, lock, apply=False, secret_lookup=...)`
  performs authoritative reads and returns a deterministic, redacted plan.
  It does not create or update Multica resources. Provisioning live effects
  require an explicit `apply=True` call. A converged second apply has
  `mutation_count == 0`; duplicate, foreign, malformed, or non-convergent state
  fails closed.
- `GenericWorkflow` consumes typed snapshots and injected adapters to intake a
  Backlog-to-Todo transition, dispatch dependency waves, record phase
  completion, resume the parent, merge an already-gated plan, run local smoke,
  and perform bounded stalled-work recovery. Its effects occur only when its
  explicit workflow methods are called; importing the module has no effect.
- `ProcessManager` starts, reuses, and stops local services only when its
  private runtime registry proves the same instance owner, Run, repository,
  exact SHA, PID, port, and health URL. An unknown or partially owned process
  blocks the operation and is never reused or terminated.

`MulticaClient` and `GitHubClient` are strict subprocess boundaries, not
general-purpose command runners. They accept closed argument shapes, validate
JSON responses, retry only bounded safe reads, redact failures, and restrict
GitHub operations to the manifest allowlist. Required checks, review, QA, and
merge evidence name the exact candidate SHA. No secret value belongs in argv,
logs, exceptions, Issues, comments, pull requests, reports, or the lock file.

Public one-ID reads accept only the exact full-match identifier grammar
`[A-Za-z0-9][A-Za-z0-9._:-]{0,255}`. Empty, option-like,
whitespace-containing, slash-containing, overlength, and extra-token forms are
rejected before the runner is called. Identifiers are not normalized,
lowercased, split, or aliased.

## Effect, merge, deployment, and Watcher policy

Dry-run is the default onboarding posture: audit contracts, validate local
inputs, and inspect `Provisioner.reconcile(..., apply=False, ...)` before any
approved apply. Only `Provisioner.reconcile(..., apply=True, ...)` authorizes
the planned Multica resource reconciliation. That approval does not authorize
GitHub repository creation, commit, push, business-code changes, pull-request
merge, or deployment.

In a development instance, development/local quality gates may authorize
automatic merge. Before merging, the current Core proves exact-SHA
implementation PASS evidence, independent review and repository/integration QA
evidence, required GitHub checks, and merge preflight. Multi-repository gates
pass before the first merge; merges then follow the confirmed
dependency-compatible order. A partial merge blocks without rollback.

`focused_test`, `test`, and `build` are manifest and Agent contracts, and
inputs for a future executor; the current Core neither executes them nor
records structured exact-SHA results for them. It accepts the implementation
phase verdict and evidence UUID that an Agent records for the candidate SHA;
it does not infer command execution from that PASS. After merging,
`OwnedSmokeExecutor` runs declared repository smoke and applicable integration
commands against the authoritative merged SHA map. Before starting any service,
and again after startup, it binds every local checkout with the closed argv
`git rev-parse HEAD`; stale or incomplete checkout evidence blocks command
execution. Every command result must also carry the same structured exact-SHA
map. `OwnedSmokeExecutor` trusts only the concrete
`LocalExactShaCommandRunner`; tests may inject only its closed command backend,
so a self-reporting runner cannot create authoritative smoke evidence. The
concrete boundary never checks out or resets a repository; operators or Agents
must place every checkout at the exact merged candidate. Unverified
owner-checked cleanup blocks every smoke result. It starts declared local
services only through `ProcessManager`, which blocks unknown or mismatched
process ownership. Merge write acknowledgements are never sufficient evidence:
the workflow authoritatively rereads the pull request and records its merged
timestamp and merge-commit SHA before advancing the ordered merge prefix.

This framework never deploys; deployment is always a separate, manually
triggered external action. The manifest requires `deployment: forbidden`.
In particular, production forbids automatic merge and deployment; Plan 1
contains no switch that weakens that restriction.

Each product has an independent Workflow Watcher Agent with concurrency one.
It is outside the delivery Squad, so its scheduled recovery cannot consume the
Delivery Lead's slot. The Watcher may reread only the configured Projects and
rerun at most one already-intended stalled assignment. It never creates work,
changes a repair attempt, waives a gate, edits business code, merges, rolls
back, or deploys.

## Eventra compatibility and migration boundary

The Eventra compatibility adapter remains operational at
`tools.multica.eventra_adapter`. `eventra_manifest(workspace)` translates the
existing local frontend/backend product into the generic immutable manifest;
the reviewed Eventra fixture verifies the same repositories, dependency and
merge order, local commands, public skill bindings, secret names, and
development/manual-deployment policy. Its pinned live IDs are immutable data;
loading the adapter or fixture performs no live call.

The existing `tools.multica` entry points remain the operational Eventra path
until the frontend-only, backend-only, and cross-repository compatibility
pilots demonstrate parity. Plan 1 does not migrate live resources, rewrite
active Issue metadata, create a control repository, push commits, or replace
the legacy entry points. Those actions require a later migration plan and
their own approval.

## Plan 2 lifecycle names

The approved Plan 2 public lifecycle reserves exactly these command names:

- `discover`: read selected repositories and classify findings as confirmed,
  inferred, or unknown;
- `init`: create only the approved local scaffold and manifest draft;
- `validate`: validate the manifest and local contracts without mutation;
- `plan`: perform read-only audits and produce a fresh mutation-free plan;
- `apply`: require the matching fresh plan plus explicit operator approval
  before external reconciliation;
- `doctor`: inspect contracts, instance health, recipient coverage, Watcher
  state, and convergence; and
- `upgrade`: plan a compatible framework/schema migration, verify it, and wait
  for approval before applying it.

These names are reservations, not currently runnable generic commands. Plan 2
must keep discovery and validation read-only, expose the current phase, reject
inferred/unknown values until confirmed, and require a fresh plan hash and
explicit confirmation for `apply`. GitHub repository creation, commit, push,
production changes, and deployment remain separate authority boundaries.
