# Multica Multi-Repo Delivery Team Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reusable five-agent Multica delivery blueprint and an isolated Eventra instance that can route, implement, review, integrate, automatically merge, and locally smoke-test frontend-only, backend-only, and cross-stack Issues.

**Architecture:** Keep project-neutral agent definitions and orchestration rules in a tested Python blueprint, then compose them with an Eventra adapter containing repository paths, commands, public skill URLs, and environment policy. Prepare each Git repository as an independently reproducible `local_directory` worktree resource before applying the idempotent provisioner to Multica.

**Tech Stack:** Python 3 standard library, Multica CLI 0.4.26, Git/GitHub CLI, Next.js 16.3.1, React 19.2.8, Node/npm, Java 17 bytecode on JDK 21, Spring Boot 3.4.4, Maven Wrapper, H2, Bash, curl, Playwright CLI.

**Spec:** `docs/superpowers/specs/2026-08-21-multica-multi-repo-team-design.md`

## Global Constraints

- Do not reuse or modify the existing `Web SaaS Delivery` Squad.
- Fork both repositories to the authenticated user's personal GitHub account; never fork them to `Aprim-OPC`.
- Frontend authority is `/Users/didi/Eventra-workspace/Eventra`.
- Backend authority is `/Users/didi/Eventra-workspace/Eventra-Backend`.
- Never modify `/Users/didi/Eventra-workspace/Eventra/Backend`.
- Multica owns worktree creation; do not bind `using-git-worktrees` to any Eventra agent.
- Do not use company SkillsHub. Import skills only from the approved public GitHub sources in this plan.
- Delivery Lead coordinates and merges but never changes business code.
- Reviewer and Integration QA report findings but never fix business code.
- Use one PR per affected repository and exact Commit SHAs for every review and integration result.
- Automatic merge is allowed only after all gates pass.
- Local development may automatically start and smoke-test merged code.
- Production deployment is always a human-triggered action.
- Do not print, commit, or place secrets in command arguments, Issue text, logs, or PR descriptions.
- Preserve unrelated user changes and stage files explicitly for every commit.

## File Structure

### Frontend repository: `/Users/didi/Eventra-workspace/Eventra`

- Create `AGENTS.md`: frontend ownership, commands, repository boundary, evidence, and merge rules.
- Modify `.gitignore`: keep secret env files ignored while allowing safe examples and development defaults.
- Create `.env.example`: documented frontend environment contract.
- Create `.env.development`: committed safe local API default.
- Modify `src/lib/api.js`: remove the historical Azure literal and read `NEXT_PUBLIC_API_BASE_URL` with a localhost fallback.
- Modify `package.json`: standardized local run, contract-test, and smoke commands.
- Create `scripts/run-local.sh`: deterministic frontend startup on port 3000.
- Create `scripts/test-local-contract.sh`: executable assertions for committed local configuration.
- Create `scripts/smoke-local.sh`: frontend and backend readiness checks.
- Create `tools/multica/blueprint.py`: project-neutral team model.
- Create `tools/multica/eventra_adapter.py`: Eventra repositories, public skills, and project policy.
- Create `tools/multica/provision.py`: dry-run-first idempotent Multica reconciler.
- Create `tools/multica/instructions/*.md`: persistent agent and Squad runtime contracts.
- Create `tools/multica/tests/test_blueprint.py`: generic-role and isolation tests.
- Create `tools/multica/tests/test_eventra_adapter.py`: Eventra adapter and skill-source tests.
- Create `tools/multica/tests/test_provision.py`: command, idempotency, and secret-hygiene tests.
- Create `tools/multica/README.md`: setup, verification, rerun, and environment-policy runbook.
- Create `docs/multica/pilot-issues.md`: three concrete pilot Issue bodies and expected evidence.

### Backend repository: `/Users/didi/Eventra-workspace/Eventra-Backend`

- Create `AGENTS.md`: backend ownership, commands, API contract, secret, and evidence rules.
- Modify `.gitignore`: retain current `.env` and `.env.local` exclusions.
- Create `.env.example`: documented backend variable names without credentials.
- Commit `.mvn/settings-public.xml`: repository-local HTTPS Maven Central configuration after validation.
- Preserve executable mode on `mvnw`.
- Create `src/main/resources/application-local.yml`: local-only mail health configuration.
- Modify `README.md`: reproducible local and Multica startup instructions.
- Create `scripts/run-local.sh`: optional explicit env-file loading, secret validation, port check, and Maven startup.
- Create `scripts/test-local-contract.sh`: assertions for local profile, secret placeholders, Maven source, and script safety.
- Create `scripts/smoke-local.sh`: actuator and public API readiness checks.

---

### Task 1: Create personal forks and establish remote authority

**Files:**
- No repository file changes.
- Mutate GitHub fork state and each local repository's Git remotes.

**Interfaces:**
- Consumes: authenticated host-level GitHub CLI session and the two existing local checkouts.
- Produces: writable personal `origin` remotes and read-only original-author `upstream` remotes for both repositories.

- [ ] **Step 1: Read the authenticated personal login at host level**

Run outside the sandbox because macOS Keychain-backed `gh` checks can return false failures inside it:

```bash
gh auth status
gh api user --jq .login
```

Expected: the login is the user's personal account and is not `Aprim-OPC`.

- [ ] **Step 2: Inspect current remote URLs before mutation**

Run in each repository:

```bash
git remote -v
```

Expected before setup: `origin` points to the corresponding
`SandeepVashishtha` repository.

- [ ] **Step 3: Create or verify the two personal forks**

Run with the personal login returned in Step 1:

