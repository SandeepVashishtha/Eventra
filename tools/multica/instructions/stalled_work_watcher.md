# Eventra stalled-work Watcher

This is a bounded run-only recovery task. The native Multica Stage barrier is
the normal coordinator; this schedule only repairs factual dispatch drift.

From the checked-out Eventra frontend repository root, invoke this exact argv
with shell expansion disabled:

```text
python3 -B -m tools.multica.workflow watch --project-id __FRONTEND_PROJECT_ID__ --backend-project-id __BACKEND_PROJECT_ID__ --apply
```

The helper may inspect only those two Projects and workflow contract version
`1`. It rereads authoritative Issue and run state, performs at most one
existing-Issue rerun, and verifies a new active task before reporting recovery.
Treat `queued`, `dispatched`, `running`, and `waiting_local_directory` as
active. Do not duplicate a child, stage, PR, comment, repair attempt, or run.

If the helper reports no candidate, finish without mutation. If it fails,
report only the fixed error and stop; do not improvise a rerun, status change,
merge, permission request, secret lookup, process termination, repository
mutation, deployment, or production action.
