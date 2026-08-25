# Multica pilot Issues and evidence runbook

Use the three bodies below as separate parent Issues. They are deliberately
small, copy-ready pilots of the three Multica routing modes: `frontend-only`,
`backend-only`, and `cross-stack`.

## Dispatch and evidence rules (apply to every pilot)

1. Create **one parent Issue** from the selected body. Bind it to the
   **Eventra Local Development** Project, assign it to the **Eventra Local
   Delivery** Squad, and move it from **backlog** to **todo**. The Delivery
   Lead classifies and decomposes it, then keeps the parent **in progress**
   until every listed gate, merge, and post-merge smoke check has evidence.
2. The Delivery Lead creates and assigns the routed child Issue or Issues
   below. Frontend children remain in **Eventra Local Development**; backend
   children are created in **Eventra Backend Local Development** and link back
   to the parent. Each child names its owner, authoritative repository, base SHA,
   acceptance criteria, interface contract (when applicable), and evidence.
   The nested frontend `Backend/` directory is never a repository target.
   Create implementation children in Stage 1 with `--parent` and `--stage`.
   Later Stages are exact-SHA review/QA, bounded repair followed by fresh
   gates, and post-merge smoke. Never reuse a Stage ordinal.
3. Every implementer returns its child Issue to the Delivery Lead with the
   repository, base and feature branches, pull-request link, **exact SHA**,
   changed paths, commands and exit codes, results, contract notes, and
   concerns. A branch name is not evidence.
   The PR body includes `Closes PRO-N` for the implementation child and
   `Related to PRO-M` for its parent. After evidence, every execution role
   calls `tools.multica.workflow finish-phase`. Child `done` means phase
   execution finished; `eventra.phase.result=pass|fail|blocked` is the verdict.
   FAIL and BLOCKED still become `done` so the native Stage barrier advances.
4. The Delivery Lead sends the immutable exact SHA (or exact SHA pair) to the
   **Independent Reviewer** and **Integration QA**. Their approval or QA
   result is valid only for that SHA set. A replacement commit requires fresh
   review and QA on its new exact SHA.
   For a cross-stack pair, create one Reviewer task per Project. Integration QA
   first verifies the backend SHA in **Eventra Backend Local Development**;
   Backend Engineer then starts that verified SHA on port 8080 and keeps its
   child active while Integration QA verifies the frontend SHA in **Eventra
   Local Development** against `localhost:8080`. Record the shared daemon,
   service SHA, start/readiness evidence, and process-owner cleanup. If the
   exact service cannot remain available, block the gate.
5. An **automatic merge** is permitted only after each affected PR is
   mergeable, its head equals the reviewed and QA-tested exact SHA, all Issue
   acceptance criteria and required repository checks pass, and both
   independent gates pass. The Delivery Lead records the gate decision before
   merging. For `cross-stack`, wait for both PRs to pass before the coordinated
   automatic merge; merge in the API-compatible order. If one merge succeeds
   and the other fails, stop, mark the parent blocked, preserve the exact merge
   evidence, and escalate—do not deploy, auto-revert, or continue.
   Delivery Lead calls read-only `tools.multica.workflow plan-parent` before
   each transition and permits at most two complete repair attempts.
6. After merge, record the merged SHA(s), started local services, commands and
   exit codes, and observed result. Local development may automatically start
   the merged applications and run smoke checks. **Production deployment is
   always human-triggered; it is never automatic and is outside this runbook.**

### Evidence template

Use this compact record for every child handoff, review, QA result, merge, and
post-merge smoke result:

| Field | Record |
| --- | --- |
| Parent / child Issue | Identifiers and current parent status |
| Repository / branch / PR | Authoritative repository, base branch, feature branch, PR link |
| SHA | Exact submitted, reviewed, QA-tested, or merged SHA (state which) |
| Scope / contract | Changed paths; frozen API contract and compatibility notes when applicable |
| Checks | Command, exit code, concise result, and repository-check status |
| Independent gates | Independent Reviewer decision and Integration QA decision, each tied to the exact SHA |
| Smoke / concerns | Local command, exit code, observed behavior, limitations, and escalation if needed |

## Pilot 1 — frontend-only

### Parent Issue body

**Title:** Show a development-only local API indicator

**Classification and dispatch:** `frontend-only`. Bind this one parent Issue
to **Eventra Local Development**, assign it to **Eventra Local Delivery**, and
move it from backlog to todo. The Delivery Lead creates one frontend child
Issue assigned to **Eventra Frontend Engineer**. Keep the parent in progress
through the exact-SHA review, QA, automatic merge, and merged local smoke
evidence.