```bash
gh repo fork SandeepVashishtha/Eventra --clone=false
gh repo fork SandeepVashishtha/Eventra-Backend --clone=false
gh repo view "$(gh api user --jq .login)/Eventra" --json nameWithOwner,isFork,parent
gh repo view "$(gh api user --jq .login)/Eventra-Backend" --json nameWithOwner,isFork,parent
```

Expected: both `nameWithOwner` values use the personal login and both parents
are the original `SandeepVashishtha` repositories. If a fork already exists,
verify it instead of trying to create a second repository.

- [ ] **Step 4: Rename the original remotes to `upstream`**

Run in each repository only when `origin` still points to the original author:

```bash
git remote rename origin upstream
```

Expected: `upstream` preserves the original URL and no writable `origin` exists
yet.

- [ ] **Step 5: Add personal HTTPS origins**

Run in the frontend repository:

```bash
git remote add origin "https://github.com/$(gh api user --jq .login)/Eventra.git"
```

Run in the backend repository:

```bash
git remote add origin "https://github.com/$(gh api user --jq .login)/Eventra-Backend.git"
```

If `origin` already exists, use `git remote set-url origin` with the same
personal URL instead of adding a duplicate.

- [ ] **Step 6: Push the current committed baselines**

Run in each repository:

```bash
git push -u origin master
```

Expected: the frontend personal fork includes design commit `7dae26525`; the
uncommitted `src/lib/api.js` change remains only in the working tree for Task 2.

- [ ] **Step 7: Verify authority and preserve local edits**

Run in each repository:

```bash
git remote get-url origin
git remote get-url upstream
git status --short
```

Expected: `origin` is personal, `upstream` is original-author, the frontend
still shows only its known API edit, and backend bootstrap edits remain visible.

### Task 2: Make frontend local configuration reproducible in every worktree

**Files:**
- Create: `AGENTS.md`
- Modify: `.gitignore`
- Create: `.env.example`
- Create: `.env.development`
- Modify: `src/lib/api.js:1-4`
- Modify: `package.json:scripts`
- Create: `scripts/test-local-contract.sh`
- Create: `scripts/run-local.sh`
- Create: `scripts/smoke-local.sh`

**Interfaces:**
- Consumes: backend origin `http://localhost:8080` and environment variable `NEXT_PUBLIC_API_BASE_URL`.
- Produces: `npm run test:local-contract`, `npm run dev:local`, and `npm run smoke:local`.

- [ ] **Step 1: Write the failing frontend local-contract test**

Create `scripts/test-local-contract.sh` with these assertions:

```bash
#!/usr/bin/env bash
set -euo pipefail

grep -Fxq 'NEXT_PUBLIC_API_BASE_URL=http://localhost:8080' .env.development
grep -Fxq 'NEXT_PUBLIC_API_BASE_URL=http://localhost:8080' .env.example
grep -Fq 'process.env.NEXT_PUBLIC_API_BASE_URL' src/lib/api.js
grep -Fq 'http://localhost:8080' src/lib/api.js
grep -Fq '!.env.development' .gitignore
grep -Fq '!.env.example' .gitignore
```

- [ ] **Step 2: Run the contract test and confirm the missing files fail it**

Run:

```bash
bash scripts/test-local-contract.sh
```

Expected: FAIL because `.env.development` and `.env.example` do not exist.

- [ ] **Step 3: Add committed safe env files and ignore exceptions**

Append after `.env*` in `.gitignore`:

```gitignore
!.env.example
!.env.development
```

Create both `.env.example` and `.env.development` with:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Keep `.env.local` ignored for optional manual overrides.

- [ ] **Step 4: Normalize the API base URL implementation**

Replace the first lines of `src/lib/api.js` with:

```javascript
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
```

Remove the commented Azure URL so new agents cannot mistake it for an allowed
default.

- [ ] **Step 5: Add deterministic run and smoke scripts**

Create `scripts/run-local.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

if lsof -nP -iTCP:3000 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "port 3000 is already in use; inspect it with: lsof -nP -iTCP:3000 -sTCP:LISTEN" >&2
  exit 2
fi

exec npm run dev -- --hostname localhost --port 3000
```

Create `scripts/smoke-local.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

curl --fail --silent --show-error http://localhost:8080/actuator/health >/dev/null
curl --fail --silent --show-error http://localhost:3000 >/dev/null
echo "frontend and backend smoke checks passed"
```

Mark all three scripts executable.

- [ ] **Step 6: Expose the standard npm command contract**

Add these entries to `package.json` without changing existing scripts:

```json
"dev:local": "bash scripts/run-local.sh",
"test:local-contract": "bash scripts/test-local-contract.sh",
"smoke:local": "bash scripts/smoke-local.sh"
```

- [ ] **Step 7: Add frontend repository instructions**

Create `AGENTS.md` with explicit rules that:

- this repository is frontend-only;
- `Backend/` is forbidden and the authoritative backend is the sibling
  `Eventra-Backend` resource;
- agents use npm and the three standard local commands;
- `.env.local` and secrets must never be committed or printed;
- implementation must use TDD where behavior changes;
- evidence includes commands, exit codes, branch, and exact SHA; and
- agents may create PRs but merge only after reviewer and QA gates.

- [ ] **Step 8: Run frontend verification**

Run:

```bash
npm run test:local-contract
npm run lint
npm run build
bash -n scripts/test-local-contract.sh scripts/run-local.sh scripts/smoke-local.sh
git diff --check
```

Expected: every command exits 0. The Next build reports the development env
file but contains no secret.

- [ ] **Step 9: Commit only the frontend local baseline**

Run:

```bash
git add AGENTS.md .gitignore .env.example .env.development src/lib/api.js package.json scripts/test-local-contract.sh scripts/run-local.sh scripts/smoke-local.sh
git diff --cached --check
git commit -m "chore: make frontend local development reproducible"
git push origin master
```

