import assert from "node:assert/strict";

const { validators } = await import("../src/utils/storage/storageValidators.js");

assert.equal(validators.isObject({}), true, "plain object passes isObject");
assert.equal(validators.isObject([]), false, "array fails isObject");
assert.equal(validators.isObject(null), false, "null fails isObject");

assert.equal(validators.isArray([1, 2]), true, "array passes isArray");
assert.equal(validators.isArray({}), false, "object fails isArray");

assert.equal(validators.isString("eventra"), true, "string passes isString");
assert.equal(validators.isString(42), false, "number fails isString");

assert.equal(validators.isNumber(42), true, "number passes isNumber");
assert.equal(validators.isNumber("42"), false, "string fails isNumber");

assert.equal(validators.isBoolean(true), true, "boolean passes isBoolean");
assert.equal(validators.isBoolean("true"), false, "string fails isBoolean");

console.log("storageValidators tests passed ✓");
