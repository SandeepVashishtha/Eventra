import assert from "node:assert/strict";
import { validateSearchQuery } from "../src/utils/inputSanitization.js";

const result1 = validateSearchQuery("");
assert.deepEqual(result1, { isValid: true, error: null }, "empty string is valid");

const result2 = validateSearchQuery("   ");
assert.deepEqual(result2, { isValid: true, error: null }, "whitespace-only is valid");

assert.deepEqual(validateSearchQuery(null), { isValid: false, error: "Search query must be a string" }, "null returns invalid");
assert.deepEqual(validateSearchQuery(undefined), { isValid: true, error: null }, "undefined returns valid (truthy check fails)");
assert.deepEqual(validateSearchQuery(123), { isValid: false, error: "Search query must be a string" }, "number returns invalid");
assert.deepEqual(validateSearchQuery({ query: "test" }), { isValid: false, error: "Search query must be a string" }, "object returns invalid");
assert.deepEqual(validateSearchQuery(["test"]), { isValid: false, error: "Search query must be a string" }, "array returns invalid");

const exactly200 = "a".repeat(200);
assert.deepEqual(validateSearchQuery(exactly200), { isValid: true, error: null }, "exactly 200 chars is valid");

const over200 = "a".repeat(201);
assert.deepEqual(validateSearchQuery(over200), { isValid: false, error: "Search query must be less than 200 characters" }, "201 chars is invalid");

const result9 = validateSearchQuery("simple valid query");
assert.deepEqual(result9, { isValid: true, error: null }, "simple query valid");

const result10 = validateSearchQuery("$and{brackets}");
assert.deepEqual(result10, { isValid: false, error: "Search query contains invalid characters" }, "injection patterns invalid");

const result11 = validateSearchQuery("query with spaces is fine");
assert.deepEqual(result11, { isValid: true, error: null }, "spaces are valid");

const result12 = validateSearchQuery("hyphenated-query");
assert.deepEqual(result12, { isValid: true, error: null }, "hyphens are valid");

const result13 = validateSearchQuery("test;statement");
assert.deepEqual(result13, { isValid: false, error: "Search query contains invalid characters" }, "semicolons are invalid");

const result14 = validateSearchQuery("test'quotes");
assert.deepEqual(result14, { isValid: false, error: "Search query contains invalid characters" }, "single quotes are invalid");

const result15 = validateSearchQuery("test`backticks`");
assert.deepEqual(result15, { isValid: false, error: "Search query contains invalid characters" }, "backticks are invalid");

const result16 = validateSearchQuery("test|pipes");
assert.deepEqual(result16, { isValid: false, error: "Search query contains invalid characters" }, "pipes are invalid");

console.log("All validateSearchQuery edge tests passed!");