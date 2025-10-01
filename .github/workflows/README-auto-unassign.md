# Auto Unassign Stale Issues Workflow

This workflow automatically unassigns contributors from issues if they haven't opened a pull request within 7 days of being assigned.

## How it works

1. **Runs daily** at 12:00 UTC (can also be triggered manually)
2. **Checks all open issues** with assignees
3. **Looks for assignment events** to determine when someone was assigned
4. **Searches for related PRs** that might address the issue
5. **Unassigns contributors** who haven't made progress after 7 days
6. **Adds a friendly comment** explaining the unassignment

## Search Strategy

The workflow searches for related PRs using multiple approaches:
- Direct issue number references (`#123`, `closes #123`, `fixes #123`, `resolves #123`)
- Issue title matches in PR titles
- Body content matches

## Features

- ✅ Respects existing work (won't unassign if PR exists)
- ✅ Provides clear communication via comments
- ✅ Allows manual workflow execution
- ✅ Logs all actions for transparency
- ✅ Handles edge cases (no assignment events, etc.)

## Configuration

- **Days before unassignment**: 7 days (configurable in the script)
- **Schedule**: Daily at 12:00 UTC
- **Permissions**: Issues (write), Pull requests (read)

This helps maintain project velocity while being fair to contributors.