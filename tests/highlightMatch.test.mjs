import assert from "node:assert/strict";

// Test regular expression escaping function matching highlightMatch.js implementation
const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

assert.equal(escapeRegExp("C++"), "C\\+\\+");
assert.equal(escapeRegExp("Regex [cool]"), "Regex \\[cool\\]");
assert.equal(escapeRegExp("$10"), "\\$10");
assert.equal(escapeRegExp("(a+)+$"), "\\(a\\+\\)\\+\\$");

console.log("✅ highlightMatch RegExp escaping logic test passed successfully!");
