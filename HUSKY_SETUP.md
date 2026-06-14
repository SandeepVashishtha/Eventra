# Pre-commit Hooks: Husky + lint-staged

This project uses [Husky](https://typicode.github.io/husky) and [lint-staged](https://github.com/lint-staged/lint-staged) to ensure high code quality by automatically checking files before they are officially committed to the repository.

## How it works

When you run `git commit`, Husky triggers the `pre-commit` hook. This script intercepts the process and automatically runs code formatting (Prettier) and linting checks on your staged files before allowing the commit to be finalized. 

Only **staged files** (the ones you added via `git add`) are checked, keeping the process fast.

> **Pre-commit Hooks:** Automatically runs `npm run lint` and `prettier` on changed files before allowing a commit.

---

### What runs on commit

| File type | Actions |
|-----------|---------|
| `*.js, *.jsx, *.ts, *.tsx` | ESLint --fix, Prettier --write |
| `*.css, *.json, *.md` | Prettier --write |

If ESLint or compilation checks find errors that cannot be auto-fixed, the commit is **blocked** until you resolve them. Keeping this automated prevents broken code from ever reaching the remote repository.

---

## Setup (Automatic)

After cloning the repository and running `npm install`, Husky is automatically configured via the project's `prepare` script.

```bash
npm install   # Husky setup runs automatically during installation
```

## Manual Trigger
You can manually run the formatting and linting scripts at any time to verify your changes before committing:

# Lint all files
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Format all files using Prettier
npm run format

## Bypass (Not Recommended)
In rare cases where you absolutely must skip the automated verification checks:

git commit --no-verify -m "your message"
>⚠️ Warning: Use --no-verify only when strictly necessary. It bypasses all pre-commit formatting, compilation, and linting checks, which can lead to CI/CD build failures down the line.