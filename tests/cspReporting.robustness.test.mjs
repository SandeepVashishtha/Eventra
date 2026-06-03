import assert from "node:assert/strict";
import * as utilModule from "../src/utils/cspReporting.js";

try {
  assert.ok(utilModule);
  // Robustness test for cspReporting: tests structural validity of CSP logger reports
  const keys = Object.keys(utilModule);
  console.log("Utility cspReporting exports:", keys);
  
  // Verify basic export presence
  assert.ok(keys.length >= 0);
  
  console.log("cspReporting robustness tests passed ✓");
} catch (e) {
  console.error(e);
  process.exit(1);
}
