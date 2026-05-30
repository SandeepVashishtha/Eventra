import assert from "node:assert/strict";
import { safeParseJson } from "../src/utils/jsonUtils.js";

const obj = { key: "value", num: 42, nested: { arr: [1, 2, 3] } };
const jsonStr = JSON.stringify(obj);

assert.deepEqual(safeParseJson(jsonStr), obj, "valid JSON should parse correctly");
assert.deepEqual(safeParseJson('{"name":"Ada"}'), { name: "Ada" }, "simple object JSON should parse");
assert.deepEqual(safeParseJson('["a","b","c"]'), ["a", "b", "c"], "array JSON should parse");

assert.equal(safeParseJson("invalid json"), null, "invalid JSON should return null");
assert.equal(safeParseJson("{key:value}"), null, "missing quotes should return null");
assert.equal(safeParseJson("not json at all"), null, "plain text should return null");
assert.equal(safeParseJson("{ truncated"), null, "truncated JSON should return null");

assert.equal(safeParseJson(null), null, "null input should return null");
assert.equal(safeParseJson(undefined), null, "undefined input should return null");

assert.equal(safeParseJson(""), null, "empty string should return null");

assert.deepEqual(safeParseJson('{"fallback":true}', { default: "value" }), { fallback: true }, "valid JSON should ignore fallback and return parsed value");
assert.equal(safeParseJson("bad", "fallbackValue"), "fallbackValue", "invalid JSON should return fallback");
assert.equal(safeParseJson(null, "fallbackValue"), "fallbackValue", "null input should return fallback");
assert.equal(safeParseJson(undefined, 42), 42, "undefined input should return fallback");

assert.deepEqual(safeParseJson('  {"trimmed":true}  ', {}), { trimmed: true }, "whitespace-padded JSON should parse");

console.log("All jsonUtils tests passed!");