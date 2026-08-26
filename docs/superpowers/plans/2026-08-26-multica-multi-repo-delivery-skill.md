# Multica Multi-Repository Delivery Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Package the generic core as a reusable Codex skill that safely discovers an arbitrary GitHub multi-repository product, generates reviewable configuration, and exposes the full lifecycle from validation through upgrade.

**Architecture:** Keep discovery pure and read-only: stack detectors inspect files and GitHub metadata but never execute repository commands. A generator converts confirmed findings into `delivery.yaml`, control-repository templates, and a version lock; lifecycle commands then delegate validation, planning, apply, diagnosis, and upgrade to the generic core. The skill itself encodes confirmation and approval gates so uncertain discovery or external mutations cannot be silently accepted.

**Tech Stack:** Codex `SKILL.md`, Python 3.11+, PyYAML 6.0.2, `unittest`, GitHub CLI read APIs, `tools.multica_delivery` generic core.

**Spec:** `docs/superpowers/specs/2026-08-26-multica-generic-multi-repo-delivery-skill-design.md`

## Global Constraints

- Before editing the skill, read and follow both `skill-creator` and `superpowers:writing-skills` completely.
- Skill source lives in this repository under `skills/multica-multi-repo-delivery/`; installation into a personal Codex directory is a separate approved action.
- Discovery is static and read-only; it must not run package scripts, builds, tests, services, containers, migrations, or arbitrary repository code.
- GitHub repositories and pull requests are the only source-control integration.
- Skill lookups use public GitHub origins only; the company-internal SkillsHub must never be queried.
- A same-name/different-origin skill conflict is a hard stop.
- Discovery confidence is exactly `confirmed`, `inferred`, or `unknown`; inferred values require operator confirmation, unknown values require an explicit supplied value, and ports, secret names/recipients, dependency edges, integration suites, merge order, and new public skill origins always require operator confirmation before initialization.
- Every product uses one dedicated control GitHub repository, one control Project, one repository Project per managed repository, and one Engineer per managed repository.
- Generated configuration is declarative in `delivery.yaml`; generated IDs, versions, and hashes are written to `framework.lock`.
- The public lifecycle is exactly `discover`, `init`, `validate`, `plan`, `apply`, `doctor`, and `upgrade`.
- `plan` is non-mutating; `apply` accepts only a fresh, exact plan hash that the operator approved.
- Local/development may auto-merge after quality gates; this framework forbids deployment, leaving any manual deployment to a separate user-controlled system. Production never auto-merges and never auto-deploys.
- Creating a GitHub control repository, committing generated files, and pushing them are three external/source-control actions requiring separate explicit authority; `init` performs none of them.
- Secrets are referenced by environment-variable name and are never written to manifests, lock files, plans, logs, or generated instructions.
- The skill must remain product-agnostic: Eventra may appear only in fixtures and migration documentation.

---

## File Map

- `skills/multica-multi-repo-delivery/SKILL.md`: user-facing routing, safety rules, and lifecycle playbook.
- `skills/multica-multi-repo-delivery/references/manifest-schema.md`: exact manifest fields and confidence semantics.
- `skills/multica-multi-repo-delivery/references/operator-workflow.md`: approval boundaries and recovery behavior.
- `skills/multica-multi-repo-delivery/scripts/multica_delivery.py`: lifecycle command dispatcher.
- `skills/multica-multi-repo-delivery/multica_delivery_skill/discovery_model.py`: typed findings and confirmation overlay.
- `skills/multica-multi-repo-delivery/multica_delivery_skill/repository_scanner.py`: filesystem/GitHub static inventory.
- `skills/multica-multi-repo-delivery/multica_delivery_skill/stack_detectors.py`: Node, Java, Python, Go, Rust, and container evidence rules.
- `skills/multica-multi-repo-delivery/multica_delivery_skill/generator.py`: manifest/control-repository generation.
- `skills/multica-multi-repo-delivery/multica_delivery_skill/lifecycle.py`: validate/plan/apply/doctor/upgrade orchestration.
- `skills/multica-multi-repo-delivery/templates/`: control-repository files and instruction templates.
- `skills/multica-multi-repo-delivery/tests/`: scanner, generator, lifecycle, and skill-behavior tests.

### Task 1: Skill Contract and Lifecycle Routing

