# Multica Multi-Repo Delivery Team Design

Date: 2026-08-21
Status: Approved for implementation planning

## 1. Objective

Create a reusable Multica team blueprint that can accept one product Issue and
autonomously coordinate changes across separate frontend and backend Git
repositories. Eventra is the first local-development validation project.

The Eventra instance must support:

- frontend-only Issues;
- backend-only Issues;
- cross-stack Issues that produce one PR per affected repository;
- isolated worktree development;
- independent review and exact-commit integration testing;
- automatic merging after all quality gates pass;
- automatic local startup and smoke verification after merge; and
- a production policy in which deployment is always triggered by a human.

The design must prevent repository-boundary mistakes, secret leakage, false
success reports, nested orchestration, and project-specific instructions from
polluting teams used by other projects.

## 2. Scope and Non-Goals

### In scope

- A reusable five-agent team blueprint.
- A separate Eventra team instance generated from that blueprint.
- Multica Project resources for two local Git repositories.
- Per-repository `AGENTS.md` files and standardized local commands.
- Public external skills appropriate for the Eventra technology stack.
- GitHub branch, PR, review, merge, and evidence conventions.
- Local configuration and secret-injection conventions that work in every
  Multica-created worktree.
- A three-Issue pilot covering frontend-only, backend-only, and cross-stack
  delivery.

### Out of scope

- Reusing the existing `Web SaaS Delivery` Squad.
- Using the company-internal SkillsHub or any company-internal skill source.
- Publishing Eventra to a remote runtime or cloud platform.
- Giving agents production credentials or permission to trigger production
  deployment.
- Editing the duplicate backend tree stored inside the frontend repository.

## 3. Key Decisions

1. The team uses five roles: Delivery Lead, Frontend Engineer, Backend
   Engineer, Integration QA, and Independent Reviewer.
2. The Delivery Lead coordinates work but never changes business code.
3. Reuse means reusing a declarative team blueprint, not reusing the same live
   agent identities across unrelated projects.
4. Every project gets a new isolated Squad instance plus a small project
   adapter layer.
5. Multica owns worktree creation. Agents do not create nested worktrees.
6. Cross-stack work produces two linked PRs and one combined acceptance result.
7. Quality gates permit automatic merging in both development and production
   workflows.
8. Local development may automatically start the merged applications.
   Production deployment always requires an explicit human action.
9. Safe local defaults may be committed. Secrets remain outside Git and are
   injected by standardized startup commands.
10. Material ambiguity pauses dispatch for one consolidated clarification;
    low-risk ambiguity is resolved using documented defaults and assumptions.

## 4. Reuse Architecture

### 4.1 Reusable blueprint: `Multi-Repo Delivery`

The blueprint contains only project-neutral behavior:

- five role definitions and ownership boundaries;
- generic Superpowers skills;
- Issue classification, decomposition, and dependency rules;
- handoff and evidence schemas;
- review, QA, merge, and deployment gates; and
- generic failure and escalation policies.

It must not contain product names, absolute repository paths, fixed ports,
framework names, or project-specific commands.

### 4.2 Project instance: `Eventra Local Delivery`

The Eventra instance is generated from the blueprint and adds:

- two Eventra repositories and their roles;
- Eventra-specific paths, commands, ports, and forbidden directories;
- local configuration and secret-injection details;
- React/Next.js, Spring Boot, JWT, and browser-testing skills; and
- Eventra acceptance flows.

This separation prevents a later project from changing the instructions or
skills of Eventra agents and prevents Eventra context from leaking into a new
project.

## 5. Agent Model

Multica `description` fields are catalog summaries only. Each runtime behavior
listed below must be expressed in the agent's persistent `instructions` and in
the Project/repository context. All agents receive `using-superpowers` as the
skill-discovery and activation layer.

### 5.1 Delivery Lead

Responsibilities:

- read the parent Issue and repository context;
- classify scope as `frontend-only`, `backend-only`, or `cross-stack`;
- clarify material ambiguity and record low-risk assumptions;
- define acceptance criteria and explicit non-goals;
- create child Issues, dependencies, and ownership assignments;
- freeze the API contract before parallel cross-stack implementation;
- validate all evidence and coordinate automatic merge; and
- close or transition the parent Issue using the environment policy.

Restrictions:

- no business-code changes;
- no implementation commits or PR ownership; and
- no nested sub-agent orchestration outside Multica Issue/Squad dispatch.

Skills:

- `brainstorming`
- `writing-plans`
- `verification-before-completion`

### 5.2 Frontend Engineer

Responsibilities:

- modify only the assigned frontend repository;
- implement against the frozen API contract;
- add or update focused tests;
- create commits and the frontend PR;
- request independent review; and
- respond rigorously to review and QA feedback.

Skills:

