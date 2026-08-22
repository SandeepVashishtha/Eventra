# Multica CLI Contract Recovery Design

## Context

The Eventra team provisioner targets Multica CLI `0.4.31`. Three live apply
attempts exposed that its stateful test fake had invented response shapes instead
of recording the command-specific CLI contracts:

1. `skill import` returns `{ "skill": {...}, "status": "created" }`, not a
   flat skill object.
2. GitHub skill identity comes from the imported manifest, so the Vercel URL
   ending in `react-best-practices` creates an entity named
   `vercel-react-best-practices`.
3. `agent env get` returns
   `{ "agent_id": "...", "custom_env": {...} }`, not a bare environment map.

The first two contracts are already corrected on `master`. The third failure
occurred after the Delivery Lead, Frontend Engineer, and Backend Engineer were
created. The Backend Engineer has exactly the three required custom-environment
keys. No Eventra skill bindings, Squad, or Project exist yet.

This is an architectural recovery, not another response-field patch.

## Goals

- Complete the approved Eventra team without asking the user to enter the
  signing secret again.
- Make strict read-after-write state authoritative instead of trusting unstable
  mutation response envelopes.
- Model every read contract used by reconciliation with sanitized Multica
  `0.4.31` fixtures.
- Fail before the next mutation when an authoritative read is malformed,
  ambiguous, points at the wrong ID, or has an unapproved origin.
- Keep all environment values out of argv, files, logs, exceptions, test
  fixtures, reports, and assistant-visible tool output.
- Preserve exact-name idempotency and unrelated workspace state.

## Non-goals

- Supporting arbitrary Multica versions or guessing future response formats.
- Deleting or renaming unrelated Agents, Skills, Squads, Projects, or resources.
- Replacing Multica, changing the five-role team design, or changing the two
  authoritative repository paths.
- Automating production deployment.
- Reading from or installing anything through the internal SkillsHub.

## Chosen Architecture

### 1. Command-specific read contracts

Create `tools/multica/contracts.py` as a pure parsing boundary. It accepts parsed
JSON values and returns normalized, typed dictionaries only after validating a
`0.4.31` schema captured by a live read-only probe or, when no representative
object exists, by the first strict read-after-create result.

The module owns parsers for:

- runtime list entries and nested `metadata.capabilities`;
- skill list entries and skill detail `config.origin.source_url`;
- agent list/detail, skill bindings, and the exact agent-environment envelope;
- Squad list/detail/member entries;
- Project list/detail/resource entries.

Each parser validates non-empty IDs, required names/titles, nested object types,
and target-ID equality. It never logs input values. Environment parsing requires
an envelope with a matching `agent_id` and a string-to-string `custom_env` map.
Errors are generic and contain neither environment keys nor values.

### 2. Writes are acknowledgements; reads prove state

`MulticaRunner` continues to require an argv list, bounded timeout, exit code
zero, and JSON object/array output. Reconciliation will not infer identity or
correctness from a mutation response body.

After every mutation, the provisioner performs an authoritative read:

| Mutation | Authoritative verification |
| --- | --- |
| skill import | skill list by exact manifest name, then skill get and approved source URL |
| agent create/update | agent list by exact name, then agent get and full desired fields |
| agent env set | agent env get, matching envelope ID, then exact environment dictionary |
| agent skill add | agent skill list contains all required IDs while preserving unrelated IDs |
| Squad create/update | Squad list/get matches exact name, leader, description, and instructions |
| member add/role update | member list has each exact agent ID, type, and role |
| Project create/update | Project list/get matches exact title and full context |
| resource add/update | resource list has the exact local path, daemon, type, and worktree mode |

Create operations discover their ID from the unique post-write list record,
then verify it with get. Update operations verify the explicitly targeted ID.
This removes dependence on unobserved create/update response envelopes without
weakening identity or post-state checks.

### 3. Sanitized contract fixtures

Add sanitized fixtures under
`tools/multica/tests/fixtures/multica_0_4_31/`. Fixtures contain the complete
structure captured for each read parser, but use synthetic IDs and test values.
Each fixture records whether its structure came from a preflight read or a
strict first-create read. The environment fixture contains only synthetic values
and is never generated from live state.

