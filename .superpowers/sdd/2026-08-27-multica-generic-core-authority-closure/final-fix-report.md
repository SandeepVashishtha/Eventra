# Final generic-core authority closure report

Starting HEAD: `8bcb1b87c721175e1ae3bc1633a14ac3231bc1e1`

Implementation commit: `84613014b605b79163cc94e17a43d05b53642bc2`

Scope: the complete residual final-review set in `final-fix-brief.md`: 7
Critical, 9 Important, and 1 Minor finding. The pass preserved Tasks 1-4,
product-neutral behavior, legacy Eventra behavior, dry-run zero effects,
exact-SHA/no-checkout/no-reset execution, and the prohibition on deployment and
rollback.

## Method and baseline

The pre-change complete-tools baseline was:

```text
.venv/bin/python -B -m unittest discover -s tools -p 'test_*.py' -q
Ran 516 tests
OK
```

PyYAML was `6.0.2`. Every finding was reproduced with a focused failing test
before its production change. The initial RED batches deliberately grouped
large reviewer matrices so each public surface was exercised consistently:

```text
manifest + metadata authority matrix: 15 expected failures
Multica + GitHub + contract-audit authority matrix: 37 expected failures
provisioning authority matrix: 3 failures, 6 errors
workflow authority matrix: 16 failures, 1 error
forged same-class/raw-key exception matrix: 3 failures
```

One unconditional merge-stage-barrier case was already green when first added;
the adjacent resumed-partial paths were RED and drove the centralized barrier
placement. The provisioning forged-same-class case was also already green
because its existing outer error translation happened to close that one shape;
the new common exception relay was still required for the complete graph.

During self-review, six additional edge reproductions were added before the
corresponding hardening:

```text
phase evidence: one failed read plus one absent read dispatched new evidence
public malformed smoke: returned mutation_count=1 instead of zero
forged exact WorkflowState/ParentSnapshot: raised AttributeError
merge reservation with added PR evidence: merged both repositories
open PR with valid provisional merge SHA: contract audit returned fail
GitHub unmanaged repository input: sentinel remained in the raised message
```

All six are now green and are included in the final counts.

## Critical findings

### C1. Exact provisioning apply authority

RED reproduction:
`test_apply_requires_an_exact_bool_before_every_effect` passes strings, positive
and zero integers, `None`, and bool-like objects, and records every GitHub read,
Multica read/mutation, and secret lookup. The former boundary did not reject the
complete matrix before local/external work.

GREEN implementation:
`Provisioner.reconcile()` now checks `type(apply) is bool` as its first
instruction. The sanitized public relay preserves the exact safe `TypeError`
without retaining the callable, manifest, or other input frames. Every invalid
case has zero reads, zero secret lookups, and zero mutations.

### C2. Non-forgeable authoritative smoke

RED reproductions:

- `test_owned_smoke_rejects_arbitrary_self_reporting_runner`
- `test_owned_smoke_rejects_nonconcrete_process_manager`
- `test_manifest_service_records_must_be_complete_and_registry_owned`
- `test_service_startup_failure_returns_only_blocked_nonauthoritative_evidence`
- `test_execute_smoke_persists_startup_failure_then_human_blocks`
- `test_public_smoke_record_is_replay_only`
- `test_public_malformed_smoke_record_has_zero_effects`
- `test_generic_workflow_rejects_arbitrary_smoke_executor`

GREEN implementation:

- `GenericWorkflow` accepts only an exact `OwnedSmokeExecutor` bound to the same
  manifest.
- `OwnedSmokeExecutor` accepts only an exact manifest-bound `ProcessManager`
  and exact manifest-bound `LocalExactShaCommandRunner`.
- `ProcessManager` has immutable manifest authority and re-verifies the exact
  declared service set, run argv/cwd, returned exact `OwnedProcess` records,
  registry PID group, process start identity, liveness, port ownership, and
  health while holding the registry transaction.
- Started records are retained for cleanup before verification, including the
  verification-failure path.
- Any startup/ownership failure marks every affected repository and applicable
  integration suite `blocked`, sets `authoritative=False`, persists that owned
  observation, and drives the parent to a human block.
- Public `record_smoke_read()` is replay-only. It can exact-replay a persisted
  observation/action pair but has no capability to persist a new observation;
  malformed or new caller evidence has zero effects.
- Exact-SHA output remains closed and no checkout/reset operation was added.

### C3. Current, proven phase completion authority

RED reproductions:

