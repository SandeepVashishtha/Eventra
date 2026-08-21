#!/usr/bin/env bash
set -euo pipefail

if lsof -nP -iTCP:3000 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "port 3000 is already in use; inspect it with: lsof -nP -iTCP:3000 -sTCP:LISTEN" >&2
  exit 2
fi

exec npm run dev -- --hostname localhost --port 3000
