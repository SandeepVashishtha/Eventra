#!/usr/bin/env bash
# check-env-secrets.sh
#
# Fails the build if .env.example contains any REACT_APP_* variable whose name
# includes TOKEN, SECRET, or KEY — these would be embedded in the browser
# bundle by Create React App and become publicly readable.
#
# Run automatically as part of `npm run prebuild`. Also useful as a pre-commit
# hook or in CI pipelines.
#
# Exit codes:
#   0  — No dangerous variables found
#   1  — One or more dangerous REACT_APP_ variables detected

set -euo pipefail

ENV_FILE="${1:-.env.example}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "[check-env-secrets] WARNING: $ENV_FILE not found — skipping check." >&2
  exit 0
fi

# Patterns that indicate secrets: REACT_APP_ prefix + TOKEN, SECRET, or KEY suffix
DANGEROUS_PATTERN='^\s*REACT_APP_[A-Z0-9_]*(TOKEN|SECRET|KEY|PASSWORD|CREDENTIAL|PRIVATE)[A-Z0-9_]*\s*='

MATCHES=$(grep -nE "$DANGEROUS_PATTERN" "$ENV_FILE" || true)

if [[ -n "$MATCHES" ]]; then
  echo "" >&2
  echo "╔══════════════════════════════════════════════════════════════════════╗" >&2
  echo "║  SECURITY ERROR: Dangerous REACT_APP_* variable(s) in $ENV_FILE    ║" >&2
  echo "╠══════════════════════════════════════════════════════════════════════╣" >&2
  echo "║                                                                      ║" >&2
  echo "║  The following variables use the REACT_APP_ prefix with a name      ║" >&2
  echo "║  that suggests a secret (TOKEN, SECRET, KEY, PASSWORD, etc.).        ║" >&2
  echo "║                                                                      ║" >&2
  echo "║  Create React App STATICALLY EMBEDS every REACT_APP_* variable      ║" >&2
  echo "║  into the JavaScript bundle at build time. Any real value added      ║" >&2
  echo "║  under these keys will be publicly visible in the deployed site.     ║" >&2
  echo "║                                                                      ║" >&2
  echo "╚══════════════════════════════════════════════════════════════════════╝" >&2
  echo "" >&2
  echo "Dangerous variables found:" >&2
  echo "$MATCHES" >&2
  echo "" >&2
  echo "Fix: Remove the REACT_APP_ prefix and set the variable as a server-side" >&2
  echo "     environment variable only (Vercel: Environment Variables → Server)." >&2
  echo "     The frontend must call your backend proxy instead of using the" >&2
  echo "     secret directly." >&2
  echo "" >&2
  exit 1
fi

echo "[check-env-secrets] OK — no dangerous REACT_APP_* secrets detected in $ENV_FILE"
exit 0