**Files:**
- Create: `skills/multica-multi-repo-delivery/SKILL.md`
- Create: `skills/multica-multi-repo-delivery/references/manifest-schema.md`
- Create: `skills/multica-multi-repo-delivery/references/operator-workflow.md`
- Create: `skills/multica-multi-repo-delivery/scripts/multica_delivery.py`
- Create: `skills/multica-multi-repo-delivery/tests/__init__.py`
- Create: `skills/multica-multi-repo-delivery/tests/test_skill_contract.py`

**Interfaces:**
- Consumes: a user request naming repositories or a workspace root.
- Produces: documented routing to `discover`, `init`, `validate`, `plan`, `apply`, `doctor`, or `upgrade`, with mutation/confirmation rules stated before any action.

- [ ] **Step 1: Invoke the required authoring skills before editing**

Read `skill-creator/SKILL.md` and `superpowers:writing-skills/SKILL.md` in full. Record their validation commands in the implementation session notes; if their requirements conflict with this approved spec, stop and report the exact conflict rather than silently changing this plan.

- [ ] **Step 2: Write failing structural contract tests**

```python
from pathlib import Path
import unittest


ROOT = Path(__file__).parents[1]


class SkillContractTests(unittest.TestCase):
    def test_skill_declares_all_lifecycle_commands(self):
        text = (ROOT / "SKILL.md").read_text()
        for command in ("discover", "init", "validate", "plan", "apply", "doctor", "upgrade"):
            self.assertIn(f"`{command}`", text)

    def test_skill_forbids_internal_skillshub_and_implicit_apply(self):
        text = (ROOT / "SKILL.md").read_text()
        self.assertIn("Never query the company-internal SkillsHub", text)
        self.assertIn("exact approved plan hash", text)

    def test_skill_requires_confirmation_for_uncertain_findings(self):
        text = (ROOT / "SKILL.md").read_text()
        self.assertIn("inferred", text)
        self.assertIn("unknown", text)
        self.assertIn("operator confirmation", text)
```

- [ ] **Step 3: Run the contract test and observe the missing file failure**

Run: `python3 -B -m unittest discover -s skills/multica-multi-repo-delivery/tests -t skills/multica-multi-repo-delivery -p 'test_skill_contract.py' -v`

Expected: FAIL because the skill files do not exist or cannot yet be imported by path.

- [ ] **Step 4: Write the minimal skill and command router**

`SKILL.md` must contain concise trigger rules, the seven-command decision table, read-only discovery guarantees, external-mutation approval language, public-GitHub skill policy, secret policy, environment merge/deploy policy, and the requirement to read the two reference files only when their command applies. The command router must expose:

```python
def build_parser() -> argparse.ArgumentParser: ...
def main(argv: Sequence[str] | None = None) -> int: ...
```

Each subcommand accepts `--workspace` as an absolute `Path`. `validate`, `plan`, `apply`, `doctor`, and `upgrade` also accept `--manifest`; `apply` requires `--approved-plan-hash`. The script prepends its resolved skill root to `sys.path` and imports only the valid Python package `multica_delivery_skill`. At this task boundary, handlers return exit code 2 with a precise “command implementation is unavailable until its owning task is installed” message.

- [ ] **Step 5: Run the structural tests and parser help**

Run: `python3 -B -m unittest discover -s skills/multica-multi-repo-delivery/tests -t skills/multica-multi-repo-delivery -p 'test_skill_contract.py' -v`

Expected: all tests PASS.

Run: `python3 -B skills/multica-multi-repo-delivery/scripts/multica_delivery.py --help`

Expected: exit 0 and list all seven commands.

- [ ] **Step 6: Commit the skill contract**

```bash
git add skills/multica-multi-repo-delivery
git commit -m "feat: scaffold multica multi repo delivery skill"
```

### Task 2: Typed Discovery Findings and Confirmation Overlay

**Files:**
- Create: `skills/multica-multi-repo-delivery/multica_delivery_skill/__init__.py`
- Create: `skills/multica-multi-repo-delivery/multica_delivery_skill/discovery_model.py`
- Create: `skills/multica-multi-repo-delivery/tests/test_discovery_model.py`

**Interfaces:**
- Consumes: raw detector findings and an operator confirmation map.
- Produces: `DiscoveryValue[T]`, `RepositoryDiscovery`, `ProductDiscovery`, `apply_confirmations()`, and `assert_ready_for_init()`.

