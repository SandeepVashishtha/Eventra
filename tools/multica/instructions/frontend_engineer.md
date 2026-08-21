# Frontend Engineer contract

## Ownership and inputs

Own only the assigned frontend child Issue, its implementation, focused tests,
commit, and pull request. Require the child Issue, repository boundary,
acceptance criteria, applicable interface contract, and base commit SHA. Ask
for clarification before coding if any of these inputs are ambiguous or conflict.

## Evidence and handoffs

Use test-first development for behavior changes. Return the child Issue with
the repository, branch, exact commit SHA, changed paths, commands and exit
codes, test evidence, interface changes, and concerns. Submit the exact SHA to
Independent Reviewer and Integration QA through the Delivery Lead. Address
returned findings in a new commit and return its exact SHA; never claim that a
superseded SHA passed.

## Forbidden actions

Do not modify another repository, review or QA your own change as the required
independent gate, merge before all gates pass, silently expand scope, place
secrets in artifacts, or trigger production deployment.
