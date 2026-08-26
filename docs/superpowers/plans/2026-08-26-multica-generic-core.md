# Multica Generic Multi-Repository Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a manifest-driven Python core that provisions and advances one GitHub product across one control Project and any number of repository Projects without Eventra-specific branching.

**Architecture:** Add a focused `tools.multica_delivery` package beside the current Eventra adapter. Immutable manifest/state models, a repository DAG, canonical JSON metadata, and a pure exact-SHA decision engine form the center; CLI-boundary clients and reconcilers perform effects around that core. Existing `tools.multica` entry points remain operational through an explicit Eventra translation layer until the migration plan completes.

**Tech Stack:** Python 3.11+, standard library (`dataclasses`, `enum`, `json`, `pathlib`, `subprocess`, `unittest`), PyYAML 6.0.2, Multica CLI, GitHub CLI, GitHub Projects and pull requests.

**Spec:** `docs/superpowers/specs/2026-08-26-multica-generic-multi-repo-delivery-skill-design.md`

## Global Constraints

- GitHub repositories and pull requests are the only source-control integration.
- One Multica daemon serves the entire product instance.
- Every product uses one dedicated control GitHub repository, one control Project, and one repository Project per managed repository.
- The team has fixed control roles plus exactly one Engineer agent per managed repository.
- `delivery.yaml` is declarative desired state; generated IDs and hashes belong in `framework.lock`.
- Skill origins must be public GitHub URLs; do not query or import from the company-internal SkillsHub.
- A same-name/different-origin skill conflict is a hard stop.
- Discovery confidence is exactly `confirmed`, `inferred`, or `unknown`; inferred and unknown values require operator confirmation before apply.
- A parent issue carries an affected-repository set and a dependency DAG; execution and merge order must follow topological waves.
- Structured Multica metadata is serialized as canonical JSON strings.
- Review and QA evidence must name the exact candidate commit SHA.
- A failed phase may be repaired at most twice before the parent becomes `blocked`.
- Local/development quality-gate success may auto-merge; the framework forbids deployment, which remains a separate manually triggered system.
- Production never auto-merges and never auto-deploys.
- Cross-repository delivery is atomic at the workflow level: partial merge is blocked and there is no automatic rollback.
- Local process management may stop or restart only processes recorded as owned by the framework.
- Watcher recovery is bounded to at most one recovery action per stalled transition.
- The generic CLI exposes `discover`, `init`, `validate`, `plan`, `apply`, `doctor`, and `upgrade`.
- Eventra remains a compatibility fixture and its existing adapter stays usable until migration parity is demonstrated.

---

## File Map

- `tools/multica_delivery/model.py`: immutable manifest and runtime-state types.
- `tools/multica_delivery/manifest.py`: YAML decoding, schema validation, and lock-file hashing.
- `tools/multica_delivery/topology.py`: selected-subgraph validation, topological execution waves, and merge ordering.
- `tools/multica_delivery/metadata.py`: canonical JSON envelopes for parent, child, phase, PR, and recovery state.
- `tools/multica_delivery/decisions.py`: pure parent/child state transitions and repair-budget enforcement.
- `tools/multica_delivery/multica_client.py`: strict Multica CLI request/response boundary.
- `tools/multica_delivery/github_client.py`: strict read/write GitHub boundary scoped by repository allowlist.
- `tools/multica_delivery/provision.py`: manifest-to-Multica reconciliation for projects, skills, agents, squad, and watcher.
- `tools/multica_delivery/processes.py`: owned local-service registry, health checks, port collision policy, and owner-only cleanup.
- `tools/multica_delivery/workflow.py`: generic issue event, phase completion, parent resume, merge, post-merge smoke, and stalled-recovery orchestration.
- `tools/multica_delivery/contract_audit.py`: pre-apply/live contract probes.
- `tools/multica_delivery/tests/`: unit, boundary, and compatibility tests.
- `tools/multica/eventra_adapter.py`: Eventra manifest translation and legacy command compatibility only.
- `tools/multica/tests/test_eventra_adapter.py`: legacy behavior regression suite.
- `requirements-multica.txt`: pinned Python dependency for YAML parsing.

### Task 1: Immutable Manifest Model and YAML Boundary

**Files:**
- Create: `requirements-multica.txt`
- Create: `tools/multica_delivery/__init__.py`
- Create: `tools/multica_delivery/model.py`
- Create: `tools/multica_delivery/manifest.py`
- Create: `tools/multica_delivery/tests/__init__.py`
- Create: `tools/multica_delivery/tests/fixtures/three-repository-delivery.yaml`
- Create: `tools/multica_delivery/tests/test_manifest.py`

**Interfaces:**
- Consumes: a UTF-8 `delivery.yaml` path and optional UTF-8 `framework.lock` path.
- Produces: `load_manifest(path: Path) -> DeliveryManifest`, `load_manifest_text(text: str) -> DeliveryManifest`, `manifest_digest(manifest: DeliveryManifest) -> str`, and `load_lock(path: Path) -> FrameworkLock`.