Expected: the pre-existing API edit is intentionally included; no `.env.local`
or `Backend/` content is staged.

### Task 3: Make backend local startup reproducible and secret-safe

**Files:**
- Create: `AGENTS.md`
- Modify: `.gitignore`
- Create: `.env.example`
- Create: `.mvn/settings-public.xml` from the existing untracked file after validation
- Modify mode: `mvnw` to executable
- Create: `src/main/resources/application-local.yml`
- Modify: `README.md`
- Create: `scripts/test-local-contract.sh`
- Create: `scripts/run-local.sh`
- Create: `scripts/smoke-local.sh`

**Interfaces:**
- Consumes: `JWT_SECRET` of at least 64 characters; optional `MAIL_USERNAME` and `MAIL_PASSWORD`; optional `--env-file <path>`.
- Produces: `scripts/run-local.sh`, `scripts/test-local-contract.sh`, and `scripts/smoke-local.sh`.

- [ ] **Step 1: Validate the existing Maven settings before committing it**

Run:

```bash
rg -n 'https://repo.maven.apache.org/maven2|<mirrorOf>\*</mirrorOf>' .mvn/settings-public.xml
rg -n 'artifactory\.intra|<username>|<password>' .mvn/settings-public.xml
```

Expected: the first command finds the public HTTPS Maven Central mirror; the
second returns no matches. Stop if credentials or the company Artifactory URL
appear.

- [ ] **Step 2: Write the failing backend local-contract test**

Create `scripts/test-local-contract.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

test -x ./mvnw
grep -Fq 'repo.maven.apache.org/maven2' .mvn/settings-public.xml
grep -Fq 'enabled: false' src/main/resources/application-local.yml
grep -Fq '${JWT_SECRET}' src/main/resources/application.yml
grep -Fq 'JWT_SECRET=' .env.example
grep -Fq -- '--spring.profiles.active=local' scripts/run-local.sh
if grep -Eq 'artifactory\.intra|<username>|<password>' .mvn/settings-public.xml; then
  echo "private Maven configuration must not be committed" >&2
  exit 1
fi
```

- [ ] **Step 3: Run the contract test and confirm the missing local profile fails it**

Run:

```bash
bash scripts/test-local-contract.sh
```

Expected: FAIL because `application-local.yml`, `.env.example`, and startup
scripts do not yet exist.

- [ ] **Step 4: Add the local-only Spring profile and env example**

Create `src/main/resources/application-local.yml`:

```yaml
management:
  health:
    mail:
      enabled: false
```

Create `.env.example`:

```dotenv
JWT_SECRET=replace-with-a-stable-random-value-of-at-least-64-characters
MAIL_USERNAME=unused@example.com
MAIL_PASSWORD=unused
```

The example values are documentation, not runtime credentials. Keep `.env` and
`.env.local` ignored.

- [ ] **Step 5: Add the backend startup script**

Create `scripts/run-local.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" == "--env-file" ]]; then
  if [[ -z "${2:-}" || ! -f "$2" ]]; then
    echo "--env-file requires an existing file" >&2
    exit 2
  fi
  set -a
  source "$2"
  set +a
elif [[ $# -ne 0 ]]; then
  echo "usage: scripts/run-local.sh [--env-file path]" >&2
  exit 2
fi

if [[ -z "${JWT_SECRET:-}" ]]; then
  echo "missing required variable: JWT_SECRET" >&2
  exit 2
fi
if [[ ${#JWT_SECRET} -lt 64 ]]; then
  echo "JWT_SECRET must contain at least 64 characters" >&2
  exit 2
fi
if lsof -nP -iTCP:8080 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "port 8080 is already in use; inspect it with: lsof -nP -iTCP:8080 -sTCP:LISTEN" >&2
  exit 2
fi

exec ./mvnw -s .mvn/settings-public.xml \
  -Dspring-boot.run.arguments=--spring.profiles.active=local \
  spring-boot:run
```

Create `scripts/smoke-local.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

curl --fail --silent --show-error http://localhost:8080/actuator/health >/dev/null
curl --fail --silent --show-error http://localhost:8080/v3/api-docs >/dev/null
echo "backend smoke checks passed"
```

Mark all three scripts and `mvnw` executable.

- [ ] **Step 6: Add backend repository instructions and README commands**

Create `AGENTS.md` with the backend-only ownership boundary, Java 17/Spring
Boot 3 rules, frozen-contract requirement, TDD workflow, public Maven settings,
secret non-disclosure, exact-SHA evidence, and reviewer/QA return path.

Update `README.md` to document exactly:

```bash
./mvnw -s .mvn/settings-public.xml test
scripts/run-local.sh --env-file /absolute/path/to/ignored/backend.env
scripts/smoke-local.sh
```

State that Multica supplies `JWT_SECRET` through agent custom environment, so
its worktrees run `scripts/run-local.sh` without copying `.env.local`.

- [ ] **Step 7: Run backend static and test verification**

Run:

```bash
bash scripts/test-local-contract.sh
bash -n scripts/test-local-contract.sh scripts/run-local.sh scripts/smoke-local.sh
./mvnw -s .mvn/settings-public.xml test
git diff --check
```

Expected: every command exits 0 and Maven resolves through public HTTPS Maven
Central.

- [ ] **Step 8: Verify real local startup without exposing the secret**

The user creates an ignored `backend.env` containing a stable `JWT_SECRET` and
runs:

```bash
scripts/run-local.sh --env-file /absolute/path/to/ignored/backend.env
```

In a second terminal run:

```bash
scripts/smoke-local.sh
```

Expected: Spring Boot starts on 8080 and both checks pass. Record only command
names and exit codes, never the env-file contents.

- [ ] **Step 9: Commit only the backend local baseline**

Run:

