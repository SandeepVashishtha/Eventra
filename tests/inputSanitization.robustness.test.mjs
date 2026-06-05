import assert from "node:assert/strict";
import { sanitizeSearchQuery } from "../src/utils/inputSanitization.js";

const clean = sanitizeSearchQuery("<script>alert(1)</script>hello");
assert.equal(clean.includes("<script>"), false);
console.log("inputSanitization robustness tests passed ✓");