- [ ] **Step 1: Pin the only new Python dependency and write a real three-repository fixture**

```text
PyYAML==6.0.2
```

The fixture must define instance key `sample-commerce`, control repository `codeExploreHub/sample-commerce-delivery-control`, repositories `web`, `api`, and `notifications`, dependency edges `web -> api` and `notifications -> api`, mandatory local commands, services with unique ports, integration suites, environment `development`, `automatic_merge: true`, `deployment: forbidden`, `max_repair_attempts: 2`, and an operator-approved public skill registry referenced by skill keys.

After the user approves dependency installation, run `python3 -m pip install -r requirements-multica.txt`. Expected: PyYAML 6.0.2 installs successfully and `python3 -c 'import yaml; print(yaml.__version__)'` prints `6.0.2`.

- [ ] **Step 2: Write failing manifest tests**

```python
from pathlib import Path
import unittest

from tools.multica_delivery.manifest import ManifestError, load_manifest, load_manifest_text, manifest_digest


FIXTURE = Path(__file__).parent / "fixtures" / "three-repository-delivery.yaml"


class ManifestTests(unittest.TestCase):
    def test_loads_n_repository_manifest(self):
        manifest = load_manifest(FIXTURE)
        self.assertEqual(manifest.instance.key, "sample-commerce")
        self.assertEqual(tuple(manifest.repositories), ("web", "api", "notifications"))
        self.assertEqual(manifest.repositories["web"].depends_on, ("api",))
        self.assertTrue(manifest.policy.automatic_merge)
        self.assertEqual(manifest.policy.deployment, "forbidden")

    def test_digest_is_stable_for_equivalent_key_order(self):
        first = load_manifest(FIXTURE)
        second = load_manifest(FIXTURE)
        self.assertEqual(manifest_digest(first), manifest_digest(second))

    def test_rejects_production_automatic_merge(self):
        text = FIXTURE.read_text().replace("environment: development", "environment: production")
        with self.assertRaisesRegex(ManifestError, "automatic_merge"):
            load_manifest_text(text)
```

- [ ] **Step 3: Run the focused test and observe the missing-package failure**

Run: `python3 -B -m unittest tools.multica_delivery.tests.test_manifest -v`

Expected: FAIL with `ModuleNotFoundError: No module named 'tools.multica_delivery'`.

- [ ] **Step 4: Implement frozen models and strict YAML decoding**

```python
@dataclass(frozen=True)
class RepositorySpec:
    key: str
    github: str
    project_title: str
    local_path: Path
    default_branch: str
    depends_on: tuple[str, ...]
    commands: Mapping[str, tuple[str, ...]]
    skills: tuple[str, ...]


@dataclass(frozen=True)
class DeliveryManifest:
    schema_version: int
    instance: InstanceSpec
    control: ControlSpec
    skill_registry: Mapping[str, SkillSource]
    repositories: Mapping[str, RepositorySpec]
    integration_suites: tuple[IntegrationSuiteSpec, ...]
    policy: PolicySpec
```

`load_manifest()` delegates UTF-8 text to `load_manifest_text()`. The text loader must use a `yaml.SafeLoader` subclass with a duplicate-key-rejecting mapping constructor. Reject unknown top-level keys; duplicate repository, Project, local-path, integration-suite, and skill-registry keys; duplicate service ports on the daemon; malformed GitHub slugs; non-public or unapproved skill URLs; undeclared skill keys or secret recipients; unknown dependencies; an empty repository map; missing `focused_test`, `test`, `build`, `start`, or `smoke` commands; cyclic dependencies; integration/merge orders inconsistent with the DAG; `max_repair_attempts != 2`; deployment values other than `forbidden`; and automatic merge in production. Store mappings as insertion-ordered, read-only `MappingProxyType` values.

- [ ] **Step 5: Run manifest tests and the full existing suite**

Run: `python3 -B -m unittest tools.multica_delivery.tests.test_manifest -v`

Expected: all manifest tests PASS.

Run: `python3 -B -m unittest discover -s tools/multica/tests -p 'test_*.py' -v`

Expected: existing Eventra tests PASS unchanged.

- [ ] **Step 6: Commit the manifest boundary**

```bash
git add requirements-multica.txt tools/multica_delivery
git commit -m "feat: add generic multica delivery manifest"
```

### Task 2: Repository DAG and Canonical Metadata

**Files:**
- Create: `tools/multica_delivery/topology.py`
- Create: `tools/multica_delivery/metadata.py`
- Create: `tools/multica_delivery/tests/test_topology.py`
- Create: `tools/multica_delivery/tests/test_metadata.py`

**Interfaces:**
- Consumes: `Mapping[str, RepositorySpec]`, `frozenset[str]`, and typed metadata dataclasses.
- Produces: `topological_waves(repositories, selected, satisfied_dependencies=frozenset()) -> tuple[tuple[str, ...], ...]`, `merge_order(repositories, selected, confirmed_order=()) -> tuple[str, ...]`, `canonical_json(value: object) -> str`, and typed `encode_*`/`decode_*` envelope functions.

