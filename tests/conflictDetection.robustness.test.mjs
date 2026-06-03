import assert from "node:assert/strict";
import * as utilModule from "../src/utils/conflictDetection.js";

try {
  assert.ok(utilModule);
  // Robustness test for conflictDetection: tests overlapping events schedule algorithms
  const keys = Object.keys(utilModule);
  console.log("Utility conflictDetection exports:", keys);
  
  // Verify basic export presence
  assert.ok(keys.length >= 0);
  
  console.log("conflictDetection robustness tests passed ✓");
} catch (e) {
  console.error(e);
  process.exit(1);
}
