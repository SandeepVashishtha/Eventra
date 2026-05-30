# Issue and Pull Request Guide

This guide describes the minimum structure we expect for issues and pull requests in Eventra. The goal is to keep changes easy to review, easy to reproduce, and easy to merge.

## Titles

Use a concise semantic prefix for both issues and PRs:

- `fix: <short description>` for bugs
- `feat: <short description>` for new functionality
- `docs: <short description>` for documentation updates
- `refactor: <short description>` for code organization changes
- `test: <short description>` for test-only updates

Keep the title specific to one problem. Avoid titles like "update code" or "fix issue".

## Issue Template

Use the repository issue forms when possible. If you need to draft an issue manually, keep the body in this format:

```md
# Problem
Describe the issue clearly.

# Current Behavior
Explain what is happening now.

# Why This Improvement Is Needed
Describe the user, maintainer, or contributor impact.

# Proposed Solution
Outline the implementation approach.

# Expected Outcome
Explain what should improve after the change.

# Additional Notes
Add constraints, screenshots, or implementation details if needed.
```

## Pull Request Template

Use the pull request template and include enough context for a reviewer to validate the change without extra back-and-forth:

```md
# Related Issue
Closes #ISSUE_NUMBER

# Summary
Short explanation of the contribution.

# Changes Made
- change 1
- change 2
- change 3

# Testing
Describe the local checks you ran and what they covered.

# Screenshots
Add screenshots if the UI changed.

# Impact
Explain why the change matters.

# Checklist
- [x] Code follows project standards
- [x] Tested locally
- [x] No unrelated changes included
```

## Validation Expectations

Before opening a PR:

1. Run the narrowest relevant validation first, such as a targeted test, `npm run build`, or a file-level syntax check.
2. Confirm the branch is based on the latest `master` branch.
3. Keep each PR focused on one issue only.
4. Mention any known follow-up work explicitly instead of burying it in the code review.

## Good Examples

- `fix: restore mobile navbar drawer wiring`
- `docs: update readme for vite workflow`
- `test: stabilize CSP reporting navigator mock`

## Bad Examples

- `fixed issue`
- `updates`
- `misc changes`
- `final commit`