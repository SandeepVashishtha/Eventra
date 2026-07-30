import assert from "node:assert/strict";
import { isStorageQuotaAvailable } from "../src/utils/quotaChecker.js";

assert.strictEqual(typeof isStorageQuotaAvailable, "function");
console.log("quotaChecker tests loaded ✓");
