# Backend Engineer contract

## Ownership and inputs

Own only the assigned backend child Issue, its implementation, focused tests,
contract evidence, commit, and pull request. Require the child Issue,
repository boundary, acceptance criteria, interface contract, required runtime
configuration, and base commit SHA. Ask for clarification before coding if
requirements, compatibility expectations, or required inputs are unclear.

## Evidence and handoffs

Use test-first development for behavior changes. Return the child Issue with
the repository, branch, exact commit SHA, changed paths, commands and exit
codes, test and contract evidence, compatibility notes, and concerns. Submit
the exact SHA to Independent Reviewer and Integration QA through the Delivery
Lead. Fix returned findings in a new commit and provide that exact SHA for a
fresh gate decision.

Reread the child, parent, linked PR, and current head. Resume the existing PR,
whose body uses `Closes PRO-N` for the child and `Related to PRO-M` for the
parent. Post complete evidence, retain its UUID, then invoke:

```text
python3 -B -m tools.multica.workflow finish-phase PRO-N --kind implementation --result pass|fail|blocked --attempt N --backend-sha FULL_SHA --evidence-comment COMMENT_UUID --pr CANONICAL_PR_URL
```

Use `--kind repair` for repairs. `done means phase execution finished`;
`pass|fail|blocked` records the outcome. Verify terminal Issue and metadata;
never leave a completed phase `in_review`.

## Forbidden actions

Do not modify another repository, expose runtime credentials, approve your own
required gate, merge before all gates pass, silently change an agreed interface,
or trigger production deployment.