- [ ] **Step 1: Write failing confidence and confirmation tests**

```python
def test_only_confirmed_discovery_is_ready(self):
    finding = DiscoveryValue(value=("npm", "test"), confidence=Confidence.CONFIRMED, evidence=("package.json:scripts.test",))
    self.assertTrue(finding.is_ready)

def test_inferred_value_requires_exact_operator_override(self):
    discovery = product_with_inferred("repositories.web.commands.test", ("npm", "test"))
    with self.assertRaisesRegex(DiscoveryConfirmationError, "repositories.web.commands.test"):
        assert_ready_for_init(discovery)
    confirmed = apply_confirmations(discovery, {"repositories.web.commands.test": ["npm", "test"]})
    assert_ready_for_init(confirmed)

def test_unknown_cannot_be_confirmed_with_null(self):
    with self.assertRaisesRegex(DiscoveryConfirmationError, "explicit value"):
        apply_confirmations(product_with_unknown("control.github"), {"control.github": None})
```

- [ ] **Step 2: Run the focused test and observe missing types**

Run: `python3 -B -m unittest discover -s skills/multica-multi-repo-delivery/tests -t skills/multica-multi-repo-delivery -p 'test_discovery_model.py' -v`

Expected: FAIL importing `Confidence`.

- [ ] **Step 3: Implement immutable findings and stable JSON reports**

```python
class Confidence(str, Enum):
    CONFIRMED = "confirmed"
    INFERRED = "inferred"
    UNKNOWN = "unknown"


@dataclass(frozen=True)
class DiscoveryValue(Generic[T]):
    value: T | None
    confidence: Confidence
    evidence: tuple[str, ...]
    operator_confirmed: bool = False

    @property
    def is_ready(self) -> bool:
        return self.confidence is Confidence.CONFIRMED and self.value is not None
```

Use dotted field paths as stable confirmation keys. `ProductDiscovery.required_confirmation_paths` must include every inferred/unknown path plus every port, secret name/recipient, dependency edge, integration suite, merge order, and newly recommended skill origin even when file evidence is confirmed. `apply_confirmations()` must reject unknown paths, require a non-null explicit value, preserve original evidence, append `operator-confirmed`, and set `operator_confirmed=True`. `assert_ready_for_init()` rejects any remaining required path. `ProductDiscovery.to_json()` must sort object keys and repository keys so two scans of unchanged inputs are byte-identical.

- [ ] **Step 4: Run discovery-model tests**

Run: `python3 -B -m unittest discover -s skills/multica-multi-repo-delivery/tests -t skills/multica-multi-repo-delivery -p 'test_discovery_model.py' -v`

Expected: all tests PASS.

- [ ] **Step 5: Commit confidence modeling**

```bash
git add skills/multica-multi-repo-delivery/multica_delivery_skill skills/multica-multi-repo-delivery/tests/test_discovery_model.py
git commit -m "feat: model multica discovery confidence"
```

### Task 3: Static Repository Scanner and Stack Detectors

**Files:**
- Create: `skills/multica-multi-repo-delivery/multica_delivery_skill/repository_scanner.py`
- Create: `skills/multica-multi-repo-delivery/multica_delivery_skill/stack_detectors.py`
- Create: `skills/multica-multi-repo-delivery/tests/fixtures/node-app/package.json`
- Create: `skills/multica-multi-repo-delivery/tests/fixtures/spring-app/pom.xml`
- Create: `skills/multica-multi-repo-delivery/tests/fixtures/python-app/pyproject.toml`
- Create: `skills/multica-multi-repo-delivery/tests/fixtures/go-app/go.mod`
- Create: `skills/multica-multi-repo-delivery/tests/fixtures/rust-app/Cargo.toml`
- Create: `skills/multica-multi-repo-delivery/tests/fixtures/container-app/Dockerfile`
- Create: `skills/multica-multi-repo-delivery/tests/fixtures/make-app/Makefile`
- Create: `skills/multica-multi-repo-delivery/tests/fixtures/ci-app/.github/workflows/ci.yml`
- Create: `skills/multica-multi-repo-delivery/tests/test_repository_scanner.py`

