import assert from "node:assert/strict";
import { validators } from "../src/utils/storage/storageValidators.js";

try {
  // Test isObject
  assert.equal(validators.isObject({}), true, "Empty object should be an object");
  assert.equal(validators.isObject({ a: 1 }), true, "Non-empty object should be an object");
  assert.equal(validators.isObject(null), false, "null should not be an object");
  assert.equal(validators.isObject([]), false, "Array should not be an object");
  assert.equal(validators.isObject("string"), false, "String should not be an object");

  // Test isArray
  assert.equal(validators.isArray([]), true, "Empty array should be an array");
  assert.equal(validators.isArray([1, 2]), true, "Non-empty array should be an array");
  assert.equal(validators.isArray({}), false, "Object should not be an array");
  assert.equal(validators.isArray("string"), false, "String should not be an array");

  // Test isString
  assert.equal(validators.isString("hello"), true, "String should be a string");
  assert.equal(validators.isString(""), true, "Empty string should be a string");
  assert.equal(validators.isString(123), false, "Number should not be a string");
  assert.equal(validators.isString(null), false, "null should not be a string");

  // Test isNumber
  assert.equal(validators.isNumber(42), true, "Integer should be a number");
  assert.equal(validators.isNumber(3.14), true, "Float should be a number");
  assert.equal(validators.isNumber(NaN), true, "NaN should be a number"); // Javascript type typeof NaN is 'number'
  assert.equal(validators.isNumber("42"), false, "Numeric string should not be a number");

  // Test isBoolean
  assert.equal(validators.isBoolean(true), true, "true should be a boolean");
  assert.equal(validators.isBoolean(false), true, "false should be a boolean");
  assert.equal(validators.isBoolean(1), false, "Number should not be a boolean");
  assert.equal(validators.isBoolean(null), false, "null should not be a boolean");

  console.log("storageValidators tests passed ✓");
} catch (error) {
  console.error("Test failed:", error);
  process.exit(1);
}
