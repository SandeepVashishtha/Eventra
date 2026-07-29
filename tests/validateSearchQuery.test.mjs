import assert from "node:assert/strict";

const { validateSearchQuery } = await import("../src/utils/inputSanitization.js");

assert.deepEqual(validateSearchQuery(""), { isValid: true, error: null });
assert.deepEqual(validateSearchQuery("   "), { isValid: true, error: null });
assert.deepEqual(validateSearchQuery(123), {
  isValid: false,
  error: "Search query must be a string",
});
assert.deepEqual(validateSearchQuery(null), {
  isValid: false,
  error: "Search query must be a string",
});
assert.deepEqual(validateSearchQuery("{ $gt: '' }"), {
  isValid: false,
  error: "Search query contains invalid characters",
});
assert.deepEqual(validateSearchQuery("a".repeat(201)), {
  isValid: false,
  error: "Search query must be less than 200 characters",
});

console.log("validateSearchQuery edge-case tests passed ✓");