```bash
git add AGENTS.md .gitignore .env.example .mvn/settings-public.xml mvnw src/main/resources/application-local.yml README.md scripts/test-local-contract.sh scripts/run-local.sh scripts/smoke-local.sh
git diff --cached --check
git commit -m "chore: make backend local development reproducible"
git push origin master
```

Expected: no real `.env` file or secret is staged.

### Task 4: Implement the reusable five-agent blueprint

**Files:**
- Create: `tools/multica/__init__.py`
- Create: `tools/multica/blueprint.py`
- Create: `tools/multica/instructions/delivery_lead.md`
- Create: `tools/multica/instructions/frontend_engineer.md`
- Create: `tools/multica/instructions/backend_engineer.md`
- Create: `tools/multica/instructions/integration_qa.md`
- Create: `tools/multica/instructions/independent_reviewer.md`
- Create: `tools/multica/instructions/squad.md`
- Create: `tools/multica/tests/__init__.py`
- Create: `tools/multica/tests/test_blueprint.py`

**Interfaces:**
- Produces: `build_multi_repo_blueprint(name_prefix: str) -> TeamBlueprint`.
- Produces dataclasses: `AgentSpec`, `TeamBlueprint`.
- Consumed later by: `eventra_adapter.py` and `provision.py`.

- [ ] **Step 1: Write failing blueprint tests**

Create `tools/multica/tests/test_blueprint.py` with tests equivalent to:

```python
import unittest

from tools.multica.blueprint import build_multi_repo_blueprint


class BlueprintTests(unittest.TestCase):
    def setUp(self):
        self.blueprint = build_multi_repo_blueprint("Sample")

    def test_has_exactly_five_unique_roles(self):
        self.assertEqual(
            [agent.role for agent in self.blueprint.agents],
            [
                "delivery_lead",
                "frontend_engineer",
                "backend_engineer",
                "integration_qa",
                "independent_reviewer",
            ],
        )

    def test_blueprint_has_no_eventra_context(self):
        serialized = repr(self.blueprint).lower()
        self.assertNotIn("eventra", serialized)
        self.assertNotIn("/users/didi", serialized)
        self.assertNotIn("spring", serialized)
        self.assertNotIn("react", serialized)

    def test_worktree_and_nested_dispatch_skills_are_excluded(self):
        bound = {skill for agent in self.blueprint.agents for skill in agent.skill_keys}
        self.assertNotIn("using-git-worktrees", bound)
        self.assertNotIn("dispatching-parallel-agents", bound)
        self.assertNotIn("subagent-driven-development", bound)
```

- [ ] **Step 2: Run the tests and confirm the module is missing**

Run:

```bash
python3 -m unittest tools.multica.tests.test_blueprint -v
```

Expected: FAIL with `ModuleNotFoundError` for `tools.multica.blueprint`.

- [ ] **Step 3: Implement the typed blueprint model**

Define in `blueprint.py`:

```python
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class AgentSpec:
    role: str
    name: str
    description: str
    instructions_file: Path
    skill_keys: tuple[str, ...]
    needs_backend_env: bool = False


@dataclass(frozen=True)
class TeamBlueprint:
    squad_name: str
    squad_description: str
    squad_instructions_file: Path
    leader_role: str
    agents: tuple[AgentSpec, ...]


def build_multi_repo_blueprint(name_prefix: str) -> TeamBlueprint:
    instructions = Path(__file__).with_name("instructions")
    common = ("using-superpowers",)
    implementer = common + (
        "executing-plans",
        "test-driven-development",
        "systematic-debugging",
        "requesting-code-review",
        "receiving-code-review",
        "verification-before-completion",
    )
    agents = (
        AgentSpec(
            "delivery_lead",
            f"{name_prefix} Delivery Lead",
            "Coordinates multi-repository delivery without editing business code.",
            instructions / "delivery_lead.md",
            common + ("brainstorming", "writing-plans", "verification-before-completion"),
        ),
        AgentSpec(
            "frontend_engineer",
            f"{name_prefix} Frontend Engineer",
            "Owns assigned frontend implementation, tests, commits, and PRs.",
            instructions / "frontend_engineer.md",
            implementer,
        ),
        AgentSpec(
            "backend_engineer",
            f"{name_prefix} Backend Engineer",
            "Owns assigned backend implementation, tests, contracts, commits, and PRs.",
            instructions / "backend_engineer.md",
            implementer,
        ),
        AgentSpec(
            "integration_qa",
            f"{name_prefix} Integration QA",
            "Verifies exact frontend and backend commits without fixing business code.",
            instructions / "integration_qa.md",
            common + ("systematic-debugging", "verification-before-completion"),
        ),
        AgentSpec(
            "independent_reviewer",
            f"{name_prefix} Independent Reviewer",
            "Reviews exact commits independently and returns actionable findings.",
            instructions / "independent_reviewer.md",
            common + ("systematic-debugging", "verification-before-completion"),
        ),
    )
    return TeamBlueprint(
        squad_name=f"{name_prefix} Local Delivery",
        squad_description="Coordinates quality-gated delivery across separate repositories.",
        squad_instructions_file=instructions / "squad.md",
        leader_role="delivery_lead",
        agents=agents,
    )
```

The function returns exactly the approved five roles. Descriptions remain
under 255 characters. Persistent instructions live in the six Markdown files,
not in catalog descriptions.

- [ ] **Step 4: Write the six generic instruction contracts**

Each agent file must state ownership, required inputs, output evidence,
clarification behavior, review/QA return behavior, and forbidden actions.
`squad.md` must define classification, minimum child-Issue routing, stages,
exact-SHA handoffs, auto-merge gates, local versus production behavior, and
partial cross-repository merge escalation.

The Delivery Lead contract must explicitly say:

