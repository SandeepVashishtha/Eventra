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
the identifiers printed by the provisioner:

```bash
multica agent list --runtime-id RUNTIME_ID --daemon-id DAEMON_ID --json
multica agent skills list --agent-id AGENT_ID --json
multica squad members list --squad-id SQUAD_ID --json
multica project resources list --project-id PROJECT_ID --json
multica skill list --runtime-id RUNTIME_ID --daemon-id DAEMON_ID --json
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
