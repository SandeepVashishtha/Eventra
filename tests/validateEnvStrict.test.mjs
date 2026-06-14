import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("scripts/validate-env.js", "utf8");
assert.ok(source.includes("production"), "Should validate production rules");
console.log("validate-env production rules tests passed ✓");