- `test_new_phase_completion_requires_current_active_created_child`
- `test_new_phase_completion_requires_two_stable_absence_reads`
- `test_post_merge_phase_completion_only_exact_replays_existing_transition`

GREEN implementation:
new evidence requires the exact control parent to be active and pre-merge, the
completion attempt to equal the parent attempt, and exactly one active child at
the current metadata stage. That child must match repository/phase/suite,
contain the expected creation-action prefix, and have that creation action in
the authoritative applied-action set. Two equal completion-store reads must
prove absence before a new write. Historical, terminal, or post-merge input can
only exact-replay a persisted completion tied to a terminal child and an
applied completion transition. Conflicts and unproven evidence have zero
mutations.

### C4. Complete merge-reservation authority tuple

RED reproductions:

- `test_merge_reservation_freezes_pull_request_targets`
- `test_merge_revalidates_candidate_authority_before_each_mutation`
- `test_merge_reservation_rejects_added_pr_evidence_before_mutation`

GREEN implementation:
an immutable `_MergeAuthority` freezes the parent identity, affected order,
candidate SHAs, child/PR/review/QA/integration/smoke/dependency evidence,
workflow children, PR targets, status/project/wait/stall/recovery state,
workflow/metadata/instance versions, repository DAG, contract hashes, and
attempt. The exact PR-evidence key set is frozen too; only the expected ordered
merged-prefix state change is permitted. Two identical authoritative reads are
required after all-PR preflight, after reservation, before each per-PR
preflight, and again between that preflight and its GitHub mutation. Reservation
state must carry the exact merge plan, observed prefix, and an applied `merge:`
action. Candidate C can no longer authorize mutation of candidate D.

### C5. Unconditional current-stage merge barrier

RED reproduction: `test_merge_stage_barrier_precedes_recovery_and_github_reads`
covers a resumed/coherence-blocked merge with active current-stage work.

GREEN implementation: `execute_merge_plan()` checks the current stage
immediately after exact state ownership, before decision evaluation,
merge-prefix recovery, preflight, reservation, or any GitHub read/mutation. The
same check is repeated after stable per-PR authority reads. The test observes
`wait` and no GitHub event.

### C6. Exact control-Project parent authority

RED reproductions:

- `test_parent_intake_rejects_repository_project_issues`
- `test_every_parent_progression_entrypoint_requires_exact_control_project`

GREEN implementation: the workflow's parent project set now contains only
`manifest.instance.control_project`. Exact state validation enforces that
project across intake, parent resume, phase completion, smoke, merge, and
recovery. Repository Projects remain valid execution-child locations but never
authorize a parent mutation. Existing intake behavior remains a zero-effect
`noop`; progression entrypoints fail closed with requested identity and zero
mutations.

### C7. Complete exception-graph redaction

RED reproductions recursively traverse exception message/args,
`__cause__`, `__context__`, formatted traceback, every traceback frame local,
object dictionaries, slots, mappings, and scalar-loop values:

- `test_multica_raw_response_is_unreachable_from_exception_graph`
- `test_multica_raw_mapping_keys_are_not_rendered_or_retained`
- `test_multica_captured_stdout_is_unreachable_from_exception_graph`
- `test_environment_input_is_unreachable_from_failure_exception_graph`
- `test_runner_cannot_forge_a_secret_bearing_boundary_error`
- `test_github_raw_response_is_unreachable_from_exception_graph`
- `test_github_captured_stdout_is_unreachable_from_exception_graph`
- `test_github_repository_input_is_unreachable_from_exception_graph`
- `test_runner_cannot_forge_a_secret_bearing_github_error`
- `test_secret_lookup_failure_is_redacted`
- `test_environment_setter_failure_is_redacted`
- `test_external_client_cannot_forge_a_secret_bearing_provision_error`

GREEN implementation: `redaction.py` provides a closed-call relay. Raw work
returns either a value or a safe `(exception type, safe message)` description;
the original exception graph has every traceback frame cleared and its
cause/context/traceback detached before a fresh safe exception is raised from a
frame that no longer contains boundary arguments. Safe same-class errors are
preserved only when their innermost raising frame belongs to the trusted module,
preventing external runners/clients from forging a secret-bearing trusted
exception. Multica malformed-mapping diagnostics now expose only mapping size,
and GitHub unmanaged-repository diagnostics no longer echo raw input.

## Important findings

### I1. Exact state/schema ownership

RED reproductions:

