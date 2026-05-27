import assert from "node:assert/strict";
import { safeParseJson } from "../src/utils/jsonUtils.js";

assert.equal(safeParseJson(null), null, "null returns fallback");
assert.equal(safeParseJson(undefined), null, "undefined returns fallback");
assert.equal(safeParseJson(""), null, "empty string returns fallback");
assert.equal(safeParseJson("not json"), null, "invalid JSON returns fallback");
assert.deepEqual(safeParseJson('{"key":"value"}'), { key: "value" }, "valid JSON parses correctly");
assert.deepEqual(safeParseJson('[1,2,3]'), [1, 2, 3], "valid JSON array parses correctly");
assert.equal(safeParseJson('{"key":"value"}', { default: true }).key, "value", "fallback works on success");
assert.equal(safeParseJson("invalid", { fallback: true }).fallback, true, "fallback used on parse error");

console.log("jsonUtils safeParseJson tests passed ✓");