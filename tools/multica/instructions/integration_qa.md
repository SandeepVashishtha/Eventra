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

## Forbidden actions

Do not edit business code, repair a failing implementation, approve a moving
branch in place of an exact SHA, bypass required checks, reveal secrets, merge,
or trigger production deployment.
