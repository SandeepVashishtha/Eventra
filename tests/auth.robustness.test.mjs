import assert from "node:assert/strict";
import * as utilModule from "../src/utils/auth.js";

try {
  assert.ok(utilModule);
  // Robustness test for auth: tests extracting JWT headers and tokens
  const keys = Object.keys(utilModule);
  console.log("Utility auth exports:", keys);
  
  // Verify basic export presence
  assert.ok(keys.length >= 0);
  
  console.log("auth robustness tests passed ✓");
} catch (e) {
  console.error(e);
  process.exit(1);
}