- [ ] **Step 1: Write failing DAG tests for dependency waves, subsets, and cycles**

```python
def test_selected_subgraph_builds_dependencies_before_dependents(self):
    waves = topological_waves(self.repositories, frozenset({"api", "web", "notifications"}))
    self.assertEqual(waves, (("api",), ("notifications", "web")))

def test_subset_omits_unselected_dependents(self):
    self.assertEqual(topological_waves(self.repositories, frozenset({"api"})), (("api",),))

def test_selected_repo_requires_selected_dependency(self):
    with self.assertRaisesRegex(TopologyError, "web requires api"):
        topological_waves(self.repositories, frozenset({"web"}))

def test_frozen_contract_allows_dependent_in_same_wave(self):
    waves = topological_waves(
        self.repositories,
        frozenset({"api", "web"}),
        satisfied_dependencies=frozenset({("web", "api")}),
    )
    self.assertEqual(waves, (("api", "web"),))
```

- [ ] **Step 2: Write failing metadata round-trip and malformed-input tests**

```python
def test_parent_envelope_is_canonical_json(self):
    encoded = encode_parent_metadata(
        ParentMetadata(
            affected_repositories=("api", "web"),
            attempt=1,
            last_action="dispatch",
            merge_state="pending",
            candidate_shas={"api": "a" * 40, "web": "b" * 40},
        )
    )
    self.assertEqual(encoded, canonical_json(json.loads(encoded)))
    self.assertEqual(decode_parent_metadata(encoded).attempt, 1)

def test_decode_rejects_unknown_fields(self):
    with self.assertRaisesRegex(MetadataError, "unknown fields"):
        decode_parent_metadata('{"attempt":1,"surprise":true}')
```

- [ ] **Step 3: Run the focused tests and observe missing-module failures**

Run: `python3 -B -m unittest tools.multica_delivery.tests.test_topology tools.multica_delivery.tests.test_metadata -v`

Expected: FAIL because `topology` and `metadata` do not exist.

- [ ] **Step 4: Implement deterministic Kahn waves and JSON envelopes**

```python
def canonical_json(value: object) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def topological_waves(
    repositories: Mapping[str, RepositorySpec],
    selected: frozenset[str],
    satisfied_dependencies: frozenset[tuple[str, str]] = frozenset(),
) -> tuple[tuple[str, ...], ...]:
    # Validate keys and dependency closure, then emit lexicographically sorted
    # zero-indegree waves. Raise TopologyError with the remaining cycle keys.
```

Define frozen `ParentMetadata`, `ChildMetadata`, `PhaseMetadata`, `PullRequestMetadata`, and `RecoveryMetadata`. Include workflow/metadata version, instance key, affected repositories, candidate SHA map, interface-contract hashes, monotonic Stage ordinal, merge plan/state, repair attempt, and stable last-action key. Every decoder must require a JSON object, reject unknown/missing keys, validate SHA values with `[0-9a-f]{40}`, and return immutable tuples/mappings. No Python `repr`, comma-separated pseudo-JSON, object stringification, raw Issue text, secret/environment value, token, or webhook body may cross the Multica metadata boundary.

- [ ] **Step 5: Run focused and combined core tests**

Run: `python3 -B -m unittest tools.multica_delivery.tests.test_manifest tools.multica_delivery.tests.test_topology tools.multica_delivery.tests.test_metadata -v`

Expected: all tests PASS; output order remains stable across three repeated runs.

- [ ] **Step 6: Commit topology and metadata**

```bash
git add tools/multica_delivery/topology.py tools/multica_delivery/metadata.py tools/multica_delivery/tests
git commit -m "feat: add repository topology and canonical metadata"
```

### Task 3: Exact-SHA Parent Decision Engine

**Files:**
- Create: `tools/multica_delivery/decisions.py`
- Create: `tools/multica_delivery/tests/test_decisions.py`

**Interfaces:**
- Consumes: `DeliveryManifest` and `ParentSnapshot` containing child, PR, review, QA, merge, and recovery evidence keyed by repository key.
- Produces: `decide_parent_action(manifest: DeliveryManifest, snapshot: ParentSnapshot) -> ParentDecision` where decision kinds are `dispatch`, `wait`, `repair`, `merge`, `complete`, and `block`.

- [ ] **Step 1: Write failing happy-path tests across three repositories**

```python
def test_merge_only_after_all_exact_sha_gates_pass(self):
    snapshot = passing_snapshot(
        affected=("api", "notifications", "web"),
        shas={"api": "a" * 40, "notifications": "b" * 40, "web": "c" * 40},
    )
    decision = decide_parent_action(self.manifest, snapshot)
    self.assertEqual(decision.kind, DecisionKind.MERGE)
    self.assertEqual(decision.repositories, ("api", "notifications", "web"))

def test_stale_review_sha_blocks_merge(self):
    snapshot = passing_snapshot(affected=("api", "web"))
    snapshot = replace(snapshot, reviews={"web": review_for("d" * 40)})
    decision = decide_parent_action(self.manifest, snapshot)
    self.assertEqual(decision.kind, DecisionKind.REPAIR)
    self.assertEqual(decision.reason, "web review evidence does not match candidate SHA")
```

