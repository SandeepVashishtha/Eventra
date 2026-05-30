import assert from "node:assert/strict";

const warnings = [];
const originalWarn = console.warn;
console.warn = (...args) => warnings.push(args);

const { prepareSafeSearchQuery } = await import("../src/utils/inputSanitization.js");

assert.equal(prepareSafeSearchQuery("react events"), "react events");
assert.equal(prepareSafeSearchQuery("  spaced  "), "spaced");
assert.equal(prepareSafeSearchQuery("bad $ operator"), "");
assert.equal(prepareSafeSearchQuery(null), "");
assert.ok(warnings.length >= 1, "logs warning for invalid queries");

console.warn = originalWarn;
console.log("prepareSafeSearchQuery tests passed ✓");
