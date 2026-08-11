import fs from "node:fs";
import assert from "node:assert/strict";

const rawApiPattern = /apiUtils\.(?:get|post|put|patch|delete)\(\s*`?['"]\/api\//;
const files = [
  "src/api/eventCancellationAPI.js",
  "src/hooks/usePublicEvents.js",
];

for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  assert.equal(
    rawApiPattern.test(source),
    false,
    `${file} must not pass /api-prefixed paths to apiUtils`,
  );
}

console.log("apiUtils path contract checks passed");
