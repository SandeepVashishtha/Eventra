#!/usr/bin/env bash
set -euo pipefail

grep -Fxq 'NEXT_PUBLIC_API_BASE_URL=http://localhost:8080' .env.development
grep -Fxq 'NEXT_PUBLIC_API_BASE_URL=http://localhost:8080' .env.example
grep -Fq 'process.env.NEXT_PUBLIC_API_BASE_URL' src/lib/api.js
grep -Fq 'http://localhost:8080' src/lib/api.js
grep -Fq '!.env.development' .gitignore
grep -Fq '!.env.example' .gitignore

node -e 'const scripts = require("./package.json").scripts; if (scripts.build !== "next build --webpack") process.exit(1)'
node --test scripts/test-single-flight.mjs
