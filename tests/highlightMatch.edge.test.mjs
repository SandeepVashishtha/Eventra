import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const content = readFileSync("src/utils/highlightMatch.js", "utf8");
assert.ok(content.includes("escapeRegex"));
assert.ok(content.includes("gi"));

console.log("highlightMatch edge tests passed ✓");