- [ ] **Step 2: Write failing repair, production, partial-merge, and recovery-bound tests**

```python
def test_third_failure_blocks_parent(self):
    decision = decide_parent_action(self.manifest, failing_snapshot(attempt=2))
    self.assertEqual(decision.kind, DecisionKind.BLOCK)

def test_production_never_returns_merge(self):
    production = replace(self.manifest, policy=replace(self.manifest.policy, environment="production"))
    self.assertEqual(decide_parent_action(production, passing_snapshot()).kind, DecisionKind.WAIT)

def test_any_merged_subset_blocks_atomic_delivery(self):
    decision = decide_parent_action(self.manifest, partial_merge_snapshot())
    self.assertEqual(decision.kind, DecisionKind.BLOCK)

def test_second_stall_does_not_recover_again(self):
    decision = decide_parent_action(self.manifest, stalled_snapshot(recovery_count=1))
    self.assertEqual(decision.kind, DecisionKind.BLOCK)

def test_merged_exact_shas_require_two_stable_smoke_reads(self):
    once = merged_snapshot(smoke_reads=(passing_smoke_read(),))
    twice = merged_snapshot(smoke_reads=(passing_smoke_read(), passing_smoke_read()))
    self.assertEqual(decide_parent_action(self.manifest, once).kind, DecisionKind.SMOKE)
    self.assertEqual(decide_parent_action(self.manifest, twice).kind, DecisionKind.COMPLETE)
```

- [ ] **Step 3: Run the focused test and observe the missing decision types**

Run: `python3 -B -m unittest tools.multica_delivery.tests.test_decisions -v`

Expected: FAIL importing `ParentSnapshot` or `decide_parent_action`.

- [ ] **Step 4: Implement the pure transition table**

```python
class DecisionKind(str, Enum):
    DISPATCH = "dispatch"
    WAIT = "wait"
    REPAIR = "repair"
    MERGE = "merge"
    SMOKE = "smoke"
    COMPLETE = "complete"
    BLOCK = "block"


@dataclass(frozen=True)
class ParentDecision:
    kind: DecisionKind
    reason: str
    repositories: tuple[str, ...] = ()
    next_attempt: int | None = None
```

Evaluate in this order: invalid/partial merge; production policy; dependency readiness; missing child or PR; failed/stale review; failed/stale QA; repair budget; all pre-merge gates passing; all expected PRs merged; failed/stale smoke; two identical authoritative smoke reads; stalled recovery. `MERGE` must contain the dependency-respecting `merge_order()`, never a set iteration order. Merged PRs return `SMOKE` until every repository smoke command and applicable integration smoke suite passes against the exact merged SHA map twice; only then return `COMPLETE`. `REPAIR` increments one shared parent attempt and never exceeds `policy.max_repair_attempts`; a replacement SHA invalidates every prior review, QA, and smoke PASS.

- [ ] **Step 5: Run decision and metadata tests**

Run: `python3 -B -m unittest tools.multica_delivery.tests.test_decisions tools.multica_delivery.tests.test_metadata tools.multica_delivery.tests.test_topology -v`

Expected: all tests PASS.

- [ ] **Step 6: Commit the decision engine**

```bash
git add tools/multica_delivery/decisions.py tools/multica_delivery/tests/test_decisions.py
git commit -m "feat: add exact sha delivery decisions"
```

### Task 4: Strict Multica and GitHub Boundaries

**Files:**
- Create: `tools/multica_delivery/multica_client.py`
- Create: `tools/multica_delivery/github_client.py`
- Create: `tools/multica_delivery/contract_audit.py`
- Create: `tools/multica_delivery/tests/test_multica_client.py`
- Create: `tools/multica_delivery/tests/test_github_client.py`
- Create: `tools/multica_delivery/tests/test_contract_audit.py`

**Interfaces:**
- Consumes: argv tuples, JSON CLI responses, runtime/daemon IDs, and the manifest repository allowlist.
- Produces: `MulticaClient.call(argv: tuple[str, ...]) -> Mapping[str, object]`, `GitHubClient` read/write methods, and `audit_contracts(multica, github, manifest) -> ContractAuditReport`.

- [ ] **Step 1: Write failing Multica shape tests using recorded variants**

```python
def test_unwraps_nested_created_resource(self):
    runner = FakeRunner({"data": {"skill": {"id": "skill-1", "name": "tdd"}}})
    created = MulticaClient(runner).import_skill("https://github.com/obra/superpowers/tree/main/skills/test-driven-development")
    self.assertEqual(created.id, "skill-1")

def test_malformed_environment_is_actionable(self):
    runner = FakeRunner({"data": {"unexpected": []}})
    with self.assertRaisesRegex(MulticaContractError, "agent environment"):
        MulticaClient(runner).get_agent_environment("agent-1")
```