**Interfaces:**
- Consumes: repository paths and an injectable read-only GitHub metadata provider.
- Produces: `scan_repository(path: Path, github: GitHubMetadataProvider) -> RepositoryDiscovery` and `scan_product(paths: Sequence[Path], github) -> ProductDiscovery`.

- [ ] **Step 1: Write failing detector tests with exact evidence**

```python
def test_node_scripts_are_confirmed_from_package_json(self):
    result = scan_repository(FIXTURES / "node-app", self.github)
    self.assertEqual(result.stack.value, "node")
    self.assertEqual(result.commands["test"].value, ("npm", "test"))
    self.assertEqual(result.commands["test"].confidence, Confidence.CONFIRMED)

def test_spring_wrapper_and_settings_are_preserved_as_argv(self):
    result = scan_repository(FIXTURES / "spring-app", self.github)
    self.assertEqual(
        result.commands["test"].value,
        ("./mvnw", "-s", ".mvn/settings-public.xml", "test"),
    )

def test_scanner_never_executes_repository_commands(self):
    runner = ExplodingRunner()
    scan_repository(FIXTURES / "node-app", self.github, command_runner=runner)
    self.assertEqual(runner.calls, ())
```

- [ ] **Step 2: Write failing ambiguity and monorepo-boundary tests**

```python
def test_multiple_primary_stacks_are_reported_as_inferred(self):
    result = scan_repository(FIXTURES / "mixed-app", self.github)
    self.assertEqual(result.stack.confidence, Confidence.INFERRED)
    self.assertEqual(set(result.stack.evidence), {"package.json", "pyproject.toml"})

def test_missing_remote_is_unknown(self):
    result = scan_repository(FIXTURES / "python-app", MissingGitHubMetadata())
    self.assertEqual(result.github.confidence, Confidence.UNKNOWN)

def test_representative_stack_markers_are_classified(self):
    expected = {
        "python-app": "python",
        "go-app": "go",
        "rust-app": "rust",
        "container-app": "container",
        "make-app": "make",
    }
    for fixture, stack in expected.items():
        with self.subTest(fixture=fixture):
            self.assertEqual(scan_repository(FIXTURES / fixture, self.github).stack.value, stack)
```

- [ ] **Step 3: Run scanner tests and observe missing entry points**

Run: `python3 -B -m unittest discover -s skills/multica-multi-repo-delivery/tests -t skills/multica-multi-repo-delivery -p 'test_repository_scanner.py' -v`

Expected: FAIL importing `scan_repository`.

- [ ] **Step 4: Implement file-only evidence detectors**

```python
DETECTORS: tuple[StackDetector, ...] = (
    NodeDetector(),
    MavenDetector(),
    GradleDetector(),
    PythonDetector(),
    GoDetector(),
    RustDetector(),
    MakeDetector(),
    ContainerDetector(),
    CiDetector(),
)
```

Read only recognized UTF-8 README/AGENTS files, package/build manifests, Make/Docker/CI configuration, repository script text, executable-bit metadata for checked-in wrappers, `.git/config`, and injected GitHub metadata. Parse JSON/TOML/XML with standard parsers; treat YAML, Make, Docker, and shell content as non-executed evidence and never source it. Treat an exact checked-in script or package-manager script as `confirmed`, a conventional command not declared in project files as `inferred`, and absence as `unknown`. Preserve commands as argv tuples, not shell strings. Cap individual file reads at 2 MiB and report oversized files as evidence without parsing them.

- [ ] **Step 5: Wire `discover` to emit a report without writing files**

`discover --workspace /absolute/path --repository /absolute/repo ...` prints canonical JSON to stdout. Optional `--output /absolute/report.json` writes only that report after explicitly announcing the write; it may not create `delivery.yaml`, a Git repository, or Multica/GitHub resources.

- [ ] **Step 6: Run scanner and no-execution tests**

Run: `python3 -B -m unittest discover -s skills/multica-multi-repo-delivery/tests -t skills/multica-multi-repo-delivery -p 'test_repository_scanner.py' -v`

Expected: all tests PASS and `ExplodingRunner.calls == ()`.

- [ ] **Step 7: Commit the static scanner**

```bash
git add skills/multica-multi-repo-delivery/multica_delivery_skill skills/multica-multi-repo-delivery/tests skills/multica-multi-repo-delivery/scripts/multica_delivery.py
git commit -m "feat: discover multi repository product topology"
```

