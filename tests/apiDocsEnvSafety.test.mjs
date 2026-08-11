import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../src/Pages/ApiDocs.js", import.meta.url),
  "utf8"
);

assert.match(
  source,
  /import\s+\{\s*ENV\s*\}\s+from\s+"\.{2}\/config\/env"/,
  "ApiDocs must import the centralized env helper"
);

assert.match(
  source,
  /const API_URL = ENV\.API_URL \|\| "";/,
  "ApiDocs must derive a browser-safe API_URL constant"
);

assert.doesNotMatch(
  source,
  /process\.env\.REACT_APP_API_URL/,
  "ApiDocs must not reference REACT_APP_API_URL directly in browser code"
);

console.log("ApiDocs env safety tests passed");
