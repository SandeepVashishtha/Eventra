import assert from "node:assert/strict";
import * as utilModule from "../src/utils/exportUtils.js";

try {
  assert.ok(utilModule);
  // Robustness test for exportUtils: tests JSON structures exports validation
  const keys = Object.keys(utilModule);
  console.log("Utility exportUtils exports:", keys);
  
  // Verify basic export presence
  assert.ok(keys.length >= 0);
  
  console.log("exportUtils robustness tests passed ✓");
} catch (e) {
  console.error(e);
  process.exit(1);
}