- [ ] **Step 2: Write failing GitHub allowlist and exact-SHA tests**

```python
def test_refuses_repository_outside_manifest(self):
    with self.assertRaisesRegex(GitHubBoundaryError, "not managed"):
        self.client.get_pull_request("other/repo", 4)

def test_merge_requires_expected_head_sha(self):
    with self.assertRaisesRegex(GitHubBoundaryError, "head SHA changed"):
        self.client.merge_pull_request("codeExploreHub/api", 4, expected_sha="a" * 40)
```

- [ ] **Step 3: Run the boundary tests and observe missing-module failures**

Run: `python3 -B -m unittest tools.multica_delivery.tests.test_multica_client tools.multica_delivery.tests.test_github_client tools.multica_delivery.tests.test_contract_audit -v`

Expected: FAIL importing boundary modules.

- [ ] **Step 4: Implement subprocess-free injectable clients**

```python
class CommandRunner(Protocol):
    def run(self, argv: tuple[str, ...]) -> CommandResult: ...


class MulticaClient:
    def __init__(self, runner: CommandRunner, runtime_id: str, daemon_id: str): ...


class GitHubClient:
    def __init__(self, runner: CommandRunner, allowed_repositories: frozenset[str]): ...
```

All shell execution must pass argv arrays without `shell=True`. The GitHub client must use `gh api`/`gh pr` only for manifest repositories, inspect PR head/mergeability/required checks immediately before merge, and return typed immutable results. The Multica client must centralize the response-unwrapping variants already learned by the Eventra provisioner and raise a contract error that includes operation name and response keys but never secrets. Read-only calls receive at most one retry for a transient, idempotent failure; mutating calls are never blindly retried.

- [ ] **Step 5: Implement a read-only contract audit**

`audit_contracts()` must probe Multica version, runtime/daemon reachability, project listing shape, agent-environment read shape, skill listing/import dry shape when supported, GitHub auth/repository visibility, Projects visibility, and PR read shape. It returns individual `pass`, `warn`, or `fail` entries and performs no mutations.

- [ ] **Step 6: Run focused tests and compile all new modules**

Run: `python3 -B -m unittest tools.multica_delivery.tests.test_multica_client tools.multica_delivery.tests.test_github_client tools.multica_delivery.tests.test_contract_audit -v`

Expected: all tests PASS.

Run: `python3 -B -m compileall -q tools/multica_delivery`

Expected: exit 0 with no output.

- [ ] **Step 7: Commit strict boundaries**

```bash
git add tools/multica_delivery/multica_client.py tools/multica_delivery/github_client.py tools/multica_delivery/contract_audit.py tools/multica_delivery/tests
git commit -m "feat: add strict multica and github boundaries"
```

### Task 5: Manifest-Driven Provisioner

**Files:**
- Create: `tools/multica_delivery/provision.py`
- Create: `tools/multica_delivery/tests/test_provision.py`

**Interfaces:**
- Consumes: `DeliveryManifest`, `FrameworkLock`, `MulticaClient`, `GitHubClient`, `apply: bool`, and a secret lookup callback.
- Produces: `Provisioner.reconcile(manifest, lock, *, apply, secret_lookup) -> ReconcileResult` and an updated lock document only after successful apply.

- [ ] **Step 1: Write failing dry-run tests for one control plus N repository Projects**

```python
def test_plan_creates_control_and_one_project_per_repository(self):
    result = self.provisioner.reconcile(self.manifest, FrameworkLock.empty(), apply=False, secret_lookup=no_secrets)
    self.assertEqual(
        tuple(action.key for action in result.actions if action.kind == "project.create"),
        ("control", "api", "notifications", "web"),
    )
    self.assertFalse(self.multica.was_mutated)
```

- [ ] **Step 2: Write failing agent, skill, idempotency, and conflict tests**

```python
def test_creates_fixed_control_roles_and_one_engineer_per_repo(self):
    result = self.provisioner.reconcile(self.manifest, FrameworkLock.empty(), apply=False, secret_lookup=no_secrets)
    self.assertEqual(result.desired_agent_keys, ("delivery-lead", "independent-reviewer", "integration-qa", "workflow-watcher", "api-engineer", "notifications-engineer", "web-engineer"))

def test_same_skill_name_different_origin_is_fatal(self):
    with self.assertRaisesRegex(ProvisionError, "same-name/different-origin"):
        self.provisioner.reconcile(self.manifest, lock_with_conflicting_skill(), apply=False, secret_lookup=no_secrets)

def test_second_apply_is_noop(self):
    first = self.provisioner.reconcile(self.manifest, FrameworkLock.empty(), apply=True, secret_lookup=self.secrets)
    second = self.provisioner.reconcile(self.manifest, first.lock, apply=True, secret_lookup=self.secrets)
    self.assertEqual(second.actions, ())
```

- [ ] **Step 3: Run the provision tests and observe the missing class failure**