- `test_non_workflow_state_returns_requested_identity_without_mutation`
- `test_forged_exact_workflow_state_schema_fails_closed_without_mutation`
- `test_unsupported_metadata_schema_has_zero_mutations`

GREEN implementation: state authority requires exact `WorkflowState`, exact
schema containers and typed children/PR targets, exact `ParentSnapshot`, exact
`ParentMetadata`, `metadata_version == 1`, supported workflow version, matching
instance, exact control project, and coherent metadata/snapshot identity. Even
an `object.__new__` exact-class forgery with missing snapshot fields returns a
requested-parent zero-mutation result. Reconciliation predicates are evaluated
inside their guarded read relay, so a malformed post-effect reread becomes
`uncertain`, not an uncaught exception or compensating mutation.

### I2. Exact watcher child intent

RED reproduction:
`test_watcher_selects_only_current_created_child_not_historical_match` supplies
a historical lookalike beside the intended current child.

GREEN implementation: recovery selects exactly one inactive-but-nonterminal
child at the parent's current stage and attempt, with the expected creation
prefix present in applied actions and exact repository/target/phase/suite
identity. A replacement rerun must preserve that full identity, creation key,
stage, and attempt. Historical children cannot be selected.

### I3. ID grammar on every Multica ID

RED reproductions:

- `test_every_typed_identifier_rejects_option_tokens_before_execution`
- `test_server_derived_summary_ids_are_validated_before_followup_reads`
- `test_server_derived_resource_and_binding_ids_are_strict`

GREEN implementation: the existing public-ID grammar is centralized in
`_identifier()` and now covers every typed input and every server-derived
project resource, daemon/runtime, agent skill/environment, squad leader/member,
Autopilot project/assignee/trigger, mutation result, summary, and follow-up ID.
Invalid input fails before a runner call; invalid output fails before any
follow-up call.

### I4. Stable provisioning pre-read consumption

RED reproduction:
`test_concurrent_create_is_reconciled_without_duplicate_target` injects a
concurrent control-Project creation with an ambiguous failed acknowledgement.

GREEN implementation: every create/add callback receives the fresh stable
two-read snapshot and rechecks absence/membership on that snapshot before
mutating. Skills, Projects, worktrees, agents, bindings, Squads/members,
Autopilot, and triggers all use this rule. Mutation exceptions are treated as
ambiguous acknowledgements; a stable post-read is authoritative and either
proves convergence or fails closed. The concurrent case converges to exactly
one target.

### I5. Exact repair PR target

RED reproduction:
`test_repair_dispatch_rejects_foreign_manifest_pr_target` substitutes a foreign
owner/repository URL while retaining the local repository key.

GREEN implementation: repair dispatch reconstructs the only accepted URL from
the manifest GitHub slug and exact `PullRequestTarget.number`, requires exact
target key and existing snapshot PR evidence, and rejects any mismatch before
child dispatch or mutation.

### I6. Policy invariants at every effect boundary

RED reproductions:

- `test_policy_constructor_enforces_every_fixed_authority_invariant`
- `test_effect_boundary_revalidates_programmatically_bypassed_policy`
- `test_every_manifest_bound_effect_revalidates_forged_policy`

GREEN implementation: `validate_policy_authority()` requires an exact
`PolicySpec`, valid environment, exact bool automatic-merge policy,
`deployment == "forbidden"`, exactly two repair attempts, the approved
30-minute cron, and a valid IANA timezone. `PolicySpec.__post_init__`,
provisioning, workflow, exact-SHA runner, smoke executor, and concrete process
manager revalidate the invariant, including objects forged to bypass the
dataclass constructor.

### I7. Absolute normalized local-path identity

RED reproductions:

- `test_manifest_paths_must_be_absolute_and_lexically_normalized`
- `test_manifest_rejects_symlink_path_aliases_conservatively`
- the existing duplicate-path matrix extended to control/repository identity

GREEN implementation: every control and repository path must be an absolute
lexically normalized string. `.`/`..`, trailing aliases, and normalization
aliases are rejected. `resolve(strict=False)` must equal the declared path, so
existing or partial symlink aliases fail conservatively without touching a
product checkout. Duplicate detection includes the control path and all
repository paths after validation.

### I8. Exact GitHub PR numbers

RED reproduction:
`test_pull_request_numbers_are_exact_positive_ints_before_execution` covers
bools, floats, strings, zero, and negative values in both public read and merge
paths.

