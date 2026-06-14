import assert from "node:assert/strict";

const {
  parseTimeToMinutes,
  validateCoordinates,
} = await import("../src/utils/eventCreationUtils.js");

assert.equal(parseTimeToMinutes("09:30"), 570);
assert.equal(parseTimeToMinutes(""), 0);

assert.deepEqual(validateCoordinates("40.7128", "-74.0060"), {
  latitude: 40.7128,
  longitude: -74.006,
});
assert.equal(validateCoordinates("95", "10"), null);
assert.equal(validateCoordinates("10", "200"), null);

console.log("eventCreationUtils tests passed ✓");
