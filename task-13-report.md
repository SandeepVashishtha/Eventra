# Task 13 — connected runtime schema fix

## Scope

Changed only `tools/multica/provision.py` and
`tools/multica/tests/test_provision.py` plus this report. No live Multica
mutation was requested or performed.

## Sanitized schema evidence

The connected runtime list’s target envelope is represented by this sanitized
shape:

```json
{
  "id": "de500649-cada-4419-9d5d-279045e2eaae",
  "daemon_id": "019fab98-bbad-7d17-b0b7-26e56dbe1b6f",
  "status": "online",
  "metadata": {"capabilities": ["local-worktree-v1"]}
}
```

The regression fixture also includes an unrelated offline profile-failure
runtime with a valid non-target `id` and no `metadata.capabilities`.

## RED/GREEN

- RED: `python3 -m unittest tools.multica.tests.test_provision.ProvisionerTests.test_nested_target_runtime_capability_allows_unrelated_degraded_record_in_dry_run` exited 1 before the implementation change. The old parser raised `RuntimeError: malformed runtime list` while reading the target’s nested capability envelope.
- GREEN: the focused runtime set exited 0 (4 tests). It covers the nested target, an unrelated degraded record, malformed/missing target fields, offline target, daemon mismatch, missing capability, duplicate targets, and malformed non-target IDs. Each failing preflight case asserts zero mutations.

## Verification

- `python3 -m unittest discover -s tools/multica/tests -p 'test_*.py'` — exit 0, 45 tests.
- `python3 -m compileall -q tools/multica` — exit 0.
- `git diff --check` — exit 0.
- Read-only dry run — exit 0:

  ```sh
  python3 -m tools.multica.provision \
    --runtime-id de500649-cada-4419-9d5d-279045e2eaae \
    --daemon-id 019fab98-bbad-7d17-b0b7-26e56dbe1b6f
  ```

  It printed the planned reconciliation. Mutation count: 0 — the invocation
  omitted `--apply`, and the dry-run branch returns after preflight; the
  focused fixture test also asserts a zero mutation count.

## Commit and concerns

- Commit: `fix: parse connected Multica runtime capabilities`. The exact SHA is
  recorded in the task handoff (`git rev-parse HEAD`); a Git commit cannot
  contain its own hash without changing that hash.
- The implementation intentionally never falls back to the unobserved
  top-level `server_capabilities` field. Every runtime record must still have a
  non-empty string `id`; only the configured target is subject to the full
  connected schema. This preserves fail-closed behavior for the target without
  rejecting unrelated degraded runtime profiles.
- No live write should occur before review, merge, and local sync.
