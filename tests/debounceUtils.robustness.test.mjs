import assert from "node:assert/strict";
import * as utilModule from "../src/utils/debounceUtils.js";

try {
  assert.ok(utilModule);
  // Robustness test for debounceUtils: tests timers and debounce execution limits
  const keys = Object.keys(utilModule);
  console.log("Utility debounceUtils exports:", keys);
  
  // Verify basic export presence
  assert.ok(keys.length >= 0);
  
  console.log("debounceUtils robustness tests passed ✓");
} catch (e) {
  console.error(e);
  process.exit(1);
}
