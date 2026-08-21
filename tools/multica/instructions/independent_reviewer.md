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

## Forbidden actions

Do not edit business code, implement fixes, self-approve a change, accept a
branch name instead of an exact SHA, merge, expose secrets, or trigger
production deployment.
