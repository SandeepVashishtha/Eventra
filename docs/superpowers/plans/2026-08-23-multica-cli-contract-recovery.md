# Multica CLI Contract Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:subagent-driven-development` (recommended) or
> `superpowers:executing-plans` to implement this plan task by task. Every
> behavior change follows `superpowers:test-driven-development`.

**Goal:** Recover the partially provisioned Eventra Multica team on CLI 0.4.31
without asking for the backend signing secret again, and make future applies
strictly read-after-write, observable, secret-safe, and idempotent.

**Architecture:** Put command-specific JSON parsing in a pure contracts module,
treat every mutation response as an acknowledgement, and prove identity and
state through subsequent list/get calls. Add an in-process backend-environment
recovery mode and a read-only structural audit whose output contains no scalar
state. The real recovery runs only after tests and independent review pass.

**Tech Stack:** Python 3 standard library, `unittest`, Multica CLI 0.4.31,
Git/GitHub CLI, JSON fixtures.

**Spec:**
`docs/superpowers/specs/2026-08-23-multica-cli-contract-recovery-design.md`

## Frozen live evidence

The 2026-08-23 read-only probe established these 0.4.31 facts:

- runtime capabilities are nested under `metadata.capabilities`;
- Skill list/get origin is `config.origin.source_url`;
- non-empty `agent skills list` contains full Skill records;
- `agent env get` is `{agent_id: string, custom_env: object}`;
- Squad member records include `id`, `squad_id`, `member_id`, `member_type`, and
  `role`;
- Project local-resource records expose `resource_type`, `project_id`, and a
  `resource_ref` containing `local_path` and `daemon_id`;
- the representative pre-existing local resource did not expose
  `execution_mode`, although add/update help accepts `--execution-mode`.

The last point is not permission to weaken the Eventra target check. The first
Eventra resource read-after-create must expose verifiable worktree state. If it
does not, stop the live recovery and investigate the server contract before any
further write.

## Global constraints

- Work only in `/private/tmp/eventra-multica-contract-recovery` until merge.
- Do not change `/Users/didi/Eventra-workspace/Eventra-Backend`.
- Do not use SkillsHub or import any source outside the approved public map.
- Do not delete, rename, or update unrelated Multica objects.
- Keep live environment values out of argv, files, logs, fixtures, exceptions,
  reports, review messages, and audit output.
- Environment values may exist only in process memory and
  `--custom-env-stdin` input.
- The two secret recipients remain exactly Backend Engineer and Integration QA.
- No live mutation runs until Tasks 1-5 pass and independent review is clean.
- A malformed or unverifiable authoritative read always stops; never add a
  permissive fallback merely to finish provisioning.
- Push and merge only to `codeExploreHub/Eventra`; never use `Aprim-OPC`.
- Production deployment remains manual and is not part of this plan.

---

### Task 1: Freeze command-specific 0.4.31 read contracts

**Files:**

- Create: `tools/multica/contracts.py`
- Create: `tools/multica/tests/test_contracts.py`
- Create: `tools/multica/tests/fixtures/multica_0_4_31/runtime-list.json`
- Create: `tools/multica/tests/fixtures/multica_0_4_31/skill-list.json`
- Create: `tools/multica/tests/fixtures/multica_0_4_31/skill-get.json`
- Create: `tools/multica/tests/fixtures/multica_0_4_31/agent-list.json`
- Create: `tools/multica/tests/fixtures/multica_0_4_31/agent-get.json`
- Create: `tools/multica/tests/fixtures/multica_0_4_31/agent-env-get.json`
- Create: `tools/multica/tests/fixtures/multica_0_4_31/agent-skill-list.json`
- Create: `tools/multica/tests/fixtures/multica_0_4_31/squad-list.json`
- Create: `tools/multica/tests/fixtures/multica_0_4_31/squad-get.json`
- Create: `tools/multica/tests/fixtures/multica_0_4_31/squad-member-list.json`
- Create: `tools/multica/tests/fixtures/multica_0_4_31/project-list.json`
- Create: `tools/multica/tests/fixtures/multica_0_4_31/project-get.json`
- Create: `tools/multica/tests/fixtures/multica_0_4_31/project-local-resource-list.json`

**Interfaces:**

- Input: already-decoded JSON values plus an expected target ID where relevant.
- Output: normalized dictionaries/lists containing only fields used by
  reconciliation.