The stateful FakeRunner will emit those read shapes and allow mutation responses
to vary between valid JSON envelopes. Tests must prove that reconciliation
succeeds only when post-write reads reach the exact desired state, and fails when
the acknowledgement looks successful but the authoritative state is wrong.

### 4. Secret-safe recovery input

Add mutually exclusive CLI modes:

- `--prompt-backend-env` for a fresh installation;
- `--reuse-backend-env` for recovery from the exact existing Eventra Backend
  Engineer.

`--reuse-backend-env` performs read-only discovery of the exact Backend Engineer,
parses the environment envelope, validates the exact required key set and minimum
signing-secret length, and passes the dictionary directly to reconciliation in
the same Python process. It never prints the dictionary and never places it in
argv, a file, an exception, or a report.

The recovered dictionary is supplied to the existing Backend Engineer and the
new Integration QA Agent through `--custom-env-stdin`. If recovery stops before
QA environment verification, the next recovery attempt repeats
`--reuse-backend-env`; only after both recipients are verified may later normal
`--apply` runs omit either secret mode.

### 5. Read-only contract audit

Add `tools/multica/contract_audit.py` for operator diagnostics. It is restricted
to allowlisted list/get commands and prints only recursive JSON types, object
keys, array lengths, and target-ID equality booleans. Scalar values are discarded
before output. The audit never accepts `--apply` and has no mutation commands.

This makes Multica upgrades observable without turning production state into
test data or exposing secrets.

## Recovery Flow

1. Run the read-only audit against runtime, all 14 approved Skills, the three
   existing Agents, Backend Agent environment shape, and representative existing
   Squad/Project/member/resource records when such unrelated objects exist.
   Record any unavailable preflight shape as pending first-create verification.
2. Run the full Python suite and a no-mutation provisioner dry run.
3. Run one recovery apply with `--reuse-backend-env`.
4. If any mutation fails, stop and inspect only sanitized state shapes. Do not
   prompt for or print a secret.
5. Verify five exact Agents, exact additive Skill bindings, one exact Squad with
   five members, one exact Project, two exact worktree resources, and required
   environment keys only on Backend Engineer and Integration QA.
6. Run a normal `--apply` without either secret flag and require zero mutations.

## Failure Handling

- Missing or duplicate exact-name objects fail before mutation.
- A same-name Skill from a different source fails before mutation.
- Malformed read envelopes fail closed with generic errors.
- Mutation exit failures are reported only by command and exit code; stdout,
  stderr, stdin, and environment values are never included.
- Wrong post-write state fails even if the mutation acknowledgement reports
  success.
- No cleanup or rollback deletes partially created resources automatically.
  Reconciliation resumes from verified exact-name state.

## Testing

- Parser unit tests cover every valid sanitized fixture and malformed variants.
- TDD regression reproduces the observed `{agent_id, custom_env}` envelope.
- Recovery tests prove `--reuse-backend-env` fails before mutation when the
  Backend Agent is missing, duplicated, malformed, short-secret, or has the wrong
  key set.
- Secret-boundary tests scan rendered argv, exceptions, reports, and audit output
  to ensure no environment value appears.
- Stateful reconciliation tests vary mutation acknowledgement bodies and verify
  only read-after-write state controls success.
- Full apply, second apply, partial-state recovery, wrong post-state, unsafe
  resource, and unrelated-state preservation tests remain mandatory.

## Acceptance Criteria

- The connected `0.4.31` recovery completes without another user secret prompt.
- Both secret-recipient Agents receive the exact same recovered dictionary only
  through stdin.
- All five Agents, 14 public Skills, Squad membership, Project context, and two
  local worktree resources match the approved design.
- A second normal apply performs zero mutations.
- All tests, static checks, secret scans, real read-only audit, independent code
  review, and exact-SHA verification pass before merge.
- Merge remains limited to the personal `codeExploreHub/Eventra` fork and does
  not trigger production deployment.
