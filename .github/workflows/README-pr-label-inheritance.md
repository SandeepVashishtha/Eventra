# PR Label Inheritance - Implementation Guide

## Overview

This workflow automatically inherits labels from linked issues and adds special labels based on PR timing.

## Features

### 1. **Label Inheritance from Linked Issues**
When you create or update a PR that references an issue, all labels from that issue are automatically copied to the PR.

**Supported keywords:**
- `Fixes #123`
- `Closes #456`
- `Resolves #789`
- `Fixed #100`
- `Closed #200`
- `Resolved #300`

Multiple issues can be referenced in the same PR, and labels from all of them will be inherited.

### 2. **Hacktoberfest Label**
PRs created during October (any year) automatically receive the `hacktoberfest-accepted` label, making them eligible for Hacktoberfest contributions.

## How It Works

### Triggering Events
The workflow runs automatically when:
- A pull request is **opened**
- A pull request is **edited** (body updated)
- A pull request is **reopened**

### Process Flow

1. **Extract Issue References**
   - Scans the PR body for keywords like "Fixes #123"
   - Extracts all referenced issue numbers

2. **Fetch Issue Labels**
   - Retrieves labels from each referenced issue
   - Handles cases where issues don't exist or can't be accessed

3. **Check PR Creation Date**
   - If the PR was created in October, adds `hacktoberfest-accepted` label

4. **Apply Labels**
   - Combines all labels from issues and special labels
   - Removes duplicates (doesn't add labels that already exist on the PR)
   - Applies the final set of labels to the PR

## Examples

### Example 1: Single Issue Reference
**PR Body:**
```markdown
This PR fixes #42 by improving the sorting algorithm performance.
```

**Result:**
- All labels from issue #42 are copied to the PR
- If created in October: `hacktoberfest-accepted` label is added

### Example 2: Multiple Issue References
**PR Body:**
```markdown
This PR resolves #10, fixes #20, and closes #30.
```

**Result:**
- Labels from issues #10, #20, and #30 are all copied to the PR
- Duplicate labels are automatically removed

### Example 3: October PR Without Issue Reference
**PR Body:**
```markdown
Adding new visualization for Dijkstra's algorithm.
```

**Result (if created in October):**
- `hacktoberfest-accepted` label is added

## Benefits

- **Automatic Organization**: PRs inherit the same categorization as their issues
- **Contributor Recognition**: Hacktoberfest participants get automatic labeling
- **Reduced Manual Work**: No need to manually copy labels from issues to PRs
- **Consistency**: Ensures PRs and their related issues have matching labels

## Monitoring

Check the **Actions** tab in GitHub to:
- View workflow runs
- See which labels were added to each PR
- Debug any issues with label inheritance

## Permissions

The workflow requires:
- **Read access** to issues (to fetch labels)
- **Write access** to pull requests (to add labels)

These are automatically provided via `GITHUB_TOKEN`.
