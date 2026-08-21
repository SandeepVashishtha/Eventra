#!/usr/bin/env bash
set -euo pipefail

curl --fail --silent --show-error http://localhost:8080/actuator/health >/dev/null
curl --fail --silent --show-error http://localhost:3000 >/dev/null
echo "frontend and backend smoke checks passed"