### Task 4: Manifest and Control-Repository Generator

**Files:**
- Create: `skills/multica-multi-repo-delivery/multica_delivery_skill/generator.py`
- Create: `skills/multica-multi-repo-delivery/templates/delivery.yaml.tmpl`
- Create: `skills/multica-multi-repo-delivery/templates/AGENTS.md`
- Create: `skills/multica-multi-repo-delivery/templates/README.md`
- Create: `skills/multica-multi-repo-delivery/templates/.gitignore`
- Create: `skills/multica-multi-repo-delivery/templates/instructions/squad.md`
- Create: `skills/multica-multi-repo-delivery/templates/instructions/delivery-lead.md`
- Create: `skills/multica-multi-repo-delivery/templates/instructions/independent-reviewer.md`
- Create: `skills/multica-multi-repo-delivery/templates/instructions/integration-qa.md`
- Create: `skills/multica-multi-repo-delivery/templates/instructions/workflow-watcher.md`
- Create: `skills/multica-multi-repo-delivery/templates/instructions/repository-engineer.md`
- Create: `skills/multica-multi-repo-delivery/tests/test_generator.py`

**Interfaces:**
- Consumes: a fully confirmed `ProductDiscovery`, destination path, and `overwrite: bool`.
- Produces: `generate_control_repository(discovery, destination, engine_source, *, overwrite=False) -> GeneratedControlRepository` containing valid `delivery.yaml`, versioned `framework.lock`, generated role/repository instructions, a pinned runtime copy under `tools/multica_delivery/`, tests/docs, `AGENTS.md`, `README.md`, and `.gitignore`.

- [ ] **Step 1: Write failing generation and refusal tests**

```python
def test_generates_valid_three_repository_manifest(self):
    generated = generate_control_repository(self.confirmed, self.destination, self.engine_source)
    manifest = load_manifest(generated.manifest_path)
    self.assertEqual(tuple(manifest.repositories), ("api", "notifications", "web"))
    self.assertEqual(manifest.policy.deployment, "forbidden")

def test_refuses_unconfirmed_discovery(self):
    with self.assertRaisesRegex(DiscoveryConfirmationError, "inferred"):
        generate_control_repository(self.inferred, self.destination, self.engine_source)

def test_refuses_nonempty_destination(self):
    (self.destination / "owned.txt").write_text("user")
    with self.assertRaisesRegex(GenerationError, "destination is not empty"):
        generate_control_repository(self.confirmed, self.destination, self.engine_source)
```

- [ ] **Step 2: Run generator tests and observe the missing module failure**

Run: `python3 -B -m unittest discover -s skills/multica-multi-repo-delivery/tests -t skills/multica-multi-repo-delivery -p 'test_generator.py' -v`

Expected: FAIL importing `generate_control_repository`.

- [ ] **Step 3: Implement deterministic, secret-free generation**

```python
@dataclass(frozen=True)
class GeneratedControlRepository:
    root: Path
    manifest_path: Path
    lock_path: Path
    files: tuple[Path, ...]
```

Generate files in memory with `string.Template`, validate the rendered manifest with `load_manifest_text()`, then create them with exclusive semantics. On failure, remove only files created during that invocation and leave a pre-existing destination untouched. Render one repository instruction from `repository-engineer.md` per repository key. Copy the tested generic runtime and its tests into `tools/multica_delivery/` so agents do not depend on the operator's global Codex installation. `framework.lock` begins with skill version, engine version, manifest schema version, workflow metadata version, supported Multica CLI range, manifest digest, and empty resource ID maps. Environment entries contain only variable names such as `JWT_SECRET`, never values.

- [ ] **Step 4: Wire `init` to confirmation JSON and safe generation**

`init` accepts `--discovery-report`, `--confirmations`, `--destination`, and `--engine-source`. It calls `apply_confirmations()`, `assert_ready_for_init()`, and `generate_control_repository()`. It prints the exact created file list and stops; it does not initialize Git, commit, create a GitHub repository, push, import skills, or call Multica.

- [ ] **Step 5: Run generation tests and validate generated YAML**

Run: `python3 -B -m unittest discover -s skills/multica-multi-repo-delivery/tests -t skills/multica-multi-repo-delivery -p 'test_generator.py' -v`

