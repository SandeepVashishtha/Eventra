import assert from "node:assert/strict";

const { sanitizeSearchQuery } = await import("../src/utils/inputSanitization.js");

assert.equal(sanitizeSearchQuery(undefined), "");
assert.equal(sanitizeSearchQuery(42), "");
assert.equal(sanitizeSearchQuery("  hello  "), "hello");
assert.equal(sanitizeSearchQuery("a{b}c[d]"), "abcd");
assert.equal(sanitizeSearchQuery("line\nbreak"), "linebreak");
assert.equal(sanitizeSearchQuery("a".repeat(250)).length, 200);

console.log("sanitizeSearchQuery edge-case tests passed ✓");