- Error: generic `RuntimeError("malformed <contract>")`; environment errors must
  contain neither keys nor values.

- [ ] **Step 1: Write failing fixture-driven parser tests**

In `test_contracts.py`, load fixtures relative to `Path(__file__).parent` and
cover one valid and several invalid cases per parser. At minimum assert:

```python
envelope = fixture("agent-env-get.json")
self.assertEqual(
    parse_agent_environment(envelope, "agent-backend"),
    envelope["custom_env"],
)

for malformed in (
    envelope["custom_env"],
    {**envelope, "agent_id": "other-agent"},
    {**envelope, "custom_env": {"KEY": 7}},
):
    with self.assertRaisesRegex(RuntimeError, "malformed agent environment"):
        parse_agent_environment(malformed, "agent-backend")
```

Also prove duplicate IDs, missing exact names/titles, wrong target IDs, malformed
nested origin/capabilities/resource refs, and non-string binding IDs fail closed.

- [ ] **Step 2: Run the focused tests and observe RED**

```bash
python3 -B -m unittest tools.multica.tests.test_contracts -v
```

Expected: FAIL because `tools.multica.contracts` and fixtures do not exist.

- [ ] **Step 3: Add sanitized fixtures**

Represent the complete structures seen in the live probe, but replace every
scalar with a synthetic value. The environment fixture must contain synthetic
test strings only and must never be generated from live output. Record fixture
provenance in a top-level sibling test constant, not by embedding live IDs.

The local-resource fixture intentionally represents the observed preflight
shape without `execution_mode`; target-state validation remains a separate,
stricter provisioner rule.

- [ ] **Step 4: Implement pure parsers**

Provide narrowly named functions such as:

```python
parse_runtime_list(value)
parse_skill_list(value)
parse_skill_detail(value, expected_id)
parse_agent_list(value)
parse_agent_detail(value, expected_id)
parse_agent_environment(value, expected_id)
parse_agent_skill_list(value)
parse_squad_list(value)
parse_squad_detail(value, expected_id)
parse_squad_members(value, expected_squad_id)
parse_project_list(value)
parse_project_detail(value, expected_id)
parse_project_resources(value, expected_project_id)
```

Allow additional 0.4.31 fields but require every field consumed by
reconciliation. Do not mutate caller-owned dictionaries.

- [ ] **Step 5: Run focused and full tests**

```bash
python3 -B -m unittest tools.multica.tests.test_contracts -v
python3 -B -m unittest discover -s tools/multica/tests -p 'test_*.py'
```

Expected: parser tests pass; the original 47-test suite remains green.

- [ ] **Step 6: Commit Task 1**

```bash
git add tools/multica/contracts.py tools/multica/tests/test_contracts.py \
  tools/multica/tests/fixtures/multica_0_4_31
git commit -m "test: freeze multica 0.4.31 read contracts"
```

---

### Task 2: Add secret-safe environment reuse

**Files:**

- Modify: `tools/multica/provision.py`
- Modify: `tools/multica/tests/test_provision.py`

**Interfaces:**

- New CLI flag: `--reuse-backend-env`, mutually exclusive with
  `--prompt-backend-env`.
- New helper: recover the exact existing Eventra Backend Engineer environment
  in memory using agent list plus agent env get.
- Existing `Provisioner.reconcile(..., backend_env=...)` remains the only write
  path for that dictionary.

- [ ] **Step 1: Make FakeRunner emit the real environment envelope**

Change only the fake read shape first:

```python
if command == ("agent", "env", "get"):
    agent_id = positionals[0]
    return self._response(
        command,
        {"agent_id": agent_id, "custom_env": copy.deepcopy(self.envs[agent_id])},
    )
```

Add a regression proving the current provisioner fails on this exact real
shape.

- [ ] **Step 2: Run the regression and observe RED**

```bash
python3 -B -m unittest \
  tools.multica.tests.test_provision.ProvisionerTests.test_accepts_real_agent_environment_envelope -v
```

Expected: FAIL with `malformed agent environment`.

- [ ] **Step 3: Route environment reads through the contract parser**

Replace `_agent_env_get`'s bare-map assumption with
`parse_agent_environment(response, agent_id)`. Keep generic errors. Validate
the exact required key set and signing-secret minimum length only after parsing.