```text
You coordinate, decompose, assign, verify, and merge. You never modify business
code. Keep the parent Issue in progress while child Issues run. A child marked
done is evidence to inspect, not automatic proof that the parent is complete.
```

- [ ] **Step 5: Run blueprint tests and syntax checks**

Run:

```bash
python3 -m unittest tools.multica.tests.test_blueprint -v
python3 -m compileall -q tools/multica
rg -n 'Eventra|/Users/didi|Spring|React' tools/multica/blueprint.py tools/multica/instructions
```

Expected: tests and compile pass; the final `rg` has no output.

- [ ] **Step 6: Commit the reusable blueprint**

Run:

```bash
git add tools/multica/__init__.py tools/multica/blueprint.py tools/multica/instructions tools/multica/tests/__init__.py tools/multica/tests/test_blueprint.py
git diff --cached --check
git commit -m "feat: add reusable Multica delivery blueprint"
git push origin master
```

### Task 5: Add the Eventra adapter and public skill manifest

**Files:**
- Create: `tools/multica/eventra_adapter.py`
- Create: `tools/multica/instructions/eventra_project.md`
- Create: `tools/multica/tests/test_eventra_adapter.py`
- Create: `tools/multica/README.md`

**Interfaces:**
- Consumes: `TeamBlueprint` from Task 4.
- Produces: `build_eventra_config(runtime_id: str, daemon_id: str) -> ProjectConfig`.
- Produces dataclasses: `SkillSource`, `LocalResource`, `ProjectConfig`.

- [ ] **Step 1: Write failing Eventra adapter tests**

Create tests that assert:

```python
config = build_eventra_config("runtime-id", "daemon-id")
self.assertEqual(config.project_title, "Eventra Local Development")
self.assertEqual(len(config.resources), 2)
self.assertTrue(all(resource.execution_mode == "worktree" for resource in config.resources))
self.assertEqual(config.resources[0].local_path, "/Users/didi/Eventra-workspace/Eventra")
self.assertEqual(config.resources[1].local_path, "/Users/didi/Eventra-workspace/Eventra-Backend")
self.assertIn("/Users/didi/Eventra-workspace/Eventra/Backend", config.forbidden_paths)
self.assertNotIn("skills.sh", " ".join(source.url for source in config.skills.values()))
self.assertTrue(all("github.com" in source.url for source in config.skills.values()))
```

Also assert that no URL contains an internal company host and that only Backend
Engineer and Integration QA have `needs_backend_env=True`.

- [ ] **Step 2: Run the tests and confirm the adapter is missing**

Run:

```bash
python3 -m unittest tools.multica.tests.test_eventra_adapter -v
```

Expected: FAIL with an import error.

- [ ] **Step 3: Implement the Eventra config and approved URL map**

Use these public GitHub skill roots:

```python
PUBLIC_SKILL_URLS = {
    "using-superpowers": "https://github.com/obra/superpowers/tree/main/skills/using-superpowers",
    "brainstorming": "https://github.com/obra/superpowers/tree/main/skills/brainstorming",
    "writing-plans": "https://github.com/obra/superpowers/tree/main/skills/writing-plans",
    "executing-plans": "https://github.com/obra/superpowers/tree/main/skills/executing-plans",
    "test-driven-development": "https://github.com/obra/superpowers/tree/main/skills/test-driven-development",
    "systematic-debugging": "https://github.com/obra/superpowers/tree/main/skills/systematic-debugging",
    "requesting-code-review": "https://github.com/obra/superpowers/tree/main/skills/requesting-code-review",
    "receiving-code-review": "https://github.com/obra/superpowers/tree/main/skills/receiving-code-review",
    "verification-before-completion": "https://github.com/obra/superpowers/tree/main/skills/verification-before-completion",
    "react-best-practices": "https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices",
    "rest-api-conventions": "https://github.com/rrezartprebreza/spring-boot-skills/tree/main/skills/spring-boot-3/rest-api-conventions",
    "testing-pyramid": "https://github.com/rrezartprebreza/spring-boot-skills/tree/main/skills/spring-boot-3/testing-pyramid",
    "spring-security-jwt": "https://github.com/rrezartprebreza/spring-boot-skills/tree/main/skills/spring-boot-3/spring-security-jwt",
    "playwright-cli": "https://github.com/microsoft/playwright-cli/tree/main/skills/playwright-cli",
}
```

Do not add `using-git-worktrees`, `dispatching-parallel-agents`,
`subagent-driven-development`, or `finishing-a-development-branch`.

- [ ] **Step 4: Write Eventra Project context**

`eventra_project.md` must contain the exact two authoritative paths, the
forbidden duplicate path, ports 3000/8080, standard commands, environment
policy, two-PR rule, API-contract-first rule, exact-SHA evidence schema, and
partial-merge stop behavior.

- [ ] **Step 5: Document operator inputs and safety**

`tools/multica/README.md` must document:

- required `runtime_id` and `daemon_id` inputs;
- dry-run as the default mode;
- `--apply` for state changes;
- hidden secret prompting for Backend Engineer and Integration QA;
- how to list agents, bindings, Squad members, Project resources, and origins;
- that existing same-name skills from a different origin cause a hard stop;
- that the script never calls `agent skills set`; and
- that production deployment is not implemented.

- [ ] **Step 6: Run adapter verification**

Run:

```bash
python3 -m unittest tools.multica.tests.test_eventra_adapter -v
python3 -m compileall -q tools/multica
rg -n 'SkillsHub|artifactory\.intra|Aprim-OPC' tools/multica
```

Expected: tests and compile pass. `Aprim-OPC` may appear only in an explicit
forbidden-organization assertion or instruction; internal skill and Maven hosts
must not appear.

- [ ] **Step 7: Commit the Eventra adapter**

