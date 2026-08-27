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

## Fix Round 1/5 — bind tests to the production prefix authority

Starting HEAD: `04a639716fcc853bdd655b0aae2277e90d6529d9`

The scoped review approved the production grammar and operator documentation
but identified two Important test-authority gaps: the behavior loop used a
disconnected literal prefix tuple, and the accepted-ID cases did not protect
the minimum/maximum lengths or the complete punctuation alphabet.

### Test changes

The test module now imports `_PUBLIC_READ_ONE_ID` and compares it to the stable
literal `_EXPECTED_PUBLIC_READ_ONE_ID` set before behavior cases. This makes
both accidental surface expansion and accidental prefix removal fail while
retaining an independently reviewed expected public surface. The behavior
matrix iterates the production set itself, so every current production prefix
and both supported suffix forms execute every grammar case.

Committed valid IDs cover:

- the one-character minimum: `A`;
- the existing UUID example;
- every allowed punctuation character in a non-leading position: `A._:-0`;
- the exact 256-character maximum: `"A" + "a" * 255`.

Committed invalid IDs cover empty and option-like values; each leading
punctuation character `.`, `_`, `:`, and `-`; space, tab, newline, carriage
return, vertical tab, form feed, NUL, unit-separator, and DEL controls; slash,
Unicode, unsupported `?`, and the 257-character overlength boundary. Every
invalid case asserts `MulticaContractError` and zero runner calls for every
production prefix and both suffix forms. The per-prefix extra-token smuggling
case retains the same zero-runner assertion.

### Controlled mutation RED evidence

Because approved production already implements the required behavior, each
new test authority was proven through a temporary production mutation and the
production file was restored after every run.

Prefix addition mutation — adding `("daemon", "get")` only to production:

```text
.venv/bin/python -B -m unittest \
  tools.multica_delivery.tests.test_multica_client.MulticaClientTests.test_public_one_id_prefixes_match_the_closed_production_surface -v
FAILED (failures=1)
Items in the first set but not the second: ('daemon', 'get')
```

Prefix removal mutation — removing `("issue", "runs")` only from production:

```text
.venv/bin/python -B -m unittest \
  tools.multica_delivery.tests.test_multica_client.MulticaClientTests.test_public_one_id_prefixes_match_the_closed_production_surface -v
FAILED (failures=1)
Items in the second set but not the first: ('issue', 'runs')
```

Maximum off-by-one mutation — narrowing `{0,255}` to `{0,254}`:

```text
.venv/bin/python -B -m unittest \
  tools.multica_delivery.tests.test_multica_client.MulticaClientTests.test_public_one_id_reads_enforce_the_closed_identifier_grammar -q
Ran 1 test in 0.008s
FAILED (errors=26)
```

Minimum off-by-one mutation — narrowing `{0,255}` to `{1,255}`:

```text
.venv/bin/python -B -m unittest \
  tools.multica_delivery.tests.test_multica_client.MulticaClientTests.test_public_one_id_reads_enforce_the_closed_identifier_grammar -q
Ran 1 test in 0.008s
FAILED (errors=26)
```

Punctuation narrowing mutation — removing `:` from the continuation class:

```text
.venv/bin/python -B -m unittest \
  tools.multica_delivery.tests.test_multica_client.MulticaClientTests.test_public_one_id_reads_enforce_the_closed_identifier_grammar -q
Ran 1 test in 0.007s
FAILED (errors=26)
```

Each grammar mutation failed once for every 13-prefix × 2-suffix combination
at the intended valid boundary value. No mutation was retained.

### Restored GREEN evidence

After restoring the approved prefix set and exact grammar:

```text
.venv/bin/python -B -m unittest -v \
  tools.multica_delivery.tests.test_multica_client.MulticaClientTests.test_public_one_id_prefixes_match_the_closed_production_surface \
  tools.multica_delivery.tests.test_multica_client.MulticaClientTests.test_public_one_id_reads_enforce_the_closed_identifier_grammar
Ran 2 tests in 0.005s
OK

.venv/bin/python -B -m unittest tools.multica_delivery.tests.test_multica_client -q
Ran 29 tests in 0.006s
OK
```

