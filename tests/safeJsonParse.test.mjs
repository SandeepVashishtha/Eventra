import assert from "node:assert/strict";
import { safeJsonParse } from "../src/utils/safeJsonParse.js";
import { safeParseJson } from "../src/utils/jsonUtils.js";

const originalConsoleError = console.error;
const capturedErrors = [];

console.error = (...args) => {
  capturedErrors.push(args);
};

try {
  assert.equal(safeJsonParse(null), null, "null returns fallback");
  assert.equal(safeJsonParse(""), null, "empty string returns fallback");
  assert.equal(safeJsonParse("invalid-json"), null, "invalid JSON returns fallback");
  assert.deepEqual(safeJsonParse('{"value": 1}'), { value: 1 }, "valid JSON parses correctly");
  assert.deepEqual(
    safeJsonParse("invalid-json", { fallback: true }),
    { fallback: true },
    "invalid JSON returns fallback object by structure"
  );

  assert.equal(safeParseJson(null), null, "null returns fallback");
  assert.equal(safeParseJson("invalid-json"), null, "invalid JSON returns fallback");
  assert.deepEqual(safeParseJson('{"value": 2}'), { value: 2 }, "valid JSON parses correctly");

  assert.equal(capturedErrors.length, 0, "parse fallback should not log errors");

  console.log("safeJsonParse silent fallback tests passed ✓");
} finally {
  console.error = originalConsoleError;
}