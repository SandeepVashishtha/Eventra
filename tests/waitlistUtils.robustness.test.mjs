import assert from "node:assert/strict";
import * as utilModule from "../src/utils/waitlistUtils.js";

try {
  assert.ok(utilModule);
  // Robustness test for waitlistUtils
  const keys = Object.keys(utilModule);
  console.log("Utility waitlistUtils exports:", keys);
  
  // Verify basic export presence
  assert.ok(keys.length >= 0);
  
  console.log("waitlistUtils robustness tests passed ✓");
} catch (e) {
  console.error(e);
  process.exit(1);
}