Run:

```bash
git add tools/multica/eventra_adapter.py tools/multica/instructions/eventra_project.md tools/multica/tests/test_eventra_adapter.py tools/multica/README.md
git diff --cached --check
git commit -m "feat: add Eventra Multica project adapter"
git push origin master
```

### Task 6: Implement the idempotent Multica provisioner

**Files:**
- Create: `tools/multica/provision.py`
- Create: `tools/multica/tests/test_provision.py`

**Interfaces:**
- Consumes: `ProjectConfig`, Multica CLI JSON output, `--runtime-id`, `--daemon-id`.
- Produces: `ProvisioningResult` containing agent IDs, skill IDs, Squad ID, Project ID, and resource IDs.
- CLI: `python3 -m tools.multica.provision --runtime-id UUID --daemon-id UUID [--apply] [--prompt-backend-env]`.

- [ ] **Step 1: Write failing provisioner command tests**

Use a `FakeRunner` that records argument arrays and returns fixture JSON. Test
these exact properties:

```python
self.assertNotIn("agent skills set", rendered_commands)
self.assertIn("agent skills add", rendered_commands)
self.assertIn("--execution-mode worktree", rendered_commands)
self.assertNotIn("JWT_SECRET", rendered_commands)
self.assertEqual(
    set(result.agent_ids),
    {
        "delivery_lead",
        "frontend_engineer",
        "backend_engineer",
        "integration_qa",
        "independent_reviewer",
    },
)
```

Add cases for:

- dry-run making no runner mutations;
- existing exact-name agents being reconciled instead of duplicated;
- existing skills with matching public origin being reused;
- a same-name skill with a different origin failing closed;
- agent descriptions longer than 255 characters being rejected before calls;
- only Backend Engineer and Integration QA receiving secret stdin;
- Project resources remaining exactly two `local_directory` worktree entries;
- rerunning against matching state producing no duplicate agents, Squad,
  Project, members, skills, or resources.

- [ ] **Step 2: Run tests and confirm the provisioner is missing**

Run:

```bash
python3 -m unittest tools.multica.tests.test_provision -v
```

Expected: FAIL with an import error.

- [ ] **Step 3: Implement the runner and strict JSON parsing**

Define:

```python
import json
import os
import subprocess


class MulticaRunner:
    def run(self, args: list[str], *, stdin_json: dict[str, str] | None = None) -> dict | list:
        child_env = os.environ.copy()
        child_env.setdefault("MULTICA_HTTP_TIMEOUT", "90s")
        completed = subprocess.run(
            ["multica", *args],
            input=None if stdin_json is None else json.dumps(stdin_json),
            text=True,
            capture_output=True,
            check=False,
            env=child_env,
        )
        if completed.returncode != 0:
            safe_command = " ".join(["multica", *args[:4]])
            raise RuntimeError(f"{safe_command} failed with exit {completed.returncode}")
        return json.loads(completed.stdout)
```

Define `Provisioner.reconcile(config: ProjectConfig, *, apply: bool,
backend_env: dict[str, str] | None) -> ProvisioningResult` and keep each
reconciliation operation in a focused private method.

Use `subprocess.run` with an argument list, `check=False`, captured text output,
a bounded `MULTICA_HTTP_TIMEOUT`, and JSON parsing. Never use `shell=True`.
Redact stdin and environment values from exceptions and logs.

- [ ] **Step 4: Implement skill import and additive binding**

For a missing approved skill, execute:

```python
runner.run([
    "skill", "import", "--url", source.url,
    "--on-conflict", "fail", "--output", "json",
])
```

For each missing agent binding, execute:

```python
runner.run([
    "agent", "skills", "add", agent_id,
    "--skill-ids", skill_id, "--output", "json",
])
```

List bindings after writes and assert every expected ID is present. Never call
replace-all `set`.

- [ ] **Step 5: Implement agent, Squad, and member reconciliation**

Create each new agent with workspace visibility, concurrency 1, the correct
runtime ID, short description, and full instruction file. Create the Squad with
Delivery Lead as leader, update its full coordination instructions, and add the
other four agents with explicit roster roles.

Backend Engineer and Integration QA creation must pass the same secret JSON by
stdin using `--custom-env-stdin`; no secret may occur in argv or output.

- [ ] **Step 6: Implement Project and resource reconciliation**

Create or update `Eventra Local Development` with the full project-context
Markdown as `description`. Add exactly these resources:

```python
for local_path in (
    "/Users/didi/Eventra-workspace/Eventra",
    "/Users/didi/Eventra-workspace/Eventra-Backend",
):
    runner.run([
        "project", "resource", "add", project_id,
        "--type", "local_directory",
        "--local-path", local_path,
        "--daemon-id", config.daemon_id,
        "--execution-mode", "worktree",
        "--output", "json",
    ])
```

If an existing same-path resource uses `in_place`, update it to `worktree`.
Fail closed if the daemon reports it lacks `local-worktree-v1`.

- [ ] **Step 7: Implement hidden secret input and dry-run output**

When `--prompt-backend-env` is present, use `getpass.getpass` for the stable
JWT secret, reject values shorter than 64 characters, and use non-secret
defaults `unused@example.com` / `unused` for local mail unless the user enters
alternatives. Keep the dictionary only in memory and pass it to the two agent
create calls through stdin.

Without `--apply`, print planned object names, skill origins, and resource paths
but make zero Multica write calls.

- [ ] **Step 8: Run provisioner unit and safety tests**

Run:

```bash
python3 -m unittest discover -s tools/multica/tests -v
python3 -m compileall -q tools/multica
rg -n 'skills set|shell=True|JWT_SECRET.*print|SkillsHub' tools/multica
git diff --check
```