Final scoped diff inspection showed no change to
`tools/multica_delivery/multica_client.py` or
`docs/multica-delivery-core.md`. Fix Round 1 changes only the authority-bound
test matrix and this report. Open concerns: none.

### Fix Round 1 final verification

```text
.venv/bin/python -B -m unittest \
  tools.multica_delivery.tests.test_multica_client \
  tools.multica_delivery.tests.test_documentation -q
Ran 41 tests in 0.008s
OK

.venv/bin/python -B -m unittest discover \
  -s tools/multica_delivery/tests -p 'test_*.py' -q
Ran 342 tests in 0.753s
OK

.venv/bin/python -B -m unittest discover \
  -s tools/multica/tests -p 'test_*.py' -q
Ran 174 tests in 0.163s
OK

.venv/bin/python -B -m unittest discover -s tools -p 'test_*.py' -q
Ran 516 tests in 0.937s
OK

PYTHONPYCACHEPREFIX=/private/tmp/multica-authority-task4-fix1-pycache \
  .venv/bin/python -B -m compileall -q tools/multica tools/multica_delivery
exit 0, no output

git diff --check
exit 0, no output

.venv/bin/python -c 'import yaml; assert yaml.__version__ == "6.0.2"; print(yaml.__version__)'
6.0.2
```

## Fix Round 2/5 — cover extra-token smuggling for both suffixes

Starting HEAD: `65a2405b445ecd6b7364e0a81d0b9f1129ebd59c`

The remaining Important test gap was limited to extra-token placement: the
smuggling assertion sat outside the suffix loop and hardcoded only
`(valid_id, "--all", "--output", "json")`. It therefore did not exercise the
suffixless complete shape.

The assertion now runs inside the suffix loop for every prefix in the
authority-bound production `_PUBLIC_READ_ONE_ID` set. It constructs the
command exactly as:

```python
("multica",) + prefix + (valid_id, "--all") + suffix
```

for both `suffix == ()` and `suffix == ("--output", "json")`. Every subcase
requires `MulticaContractError` and `runner.calls == []`.

### Controlled mutation RED evidence

Approved production already rejects both forms, so the new suffix coverage was
mutation-checked by temporarily discarding an injected `--all` token before
the existing complete-shape validation. This converted each smuggled command
back into an otherwise valid one. The focused regression failed exactly once
per 13-prefix × 2-suffix combination:

```text
.venv/bin/python -B -m unittest \
  tools.multica_delivery.tests.test_multica_client.MulticaClientTests.test_public_one_id_reads_enforce_the_closed_identifier_grammar -q
Ran 1 test in 0.006s
FAILED (failures=26)
```

Failure subtests explicitly included both `suffix=()` and
`suffix=("--output", "json")` for every production prefix. The mutation was
then removed; final diff inspection showed no production or operator-document
change.

### Restored GREEN and final verification

```text
.venv/bin/python -B -m unittest \
  tools.multica_delivery.tests.test_multica_client.MulticaClientTests.test_public_one_id_reads_enforce_the_closed_identifier_grammar -q
Ran 1 test in 0.004s
OK

.venv/bin/python -B -m unittest \
  tools.multica_delivery.tests.test_multica_client \
  tools.multica_delivery.tests.test_documentation -q
Ran 41 tests in 0.006s
OK

.venv/bin/python -B -m unittest discover \
  -s tools/multica_delivery/tests -p 'test_*.py' -q
Ran 342 tests in 0.753s
OK

.venv/bin/python -B -m unittest discover \
  -s tools/multica/tests -p 'test_*.py' -q
Ran 174 tests in 0.148s
OK

.venv/bin/python -B -m unittest discover -s tools -p 'test_*.py' -q
Ran 516 tests in 0.872s
OK

PYTHONPYCACHEPREFIX=/private/tmp/multica-authority-task4-fix2-pycache \
  .venv/bin/python -B -m compileall -q tools/multica tools/multica_delivery
exit 0, no output

git diff --check
exit 0, no output

.venv/bin/python -c 'import yaml; assert yaml.__version__ == "6.0.2"; print(yaml.__version__)'
6.0.2
```

Fix Round 2 changes only the one smuggling test placement/construction and this
tracked report. Production grammar, closed prefix tables, and operator docs are
unchanged. Open concerns: none.
