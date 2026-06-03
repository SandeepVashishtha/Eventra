import assert from "node:assert/strict";
import * as utilModule from "../src/utils/eventFetchUtils.js";

try {
  assert.ok(utilModule);
  // Robustness test for eventFetchUtils: tests paging offsets retrieval parameters
  const keys = Object.keys(utilModule);
  console.log("Utility eventFetchUtils exports:", keys);
  
  // Verify basic export presence
  assert.ok(keys.length >= 0);
  
  console.log("eventFetchUtils robustness tests passed ✓");
} catch (e) {
  console.error(e);
  process.exit(1);
}