Run: `python3 -B -m unittest tools.multica_delivery.tests.test_provision -v`

Expected: FAIL importing `Provisioner`.

- [ ] **Step 4: Implement ordered reconciliation and lock emission**

```python
@dataclass(frozen=True)
class ReconcileResult:
    actions: tuple[ReconcileAction, ...]
    desired_agent_keys: tuple[str, ...]
    lock: FrameworkLock


class Provisioner:
    def reconcile(
        self,
        manifest: DeliveryManifest,
        lock: FrameworkLock,
        *,
        apply: bool,
        secret_lookup: Callable[[str], str],
    ) -> ReconcileResult: ...
```

Reconcile in this fixed order: operator-approved public skills and origin conflicts; control/repository Projects; exactly one local worktree resource per repository Project; Delivery Lead, Independent Reviewer, Integration QA, and independent Workflow Watcher; one repository Engineer per repository; workspace visibility and concurrency one; agent environment allowlists/secrets; Squad membership excluding Watcher; run-only Watcher Autopilot and 30-minute trigger in the manifest timezone; lock IDs/versions/hashes; authoritative post-write reads. Preserve unrelated bindings and unknown resources, and fail on duplicate/foreign target state. `apply=False` must not call any mutating client method. Secret values may enter only the environment setter and must never appear in argv, actions, errors, logs, metadata, or `framework.lock`.

- [ ] **Step 5: Run the provision tests twice and verify deterministic plans**

Run: `python3 -B -m unittest tools.multica_delivery.tests.test_provision -v`

Expected: all tests PASS and the dry-run action ordering is stable.

- [ ] **Step 6: Commit the generic provisioner**

```bash
git add tools/multica_delivery/provision.py tools/multica_delivery/tests/test_provision.py
git commit -m "feat: provision generic multica delivery instances"
```

### Task 6: Generic Workflow Orchestrator and Bounded Watcher

**Files:**
- Create: `tools/multica_delivery/processes.py`
- Create: `tools/multica_delivery/workflow.py`
- Create: `tools/multica_delivery/tests/test_processes.py`
- Create: `tools/multica_delivery/tests/test_workflow.py`

**Interfaces:**
- Consumes: manifest/lock paths, typed clients, issue identifiers, completion evidence, and `ParentDecision`.
- Produces: `handle_status_change(parent_identifier: str, old_status: str, new_status: str) -> WorkflowResult`, `handle_parent_event(parent_identifier: str, *, affected: frozenset[str] | None = None, affected_candidates: tuple[frozenset[str], ...] = ()) -> WorkflowResult`, `record_phase_completion`, `resume_parent`, `execute_merge_plan`, and `recover_stalled_parent`, each returning `WorkflowResult`.

- [ ] **Step 1: Write failing issue intake and DAG dispatch tests**

```python
def test_parent_intake_dispatches_only_first_topological_wave(self):
    result = self.workflow.handle_parent_event("PRO-101", affected=frozenset({"api", "web"}))
    self.assertEqual(result.created_children, (("api", "implementation"),))
    self.assertEqual(result.parent_status, "in_progress")

def test_only_backlog_to_todo_starts_intake(self):
    self.assertEqual(self.workflow.handle_status_change("PRO-101", "backlog", "todo").next_action, "dispatch")
    self.assertEqual(self.workflow.handle_status_change("PRO-102", "todo", "in_progress").next_action, "noop")

def test_ambiguous_or_out_of_manifest_scope_waits_for_human(self):
    ambiguous = self.workflow.handle_parent_event("PRO-102", affected_candidates=({"api"}, {"api", "web"}))
    outside = self.workflow.handle_parent_event("PRO-103", affected=frozenset({"billing"}))
    self.assertEqual(ambiguous.next_action, "human-clarification")
    self.assertEqual(outside.next_action, "human-clarification")

def test_api_completion_resumes_parent_and_dispatches_web(self):
    result = self.workflow.record_phase_completion(completion_for("api", sha="a" * 40))
    self.assertEqual(result.created_children, (("web", "implementation"),))
```

- [ ] **Step 2: Write failing exact-SHA review/QA, merge, and Watcher tests**

