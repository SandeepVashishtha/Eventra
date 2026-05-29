import assert from "node:assert/strict";
import { safeJsonParse } from "../src/utils/safeJsonParse.js";

assert.deepEqual(safeJsonParse('{"a":1}'), { a: 1 });
assert.equal(safeJsonParse(null), null);
assert.equal(safeJsonParse("invalid json"), null);
assert.equal(safeJsonParse("invalid json", { fallback: true }), { fallback: true });

console.log("safeJsonParse tests passed ✓");
