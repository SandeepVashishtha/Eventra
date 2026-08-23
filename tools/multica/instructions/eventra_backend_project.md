# Eventra backend child-delivery project context

This Project is the execution home for backend child Issues only. The Delivery
Lead creates or routes backend-only children and the backend half of cross-stack
work here from a parent Issue in **Eventra Local Development**. Do not create a
second parent Issue here.

The only authoritative resource in this Project is
`/Users/didi/Eventra-workspace/Eventra-Backend`, attached as a Multica worktree.
Never use `/Users/didi/Eventra-workspace/Eventra/Backend`.

Every backend child links its parent Issue, records the frozen API contract when
applicable, and returns its branch, pull request, exact SHA, changed paths, test
commands with exit codes, and known concerns to the Delivery Lead. Independent
Reviewer and Integration QA decisions apply only to that exact SHA.

For cross-stack QA, Integration QA first verifies the backend exact SHA here.
Backend Engineer then starts that same SHA on port 8080 and keeps the child
active while Integration QA runs the frontend verification task in **Eventra
Local Development** over the shared daemon network. Hand off the exact SHA,
daemon identity, start command and exit status, and a safe readiness result.
Only the process owner stops this known service after QA; inability to maintain
or prove the service blocks automatic merge.

Use `scripts/test-local.sh`, `scripts/run-local.sh`, and
`scripts/smoke-local.sh`. Secrets come only from agent custom environment and
must never appear in Issues, logs, commands, files, or commits. Automatic merge
is allowed only after all quality gates pass. Local merged smoke checks may run
automatically; production deployment is always human-triggered.
