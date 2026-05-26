# AI PR Classification Workflow

## Overview

The `AI PR Classification` workflow analyzes pull requests and applies supported `level:*` and `type:*` labels automatically.

It reviews:

- PR title
- PR description
- Changed file names
- Diff summary, including additions, deletions, status, and truncated patches

## Supported Labels

### Difficulty

- `level:beginner`
- `level:intermediate`
- `level:advanced`
- `level:critical`

### Type

- `type:security`
- `type:performance`
- `type:refactor`
- `type:feature`
- `type:bug`

Only labels that already exist in the repository are applied. If a supported label is missing from the repository, the workflow skips that label instead of failing the PR.

## Configuration

The workflow supports OpenAI and Grok-compatible classification APIs.

### OpenAI

Set this repository secret:

```text
OPENAI_API_KEY
```

Optional repository variables:

```text
AI_LABEL_PROVIDER=openai
AI_LABEL_MODEL=gpt-4o-mini
```

### Grok / xAI

Set this repository secret:

```text
XAI_API_KEY
```

Optional repository variables:

```text
AI_LABEL_PROVIDER=grok
AI_LABEL_MODEL=<your-grok-model>
```

## Fallback Behavior

If the API key is not configured, the API request fails, or the AI returns invalid labels, the workflow uses deterministic fallback rules.

The fallback classifier considers:

- Security keywords such as `auth`, `token`, `secret`, `permission`, `xss`, and `csrf`
- Performance keywords such as `cache`, `lazy`, `debounce`, `pagination`, and `bundle`
- Bug keywords such as `fix`, `bug`, `error`, `crash`, and `regression`
- Refactor keywords such as `refactor`, `cleanup`, `restructure`, and `migrate`
- Change size from total files, additions, and deletions

This keeps labeling reliable even when AI services are temporarily unavailable.

## Security Notes

- The workflow runs on `pull_request_target` so repository secrets can be used.
- It does not check out or execute pull request code.
- It reads PR metadata and diffs through the GitHub API only.
- The workflow has the minimum permissions needed to read PR data and write labels.

## Monitoring

Open the repository's **Actions** tab and select `AI PR Classification` to inspect:

- The generated classification reason
- The candidate labels
- Fallback usage
- Missing repository labels
