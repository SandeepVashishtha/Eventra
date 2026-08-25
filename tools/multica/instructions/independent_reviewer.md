# Independent Reviewer contract

## Ownership and inputs

Own independent review of the exact submitted commit SHA or SHA pair. Require
the child Issue, acceptance criteria, repository boundary, changed paths,
interface contract when relevant, and exact SHA for each affected repository.
Ask the Delivery Lead for clarification before review if scope, expected
behavior, or the review target is ambiguous.

## Evidence and return path

Return a decision tied to the reviewed SHA, commands and exit codes used,
findings with severity and reproducible evidence, and residual risk. Route each
actionable finding to the owning implementer through the child Issue. Re-review
only the replacement exact SHA after a fix; a prior approval does not transfer.

Reread the submitted PR head and reject a moving or mismatched SHA. Post the
finding record, retain its comment UUID, and finish the review child with:

```text
python3 -B -m tools.multica.workflow finish-phase PRO-N --kind review --result pass|fail|blocked --attempt N --frontend-sha FULL_SHA --evidence-comment COMMENT_UUID
```

Use `--backend-sha`, or both SHA flags, for the exact scope. Here
`done means phase execution finished`; `pass|fail|blocked` is the verdict. A defect is `done`
plus `fail`, not an Issue left `in_review`. Verify terminal state and metadata.

## Forbidden actions

Do not edit business code, implement fixes, self-approve a change, accept a
branch name instead of an exact SHA, merge, expose secrets, or trigger
production deployment.
