# Final fix wave — MulticaClient / Provisioner

## Scope

Owned production files:

- `tools/multica_delivery/multica_client.py`
- `tools/multica_delivery/provision.py`

Owned tests:

- `tools/multica_delivery/tests/test_multica_client.py`
- `tools/multica_delivery/tests/test_provision.py`

No live Multica, GitHub, or other external calls were made.

## Root causes and fixes

1. `MulticaClient.call` classified operations by argv prefix. A recognized
   prefix therefore authorized arbitrary trailing arguments, including unknown
   mutation flags. The public boundary now accepts only closed, complete read
   shapes. Generic mutations are rejected before the runner; typed mutation
   methods retain their private closed argv construction.
2. Provision apply phases re-read several targets by mutable names/origins and
   only checked some IDs after mutation. Every mutation now passes through a
   common guard that obtains two consecutive authoritative, lock-validated
   identity snapshots both before and after the mutation. Mutation arguments
   for skills, Projects, worktrees, Agents, bindings, environments, Squad,
   Autopilot dependencies, and triggers are taken from the guarded snapshot.
3. Ordinary reconcile silently rewrote old lock framework versions. Any
   initialized lock now must exactly match skill, engine, manifest schema,
   workflow metadata, and supported CLI versions. Mismatch fails before
   external preflight and before mutation. `FrameworkLock.empty()` remains the
   explicit first-install path.

## TDD evidence

- RED: unsupported `agent create --unsupported-secret SENTINEL` and extra read
  argv both reached the fake runner; now both are rejected with zero calls.
- RED: ten initialized lock upgrade/downgrade cases reconciled without error;
  now every case fails closed with zero new mutation.
- RED: post-plan same-name identity replacement caused skill, worktree, and
  trigger mutations; now all seven lock resource categories stop before any
  mutation.
- RED: a Project dependency replacement late inside the pre-mutation snapshot
  allowed an Autopilot update; the two-read stability guard now detects it
  before mutation.

Additional adversarial coverage exercises binding skill/Agent identities,
environment Agent identity, and both Autopilot Project and Agent dependencies.

## Verification

- MulticaClient focused: 27 tests, PASS.
- Provision focused: 35 tests, PASS.
- Generic suite: 259 tests, PASS.
- Legacy suite: 174 tests, PASS.
- Combined tools suite: 433 tests, PASS.
- `python -B -m compileall -q tools/multica tools/multica_delivery`: PASS.
- `git diff --check`: PASS.

## Concerns / deferred work

- The stronger identity guard performs two complete authoritative snapshots
  before and after each mutation. This deliberately favors fail-closed safety
  over provisioning speed and may be optimized only if Multica later exposes
  transactional compare-and-swap or exact-ID read APIs.
- Public `call` is intentionally read-only and narrow. New generic reads must
  add an explicit complete grammar; new mutations must add typed methods.
