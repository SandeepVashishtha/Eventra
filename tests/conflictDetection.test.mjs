import assert from "node:assert/strict";

const {
  doEventsOverlap,
  findConflictingEvents,
  checkRegistrationConflict,
  parseTimeToMinutes,
} = await import("../src/utils/conflictDetection.js");

assert.equal(parseTimeToMinutes("10:00 AM"), 600);
assert.equal(parseTimeToMinutes(""), 0);

const baseEvent = {
  date: "2026-06-01",
  time: "10:00 AM",
  durationMinutes: 60,
  timezone: "UTC",
};

const overlapping = {
  date: "2026-06-01",
  time: "10:30 AM",
  durationMinutes: 60,
  timezone: "UTC",
};

const separate = {
  date: "2026-06-01",
  time: "12:00 PM",
  durationMinutes: 60,
  timezone: "UTC",
};

assert.equal(doEventsOverlap(baseEvent, overlapping, 60, "UTC"), true);
assert.equal(doEventsOverlap(baseEvent, separate, 60, "UTC"), false);

const conflicts = findConflictingEvents(
  baseEvent,
  [{ event: overlapping }, { event: separate }],
  60,
  "UTC"
);
assert.equal(conflicts.length, 1);

const check = checkRegistrationConflict(
  baseEvent,
  [{ event: overlapping }],
  60,
  "UTC"
);
assert.equal(check.hasConflict, true);
assert.equal(check.conflicts.length, 1);

console.log("conflictDetection tests passed ✓");