Run: `python3 -B -m unittest tools.multica_delivery.tests.test_manifest -v`

Expected: all tests PASS.

- [ ] **Step 6: Commit safe generation**

```bash
git add skills/multica-multi-repo-delivery/multica_delivery_skill/generator.py skills/multica-multi-repo-delivery/templates skills/multica-multi-repo-delivery/tests/test_generator.py skills/multica-multi-repo-delivery/scripts/multica_delivery.py
git commit -m "feat: generate multica delivery control repositories"
```

### Task 5: Validate, Plan, and Approved Apply

**Files:**
- Create: `skills/multica-multi-repo-delivery/multica_delivery_skill/lifecycle.py`
- Create: `skills/multica-multi-repo-delivery/tests/test_lifecycle.py`
- Modify: `skills/multica-multi-repo-delivery/scripts/multica_delivery.py`
- Modify: `skills/multica-multi-repo-delivery/references/operator-workflow.md`

**Interfaces:**
- Consumes: manifest/lock paths, runtime/daemon IDs from config, typed generic clients, and an approved plan hash.
- Produces: `validate_instance() -> ValidationReport`, `build_plan() -> PlanReceipt`, and `apply_plan(receipt, approved_hash) -> ApplyReport`.

- [ ] **Step 1: Write failing validation and stable-plan tests**

```python
def test_validate_reports_every_unconfirmed_path(self):
    report = validate_instance(self.manifest_with_inferred_value, self.empty_lock)
    self.assertFalse(report.ok)
    self.assertEqual(report.errors[0].path, "repositories.web.commands.test")

def test_plan_is_non_mutating_and_hash_is_stable(self):
    first = build_plan(self.manifest_path, self.lock_path, self.clients)
    second = build_plan(self.manifest_path, self.lock_path, self.clients)
    self.assertEqual(first.plan_hash, second.plan_hash)
    self.assertFalse(self.clients.was_mutated)
```

- [ ] **Step 2: Write failing apply freshness, hash, and secret-redaction tests**

```python
def test_apply_rejects_wrong_hash(self):
    receipt = build_plan(self.manifest_path, self.lock_path, self.clients)
    with self.assertRaisesRegex(ApprovalError, "approved plan hash"):
        apply_plan(receipt, "0" * 64, self.clients, self.secrets)

def test_apply_rejects_changed_manifest(self):
    receipt = build_plan(self.manifest_path, self.lock_path, self.clients)
    self.change_manifest()
    with self.assertRaisesRegex(ApprovalError, "manifest changed"):
        apply_plan(receipt, receipt.plan_hash, self.clients, self.secrets)

def test_receipt_never_contains_secret_values(self):
    receipt = build_plan(self.manifest_path, self.lock_path, self.clients)
    self.assertNotIn("stable-secret-value", receipt.to_json())
```

- [ ] **Step 3: Run lifecycle tests and observe missing functions**

Run: `python3 -B -m unittest discover -s skills/multica-multi-repo-delivery/tests -t skills/multica-multi-repo-delivery -p 'test_lifecycle.py' -v`

Expected: FAIL importing `build_plan`.

- [ ] **Step 4: Implement validation and immutable receipts**

```python
@dataclass(frozen=True)
class PlanReceipt:
    schema_version: int
    framework_version: str
    manifest_hash: str
    lock_hash: str
    created_at: str
    expires_at: str
    actions: tuple[ReconcileAction, ...]
    plan_hash: str
```

The plan hash is SHA-256 over canonical JSON excluding `plan_hash`. A receipt expires after 30 minutes. `apply_plan()` must re-read manifest and lock, compare both hashes, compare the exact approved hash using `hmac.compare_digest`, run the contract audit again, then call `Provisioner.reconcile(..., apply=True)`. Write `framework.lock` atomically only after every apply action succeeds. An apply failure retains the old lock and prints a redacted reconciliation report.

- [ ] **Step 5: Wire lifecycle commands and exit codes**

Use exit 0 for success, 1 for validation/audit failure, 2 for command/config misuse, and 3 for stale or mismatched approval. `plan --output /absolute/plan.json` writes the receipt; `apply --plan /absolute/plan.json --approved-plan-hash HASH` accepts only `HASH` matching `[0-9a-f]{64}`. Before invoking `apply`, the skill must summarize resource creates/updates and explicitly obtain approval for that exact hash.

