import assert from "node:assert/strict";
import { safeJsonParse } from "../src/utils/safeJsonParse.js";

const validator = (data) => typeof data.age === "number";
assert.deepStrictEqual(safeJsonParse('{"age": 25}', {}, validator), { age: 25 });
assert.deepStrictEqual(safeJsonParse('{"name": "John"}', { age: 0 }, validator), { age: 0 }, "Should return fallback when validator fails");
console.log("safeJsonParse validator tests passed ✓");
