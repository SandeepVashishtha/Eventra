# Contributing to Eventra

Thank you for contributing to Eventra.

This guide explains how to set up your environment, propose changes, and open high-quality pull requests.

## Code of Conduct

Please read and follow [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

We expect all collaboration to be respectful, inclusive, and constructive.

## Before You Start

Read these docs first:

- [Architecture and Roles](docs/ARCHITECTURE_AND_ROLES.md)
- [Environment Setup Guide](docs/ENV_SETUP_GUIDE.md)
- [Frontend Onboarding](docs/frontend-onboarding.md)

These cover project structure, permissions, and local setup patterns used in this repository.

## Prerequisites

- Node.js `>=22.x`
- npm `>=9.6.4`
- Git

## Local Setup

1. Fork the repository on GitHub.
2. Clone your fork and install dependencies:

```bash
git clone https://github.com/<your-username>/Eventra.git
cd Eventra
npm install
```

3. Copy environment variables:

```bash
cp .env.example .env
```

4. Start development server:

```bash
npm run dev
```

The app runs on `http://localhost:3000`.

## Development Workflow

1. Sync your fork with upstream.
2. Create a focused branch:

```bash
git checkout -b feature/short-description
```

**Branch Naming Conventions:**
- Use lowercase only and separate words with hyphens (`-`).
- Prefix branch names based on the type of work:
  - `feat/` for new features (e.g., `feat/event-card-skeleton`)
  - `fix/` for bug fixes (e.g., `fix/navbar-desktop-overlap`)
  - `docs/` for documentation updates (e.g., `docs/fix-contributing-format`)
  - `enhancement/` for visual/behavior improvements (e.g., `enhancement/dashboard-empty-state`)

3. Make your changes in small, reviewable commits.
4. Run quality checks locally:

```bash
npm run lint
npm test
```

5. Run E2E tests when your change affects key flows:

```bash
npm run test:e2e
```

6. Push your branch and open a pull request.

## Coding Standards

- Prefer functional React components and hooks.
- Keep components modular and reusable.
- Reuse existing utilities/hooks before creating new ones.
- Keep naming explicit and consistent with nearby code.
- Update docs when behavior or setup changes.
- Use ESLint and Prettier conventions used in the repo.

## Testing Expectations

- Add or update tests for meaningful behavior changes.
- Cover edge cases for bug fixes.
- Keep test names clear and behavior-focused.
- Do not merge changes that break lint or tests.

## Commit Message Guidelines

Use Conventional Commit style where possible:

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation-only changes
- `refactor:` internal cleanup without behavior changes
- `test:` test additions/updates
- `chore:` tooling or maintenance

Examples:

- `feat: add event search badge filter`
- `fix: prevent stale state update in event details`
- `docs: update env setup notes for SSE`

## Pull Request Guidelines

Include these in your PR:

- What changed
- Why it changed
- Related issue (for example: `Closes #123`)
- Test evidence (commands run, screenshots if UI changes)

Before requesting review:

- Rebase or merge latest default branch changes (currently `master`)
- Resolve merge conflicts
- Ensure lint/tests pass locally
- Keep PR scope focused

## Issue Assignment Policy

This repository runs an automation workflow that unassigns stale issues.

- Threshold is 7 days by default.
- If you are assigned an issue, open a draft PR within that window to keep assignment active.
- If you need more time, comment on the issue and request reassignment.

Reference workflow:
- [.github/workflows/auto-unassign-stale-issues.yml](.github/workflows/auto-unassign-stale-issues.yml)

## Automated PR Labels

PR labels are applied automatically by workflows:

- Type labels: `.github/workflows/type-labeler.yml` (`type:*`)
- Quality labels: `.github/workflows/quality-labeler.yml` (`quality:*`)
- Difficulty labels: `.github/workflows/difficulty.yml` (`level:*`)

You do not need to set these manually.

## Getting Help

- Open an issue for bugs or feature requests.
- Use GitHub Discussions (if enabled) for questions and ideas.
- For project-specific clarifications, tag maintainers in the PR or issue thread.

## Security

Do not commit secrets, tokens, or private keys.

If you discover a security issue, follow [SECURITY.md](SECURITY.md).
