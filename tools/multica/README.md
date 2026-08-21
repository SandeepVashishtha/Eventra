# Eventra Multica adapter

This adapter composes the reusable five-role delivery blueprint with Eventra's
two authoritative local repositories. It is local-development automation only;
production deployment is not implemented and remains a human action.

## Inputs and safe execution

The provisioner requires a Multica `runtime_id` and `daemon_id`:

```bash
python3 -m tools.multica.provision --runtime-id RUNTIME_ID --daemon-id DAEMON_ID
```

That command is a dry run by default. Review its planned reconciliation before
using `--apply` to create or update Multica state:

```bash
python3 -m tools.multica.provision --runtime-id RUNTIME_ID --daemon-id DAEMON_ID --apply
```

Use `--prompt-backend-env` only when Backend Engineer and Integration QA need
the local backend environment. It prompts for the secret without echoing it
and passes it only through those agents' custom environment. Do not put a
secret in shell history, Issue text, logs, pull-request descriptions, or a
tracked environment file.

## Inspection and reconciliation

Use the Multica CLI JSON views to inspect the resulting state, substituting
the identifiers printed by the provisioner. Multica 0.4.31 uses `--output
json`, positional object IDs, singular `squad member` and `project resource`
commands, and workspace-scoped list commands without runtime or daemon
filters:

```bash
multica runtime list --output json
multica daemon status --output json
multica agent list --output json
multica agent get AGENT_ID --output json
multica agent skills list AGENT_ID --output json
multica squad get SQUAD_ID --output json
multica squad member list SQUAD_ID --output json
multica project get PROJECT_ID --output json
multica project resource list PROJECT_ID --output json
multica skill list --output json
multica skill get SKILL_ID --output json
```

Compare every listed skill origin with the public GitHub URL map in
`eventra_adapter.py`. A pre-existing skill with the same name but a different
origin is a hard stop: resolve it explicitly before applying again. The
provisioner makes additive bindings with `agent skills add`; it never invokes
`agent skills set`, so it does not replace existing bindings.

The Project must contain exactly two `local_directory` resources in `worktree`
mode: the Eventra frontend and the sibling Eventra backend. The nested frontend
`Backend` directory is forbidden. Re-running a dry run or an already-applied
matching configuration is reconciliation, not permission to create duplicate
agents, skills, Squad members, Projects, or resources.

## Delivery operation

Use the project context and each repository's `AGENTS.md` as the operating
contract. Frontend work uses `npm run test:local-contract`, `npm run
dev:local`, and `npm run smoke:local`; backend work uses `./mvnw -s
.mvn/settings-public.xml test`, `scripts/run-local.sh`, and
`scripts/smoke-local.sh`. Cross-stack work freezes the API contract first,
keeps one pull request per repository, and records exact reviewed and tested
commit SHAs. A partial two-repository merge stops immediately and requires
human escalation; it does not trigger rollback or deployment.

## Pilot dispatch and evidence runbook

Use [the pilot Issue bodies](../../docs/multica/pilot-issues.md) to exercise
the `frontend-only`, `backend-only`, and `cross-stack` routing modes. For each
pilot, create one parent Issue, bind it to `Eventra Local Development`, assign
it to `Eventra Local Delivery`, and move it from backlog to todo. The Delivery
Lead creates the routed child Issue or Issues, keeps the parent in progress,
and records all evidence before closure.

Each implementer hands the Delivery Lead its repository, branch, PR, changed
paths, commands and exit codes, concerns, and an exact SHA. The Delivery Lead
sends that immutable SHA (or the cross-stack SHA pair) to Independent Reviewer
and Integration QA. Their decisions apply only to those exact SHAs; any new
commit repeats the affected gate. The full per-pilot test matrix, frozen API
contracts, cross-stack `buildVersion` variant, and copy-ready Issue text are in
the linked runbook.

Automatic merge is permitted only when the final exact SHA set has passed the
required tests, builds, repository checks, independent review, Integration QA,
and mergeability checks. Cross-stack PRs wait for one coordinated gate decision
and merge in API-compatible order; a partial merge stops and escalates. After
merge, record merged local smoke evidence. Local services may be started for
that smoke test, but production deployment remains human-triggered and is never
automatic.
