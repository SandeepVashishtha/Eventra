import assert from "node:assert/strict";
import { isTokenExpiredWithGrace } from "../src/utils/graceExpiry.js";

const now = Math.floor(Date.now() / 1000);
assert.ok(isTokenExpiredWithGrace(now - 1));
console.log("graceExpiry tests passed ✓");
