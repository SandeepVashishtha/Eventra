import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("src/utils/indexedDB.js", "utf8");
assert.ok(source.includes("navigator.storage"), "Should include storage quota query");
console.log("indexedDB quota checking tests passed");
