#!/bin/bash
set -e
REPO_DIR="/Users/saurabhkumarbajpaiai/Documents/Codex/OpenCode/repos/Eventra"
cd "$REPO_DIR"

make_pr() {
  local branch="$1"
  local file="$2"
  local commit_msg="$3"
  
  if git ls-remote --exit-code fork "refs/heads/$branch" 2>/dev/null; then
    echo "SKIP: $branch already exists"
    return 0
  fi
  
  git checkout master --quiet 2>/dev/null
  git branch -D "$branch" 2>/dev/null || true
  git checkout -b "$branch" --quiet 2>/dev/null
  
  if ! git diff --quiet; then
    git add -A
    git commit -m "$commit_msg" --quiet 2>/dev/null
    git push --force fork "$branch" 2>&1 | grep -v "^remote:\|^To\|^\*"
    gh pr create --repo SandeepVashishtha/Eventra --head "saurabhhhcodes:$branch" --fill 2>&1 | grep "^https"
  else
    echo "NO CHANGE for $branch"
  fi
  
  git checkout master --quiet 2>/dev/null
}