- `executing-plans`
- `test-driven-development`
- `systematic-debugging`
- `requesting-code-review`
- `receiving-code-review`
- `verification-before-completion`
- Vercel's public [`vercel-react-best-practices`](https://github.com/vercel-labs/agent-skills)

Next.js 16 guidance is kept version-matched in the repository `AGENTS.md`
rather than using the obsolete standalone `next-best-practices` skill.

### 5.3 Backend Engineer

Responsibilities:

- modify only the authoritative backend repository;
- maintain the agreed API contract and compatibility expectations;
- add or update unit and interface tests;
- create commits and the backend PR;
- request independent review; and
- respond rigorously to review and QA feedback.

Skills:

- the same generic implementation skills as Frontend Engineer;
- `rest-api-conventions`;
- `testing-pyramid`; and
- `spring-security-jwt`.

The Spring skills come from the public
[`spring-boot-skills`](https://github.com/rrezartprebreza/spring-boot-skills)
repository and are scoped to Spring Boot 3.

### 5.4 Integration QA

Responsibilities:

- test exact frontend and backend PR Commit SHAs;
- start both applications using standardized local commands;
- verify readiness, API behavior, and required browser flows;
- capture commands, exit codes, logs, and screenshots when relevant; and
- return defects to the owning implementation Agent without changing business
  code.

Skills:

- `systematic-debugging`
- `verification-before-completion`
- Microsoft's public [`playwright-cli`](https://github.com/microsoft/playwright-cli)

Full-stack runs on fixed local ports are serialized through this role to avoid
port collisions. Implementation agents may still run repository-local unit and
build checks in parallel.

### 5.5 Independent Reviewer

Responsibilities:

- review the requirements, exact Commit SHAs, diffs, tests, security impact,
  and repository boundaries;
- apply both frontend and backend project rules when a change is cross-stack;
- reproduce a suspected defect when evidence is inconclusive; and
- approve or return findings without editing implementation code.

Skills:

- `verification-before-completion`
- `systematic-debugging` when reproducing a finding
- read-only access to the Eventra frontend and backend practice skills

### 5.6 Explicitly excluded Superpowers skills

- `using-git-worktrees`: Multica owns worktree isolation.
- `dispatching-parallel-agents`: Multica Issue/Squad routing owns dispatch.
- `subagent-driven-development`: nested implementation orchestration would
  obscure the behavior being evaluated.
- `finishing-a-development-branch`: the generic workflow may present merge
  choices that conflict with the explicit quality-gated merge policy.

Superpowers skills are imported from the public
[`obra/superpowers`](https://github.com/obra/superpowers) source, never from the
company-internal SkillsHub.

## 6. Eventra Project Adapter

### 6.1 Repository authority

| Role | Authoritative local repository |
| --- | --- |
| Frontend | `/Users/didi/Eventra-workspace/Eventra` |
| Backend | `/Users/didi/Eventra-workspace/Eventra-Backend` |

`/Users/didi/Eventra-workspace/Eventra/Backend` is a duplicate backend tree
inside the frontend repository. It is a forbidden path for all agents. Backend
work must target only the sibling `Eventra-Backend` repository.

Both repositories are forked to the user's personal GitHub account, not the
`Aprim-OPC` organization. For each local repository:

- `origin` points to the writable personal fork; and
- `upstream` points to the original `SandeepVashishtha` repository.

The authenticated personal account name is resolved during implementation so
the design does not hard-code an identity.

### 6.2 Multica resources

Both repositories are registered on one Multica Project as separate
`local_directory` resources in `worktree` mode. Each repository must have a
clean, committed, reproducible baseline before it is registered.

The Multica Project description is the cross-repository source of truth for:

- repository roles and forbidden paths;
- environment policy;
- Issue classification and handoff rules;
- local port allocation;
- cross-stack contract and merge coordination; and
- exact-commit evidence requirements.

Each repository's `AGENTS.md` is the source of truth for that repository's
commands, structure, coding rules, tests, configuration, and ownership limits.

### 6.3 Local configuration

Configuration uses three layers:

1. Safe development defaults are committed. The frontend local API base URL,
   H2 development behavior, and local mail-health behavior are not secrets and
   are available to every worktree.
2. `.env.example` or equivalent example configuration documents required
   names without containing usable credentials.
3. `JWT_SECRET`, mail credentials, and any later secrets live outside Git and
   are injected by the standardized local startup commands.

`.env.local` remains ignored and may be used for a developer's manual override,
but the normal Multica workflow must not depend on an untracked file from the
primary checkout. A worktree must be able to start using committed safe defaults
plus the external secret source.

The JWT secret is stable across restarts so existing local sessions remain
valid. It changes only when intentionally invalidating local tokens.

Startup commands must:

- report missing variable names without printing values;
- never create or rotate secrets implicitly;
- avoid copying secrets into Git-tracked paths; and
- inspect port ownership before reporting a collision, without terminating an
  unknown user process.

## 7. Issue Orchestration

### 7.1 Parent Issue intake

The user creates one product-level parent Issue. The Delivery Lead:

1. classifies affected repositories;
2. writes acceptance criteria and non-goals;
3. records assumptions or requests one consolidated clarification;
4. creates the minimum required child Issues; and
5. defines dependencies and ownership.

### 7.2 Routing patterns

- Frontend-only: frontend implementation, independent review, then the smallest
  required QA scope.
- Backend-only: backend implementation, independent review, then API QA.
- Cross-stack: contract definition, backend implementation, frontend
  implementation, independent review, and combined Integration QA.

Frontend and backend implementation may run in parallel only after the contract
is frozen and neither task needs the other's implementation output. Otherwise,
the Delivery Lead encodes the real dependency.

### 7.3 Handoff record

Every implementation handoff includes:

- repository and base branch;
- feature branch;
- exact Commit SHA;
- PR link;
- changed API contract, if any;
- commands run, exit codes, and concise results; and
- known limitations or unresolved risks.

Cross-stack PRs link each other and their shared parent Issue. Review and QA
results apply only to the recorded SHAs. Any later commit invalidates previous
approval and must pass the relevant gates again.

## 8. Quality Gates and Merge Policy

### 8.1 Required gates

Before automatic merge:

- the implementation Agent's relevant tests pass;
- frontend lint and production build pass when frontend is affected;
- backend Maven tests and application startup checks pass when backend is
  affected;
- the Independent Reviewer approves the latest SHA;
- Integration QA verifies the required API and browser flow on exact SHAs;
- both PRs are mergeable and their heads have not changed; and
- all required repository checks remain successful.

A success report must include commands, exit codes, and exact SHAs. Statements
such as "tested" without evidence do not satisfy a gate.

### 8.2 Cross-repository merge

Separate repositories cannot be merged atomically. For a cross-stack Issue:

1. confirm both PRs pass all gates and remain mergeable;
2. choose merge order based on API backward compatibility;
3. merge the two PRs consecutively; and
4. stop immediately if the second merge fails.

If only the first PR merges, the parent Issue is marked blocked and the user is
notified. Agents do not automatically revert the first merge or continue to
deployment.

### 8.3 Environment policy

| Environment | Automatic merge after gates | Deployment/start behavior |
| --- | --- | --- |
| Local development | Allowed | Automatically start merged frontend and backend, then run smoke verification |
| Production | Allowed | Stop at `ready-for-deployment`; a human must trigger deployment |

Agents never receive production deployment credentials through this design.

## 9. Failure Handling

- Test or build failure returns work to the owning implementation Agent, which
  uses systematic debugging before changing code.
- Missing configuration reports only missing names and blocks the affected
  check.
- Port collision reports the owner when discoverable and does not terminate an
  unknown process.
- Multica, GitHub, authentication, or network failure preserves local branches
  and commits and marks the parent Issue blocked rather than claiming success.
- Reviewer or QA findings are fixed by the original implementation Agent and
  then re-reviewed at the new SHA.
- Partial cross-repository merge stops local deployment and escalates to the
  user without automatic rollback.

## 10. Pilot Validation

The Eventra team is validated with three small real Issues:

1. a frontend-only change;
2. a backend-only change; and
3. a cross-stack API and frontend-interaction change.

The pilot succeeds only if Multica demonstrates:

- correct automatic classification and child-Issue routing;
- repository and worktree isolation;
- focused implementation tests;
- one PR per affected repository;
- independent review at exact SHAs;
- local API and browser integration evidence;
- automatic merge after gates;
- merged-code local startup and smoke verification;
- no secret exposure;
- no edits outside the assigned repository; and
- no changes to the duplicate `Eventra/Backend` directory.

## 11. Responsibilities

The implementation work owned by the assistant includes:

- preparing the reusable blueprint and Eventra adapter;
- configuring the personal-fork remote layout;
- preparing clean repository baselines;
- adding per-repository `AGENTS.md` files;
- adding safe configuration examples and standardized local commands;
- importing and binding approved public external skills;
- creating the Eventra Multica Project and isolated Squad instance; and
- preparing and verifying the three-Issue pilot workflow.

The user is responsible for:

- securely providing local secret values through the external configuration
  mechanism without posting them in Issues or chat;
- approving GitHub or Multica write operations when the environment requests
  authorization; and
- reviewing pilot evidence and deciding whether the team is suitable for
  reuse on later projects.

## 12. Implementation Boundary

Implementation begins only after this design is reviewed and approved in its
committed form. The next artifact is a detailed implementation plan. Creating
forks, changing remotes, editing runtime configuration, importing skills,
creating Multica agents, and dispatching pilot Issues are implementation work
and are not part of this design-document commit.
