import assert from "node:assert/strict";
import { sanitizeFilterQuery } from "../src/utils/querySanitizer.js";

const result = sanitizeFilterQuery({ search: "<script>" });
assert.strictEqual(result.search, "script");
console.log("querySanitizer tests passed ✓");
