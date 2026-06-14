# Pre-commit Hooks: Husky + lint-staged

This project uses `husky` and `lint-staged` to automatically lint and format code before every commit.

## How it works

When you run `git commit`, Husky triggers the `pre-commit` hook which runs `lint-staged`. Only **staged files** are checked, keeping the process fast.

* **Pre-commit Hooks:** Automatically runs `npm run lint` and `prettier` on changed files before allowing a commit to be finalized.

### What runs on commit

| File type | Actions |
|-----------|---------|
| `*.js, *.jsx, *.ts, *.tsx` | ESLint --fix, Prettier --write |
| `*.css, *.json, *.md` | Prettier --write |

If ESLint finds errors that cannot be auto-fixed, the commit is **blocked** until they are resolved.

## Setup (automatic)

After cloning and running `npm install`, Husky is automatically configured via the `prepare` script.

```bash
npm install   # husky is set up automatically
Manual trigger
You can manually run the checks at any time:

Bash
# Lint all files
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Format all files
npm run format
Bypass (not recommended)
In rare cases where you need to skip the hook:

Bash
git commit --no-verify -m "your message"
⚠️ Use --no-verify only when absolutely necessary. It bypasses all pre-commit checks.