```python
def test_stale_qa_evidence_never_merges(self):
    result = self.workflow.record_phase_completion(stale_qa_completion("web"))
    self.assertEqual(result.parent_status, "in_progress")
    self.assertEqual(result.next_action, "repair")

def test_merge_stops_before_first_changed_head(self):
    self.github.set_head("codeExploreHub/api", 12, "f" * 40)
    result = self.workflow.execute_merge_plan("PRO-101")
    self.assertEqual(result.parent_status, "blocked")
    self.assertEqual(self.github.merged, ())

def test_mid_sequence_merge_failure_records_partial_merge_and_stops(self):
    self.github.fail_merge_after(("codeExploreHub/api", 12))
    result = self.workflow.execute_merge_plan("PRO-101")
    self.assertEqual(result.parent_status, "blocked")
    self.assertEqual(result.merge_state, "partial")
    self.assertEqual(self.github.rollback_calls, ())

def test_watcher_recovers_once(self):
    first = self.workflow.recover_stalled_parent("PRO-101", now=self.stalled_at)
    second = self.workflow.recover_stalled_parent("PRO-101", now=self.stalled_at)
    self.assertEqual(first.next_action, "resume")
    self.assertEqual(second.parent_status, "blocked")

def test_watcher_ignores_healthy_and_human_wait_work(self):
    self.assertEqual(self.workflow.recover_stalled_parent("PRO-healthy", now=self.stalled_at).next_action, "noop")
    self.assertEqual(self.workflow.recover_stalled_parent("PRO-human", now=self.stalled_at).next_action, "noop")

def test_failed_phase_is_done_but_parent_repairs(self):
    result = self.workflow.record_phase_completion(failing_review_completion("web"))
    self.assertEqual(result.completed_child_status, "done")
    self.assertEqual(result.next_action, "repair")

def test_merged_prs_run_smoke_before_parent_completion(self):
    first = self.workflow.resume_parent("PRO-101")
    self.assertEqual(first.next_action, "smoke")
    self.workflow.record_smoke_read(passing_smoke_for_exact_merged_shas())
    second = self.workflow.record_smoke_read(passing_smoke_for_exact_merged_shas())
    self.assertEqual(second.parent_status, "done")
```

- [ ] **Step 3: Run workflow tests and observe missing entry points**

Run: `python3 -B -m unittest tools.multica_delivery.tests.test_workflow -v`

Expected: FAIL importing `GenericWorkflow`.

- [ ] **Step 4: Write and implement owned-process boundary tests**

```python
def test_unknown_port_owner_blocks_service_start(self):
    with self.assertRaisesRegex(ProcessOwnershipError, "port 8080 is not framework-owned"):
        self.manager.start(self.service, self.run, candidate_sha="a" * 40)

def test_only_same_run_repository_sha_owner_can_stop(self):
    with self.assertRaisesRegex(ProcessOwnershipError, "owner mismatch"):
        self.manager.stop(self.record, run_id="run-2", repository_key="api", candidate_sha="a" * 40)
```

Implement frozen `OwnedProcess(repository_key, candidate_sha, pid, port, health_url, run_id, owner_token)` records in an ignored runtime registry. A successful start records ownership only after health passes. Reuse is allowed only for the same Run, repository, and SHA. Stop targets only the recorded PID after all ownership fields match.

- [ ] **Step 5: Implement side effects around the pure decision engine**

```python
@dataclass(frozen=True)
class PhaseCompletion:
    parent_identifier: str
    repository_key: str
    phase: str
    result: str
    attempt: int
    candidate_sha: str
    pull_request_url: str
    evidence_comment_uuid: str
    evidence_comment_url: str


class GenericWorkflow:
    def resume_parent(self, parent_identifier: str) -> WorkflowResult:
        snapshot = self.snapshot_reader.read(parent_identifier)
        decision = decide_parent_action(self.manifest, snapshot)
        return self.executor.execute(parent_identifier, snapshot, decision)
```

All coordinator mutations use a stable action key derived from workflow version, instance key, parent identifier, Stage kind/ordinal, repair attempt, affected repository set, candidate SHA map, and contract hashes. Stage ordinals increase monotonically and are never reused. Child creation and metadata updates are idempotent by that key. A completion writes and authoritatively rereads evidence, marks the child `done` even for `fail|blocked`, then calls `resume_parent`; it must not depend on a child issue close event. Delivery Lead creates per-repository independent review tasks and manifest-required repository/integration QA tasks. Repairs update the existing repository PR. Merge preflight re-reads every PR head, mergeability, and required checks, rejects any already merged subset, then merges consecutively in DAG/confirmed order; a mid-sequence failure records partial merge and blocks without rollback. After all merges, owned services run repository and applicable cross-repository smoke commands against exact merged SHAs; two authoritative identical PASS reads are required before the parent becomes `done`.

- [ ] **Step 6: Run workflow, process, decision, and provision tests**

Run: `python3 -B -m unittest tools.multica_delivery.tests.test_workflow tools.multica_delivery.tests.test_processes tools.multica_delivery.tests.test_decisions tools.multica_delivery.tests.test_provision -v`

Expected: all tests PASS.

- [ ] **Step 7: Commit workflow orchestration**

```bash
git add tools/multica_delivery/processes.py tools/multica_delivery/workflow.py tools/multica_delivery/tests/test_processes.py tools/multica_delivery/tests/test_workflow.py
git commit -m "feat: orchestrate generic multi repo delivery"
```

### Task 7: Eventra Compatibility Translation

**Files:**
- Modify: `tools/multica/eventra_adapter.py`
- Create: `tools/multica_delivery/tests/fixtures/eventra-delivery.yaml`
- Create: `tools/multica_delivery/tests/test_eventra_compatibility.py`
- Modify: `tools/multica/tests/test_eventra_adapter.py`

