# Task 4 report — closed scoped Multica read identifiers

## Scope and starting state

- Worktree: `/Users/didi/Eventra-workspace/Eventra/.worktrees/multica-generic-core`
- Starting HEAD: `45f957deb9b3b14734d4f9e951834ddbcd6d4e0f`
- Production boundary: `tools/multica_delivery/multica_client.py`
- Behavioral tests: `tools/multica_delivery/tests/test_multica_client.py`
- Operator contract: `docs/multica-delivery-core.md`
- Documentation tests: `tools/multica_delivery/tests/test_documentation.py`
- Preserved constraints: closed public read shapes, typed-only mutations, no ID
  normalization or aliasing, Tasks 1–3 authority rulings, and the existing
  no-checkout/no-reset/no-deployment contract.

## RED/GREEN evidence

### Public one-ID command boundary

The regression was written before the production change. Its literal prefix
table covers all 13 `_PUBLIC_READ_ONE_ID` command prefixes and exercises both
accepted suffix forms: no suffix and `("--output", "json")`. Each prefix
accepts a literal UUID. Each prefix/suffix combination rejects:

```text
"", "--all", "--help", "-x", "has space", "owner/name", "a" * 257,
".leading", "unicode-é", "invalid?character"
```

Every rejection asserts `MulticaContractError` and `runner.calls == []`. A
separate per-prefix case inserts `--all` after a valid ID and before the JSON
suffix, proving extra argv tokens are rejected before execution.

RED command:

```text
.venv/bin/python -B -m unittest tools.multica_delivery.tests.test_multica_client.MulticaClientTests.test_public_one_id_reads_enforce_the_closed_identifier_grammar -v
```

RED result:

```text
Ran 1 test in 0.016s
FAILED (failures=234)
```

All non-empty malformed tokens reached the fake runner across every prefix and
both suffix forms. Representative failing subcases were `--all`, `has space`,
`owner/name`, the 257-character ID, leading punctuation, non-ASCII input, and
unsupported punctuation. Empty IDs and extra-token layouts were already
closed, so their subcases did not fail. This isolated the production defect to
the one truthiness check in `_is_public_read()`.

GREEN implementation added exactly the approved stable validator:

```python
_PUBLIC_ID = re.compile(r"[A-Za-z0-9][A-Za-z0-9._:-]{0,255}\Z")

def _is_public_identifier(value: object) -> bool:
    return isinstance(value, str) and _PUBLIC_ID.fullmatch(value) is not None
```

Every public one-ID read shape now uses that helper instead of truthiness. The
value is neither normalized, lowercased, split, nor mapped to an alias.

GREEN commands and results:

```text
.venv/bin/python -B -m unittest tools.multica_delivery.tests.test_multica_client.MulticaClientTests.test_public_one_id_reads_enforce_the_closed_identifier_grammar -v
Ran 1 test in 0.002s
OK

.venv/bin/python -B -m unittest tools.multica_delivery.tests.test_multica_client -q
Ran 28 tests in 0.002s
OK
```

### Operator contract

The documentation assertion was also added before its prose. It requires the
`Public core boundary` section to state the exact grammar, pre-runner rejection
of empty/option-like/whitespace/slash/overlength/extra-token forms, and the
absence of normalization, lowercasing, splitting, or aliases.

RED command and result:

```text
.venv/bin/python -B -m unittest tools.multica_delivery.tests.test_documentation.CoreDocumentationTests.test_documents_closed_public_multica_identifier_grammar -v
Ran 1 test in 0.001s
FAILED (failures=1)
```

GREEN commands and results:

```text
.venv/bin/python -B -m unittest tools.multica_delivery.tests.test_documentation.CoreDocumentationTests.test_documents_closed_public_multica_identifier_grammar -v
Ran 1 test in 0.000s
OK

.venv/bin/python -B -m unittest tools.multica_delivery.tests.test_documentation -q
Ran 12 tests in 0.002s
OK
```

The existing exact-SHA runner, no-checkout/no-reset, apply authority, legacy
compatibility, and nonexistent-CLI clauses remain present and tested.

## Final verification

Fresh test matrix after the implementation and documentation changes:

```text
.venv/bin/python -B -m unittest tools.multica_delivery.tests.test_multica_client tools.multica_delivery.tests.test_documentation -q
Ran 40 tests in 0.005s
OK

.venv/bin/python -B -m unittest discover -s tools/multica_delivery/tests -p 'test_*.py' -q
Ran 341 tests in 0.721s
OK

.venv/bin/python -B -m unittest discover -s tools/multica/tests -p 'test_*.py' -q
Ran 174 tests in 0.145s
OK

.venv/bin/python -B -m unittest discover -s tools -p 'test_*.py' -q
Ran 515 tests in 0.867s
OK
```

Static, dependency, and formatting verification:

```text
PYTHONPYCACHEPREFIX=/private/tmp/multica-authority-final-pycache \
  .venv/bin/python -B -m compileall -q tools/multica tools/multica_delivery
exit 0, no output

git diff --check
exit 0, no output

.venv/bin/python -c 'import yaml; assert yaml.__version__ == "6.0.2"; print(yaml.__version__)'
6.0.2
```

## Scoped safety-search evidence

Each scan excluded generic-core tests where synthetic sentinels and a temporary
Git checkout are intentionally used. Every fail-on-match search returned
`rg` status 1 (no matches), and the enclosing verification command exited 0:

```text
rg 'shell\s*=\s*True' generic production Python
no matches

rg '^\s*(?:async\s+)?def\s+(?:deploy|rollback)\b' generic production Python
no matches

rg 'git.{0,40}(?:checkout|reset)|(?:checkout|reset).{0,40}git' generic production Python
no matches

rg 'Eventra|codeExploreHub|Aprim' generic production Python
no matches

rg example SECRET/TOKEN/PASSWORD assignments in generic production and the operator document
no matches

rg literal secret/token/password assignments in generic production and the operator document
no matches

rg 'python3\s+(?:-B\s+)?-m\s+tools\.multica_delivery(?:\s|\.)' docs/multica-delivery-core.md
no matches
```

These searches prove the scoped production/document paths contain no
`shell=True`, deployment or rollback method, automatic Git checkout/reset,
product-specific branch, example/literal secret assignment, or documented
nonexistent generic CLI invocation.

## Self-review and concerns

- The production delta is one compiled regex, one type/full-match helper, and
  one replacement at the complete command-shape gate.
- Every prefix uses the same validator; there is no per-resource exception or
  alias path.
- Exact length is capped at 256 characters and the first character must be
  ASCII alphanumeric. Whitespace, slash, option-leading hyphen, non-ASCII, and
  unsupported punctuation fail the full match.
- Shape length and suffix equality still run before the runner, preserving the
  prior extra-token closure and both supported output forms.
- `_PUBLIC_READ_NO_ID`, typed mutation methods, response decoding, retry
  classification, and environment redaction are unchanged.
- No live Multica, GitHub, network, product repository, checkout/reset, merge,
  rollback, deployment, push, or PR action ran during Task 4.
- Mutation check: restoring `bool(command[len(prefix)])` reproduces the 234
  focused failures; removing a prefix or either suffix form breaks its literal
  valid-ID subcase; permitting extra tokens breaks the zero-call assertion.
- Open concerns: none.