**Change:** Add a small development-only indicator to the Eventra UI showing
that the API target is local. Derive its text from the configured API base URL.
Render it only when the API hostname is `localhost` and `NODE_ENV` is
`development`, and meet existing responsive and accessibility conventions. Do
not modify backend code.

**Repository and PR boundary:** Authoritative frontend repository only;
exactly one frontend PR. The child must not inspect, edit, test, or register
the nested frontend `Backend/` directory.

**Acceptance and required checks:**

- Add a focused test for the visibility logic, including localhost/development
  visibility and a hidden non-local or non-development case.
- Run `npm run test:local-contract`, the focused test, `npm run lint`, and
  `npm run build`; record every command and exit code.
- The Independent Reviewer reviews the submitted exact frontend SHA. Integration
  QA verifies that same SHA with the frontend behavior and local-browser or
  smoke evidence; neither gate may self-approve or use a moving branch.
- Confirm the PR is mergeable, the head remains the reviewed and QA-tested
  exact SHA, and all required repository checks pass. The Delivery Lead records
  these gates and performs the automatic merge only then.
- After merge, record the frontend merged SHA and `npm run smoke:local` exit
  code with the indicator observed only in the required local development
  condition. Keep production deployment human-triggered.

**Handoff route:** Frontend Engineer → Delivery Lead → Independent Reviewer and
Integration QA → Delivery Lead merge decision. Review or QA findings return to
the frontend child; a corrected commit supplies a new exact SHA for both gates.

## Pilot 2 — backend-only

### Parent Issue body

**Title:** Add a public API metadata endpoint

**Classification and dispatch:** `backend-only`. Bind this one parent Issue to
**Eventra Local Development**, assign it to **Eventra Local Delivery**, and
move it from backlog to todo. The Delivery Lead creates one backend child Issue
in **Eventra Backend Local Development**, links it to the parent, and assigns it
to **Eventra Backend Engineer**. Keep the parent in progress until the
exact-SHA gates, automatic merge, and merged local backend smoke evidence are
recorded.

**Change:** Add `GET /api/meta` returning stable JSON fields `service` and
`apiVersion`. Keep it public in Spring Security and document it in OpenAPI. Do
not modify frontend code.

**Frozen contract:** `GET /api/meta` returns HTTP 200 JSON with exactly the
stable public fields `service` and `apiVersion` for this pilot. Any later
additive field is a new approved contract change; the cross-stack post-pilot
variant below is the specifically approved one.

**Repository and PR boundary:** Authoritative backend repository only; exactly
one backend PR. No frontend source, nested frontend `Backend/`, or unrelated
repository change belongs in the child.

**Acceptance and required checks:**

- Controller and security tests cover public HTTP 200 access and the response
  schema containing `service` and `apiVersion`.
- Run the focused controller/security tests as
  `scripts/test-local.sh -Dtest=...`, then the complete suite as
  `scripts/test-local.sh`, and `scripts/smoke-local.sh`; record every command
  and exit code. The smoke result must include an observed successful
  `GET /api/meta` response without secrets.
- The Independent Reviewer reviews the submitted exact backend SHA. Integration
  QA verifies that exact SHA's endpoint, public-access behavior, schema, and
  local backend smoke evidence.
- Confirm the PR is mergeable, its head is the exact SHA reviewed and
  QA-tested, and all required repository checks pass. The Delivery Lead records
  the gates and performs the automatic merge only after they all pass.
- After merge, record the backend merged SHA and a fresh merged local
  `scripts/smoke-local.sh` result plus the safe API observation. Production
  deployment remains a human-triggered action.

**Handoff route:** Backend Engineer → Delivery Lead → Independent Reviewer and
Integration QA → Delivery Lead merge decision. Findings return to the backend
child; a changed SHA repeats review and QA.

## Pilot 3 — cross-stack

### Parent Issue body

**Title:** Display backend API version in the Eventra footer

**Classification and dispatch:** `cross-stack`. Bind this one parent Issue to
**Eventra Local Development**, assign it to **Eventra Local Delivery**, and
move it from backlog to todo. The Delivery Lead creates two linked child
Issues: a backend child assigned to **Eventra Backend Engineer** and a frontend
child assigned to **Eventra Frontend Engineer**. Place the backend child in
**Eventra Backend Local Development**, keep the frontend child with the parent,
and link both children to it. Keep the parent in progress
until the exact-SHA pair passes independent review and QA, both PRs complete
the coordinated automatic merge, and merged local smoke evidence is recorded.