Expected: unit tests and compile pass. The search may find only test assertions
that prohibit unsafe strings.

- [ ] **Step 9: Commit the provisioner**

Run:

```bash
git add tools/multica/provision.py tools/multica/tests/test_provision.py
git diff --cached --check
git commit -m "feat: provision isolated Multica delivery teams"
git push origin master
```

### Task 7: Apply and verify the Eventra Multica instance

**Files:**
- No repository changes expected.
- Mutates Multica workspace agents, skills, Squad, Project, and resources.

**Interfaces:**
- Consumes: live Multica runtime ID, daemon ID, stable hidden JWT secret.
- Produces: five Eventra agents, one `Eventra Local Delivery` Squad, one `Eventra Local Development` Project, approved skill bindings, and two worktree resources.

- [ ] **Step 1: Verify daemon connectivity before any write**

Run read-only Multica list/get commands for runtimes, agents, skills, Squads,
and Projects with JSON output. Expected: all commands return valid JSON without
TLS handshake timeout. If connectivity still fails, stop here and preserve the
completed repository baselines.

- [ ] **Step 2: Capture the runtime and local daemon IDs**

Use the runtime bound to the user's local Codex execution environment and the
daemon that owns `/Users/didi/Eventra-workspace`. Confirm the daemon advertises
`local-worktree-v1` before applying resources.

Store the two values for subsequent commands without hard-coding them in Git:

```bash
read -r EVENTRA_RUNTIME_ID
read -r EVENTRA_DAEMON_ID
export EVENTRA_RUNTIME_ID EVENTRA_DAEMON_ID
```

- [ ] **Step 3: Run a zero-mutation dry run**

Run:

```bash
python3 -m tools.multica.provision --runtime-id "$EVENTRA_RUNTIME_ID" --daemon-id "$EVENTRA_DAEMON_ID"
```

Expected: five planned agents, one planned Squad, one planned Project, approved
public skill URLs, and exactly two `worktree` resources; no IDs are created.

- [ ] **Step 4: Apply with hidden backend environment input**

Run:

```bash
python3 -m tools.multica.provision --runtime-id "$EVENTRA_RUNTIME_ID" --daemon-id "$EVENTRA_DAEMON_ID" --apply --prompt-backend-env
```

Enter the stable secret only at the hidden prompt. Expected: structured IDs for
all created or reconciled objects and no secret in terminal output.

- [ ] **Step 5: Verify persisted agent contracts and bindings**

List every returned Eventra agent, then inspect each ID:

```bash
multica agent list --output json
multica agent get "$EVENTRA_AGENT_ID" --output json
multica agent skills list "$EVENTRA_AGENT_ID" --output json
```

Set `EVENTRA_AGENT_ID` to each ID returned by the list before the two per-agent
commands.

Expected: runtime bound, workspace visibility, concurrency 1, non-empty
instructions, and exactly the approved role-relevant skill IDs. The agent record
may report secret key count but must not expose values.

- [ ] **Step 6: Verify Squad routing state**

Run:

```bash
multica squad list --output json
multica squad get "$EVENTRA_SQUAD_ID" --output json
multica squad member list "$EVENTRA_SQUAD_ID" --output json
```

Set `EVENTRA_SQUAD_ID` to the ID whose exact name is `Eventra Local Delivery`.

Expected: Delivery Lead is leader; the four other agents appear once with their
approved role labels; Squad instructions are non-empty.

- [ ] **Step 7: Verify Project resources**

Run:

```bash
multica project list --output json
multica project get "$EVENTRA_PROJECT_ID" --output json
multica project resource list "$EVENTRA_PROJECT_ID" --output json
```

Set `EVENTRA_PROJECT_ID` to the ID whose exact title is
`Eventra Local Development`.

Expected: the full Eventra context is persisted and the only local resources
are the two authoritative paths with `execution_mode=worktree` and the chosen
daemon ID.

- [ ] **Step 8: Rerun apply to prove idempotency**

Run the apply command again without `--prompt-backend-env`.

Expected: all existing objects are reconciled or skipped; counts and IDs remain
unchanged; stored custom env is not overwritten.

### Task 8: Define concrete pilot Issues and acceptance evidence

**Files:**
- Create: `docs/multica/pilot-issues.md`
- Modify: `tools/multica/README.md`

**Interfaces:**
- Produces: three copy-ready parent Issue bodies for assignment to the Eventra Project and Squad.
- Consumed by: Task 9 pilot execution.

- [ ] **Step 1: Write the frontend-only pilot Issue**

Use this bounded product change:

```markdown
Title: Show a development-only local API indicator

Add a small development-only indicator to the Eventra UI showing that the API
target is local. It must derive its text from the configured API base URL,
render only when the API hostname is localhost and `NODE_ENV` is development,
and meet existing responsive/accessibility conventions. Do not modify any
backend code.

Acceptance:
- frontend repository only;
- focused test for visibility logic;
- lint and production build pass;
- PR, independent review, frontend smoke evidence, and automatic merge.
```

- [ ] **Step 2: Write the backend-only pilot Issue**

Use this bounded product change:

```markdown
Title: Add a public API metadata endpoint

Add GET /api/meta returning stable JSON fields `service` and `apiVersion`.
Keep it public in Spring Security and document it in OpenAPI. Do not modify any
frontend code.

Acceptance:
- backend repository only;
- controller/security tests cover 200 and response schema;
- Maven tests and local backend smoke pass;
- PR, independent review, API QA evidence, and automatic merge.
```

- [ ] **Step 3: Write the cross-stack pilot Issue**

Use this small contract-first change:

```markdown
Title: Display backend API version in the Eventra footer

Use GET /api/meta to display the backend `apiVersion` in the frontend footer.
The UI must show a non-disruptive unavailable state when the request fails.
Freeze the response contract before implementation and create one PR in each
repository.

Acceptance:
- backend contract test and frontend success/failure tests;
- two linked PRs with exact SHAs;
- independent cross-repository review;
- Playwright/local-browser evidence against the two exact SHAs;
- both PRs pass the coordinated merge gate and merged local smoke test.
```

If Task 9 runs after the backend-only pilot has already merged `/api/meta`, the
cross-stack Issue changes the endpoint contract by adding `buildVersion` while
preserving `service` and `apiVersion`; the frontend displays `buildVersion`.
This guarantees the third pilot still exercises both repositories without
duplicating the second pilot.

- [ ] **Step 4: Document dispatch procedure and evidence rubric**

For each pilot, instruct the user to create one parent Issue, bind it to
`Eventra Local Development`, assign it to `Eventra Local Delivery`, and move it
from backlog to todo. Document the expected child stages, PR count, exact-SHA
handoffs, quality gates, auto-merge result, and local smoke evidence.

- [ ] **Step 5: Verify and commit pilot documentation**

Run:

```bash
rg -n 'frontend-only|backend-only|cross-stack|exact SHA|automatic merge|production' docs/multica/pilot-issues.md tools/multica/README.md
git diff --check
git add docs/multica/pilot-issues.md tools/multica/README.md
git commit -m "docs: add Multica multi-repo pilot runbook"
git push origin master
```

### Task 9: Execute the three-pilot evaluation

**Files:**
- No setup-code changes expected.
- Product changes are created by the Multica agents in the repository and PR branches generated for each pilot.

**Interfaces:**
- Consumes: Task 7 Multica Project/Squad and Task 8 Issue bodies.
- Produces: three completed parent Issues, merged PR evidence, local smoke results, and an evaluation summary.

- [ ] **Step 1: Dispatch the frontend-only pilot**

Create the first parent Issue from `docs/multica/pilot-issues.md`, bind the
Eventra Project, assign the Eventra Squad, and set status to todo.

Expected: Delivery Lead classifies it frontend-only, creates no backend
implementation child, and keeps the parent in progress.

- [ ] **Step 2: Audit frontend-only routing and completion**

Verify child ownership, worktree branch, focused test evidence, independent
review at the final SHA, frontend QA, one frontend PR, automatic merge, and
merged-code smoke result. Confirm `Eventra-Backend` and `Eventra/Backend` are
unchanged.

- [ ] **Step 3: Dispatch and audit the backend-only pilot**

Repeat with the backend Issue. Expected: no frontend implementation child, one
backend PR, Maven/controller/security evidence, independent review, API QA,
automatic merge, and backend smoke. Confirm the frontend repository is
unchanged except for any Multica-generated issue links outside Git.

- [ ] **Step 4: Dispatch and audit the cross-stack pilot**

Repeat with the cross-stack Issue. Expected: frozen contract, frontend and
backend implementation children, two linked PRs, exact SHA handoffs, combined
review, serialized Integration QA on ports 3000/8080, coordinated automatic
merge, and merged local frontend/backend smoke.

- [ ] **Step 5: Exercise the partial-merge guard without merging broken code**

Use provisioner unit coverage plus a dry-run fixture in which the second PR
becomes non-mergeable after preflight. Expected: the merge coordinator stops,
reports the first/second PR states, performs no deployment, and never issues an
automatic revert. Do not deliberately create a real partial merge.

- [ ] **Step 6: Produce the final evaluation summary**

Add a parent-Issue comment or local report containing:

- Issue and child IDs;
- repository branches and final SHAs;
- PR URLs and merge commits;
- commands and exit codes for every gate;
- reviewer and QA results;
- proof the duplicate backend path was untouched;
- proof no secret appeared in Git or Issue comments;
- any Multica routing, daemon, worktree, or evidence gaps discovered; and
- a recommendation on whether to reuse the blueprint unchanged or revise it.

- [ ] **Step 7: Final repository and secret hygiene verification**

Run in both repositories:

```bash
git status --short
git log -5 --oneline
git remote -v
```

Run targeted secret-name and forbidden-path checks without displaying secret
values. Expected: clean repositories, personal origins, original upstreams,
and no tracked `.env.local`, JWT value, or unintended `Eventra/Backend` diff.

### Task 10: Verify blueprint portability

**Files:**
- Modify only if verification exposes a documentation gap: `tools/multica/README.md`

**Interfaces:**
- Consumes: completed Eventra setup and generic blueprint.
- Produces: evidence that a future project can instantiate a fresh isolated Squad without Eventra leakage.

- [ ] **Step 1: Build a sample non-Eventra blueprint in memory**

Run:

```bash
python3 -c 'from tools.multica.blueprint import build_multi_repo_blueprint; print(build_multi_repo_blueprint("Sample Product").squad_name)'
```

Expected: `Sample Product Local Delivery` or the documented generic naming
pattern, with no Eventra-specific context.

- [ ] **Step 2: Re-run all blueprint/provisioner tests**

Run:

```bash
python3 -m unittest discover -s tools/multica/tests -v
python3 -m compileall -q tools/multica
```

Expected: all tests pass.

- [ ] **Step 3: Inspect generated dry-run output for leakage**

Generate a generic sample using a temporary adapter fixture and confirm the
five generic Agent instructions contain no Eventra paths, ports, frameworks, or
skill bindings. Eventra-specific values must appear only after composing with
`eventra_adapter.py`.

- [ ] **Step 4: Commit a runbook correction only if verification required one**

If Task 10 exposed a concrete documentation gap, update only
`tools/multica/README.md`, rerun `git diff --check`, and commit:

```bash
git add tools/multica/README.md
git commit -m "docs: clarify reusable Multica team onboarding"
git push origin master
```

If no gap exists, make no commit.
