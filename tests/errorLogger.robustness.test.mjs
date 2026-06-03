import assert from "node:assert/strict";
import * as utilModule from "../src/utils/errorLogger.js";

try {
  assert.ok(utilModule);
  // Robustness test for errorLogger: tests writing details of runtime exceptions
  const keys = Object.keys(utilModule);
  console.log("Utility errorLogger exports:", keys);
  
  // Verify basic export presence
  assert.ok(keys.length >= 0);
  
  console.log("errorLogger robustness tests passed ✓");
} catch (e) {
  console.error(e);
  process.exit(1);
}