GREEN implementation: `_pull_request_number()` requires `type(value) is int`
and `value > 0` before any runner call. Both `get_pull_request()` and
`merge_pull_request()` invoke it; every invalid case records zero runner calls.

### I9. Complete contract-audit PR state domain

RED reproductions:

- `test_merged_pull_request_sample_requires_coherent_merge_identity`
- `test_open_pull_request_sample_accepts_valid_provisional_merge_sha`

GREEN implementation: the audit accepts `open`, `closed`, and `merged`.
`merged` requires a timezone-aware merged timestamp and lowercase 40-character
merge SHA; `closed` permits neither merged identity field; `open` forbids a
merged timestamp and permits either no provisional merge SHA or a valid one,
matching the typed GitHub boundary. Incoherent summaries and detail samples
fail the aggregate shape.

## Minor finding

### M1. Exact metadata encoder type

RED reproduction: `test_every_encoder_requires_its_exact_metadata_type` passes
each other `ParentMetadata` subtype to every public encoder.

GREEN implementation: the shared encoder receives its required concrete type
and uses `type(metadata) is expected_type` before reading dataclass fields or
serializing. Wrong sibling/subtype input raises `MetadataError` with no partial
serialization.

## Final verification

All commands below were rerun from the completed implementation tree after the
last self-review fix:

```text
.venv/bin/python -B -m unittest \
  tools.multica_delivery.tests.test_manifest \
  tools.multica_delivery.tests.test_metadata \
  tools.multica_delivery.tests.test_multica_client \
  tools.multica_delivery.tests.test_github_client \
  tools.multica_delivery.tests.test_contract_audit \
  tools.multica_delivery.tests.test_provision \
  tools.multica_delivery.tests.test_decisions \
  tools.multica_delivery.tests.test_processes \
  tools.multica_delivery.tests.test_workflow -q
Ran 338 tests
OK

.venv/bin/python -B -m unittest discover \
  -s tools/multica_delivery/tests -p 'test_*.py' -q
Ran 386 tests
OK

.venv/bin/python -B -m unittest discover \
  -s tools/multica/tests -p 'test_*.py' -q
Ran 174 tests
OK

.venv/bin/python -B -m unittest discover -s tools -p 'test_*.py' -q
Ran 560 tests
OK

PYTHONPYCACHEPREFIX=/tmp/multica-final-compile.uwpT4w \
  .venv/bin/python -m compileall -q tools
exit 0; 104 compiled cache files were written outside the worktree

.venv/bin/python -B -c \
  'import yaml; assert yaml.__version__ == "6.0.2"; print(yaml.__version__)'
6.0.2

git diff --check
exit 0, no output
```

## Scoped safety searches

The production searches excluded synthetic tests, including the existing
temporary-Git mismatch fixture. Each `rg` command returned status 1 with no
matches:

```text
shell=True, deploy/rollback function definitions, and product-specific names
automatic git checkout/reset spellings
literal secret/token/password assignments in generic production and docs
documented nonexistent `python3 -m tools.multica_delivery...` invocation
new subprocess/os.system/urlopen/requests/socket/Popen call sites in production
```

No live Multica runner, GitHub runner, network request, or local-service backend
was used. Contract tests use recording/fake clients; process and smoke tests use
the in-memory recording backend and temporary registries; path tests create only
temporary-directory symlinks. No managed or product checkout was changed. The
unchanged exact-SHA mismatch test performs a checkout only inside its disposable
temporary Git repository; the production core and this implementation pass ran
no checkout/reset against a managed path. No reset, clean, deploy, rollback,
push, PR creation, remote merge, or worktree cleanup command was run.

## Self-review and concerns

- Every public workflow progression path reaches the same exact state/project
  authority before effects. Intake retains its approved repository-Project
  zero-effect `noop` behavior.
- The merge reservation comparison is exact for all frozen evidence, including
  added or removed PR evidence; only the proven ordered merged prefix may
  evolve.
- Smoke persistence has one internal authority path, and all caller-facing
  recording paths are exact replay or zero-effect denial.
- Exception sanitization removes reachability, not only rendered strings. The
  graph assertions cover result objects, mappings and keys, stdout, environment
  values, raw inputs, cause/context, and frame locals.
- Provisioning still treats a failed write acknowledgement as ambiguous and
  relies on authoritative post-read state; it does not retry a create/add from
  its stale outer decision.
- The production delta adds no deployment, rollback, checkout, reset, network,
  or product-specific branch.

Open concerns: none.
