# Generic Multica Multi-Repository Delivery Skill Design

Date: 2026-08-26
Status: approved in chat; pending written-spec review

## Purpose

Turn the Eventra-specific Multica automation into a reusable onboarding and
delivery system for products composed of one or more unrelated GitHub
repositories. A new product should be able to create a quality-gated Multica
team from a reviewed manifest instead of copying and rewriting the Eventra
adapter.

The first version is intentionally limited to GitHub repositories that use pull
requests, have local checkouts with executable test and startup commands, and
are accessible through one Multica daemon. Production deployment is outside the
system.

## Goals

- Support one to N business repositories with different technology stacks.
- Create one dedicated Engineer Agent and one Multica Project per repository.
- Keep fixed control roles for delivery coordination, independent review,
  integration QA, and stalled-work recovery.
- Use one control Project for parent Issues and N repository Projects for
  execution children.
- Discover repository configuration safely, but make a reviewed manifest the
  only authoritative source of project-specific behavior.
- Preserve deterministic Stage progression, exact-SHA evidence, bounded repair,
  automatic development merges, post-merge local smoke, and idempotent recovery.
- Package onboarding and maintenance as a reusable Codex skill with dry-run
  first and explicit approval before external writes.
- Keep secrets out of Git, argv, logs, Issues, comments, and unrelated Agents.

## Non-goals

- GitLab, Bitbucket, non-Git repositories, or direct commits without pull
  requests.
- Multiple Multica daemons in one delivery instance.
- Remote deployment, production merge automation, or production deployment.
- Automatic rollback after a partial multi-repository merge.
- Guessing commands, credentials, ports, repository ownership, or interface
  contracts when static evidence is insufficient.
- A generic workflow engine for non-software delivery.

## Selected approach

Use a three-part architecture:

1. A reusable `multica-multi-repo-delivery` Codex skill provides discovery,
   review prompts, scaffolding, validation, planning, approved application,
   diagnosis, and upgrades.
2. A tracked product manifest contains every project-specific difference.
3. A project-neutral Python engine performs strict Multica/GitHub reads,
   provisioning, workflow decisions, phase completion, parent completion, and
   bounded Watcher recovery.

This separates model-guided discovery and operator experience from the
deterministic operations that decide whether work may advance or merge.

Copying the Eventra adapter for each product was rejected because fixes would
diverge across instances. A pure prompt-driven skill was rejected because
idempotency, secret boundaries, exact-SHA gates, and partial-merge handling
would depend on model judgment at run time.

## Product control repository

Each product owns a lightweight GitHub repository named like
`<product>-delivery-control`. It is not a business-code repository. Its local
checkout is the authoritative execution location for the workflow helper and
contains:

```text
delivery-control/
├── delivery.yaml
├── framework.lock
├── instructions/
│   ├── squad.md
│   ├── delivery-lead.md
│   ├── independent-reviewer.md
│   ├── integration-qa.md
│   ├── workflow-watcher.md
│   └── repositories/
├── tools/multica_delivery/
├── tests/
└── docs/
```

The skill may scaffold this repository locally. Creating the GitHub repository,
committing, or pushing requires a separate explicit approval. Generated runtime
files are versioned so Multica Agents can run a stable helper without relying
on the operator's global Codex installation.

`framework.lock` records the skill version, engine version, manifest schema
version, workflow metadata version, and supported Multica CLI range. Framework
upgrades are explicit migrations and never silently rewrite an instance.

## Manifest model

`delivery.yaml` is the authoritative product configuration. The generic engine
must not contain product names, fixed frontend/backend roles, absolute Eventra
paths, or stack-specific commands.

A representative shape is:

