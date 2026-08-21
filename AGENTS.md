# Eventra frontend agent instructions

## Repository boundary

This repository owns only the Eventra frontend. Do not edit the nested
`Backend/` directory: it is a non-authoritative copy. The authoritative backend
is the sibling `Eventra-Backend` repository and must be changed only in that
repository's assigned worktree.

## Local development

Use npm and these standard commands:

- `npm run dev:local` starts the frontend on `localhost:3000`.
- `npm run test:local-contract` checks the committed local configuration.
- `npm run smoke:local` checks frontend and backend readiness.

The committed development API default is `http://localhost:8080` through
`NEXT_PUBLIC_API_BASE_URL`.

## Secret safety

`.env.local` is optional for personal overrides. Never commit or print it, or
any other secret, token, credential, or private environment value.

## Delivery gates

Use test-driven development for behavior changes: add a focused failing test,
record the RED result, then implement the smallest passing change. Evidence
must include commands, exit codes, branch, and exact commit SHA. Agents may
create pull requests, but merge only after both reviewer and integration-QA
gates pass.