**Change:** Use `GET /api/meta` to display the backend `apiVersion` in the
frontend footer. The UI must show a non-disruptive unavailable state when the
request fails. Freeze the response contract before implementation and create
one PR in each authoritative repository.

**Frozen contract (first cross-stack run):**

```json
{
  "service": "<stable service value>",
  "apiVersion": "<stable API version value>"
}
```

`GET /api/meta` remains public. The backend child supplies this contract and
its exact SHA; the frontend child consumes `apiVersion` and preserves a
non-disruptive unavailable state for request, response, or parse failure. Once
the contract is frozen, the children may work in parallel against it; otherwise
the Delivery Lead sequences them by the real dependency.

**Post-backend-pilot variant (required if Pilot 2 has already merged):** Do not
repeat Pilot 2 unchanged. Change the backend contract additively to:

```json
{
  "service": "<unchanged stable service value>",
  "apiVersion": "<unchanged stable API version value>",
  "buildVersion": "<stable build version value>"
}
```

`service` and `apiVersion` remain backward-compatible and unchanged; add
`buildVersion` without removing or renaming either field. The frontend displays
`buildVersion` in the footer and retains the unavailable state. Freeze this
three-field contract before implementation. This variant still requires the
backend child/PR and frontend child/PR, preserving the cross-stack exercise
after `/api/meta` already exists.

**Repository and PR boundary:** Exactly two linked PRs—one in the authoritative
backend repository and one in the authoritative frontend repository. Each child
records its base SHA, feature SHA, frozen contract, and the linked companion
PR. Neither child modifies the nested frontend `Backend/` directory.

**Acceptance and required checks:**

- Backend: add contract tests for the selected frozen response and public
  endpoint behavior. Run focused tests as `scripts/test-local.sh -Dtest=...`
  and the complete suite as `scripts/test-local.sh`, recording commands and
  exits.
- Frontend: add success and failure tests for footer rendering, including the
  selected `apiVersion` or `buildVersion` display and the non-disruptive
  unavailable state. Run the focused tests, `npm run test:local-contract`,
  `npm run lint`, and `npm run build`, recording commands and exits.
- Submit the immutable exact backend SHA to a Reviewer task in the backend
  Project and the exact frontend SHA to a Reviewer task in the frontend
  Project; Delivery Lead combines both component decisions. Integration QA
  first verifies the backend SHA in the backend Project. Backend Engineer then
  starts that same verified SHA on port 8080 and keeps the backend child active.
  After its exact-SHA readiness handoff, Integration QA verifies the frontend
  SHA in the frontend Project with Playwright/local-browser evidence against
  `localhost:8080`, including the success view and unavailable state. Record
  that both tasks use the configured daemon and have the process owner clean up
  only the known backend service after QA.
- Both PRs must be mergeable; both heads must still equal the SHA pair reviewed
  and QA-tested; every listed test, build, acceptance criterion, and required
  repository check must pass. The Delivery Lead records one coordinated gate
  decision before automatic merge.
- Merge both approved PRs consecutively in API-compatible order (normally
  backend then frontend) only after the two-repository gate passes. If the
  second merge fails, stop, block and escalate the parent with merged SHA,
  unmerged repository, failed gate, interface impact, and recovery options; do
  not deploy, auto-revert, or claim completion.
- After both merges, record both merged SHAs, start the local backend and
  frontend, run `scripts/smoke-local.sh` in the backend and `npm run
  smoke:local` in the frontend, and retain the Playwright/local-browser footer
  evidence against the merged result. Production deployment is human-triggered
  and never part of the automatic merge.

**Handoff route:** Backend Engineer and Frontend Engineer → Delivery Lead →
Independent Reviewer (exact SHA pair) and Integration QA (same exact SHA pair)
→ Delivery Lead coordinated merge decision. Any changed SHA invalidates the
corresponding review or QA result and returns to its owning child.

## Parent closure checklist

Before moving a parent from in progress to done, the Delivery Lead verifies the
evidence template contains all routed child records, the required PR count,
review and QA results for the final exact SHA set, required checks, merge
evidence, and merged local smoke evidence. The closure record must state that
production deployment was not triggered; a human separately decides whether to
deploy.