```yaml
schema_version: 1
instance:
  key: sample-product
  display_name: Sample Product
  runtime_id: 11111111-1111-4111-8111-111111111111
  daemon_id: 22222222-2222-4222-8222-222222222222
  control_project: Sample Product Delivery Control

policies:
  environment: development
  automatic_merge: true
  deployment: forbidden
  max_repair_attempts: 2
  watcher_cron: "*/30 * * * *"
  watcher_timezone: Asia/Shanghai

repositories:
  api:
    github: example/sample-api
    local_path: /absolute/path/sample-api
    default_branch: main
    project: Sample Product API
    description: Owns public and internal HTTP APIs.
    commands:
      focused_test: ./scripts/test-focused.sh
      test: ./scripts/test.sh
      build: ./scripts/build.sh
      start: ./scripts/run-local.sh
      smoke: ./scripts/smoke-local.sh
    services:
      - name: api
        port: 8080
        health_url: http://localhost:8080/health
    skills:
      - using-superpowers
      - test-driven-development
      - systematic-debugging
      - verification-before-completion
    secret_env:
      DATABASE_URL:
        recipients: [engineer, integration-qa]

  web:
    github: example/sample-web
    local_path: /absolute/path/sample-web
    default_branch: main
    project: Sample Product Web
    description: Owns the browser user interface.
    depends_on: [api]
    commands:
      focused_test: npm run test:focused
      test: npm test
      build: npm run build
      start: npm run dev:local
      smoke: npm run smoke:local
    services:
      - name: web
        port: 3000
        health_url: http://localhost:3000
    skills:
      - using-superpowers
      - test-driven-development
      - systematic-debugging
      - verification-before-completion

integration_suites:
  web-api:
    repositories: [api, web]
    start_order: [api, web]
    command_repository: web
    command: npm run test:integration

merge_order: [api, web]
```

The schema must reject duplicate repository keys, duplicate Projects, duplicate
paths, duplicate service ports on the same daemon, nonexistent dependencies,
cyclic dependencies, missing mandatory commands, invalid GitHub repository
identifiers, undeclared secret recipients, and merge orders inconsistent with
the dependency graph.

Environment values are never stored in the manifest. It records only variable
names, validation rules, and permitted Agent roles.

## Skill source policy

Agent skills come only from operator-approved public GitHub origins. The
framework maintains a key-to-URL registry, and the manifest refers to registry
keys rather than copying arbitrary instructions into an Agent. Repository
discovery may recommend skills that match a detected stack, but the operator
must approve every new origin before it is imported or bound.

The framework does not query or import from the company-internal SkillsHub. A
pre-existing Multica skill with the desired name but a different source URL is
a hard stop. Provisioning adds required bindings without replacing unrelated
existing bindings, and every applied binding is verified through an
authoritative read.

## Discovery and confirmation

The skill performs read-only discovery over explicitly selected workspace
directories. It may inspect `README`, `AGENTS.md`, package manifests, Maven and
Gradle files, Python, Go, Rust, Make, Docker and CI configuration, repository
scripts, Git remotes, and default branches.

Every discovered value has one confidence class:

- `confirmed`: a repository file or Git fact proves the value;
- `inferred`: evidence strongly suggests the value but operator confirmation is
  required;
- `unknown`: the skill cannot safely propose a value.

Only confirmed values and operator-approved inferred values may enter the final
manifest. Port allocation, secret variable names and recipients, dependency
edges, integration suites, and merge order always require explicit
confirmation. Unknown values block initialization rather than receiving a
guessed default.

## Multica resource topology

One delivery instance creates:

- one Delivery Lead;
- one Independent Reviewer;
- one Integration QA Agent;
- one independent Workflow Watcher Agent;
- one dedicated Engineer Agent per business repository;
- one delivery Squad containing all roles except the Watcher;
- one control Project for parent Issues;
- one Project per business repository, each owning exactly one local worktree
  resource; and
- one run-only scheduled Watcher Autopilot associated with the control Project.

All Agents are workspace-visible and default to concurrency one. The Watcher is
outside the Squad so recovery cannot consume the Delivery Lead's task slot.

Each repository Engineer receives the common implementation skills plus only
the stack and domain skills approved for that repository. Integration QA may
receive the union of explicitly approved verification skills needed by declared
integration suites. The Watcher receives only workflow-use, systematic-debugging,
and verification skills.

## Skill operation and authority

The skill exposes these operator intents:

- `discover`: read repositories and produce a classified discovery report;
- `init`: create the local control-repository scaffold and manifest draft;
- `validate`: validate the manifest, repositories, commands, dependency graph,
  ports, policies, and secret-recipient declarations;
- `plan`: audit read contracts and show a mutation-free Multica reconciliation;
- `apply`: after explicit approval, create or update the exact instance
  resources;
- `doctor`: inspect configured resources, workflow health, environment
  recipient coverage, Watcher status, and idempotency; and
- `upgrade`: plan and, after approval, apply a framework/schema migration.

Natural-language use does not hide the active phase. The skill must say whether
it is discovering, writing local scaffold files, planning external mutations,
or applying approved changes.

The default mode is read-only discovery and dry-run. `apply` requires a fresh
plan and explicit operator approval. GitHub repository creation, commit, push,
and production-related operations each require separate authority and are not
implied by Multica provisioning approval.

## Issue intake and repository routing

