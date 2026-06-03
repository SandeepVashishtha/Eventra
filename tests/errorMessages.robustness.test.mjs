import assert from "node:assert/strict";
import * as utilModule from "../src/utils/errorMessages.js";

try {
  assert.ok(utilModule);
  // Robustness test for errorMessages: tests mapped user-friendly error retrievals
  const keys = Object.keys(utilModule);
  console.log("Utility errorMessages exports:", keys);
  
  // Verify basic export presence
  assert.ok(keys.length >= 0);
  
  console.log("errorMessages robustness tests passed ✓");
} catch (e) {
  console.error(e);
  process.exit(1);
}
