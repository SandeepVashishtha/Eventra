# Eventra local-delivery project context

## Repository authority and local resources

The only authoritative repositories are:

- Frontend: `/Users/didi/Eventra-workspace/Eventra`
- Backend: `/Users/didi/Eventra-workspace/Eventra-Backend`

This Project is the parent-Issue entry point and owns only the frontend local
resource. Backend child Issues run in **Eventra Backend Local Development**,
which owns the backend resource. The same **Eventra Local Delivery** Squad
coordinates both Projects.

`/Users/didi/Eventra-workspace/Eventra/Backend` is a duplicate nested backend
tree. It is forbidden for every agent: do not inspect, edit, test, commit, or
register it. Multica creates isolated worktrees for the two authoritative
repositories; agents do not create nested worktrees.

The writable `origin` of each authoritative repository is the authenticated
user's personal fork, while `upstream` is the original source repository. Do
not use the `Aprim-OPC` organization for forks, remotes, pull requests, or
resources.

## Standard local commands and ports

The frontend uses port `3000` and the backend uses port `8080`.

From the frontend worktree run `npm run test:local-contract`,
`npm run dev:local`, and `npm run smoke:local`. From the backend worktree run
`scripts/test-local.sh`, `scripts/run-local.sh`, and
`scripts/smoke-local.sh`. Inspect a reported port collision before taking any
action; never terminate an unknown process.

## Environment and secret policy

Committed development defaults are safe and available in every worktree. The
frontend reads `NEXT_PUBLIC_API_BASE_URL` and defaults to the local backend.
The backend receives its stable backend signing secret and any mail credentials
only through agent custom environment for Backend Engineer and Integration QA. Never commit,
print, place in Issue text, add to a command argument, copy into a worktree,
or report a secret. `.env.local` stays ignored for optional user overrides.

## Delivery and evidence contract

Create every parent Issue in this Project. Classify it as frontend-only,
backend-only, or cross-stack. Keep frontend children here and route backend
children to **Eventra Backend Local Development**. A
cross-stack change has one linked pull request per affected repository. Freeze
the API contract before parallel work; otherwise encode the real dependency
and sequence implementation. Each handoff records repository, base branch,
feature branch, exact commit SHA, pull-request link, API-contract change,
commands with exit codes and concise results, plus known limitations.

Independent Reviewer approval and Integration QA verification apply only to
the exact recorded SHA. Any later commit repeats the affected gate. Merge only
when the required tests, builds, review, QA, mergeability, and repository
checks pass. Local development may start merged applications and run smoke
checks; production deployment has no automation and always requires a human.

For a cross-repository merge, choose the order from API compatibility and
merge consecutively only after both pull requests pass their gates. If the
second merge fails after the first succeeds, stop immediately: do not deploy,
auto-revert, or continue. Mark the parent Issue blocked and escalate the
partial merge with the exact merge evidence.

For cross-stack QA, this Project supplies only the frontend exact-SHA worktree.
The verified backend exact SHA must already be running on port 8080 from an
active backend child in **Eventra Backend Local Development** on the same
daemon. Integration QA records the backend service SHA and readiness handoff
before testing the frontend. Lack of a verifiable matching service blocks the
gate.

## Automated workflow state

Use workflow contract version `1`, ordered native Stages, and string metadata.
Execution roles finish through `tools.multica.workflow finish-phase`; Delivery
Lead plans through read-only `tools.multica.workflow plan-parent`. The primary
wakeup is the native Stage barrier. **Eventra · Stalled Work Watcher** runs
every 30 minutes only as an idempotent recovery fallback and performs at most
one existing-Issue rerun.

Implementation PRs use `Closes PRO-N` for their implementation child and
`Related to PRO-M` for the parent. A phase Issue `done` is interpreted only
with `eventra.phase.result`; later commits invalidate old review and QA.