- [ ] **Step 4: Write failing recovery-mode tests**

Cover:

- exact Backend Engineer found once and returned in memory;
- missing or duplicate exact name fails before mutation;
- malformed envelope, wrong envelope ID, wrong key set, or short signing secret
  fails before mutation;
- `--prompt-backend-env` and `--reuse-backend-env` are mutually exclusive;
- recovered values never appear in argv, captured stdout/stderr, exceptions, or
  `repr()` of results;
- a matching existing Backend environment is not redundantly set;
- new Integration QA receives an independent copy through stdin and verifies it
  with an env get;
- a later apply without either environment flag requires both recipient maps to
  have the exact required key set, a valid signing-secret length, and identical
  values; extra keys or unequal recipient maps fail before mutation.

- [ ] **Step 5: Run the recovery tests and observe RED**

```bash
python3 -B -m unittest tools.multica.tests.test_provision.RecoveryModeTests -v
```

Expected: FAIL because recovery mode does not exist.

- [ ] **Step 6: Implement recovery mode**

Use an argparse mutually exclusive group. Build the config first, then call a
helper with the same `MulticaRunner` instance:

```python
runner = MulticaRunner()
backend_env = (
    prompt_backend_env()
    if args.prompt_backend_env
    else recover_backend_env(config, runner)
    if args.reuse_backend_env
    else None
)
```

The helper may call only `agent list` and `agent env get`. It must not print,
serialize to disk, or include the dictionary in an exception. In agent
reconciliation, compare before setting and skip `agent env set` when state is
already exact. When no environment input is supplied, validate both recipient
maps as an equal pair before making any change; errors remain generic.

- [ ] **Step 7: Run focused and full tests**

```bash
python3 -B -m unittest tools.multica.tests.test_provision.RecoveryModeTests -v
python3 -B -m unittest discover -s tools/multica/tests -p 'test_*.py'
```

- [ ] **Step 8: Commit Task 2**

```bash
git add tools/multica/provision.py tools/multica/tests/test_provision.py
git commit -m "fix: reuse existing backend agent environment safely"
```

---

### Task 3: Make authoritative reads control reconciliation

**Files:**

- Modify: `tools/multica/provision.py`
- Modify: `tools/multica/tests/test_provision.py`

**Interfaces:**

- Mutation responses need only be valid JSON objects or arrays.
- New IDs are discovered by an exact unique post-write list record.
- Desired state is then proven by command-specific get/list parsers.
- Output includes a non-secret mutation-command count so real idempotency can be
  demonstrated.

- [ ] **Step 1: Write acknowledgement-independence tests**

Make FakeRunner support arbitrary mutation acknowledgements, including `{}`,
`{"ok": true}`, and unrelated arrays. For each mutation family, assert that a
correct post-read succeeds and a frozen/wrong post-state fails even when the
acknowledgement looks successful.

Cover Skill import, Agent create/update/env/skills, Squad create/update/member,
Project create/update, and resource add/update.

- [ ] **Step 2: Run acknowledgement tests and observe RED**

```bash
python3 -B -m unittest \
  tools.multica.tests.test_provision.ProvisionerTests.test_mutation_acknowledgements_do_not_define_state \
  tools.multica.tests.test_provision.ProvisionerTests.test_every_mutation_requires_authoritative_post_state -v
```

Expected: FAIL because create/update paths still parse IDs and names from
mutation responses.

- [ ] **Step 3: Refactor reads through `contracts.py`**

Replace generic `_records`, `_object`, and inline schema checks on read commands
with their command-specific parsers. Keep exact-name indexing and duplicate
rejection in the contracts boundary.

Do not make mutation acknowledgement bodies a source of IDs or state.

- [ ] **Step 4: Refactor every mutation to read after write**

Use these exact sequences:

- import → Skill list exact name → Skill get exact ID/origin;
- Agent create/update → Agent list exact name → Agent get exact ID/fields;
- env set → env get exact ID/full dictionary;
- skills add → skill list contains required IDs while preserving unrelated IDs;
- Squad create/update → Squad list exact name → Squad get exact fields;
- member add/set-role → member list exact agent IDs/types/roles;
- Project create/update → Project list exact title → Project get exact fields;
- resource add/update → resource list exact project/path/type/daemon/worktree.

