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
  assert.deepStrictEqual(safeJsonParse('{"value": 1}'), { value: 1 }, "valid JSON parses correctly");

  assert.equal(safeParseJson(null), null, "null returns fallback");
  assert.equal(safeParseJson("invalid-json"), null, "invalid JSON returns fallback");
  assert.deepStrictEqual(safeParseJson('{"value": 2}'), { value: 2 }, "valid JSON parses correctly");

  assert.equal(capturedErrors.length, 0, "parse fallback should not log errors");

  // Custom fallback parameters testing
  const customFallbackObj = { ok: false };
  assert.deepStrictEqual(safeJsonParse("invalid-json", customFallbackObj), customFallbackObj, "custom fallback object should be returned on parsing failure");

  // Non-string arguments parsing
  assert.equal(safeJsonParse(123), null, "number input should return fallback value");
  assert.deepStrictEqual(safeJsonParse({ value: 123 }), null, "object input should return fallback value");

  console.log("safeJsonParse silent fallback tests passed ✓");
} finally {
  console.error = originalConsoleError;
}