- [ ] **Step 6: Run lifecycle and generic provision tests**

Run: `python3 -B -m unittest discover -s skills/multica-multi-repo-delivery/tests -t skills/multica-multi-repo-delivery -p 'test_lifecycle.py' -v`

Run: `python3 -B -m unittest tools.multica_delivery.tests.test_provision tools.multica_delivery.tests.test_contract_audit -v`

Expected: all tests PASS.

- [ ] **Step 7: Commit approved-apply lifecycle**

```bash
git add skills/multica-multi-repo-delivery/multica_delivery_skill/lifecycle.py skills/multica-multi-repo-delivery/tests/test_lifecycle.py skills/multica-multi-repo-delivery/scripts/multica_delivery.py skills/multica-multi-repo-delivery/references/operator-workflow.md
git commit -m "feat: add validated multica plan and apply lifecycle"
```

### Task 6: Doctor and Version-Locked Upgrade

**Files:**
- Modify: `skills/multica-multi-repo-delivery/multica_delivery_skill/lifecycle.py`
- Modify: `skills/multica-multi-repo-delivery/scripts/multica_delivery.py`
- Create: `skills/multica-multi-repo-delivery/tests/test_doctor_upgrade.py`
- Create: `skills/multica-multi-repo-delivery/references/upgrades.md`

**Interfaces:**
- Consumes: installed manifest/lock, current framework version, target framework version, and live read-only state.
- Produces: `doctor_instance() -> DoctorReport` and `plan_upgrade() -> PlanReceipt`; upgrades reuse `apply_plan()` and its exact-hash gate.

- [ ] **Step 1: Write failing drift and ownership tests**

```python
def test_doctor_reports_missing_agent_and_extra_unowned_process(self):
    report = doctor_instance(self.manifest, self.lock, self.drifted_clients)
    self.assertIn("agents.web-engineer: missing", report.failures)
    self.assertIn("services.frontend: running but not framework-owned", report.warnings)

def test_doctor_does_not_stop_processes(self):
    doctor_instance(self.manifest, self.lock, self.drifted_clients)
    self.assertEqual(self.process_manager.stop_calls, ())
```

- [ ] **Step 2: Write failing upgrade-lock tests**

```python
def test_upgrade_refuses_skipped_schema_migration(self):
    with self.assertRaisesRegex(UpgradeError, "no migration path"):
        plan_upgrade(self.manifest, lock_at("1.0.0"), target="3.0.0")

def test_upgrade_is_a_normal_hashed_plan(self):
    receipt = plan_upgrade(self.manifest, lock_at("1.0.0"), target="1.1.0")
    self.assertEqual(len(receipt.plan_hash), 64)
    self.assertIn("framework.lock", tuple(action.target for action in receipt.actions))

def test_upgrade_rejects_incompatible_active_parent_metadata(self):
    with self.assertRaisesRegex(UpgradeError, "active parent issues"):
        plan_upgrade(self.manifest, lock_at("1.0.0"), target="1.1.0", active_parents=("PRO-101",))
```

- [ ] **Step 3: Run focused tests and observe missing behavior**

Run: `python3 -B -m unittest discover -s skills/multica-multi-repo-delivery/tests -t skills/multica-multi-repo-delivery -p 'test_doctor_upgrade.py' -v`

Expected: FAIL because doctor/upgrade functions are absent.

- [ ] **Step 4: Implement read-only diagnosis and sequential migrations**

`doctor_instance()` combines manifest validation, lock verification, contract audit, live-vs-lock resource drift, repository visibility/default branch, public skill-origin consistency, agent environment key presence without values, owned-process registry consistency, stale issue detection, and Watcher trigger health. It performs no repair. `plan_upgrade()` supports an explicit migration registry keyed by adjacent versions and emits a normal plan receipt; it must not edit the manifest or lock during planning. Any schema/workflow-metadata migration incompatible with active parents is forbidden until those parents are terminal, and upgrades never rotate secrets or rewrite active Issue metadata.

- [ ] **Step 5: Document repair routing**

The report maps each finding to exactly one next command: edit and `validate`, rerun `plan`, obtain approval and `apply`, or perform manual service/secret correction. It must not recommend deleting unknown live resources or resetting repositories.

