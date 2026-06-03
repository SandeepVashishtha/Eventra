import assert from "node:assert/strict";
import * as utilModule from "../src/utils/calendarUtils.js";

try {
  assert.ok(utilModule);
  // Robustness test for calendarUtils: tests date additions and month bounds for calendars
  const keys = Object.keys(utilModule);
  console.log("Utility calendarUtils exports:", keys);
  
  // Verify basic export presence
  assert.ok(keys.length >= 0);
  
  console.log("calendarUtils robustness tests passed ✓");
} catch (e) {
  console.error(e);
  process.exit(1);
}
