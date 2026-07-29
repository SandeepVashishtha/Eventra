import assert from "node:assert/strict";

const {
  sanitizeSearchQuery,
  validateSearchQuery,
  prepareSafeSearchQuery,
  sanitizeInputText,
} = await import("../src/utils/inputSanitization.js");

assert.equal(sanitizeSearchQuery("  trimmed  "), "trimmed");
assert.equal(sanitizeSearchQuery("back\\slash"), "backslash");
assert.equal(sanitizeSearchQuery("pipe|cmd"), "pipecmd");
assert.equal(sanitizeSearchQuery("back`tick"), "backtick");
assert.equal(sanitizeSearchQuery("$where"), "where");

assert.deepEqual(validateSearchQuery("   "), { isValid: true, error: null });
assert.deepEqual(validateSearchQuery("ok-query_1"), {
  isValid: true,
  error: null,
});

assert.equal(prepareSafeSearchQuery("safe text!"), "safe text!");
assert.equal(prepareSafeSearchQuery("{ $gt: '' }"), "");

assert.equal(
  sanitizeInputText("Tom & Jerry"),
  "Tom &amp; Jerry",
  "escapes ampersands"
);
assert.equal(sanitizeInputText("path/to"), "path&#x2F;to", "escapes slashes");

console.log("inputSanitization edge-case tests passed ✓");