All parent Issues are created in the control Project, assigned to the delivery
Squad, and moved from backlog to todo. Delivery Lead analyzes the Issue against
repository descriptions, declared capabilities, the dependency graph, and
acceptance criteria to produce an affected repository set.

Unambiguous, authorized work proceeds automatically. Multiple reasonable
repository sets, conflicting acceptance criteria, a repository outside the
manifest, or a new secret/permission requirement creates a human clarification
wait.

The parent stores string-valued, schema-validated metadata including:

- workflow version and instance key;
- affected repository keys;
- current candidate SHA map;
- interface-contract hashes;
- next Stage ordinal and repair attempt;
- current merge plan and merge state; and
- a stable last-action key.

Arbitrary maps are serialized as canonical JSON strings with sorted keys. Raw
Issue text, secrets, environment values, webhook bodies, and tokens are
forbidden metadata.

## N-repository Stage workflow

### Implementation

Delivery Lead creates one implementation child per affected repository and
routes it to that repository's Project and Engineer. A child records its
repository, base SHA, acceptance criteria, required commands, relevant contract
hash, and required evidence.

Repositories with no unresolved dependency may execute in parallel. Repositories
with a frozen interface contract may also execute in parallel. A real producer
dependency without a frozen contract creates separate topological Stage waves;
the dependent child starts only after the producer supplies an exact SHA and
contract evidence.

Each Engineer uses test-first development, updates one pull request for its
repository, and returns repository key, base SHA, candidate SHA, branch, PR,
changed paths, commands and exit codes, contract notes, concerns, and an
evidence-comment UUID.

### Phase completion

Every execution role uses the generic equivalent of `finish-phase`. It writes
and verifies a phase envelope containing workflow version, repository key,
phase kind, `pass|fail|blocked`, attempt, exact SHA, PR where applicable, and
evidence-comment UUID, then marks the child `done`.

Child `done` means phase execution finished. The phase result is the verdict.
A failed or blocked child still becomes `done` so the native Multica Stage
barrier can wake Delivery Lead.

### Independent gates

After implementation or repair passes, Delivery Lead creates one independent
review task for each affected repository and the QA tasks required by the
manifest's integration suites. Review and QA decisions are valid only for the
exact SHA map they name.

Integration QA verifies individual repositories and declared suites in
dependency order. Every started service records repository, exact SHA, PID,
port, health result, owning Run, and process owner. Only the owner may stop that
known process.

### Repair

Any non-PASS implementation, review, QA, or smoke result returns findings to the
existing repository PR. The Engineer produces a replacement SHA, and all
affected gates are recomputed. No prior PASS transfers to a new SHA.

The default maximum is two complete repair attempts. Exhaustion blocks the
parent with exact evidence and a required human decision.

### Merge and smoke

Before the first merge, every affected PR must be open, mergeable, have passing
required checks, and have a head equal to the exact candidate SHA reviewed and
QA-tested. Delivery Lead computes a deterministic merge plan consistent with
the dependency DAG and the confirmed manifest order.

All merge gates must pass before any repository merges. Merges then execute
consecutively. A failure after at least one merge records a partial merge,
blocks the parent, and stops without automatic rollback or deployment.

After all merges, QA runs every affected repository smoke command and all
applicable cross-repository smoke suites against exact merged SHAs. A stable
PASS decision, verified by two authoritative reads, moves the parent directly
to `done`.

## Determinism and idempotency

Every coordinator mutation has a stable action key derived from workflow
version, instance key, parent identifier, Stage kind, repair attempt, affected
repository set, candidate SHA map, and contract hashes.

Before mutation, the engine rereads parent metadata, staged children, evidence
comments, active and terminal Runs, pull-request heads and checks, and merge
state. An existing action or active successor returns `noop`. Stage ordinals
increase monotonically and are never reused.

Provisioning reconciles exact instance-scoped names and stable identities. It
updates existing target resources, never deletes unknown resources, and fails
on duplicate or foreign target state. A converged second apply must report
`mutation_count=0`.

## Watcher

Each instance has one independent run-only Watcher scheduled every 30 minutes
in the manifest timezone by default. It scans only the instance's control and
repository Projects, only supported workflow versions, and only active parent
Issues.

The Watcher rereads state before mutation, ignores healthy active work and
human approval waits, and reruns at most one existing intended child or parent
assignment. It never creates delivery work, modifies business code, changes a
repair attempt, waives a gate, merges, rolls back, or deploys. If normal Stage
automation already advanced the workflow, it returns `noop`.

## Security and local process policy