For Eventra target resources, absence of an authoritative worktree field after
create/update is a hard failure. Do not infer it merely because the command used
`--execution-mode worktree`.

- [ ] **Step 5: Add mutation-count observability**

Have `MulticaRunner` count attempted commands from an immutable mutation-prefix
allowlist. The CLI's apply JSON must include only state IDs and
`mutation_count`; it must never include argv, stdin, stdout, stderr, or
environment content. Tests must prove a fully matching second apply reports
zero.

- [ ] **Step 6: Run focused regression tests**

```bash
python3 -B -m unittest tools.multica.tests.test_provision -v
```

Expected: all original safety/idempotency tests plus the new acknowledgement
tests pass.

- [ ] **Step 7: Run the full suite and commit**

```bash
python3 -B -m unittest discover -s tools/multica/tests -p 'test_*.py'
git diff --check
git add tools/multica/provision.py tools/multica/tests/test_provision.py
git commit -m "refactor: verify multica mutations from authoritative reads"
```

---

### Task 4: Add a read-only, scalar-free contract audit

**Files:**

- Create: `tools/multica/contract_audit.py`
- Create: `tools/multica/tests/test_contract_audit.py`

**Interfaces:**

- CLI: `python3 -B -m tools.multica.contract_audit --runtime-id ID --daemon-id ID`
- Allowed commands: the fixed list/get calls used by the Eventra preflight.
- Output: JSON structure containing type names, field names, array lengths, and
  equality booleans only.
- Special case: environment objects expose only key count and value-type set;
  even their key names are omitted.

- [ ] **Step 1: Write failing audit safety tests**

Use scalar sentinels for names, IDs, paths, descriptions, and environment values.
Assert none appears in `json.dumps(report)`. Assert the environment variable key
sentinels are also absent. Reject arbitrary commands and any `--apply` argument.

- [ ] **Step 2: Run the audit tests and observe RED**

```bash
python3 -B -m unittest tools.multica.tests.test_contract_audit -v
```

- [ ] **Step 3: Implement allowlisted audit traversal**

Construct every command internally; never accept command text from the user.
Discard stderr through the existing captured subprocess boundary. Convert
scalars to type strings before returning or printing. For target-aware reads,
emit only booleans such as `target_id_matches: true`.

- [ ] **Step 4: Prove the audit has no mutation surface**

Test the collected runner calls against the same immutable mutation-prefix
allowlist and require an empty intersection. Test argparse rejects unknown flags.

- [ ] **Step 5: Run focused/full tests and commit**

```bash
python3 -B -m unittest tools.multica.tests.test_contract_audit -v
python3 -B -m unittest discover -s tools/multica/tests -p 'test_*.py'
git add tools/multica/contract_audit.py tools/multica/tests/test_contract_audit.py
git commit -m "feat: add secret-safe multica contract audit"
```

---

### Task 5: Update the operator recovery runbook and complete static gates

**Files:**

- Modify: `tools/multica/README.md`
- Modify: `tools/multica/tests/test_operator_docs.py`
- Modify if evidence needs clarification:
  `docs/superpowers/specs/2026-08-23-multica-cli-contract-recovery-design.md`

- [ ] **Step 1: Write failing documentation contract tests**

Require the README to contain:

- audit command before recovery;
- dry-run command;
- one recovery apply with `--reuse-backend-env`;
- a normal second apply with neither environment flag;
- expected `mutation_count: 0` on the second apply;
- explicit stop behavior when resource worktree state is not observable;
- personal-fork-only merge and manual production deployment language.

Also assert the recovery example does not contain a secret literal, env value,
`Aprim-OPC`, or SkillsHub command.

- [ ] **Step 2: Run the docs test and observe RED**

```bash
python3 -B -m unittest \
  tools.multica.tests.test_operator_docs.OperatorDocsTests.test_contract_recovery_runbook -v
```

- [ ] **Step 3: Update the README**

Document commands using placeholders in the reusable section and the approved
runtime/daemon IDs only in a clearly Eventra-specific operator block. Explain
that `--reuse-backend-env` reads the existing Backend Engineer value in process
and forwards it only through stdin.

- [ ] **Step 4: Run all static and secret-boundary gates**

```bash
python3 -B -m unittest discover -s tools/multica/tests -p 'test_*.py'
python3 -B -m compileall -q tools/multica
git diff --check
rg -n 'Aprim-OPC|SkillsHub' tools/multica docs/superpowers || true
git status --short
```

