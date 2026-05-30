import assert from "node:assert/strict";
import {
  parseTimeToMinutes,
  formatDate,
  formatTime,
  validateCoordinates
} from "../src/utils/eventCreationUtils.js";

// Test parseTimeToMinutes
assert.equal(parseTimeToMinutes(""), 0, "empty time returns 0 minutes");
assert.equal(parseTimeToMinutes(null), 0, "null time returns 0 minutes");
assert.equal(parseTimeToMinutes("09:30"), 570, "correct minutes for 09:30");
assert.equal(parseTimeToMinutes("00:00"), 0, "correct minutes for 00:00");
assert.equal(parseTimeToMinutes("23:59"), 1439, "correct minutes for 23:59");

// Test validateCoordinates
assert.deepEqual(
  validateCoordinates("45.5", "-122.5"),
  { latitude: 45.5, longitude: -122.5 },
  "valid coordinates parsed correctly"
);
assert.deepEqual(
  validateCoordinates(90, 180),
  { latitude: 90, longitude: 180 },
  "boundary valid coordinates parsed correctly"
);
assert.deepEqual(
  validateCoordinates(-90, -180),
  { latitude: -90, longitude: -180 },
  "boundary negative valid coordinates parsed correctly"
);
assert.equal(validateCoordinates(90.1, 0), null, "out-of-bounds latitude returns null");
assert.equal(validateCoordinates(0, 180.1), null, "out-of-bounds longitude returns null");
assert.equal(validateCoordinates("not a number", 0), null, "NaN latitude returns null");

// Test formatDate
const formattedDate = formatDate("2026-05-30");
assert.ok(formattedDate.includes("2026"), "Date formatted string includes year");
assert.ok(formattedDate.includes("May"), "Date formatted string includes month");

// Test formatTime
const formattedTime = formatTime("09:30:00");
// e.g. "9:30 AM" or "09:30 AM" or similar depending on platform, but should have 9, 30, and AM/PM
assert.ok(formattedTime.includes("9:30"), "Time formatted string includes minutes");
assert.ok(formattedTime.includes("AM") || formattedTime.includes("am"), "Time formatted string includes AM/PM");

console.log("eventCreationUtils tests passed ✓");
