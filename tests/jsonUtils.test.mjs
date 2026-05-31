import assert from "node:assert/strict";
import { safeParseJson } from "../src/utils/jsonUtils.js";

assert.strictEqual(safeParseJson(null), null);
assert.strictEqual(safeParseJson(undefined), null);
assert.strictEqual(safeParseJson(null, "fallback"), "fallback");
assert.strictEqual(safeParseJson(undefined, "fallback"), "fallback");
assert.strictEqual(safeParseJson("", null), null);
assert.strictEqual(safeParseJson("  ", null), null);
assert.strictEqual(safeParseJson("not json", null), null);
assert.strictEqual(safeParseJson('{"a":1}', null).a, 1);
assert.deepStrictEqual(safeParseJson('[1,2,3]', null), [1, 2, 3]);
assert.strictEqual(safeParseJson("42", null), 42);
assert.strictEqual(safeParseJson("true", null), true);
assert.strictEqual(safeParseJson("false", null), false);
assert.strictEqual(safeParseJson('"hello"', null), "hello");
assert.strictEqual(safeParseJson(123, null), 123, "number is not a string so JSON.parse(123) is called");
assert.strictEqual(safeParseJson(123, "fallback"), 123, "number is not a string so JSON.parse(123) is called");
assert.deepStrictEqual(safeParseJson({ a: 1 }, null), null, "object is not a string so returns fallback");
assert.deepStrictEqual(safeParseJson({ a: 1 }, { b: 2 }), { b: 2 }, "object is not a string so returns fallback");
assert.deepStrictEqual(safeParseJson('{"nested":{"key":"value"}}', null), { nested: { key: "value" } });
assert.deepStrictEqual(safeParseJson('  {"trimmed":true}  ', null), { trimmed: true });
assert.strictEqual(safeParseJson("null", null), null);
assert.strictEqual(safeParseJson("undefined", null), null);

console.log("All jsonUtils tests passed");