Secret values are accepted only through no-echo prompting or stdin and supplied
only to manifest-approved Agent recipients. They may not appear in argv,
tracked or generated files, logs, exceptions, Issue text, comments, PRs, or
reports. One repository Engineer does not inherit another repository's secrets.

Unknown local processes are never reused or terminated. A port collision blocks
the relevant gate unless the process can be proven to belong to the same Run,
repository, and exact SHA. Cleanup targets only recorded owned PIDs.

## Merge and deployment policy

The default first-version policy is:

- development/local quality gates may authorize automatic pull-request merge;
- merged local services and smoke suites may run automatically;
- deployment is forbidden;
- production automatic merge is forbidden; and
- production deployment always requires a separate human-designed and
  human-triggered system outside this framework.

The first version does not allow a manifest to weaken these production
restrictions.

## Failure handling

The engine fails closed for malformed manifests or metadata, missing evidence,
unknown repository scope, SHA mismatches, dependency cycles, command absence,
unowned ports, CLI contract drift, required-check failures, ambiguous
requirements, new authority requirements, repair exhaustion, and partial
merges.

Transient read operations may receive one bounded retry when the operation is
safe and idempotent. Repeated failure becomes a structured `blocked` result or
a failed provisioning/doctor report. The system never converts missing or
unverifiable evidence to PASS.

## Testing strategy

The generic framework uses five test layers:

1. Manifest schema tests cover one to N repositories, DAG validation, port
   conflicts, secret recipients, commands, integration suites, and merge order.
2. Discovery fixtures cover representative Node, Java, Python, Go, Rust,
   containerized, and mixed repositories, including ambiguous and unknown
   results.
3. Pure state-machine tests cover single repository, two repositories, three or
   more repositories, independent parallel work, topological waves, exact-SHA
   invalidation, bounded repairs, idempotent repeats, and partial merges.
4. Stateful fake Multica/GitHub tests cover provisioning, Issue metadata and
   Stages, pull requests, checks, Autopilots, triggers, Watcher recovery, CLI
   contract drift, and secret-redaction invariants.
5. Instance acceptance tests prove audit and dry-run are mutation-free, first
   apply creates only desired resources, second apply has zero mutations, and
   pilot Issues complete through review, QA, merge, and smoke without
   deployment.

Eventra becomes the first compatibility fixture. Migration is complete only
when its frontend-only, backend-only, and cross-repository pilots retain their
existing safety and automation behavior under the generic engine.

## Upgrade policy

An upgrade reads the current lock and manifest, produces a migration plan,
shows file and Multica resource differences, runs the complete control-repository
test suite, performs a dry-run, and waits for approval before apply. A second
apply verifies convergence.

Schema or workflow-metadata upgrades that are incompatible with active parent
Issues are forbidden until those Issues reach a terminal state. Upgrades never
silently rewrite active Issue metadata or rotate secrets.

## Acceptance criteria

- The skill can discover an explicitly selected workspace containing one to N
  local GitHub repositories and generate a classified manifest draft.
- The operator can review and confirm all inferred commands, ports, secrets,
  dependency edges, integration suites, and merge order.
- Validation rejects every unsafe manifest condition described above.
- Dry-run performs no external mutation and presents an exact reconciliation
  summary.
- Approved apply creates one control Project, N repository Projects, fixed
  control Agents, one Engineer per repository, one Squad excluding the
  Watcher, and one scheduled independent Watcher.
- A second apply reports zero mutations and does not disturb unrelated
  Multica resources.
- Single- and multi-repository parent Issues progress through implementation,
  exact-SHA review, integration QA, at most two repair attempts, approved
  automatic development merge, and merged local smoke.
- Dependency DAGs control parallel execution, service startup, integration
  suites, and merge order.
- Exact-SHA changes invalidate prior gate results.
- Partial merges, unknown processes, ambiguous scope, new authority, and repair
  exhaustion block safely.
- No secret value is written to argv, Git, files, logs, exceptions, Issues,
  comments, or pull requests.
- No operation performs deployment or automatic production merge.

## Implementation boundaries

The first implementation should generalize the current Eventra engine rather
than replace it in one step. It should first extract a project-neutral manifest
and state model with compatibility tests, then add N-repository provisioning
and workflow behavior, then package discovery and lifecycle operations as the
skill. Eventra remains on the proven adapter until compatibility pilots pass.

Creating the reusable skill, refactoring the Python engine, migrating Eventra,
creating a new GitHub control repository, and applying live Multica changes are
separate implementation and authority steps. This design approves the
architecture only.
