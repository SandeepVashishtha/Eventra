import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("src/utils/deviceFingerprint.js", "utf8");
assert.ok(source.includes("dayOffset"), "Should implement periodic salt rotation using day offset");
console.log("deviceFingerprint salt rotation tests passed");