Inspect every match rather than treating `rg`'s no-match exit code as a test
failure. Remove only generated `__pycache__` directories under `tools/multica`
if they appear.

- [ ] **Step 5: Commit Task 5**

```bash
git add tools/multica/README.md tools/multica/tests/test_operator_docs.py
git add docs/superpowers/specs/2026-08-23-multica-cli-contract-recovery-design.md
git commit -m "docs: add multica contract recovery runbook"
```

Omit the spec from `git add` if it did not change.

---

### Task 6: Review, run the connected recovery, and merge

**Files/state:**

- No new production files expected.
- Read and then reconcile the approved Multica runtime only.
- Create a PR only in `codeExploreHub/Eventra`.

- [ ] **Step 1: Run verification-before-completion gates**

```bash
python3 -B -m unittest discover -s tools/multica/tests -p 'test_*.py'
python3 -B -m compileall -q tools/multica
git diff --check
git status --short
git log --oneline master..HEAD
```

- [ ] **Step 2: Request independent spec/code/security review**

Use `superpowers:requesting-code-review`. The reviewer must inspect the full
`master..HEAD` diff and independently rerun the full suite. Must-fix findings
return to the relevant TDD task and require a fresh review.

- [ ] **Step 3: Run the connected read-only audit**

Run with host execution:

```bash
python3 -B -m tools.multica.contract_audit \
  --runtime-id de500649-cada-4419-9d5d-279045e2eaae \
  --daemon-id 019fab98-bbad-7d17-b0b7-26e56dbe1b6f
```

Expected: exit 0; output contains structure only. If any scalar state appears,
stop before mutation.

- [ ] **Step 4: Run a no-mutation dry run**

```bash
python3 -B -m tools.multica.provision \
  --runtime-id de500649-cada-4419-9d5d-279045e2eaae \
  --daemon-id 019fab98-bbad-7d17-b0b7-26e56dbe1b6f
```

Expected: exit 0 with the planned Eventra objects; zero mutation commands.

- [ ] **Step 5: Run the one authorized recovery apply**

```bash
python3 -B -m tools.multica.provision \
  --runtime-id de500649-cada-4419-9d5d-279045e2eaae \
  --daemon-id 019fab98-bbad-7d17-b0b7-26e56dbe1b6f \
  --apply \
  --reuse-backend-env
```

Expected: no prompt. The existing Backend Agent supplies the in-memory
dictionary; Backend and Integration QA verify exact equal state. Any malformed
or unverifiable read stops immediately without deletion or rollback.

- [ ] **Step 6: Prove real idempotency with a normal apply**

```bash
python3 -B -m tools.multica.provision \
  --runtime-id de500649-cada-4419-9d5d-279045e2eaae \
  --daemon-id 019fab98-bbad-7d17-b0b7-26e56dbe1b6f \
  --apply
```

Expected: exit 0 and `mutation_count` exactly `0`. No environment mode is used.

- [ ] **Step 7: Verify final sanitized state**

Rerun the audit and verify counts/booleans for five Agents, 14 approved public
Skills, five-member Squad semantics, one Eventra Project, two authoritative
local resources, and environment presence only for the two approved recipients.
Do not output IDs, paths, names, environment keys, or values in the audit.

- [ ] **Step 8: Push, create, and merge the personal-fork PR**

After all gates and connected recovery pass:

```bash
git push -u origin codex/multica-cli-contract-recovery
gh pr create --repo codeExploreHub/Eventra \
  --base master \
  --head codex/multica-cli-contract-recovery \
  --title "fix: harden Multica CLI contract recovery" \
  --body-file PR_BODY_FILE
gh pr checks --repo codeExploreHub/Eventra PR_NUMBER --watch
gh pr merge --repo codeExploreHub/Eventra PR_NUMBER --merge --delete-branch
```

Build `PR_BODY_FILE` in a task-specific temporary directory and include test,
review, live recovery, idempotency, and exact-SHA evidence without any secret or
raw audit state.

- [ ] **Step 9: Verify the merged SHA locally and remotely**

Update the authoritative frontend checkout non-destructively, then verify the
same exact merge SHA via local `git rev-parse HEAD` and host-level read-only
GitHub queries. Preserve the existing user stash and do not delete the recovery
worktree automatically.
