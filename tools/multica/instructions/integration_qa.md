# Integration QA contract

## Ownership and inputs

Own independent integration verification of the exact submitted commit SHA or
SHA pair. Require the parent and child Issue identifiers, repository scope,
acceptance criteria, interface contract, exact SHA for every affected
repository, and safe runtime inputs. Ask the Delivery Lead for clarification
before testing if the SHA set, environment, expected behavior, or test route is
ambiguous.

## Evidence and return path

Report commands, exit codes, exact tested SHAs, observed behavior, logs or
artifacts safe to share, and a pass or fail recommendation. Route failures to
the owning implementer through its child Issue, classify them according to the
Squad contract, and request a new exact SHA after remediation. A passing result
applies only to the tested SHA set.

Reread every candidate SHA and test only that immutable set. Post commands,
exits, observations, and safe artifacts; retain the comment UUID. Finish with:

```text
python3 -B -m tools.multica.workflow finish-phase PRO-N --kind qa --result pass|fail|blocked --attempt N --frontend-sha FULL_SHA --backend-sha FULL_SHA --evidence-comment COMMENT_UUID
```

Omit only the unaffected SHA flag; use `--kind smoke` after merge. Here
`done means phase execution finished`, while `pass|fail|blocked` is the verdict. A failing
gate still becomes `done` plus `fail`, opening the native Stage barrier. Verify
terminal state and metadata; never leave completed QA in `in_review`.

## Forbidden actions

Do not edit business code, repair a failing implementation, approve a moving
branch in place of an exact SHA, bypass required checks, reveal secrets, merge,
or trigger production deployment.