**Interfaces:**
- Consumes: existing Eventra config/state and generic `DeliveryManifest`/metadata types.
- Produces: `eventra_manifest(workspace: Path) -> DeliveryManifest` and byte-for-byte-compatible legacy command payloads where Multica already depends on them.

- [ ] **Step 1: Write failing translation tests for the two Eventra repositories**

```python
def test_eventra_translates_to_control_plus_two_repositories(self):
    manifest = eventra_manifest(Path("/Users/didi/Eventra-workspace"))
    self.assertEqual(manifest.control.github, "codeExploreHub/eventra-delivery-control")
    self.assertEqual(tuple(manifest.repositories), ("frontend", "backend"))
    self.assertEqual(manifest.repositories["frontend"].github, "codeExploreHub/Eventra")
    self.assertEqual(manifest.repositories["backend"].github, "codeExploreHub/Eventra-Backend")

def test_eventra_remains_local_development_manual_deploy(self):
    manifest = eventra_manifest(Path("/Users/didi/Eventra-workspace"))
    self.assertEqual(manifest.policy.environment, "development")
    self.assertTrue(manifest.policy.automatic_merge)
    self.assertEqual(manifest.policy.deployment, "forbidden")
```

- [ ] **Step 2: Run new and legacy adapter tests and observe the missing translator**

Run: `python3 -B -m unittest tools.multica_delivery.tests.test_eventra_compatibility tools.multica.tests.test_eventra_adapter -v`

Expected: new tests FAIL importing `eventra_manifest`; legacy tests still PASS.

- [ ] **Step 3: Implement an explicit translation without changing live IDs**

`eventra_manifest()` must construct the generic model from current constants/config. Keep runtime `de500649-cada-4419-9d5d-279045e2eaae`, daemon `019fab98-bbad-7d17-b0b7-26e56dbe1b6f`, Watcher agent `7fed6058-d0ab-42b7-9092-42df03c10890`, Autopilot `4103d5e7-1b3b-4856-94a1-9ffe1b096812`, and trigger `7a6dea91-03a1-4e70-8709-9d5a97ec7f77` as compatibility lock values. Do not call Multica or GitHub from the translator.

- [ ] **Step 4: Add a parity assertion for legacy instruction payloads**

```python
def test_generic_render_preserves_eventra_phase_contract(self):
    legacy = legacy_phase_contract("frontend", "review", attempt=1)
    generic = render_phase_contract(eventra_manifest(self.workspace), "frontend", "review", attempt=1)
    self.assertEqual(json.loads(generic.metadata_json), json.loads(legacy.metadata_json))
```

- [ ] **Step 5: Run all Multica tests**

Run: `python3 -B -m unittest discover -s tools -p 'test_*.py' -v`

Expected: generic and existing Eventra suites PASS; no live command executes.

- [ ] **Step 6: Commit the compatibility layer**

```bash
git add tools/multica/eventra_adapter.py tools/multica/tests/test_eventra_adapter.py tools/multica_delivery/tests
git commit -m "refactor: translate eventra into generic delivery model"
```

### Task 8: Core Operator Documentation and Final Verification

**Files:**
- Create: `docs/multica-delivery-core.md`
- Modify: `tools/multica/README.md`

**Interfaces:**
- Consumes: all public interfaces from Tasks 1-7.
- Produces: install/test instructions and a compatibility boundary that Plan 2 can invoke without reading implementation internals.

- [ ] **Step 1: Write documentation assertions**

Create `tools/multica_delivery/tests/test_documentation.py` that verifies the docs contain the pinned install command, manifest path, dry-run guarantee, Eventra compatibility statement, public-skill-only policy, local auto-merge/manual-deploy policy, production prohibition, and all eight command names reserved for Plan 2.

- [ ] **Step 2: Run the documentation test and observe missing content**

Run: `python3 -B -m unittest tools.multica_delivery.tests.test_documentation -v`

Expected: FAIL because `docs/multica-delivery-core.md` does not exist.

- [ ] **Step 3: Document the tested core contract**

Include these exact commands:

```bash
python3 -m pip install -r requirements-multica.txt
python3 -B -m unittest discover -s tools -p 'test_*.py' -v
python3 -B -m compileall -q tools/multica tools/multica_delivery
```

State that importing modules and running tests never mutates Multica, GitHub, local services, or secrets. State that live effects are available only through an explicit `apply=True` call and that Plan 2 owns the user-facing CLI confirmation boundary. Document that this framework never deploys; manual deployment is an external user-controlled action.

- [ ] **Step 4: Run the complete verification set**

Run: `python3 -B -m unittest discover -s tools -p 'test_*.py' -v`

Expected: all tests PASS.

Run: `python3 -B -m compileall -q tools/multica tools/multica_delivery`

Expected: exit 0 with no output.

Run: `git diff --check`

Expected: exit 0 with no output.

- [ ] **Step 5: Commit documentation and verification tests**

```bash
git add docs/multica-delivery-core.md tools/multica/README.md tools/multica_delivery/tests/test_documentation.py
git commit -m "docs: document generic multica delivery core"
```