- [ ] **Step 6: Run doctor/upgrade and lifecycle tests**

Run: `python3 -B -m unittest discover -s skills/multica-multi-repo-delivery/tests -t skills/multica-multi-repo-delivery -p 'test_doctor_upgrade.py' -v`

Run: `python3 -B -m unittest discover -s skills/multica-multi-repo-delivery/tests -t skills/multica-multi-repo-delivery -p 'test_lifecycle.py' -v`

Expected: all tests PASS.

- [ ] **Step 7: Commit diagnosis and upgrades**

```bash
git add skills/multica-multi-repo-delivery/multica_delivery_skill/lifecycle.py skills/multica-multi-repo-delivery/scripts/multica_delivery.py skills/multica-multi-repo-delivery/tests/test_doctor_upgrade.py skills/multica-multi-repo-delivery/references/upgrades.md
git commit -m "feat: diagnose and upgrade multica delivery instances"
```

### Task 7: Skill Packaging, Isolation, and End-to-End Verification

**Files:**
- Create: `skills/multica-multi-repo-delivery/tests/test_end_to_end.py`
- Create: `skills/multica-multi-repo-delivery/tests/fixtures/confirmed-product.json`
- Modify: `skills/multica-multi-repo-delivery/SKILL.md`
- Modify: `skills/multica-multi-repo-delivery/references/manifest-schema.md`
- Modify: `skills/multica-multi-repo-delivery/references/operator-workflow.md`

**Interfaces:**
- Consumes: a two-repository workspace fixture and fake Multica/GitHub clients.
- Produces: a validated skill package that goes from discovery to idempotent fake apply without touching live systems.

- [ ] **Step 1: Write a failing end-to-end safety test**

```python
def test_discover_init_plan_apply_and_second_apply_noop(self):
    discovery = scan_product(self.fixture_repositories, self.fake_github)
    confirmed = apply_confirmations(discovery, self.confirmations)
    generated = generate_control_repository(confirmed, self.destination, self.engine_source)
    receipt = build_plan(generated.manifest_path, generated.lock_path, self.clients)
    first = apply_plan(receipt, receipt.plan_hash, self.clients, self.secrets)
    second_receipt = build_plan(generated.manifest_path, generated.lock_path, self.clients)
    second = apply_plan(second_receipt, second_receipt.plan_hash, self.clients, self.secrets)
    self.assertGreater(len(first.actions), 0)
    self.assertEqual(second.actions, ())
    self.assertNotIn(self.secrets["JWT_SECRET"], generated.lock_path.read_text())
```

- [ ] **Step 2: Run end-to-end test and fix only integration mismatches**

Run: `python3 -B -m unittest discover -s skills/multica-multi-repo-delivery/tests -t skills/multica-multi-repo-delivery -p 'test_end_to_end.py' -v`

Expected before wiring fixes: FAIL at the first mismatched interface. Update imports/signatures to the exact interfaces declared in Tasks 2-6; do not duplicate generic-core logic in the skill.

- [ ] **Step 3: Run skill-authoring validation from the required skills**

Run the exact structural/frontmatter/package validation commands prescribed by the installed `skill-creator` and `superpowers:writing-skills` documents. Expected: all checks PASS with no unreferenced required resources and no oversized `SKILL.md` section.

- [ ] **Step 4: Run all skill and generic-core tests**

Run: `python3 -B -m unittest discover -s skills/multica-multi-repo-delivery/tests -t skills/multica-multi-repo-delivery -p 'test_*.py' -v`

Expected: all skill tests PASS.

Run: `python3 -B -m unittest discover -s tools -p 'test_*.py' -v`

Expected: all generic and Eventra compatibility tests PASS.

Run: `git diff --check`

Expected: exit 0 with no output.

- [ ] **Step 5: Perform the personal installation only after separate approval**

After the user approves writing outside the workspace, install the checked-in skill from `/Users/didi/Eventra-workspace/Eventra/skills/multica-multi-repo-delivery` using the installation procedure required by `skill-creator`. Do not publish it or create a GitHub repository in this step. Restart/reload Codex if the authoring skill requires it, then verify the skill appears by exact name `multica-multi-repo-delivery`.

- [ ] **Step 6: Commit the verified package**

```bash
git add skills/multica-multi-repo-delivery
git commit -m "test: verify reusable multica delivery skill"
```
