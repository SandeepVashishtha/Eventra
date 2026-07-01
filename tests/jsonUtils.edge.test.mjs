import assert from "node:assert/strict";

const { safeParseJson } = await import("../src/utils/jsonUtils.js");

assert.equal(safeParseJson(0), null, "non-string input returns fallback");
assert.equal(safeParseJson(false), null, "boolean input returns fallback");
assert.deepEqual(safeParseJson('"hello"'), "hello", "parses JSON string literals");
assert.deepEqual(safeParseJson("42"), 42, "parses JSON numbers");
assert.deepEqual(safeParseJson("true"), true, "parses JSON booleans");
assert.deepEqual(
  safeParseJson('{"nested":{"ok":true}}'),
  { nested: { ok: true } },
  "parses nested objects"
);
assert.equal(
  safeParseJson("{bad json", { recovered: true }).recovered,
  true,
  "returns custom fallback on parse error"
);

console.log("jsonUtils edge-case tests passed ✓");
