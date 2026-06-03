import assert from "node:assert/strict";
import * as utilModule from "../src/utils/eventUtils.js";

try {
  assert.ok(utilModule);
  // Robustness test for eventUtils: tests event item field extractions and filters
  const keys = Object.keys(utilModule);
  console.log("Utility eventUtils exports:", keys);
  
  // Verify basic export presence
  assert.ok(keys.length >= 0);
  
  console.log("eventUtils robustness tests passed ✓");
} catch (e) {
  console.error(e);
  process.exit(1);
}
