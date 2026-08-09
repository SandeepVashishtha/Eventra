import assert from "node:assert/strict";

const { doEventsOverlap, findConflictingEvents, checkRegistrationConflict, parseTimeToMinutes, getEventUTCRange } =
  await import("../src/utils/conflictDetection.js");

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

const check = checkRegistrationConflict(baseEvent, [{ event: overlapping }], 60, "UTC");
assert.equal(check.hasConflict, true);
assert.equal(check.conflicts.length, 1);

const baseEventWithId = { ...baseEvent, id: 99 };
const selfConflictCheck = findConflictingEvents(
  baseEventWithId,
  [{ event: baseEventWithId }],
  60,
  "UTC"
);
assert.equal(selfConflictCheck.length, 0);

// --- Issue 12458: same-day events with ISO eventDate timestamps ---
// Real API events carry only a full ISO timestamp (eventDate); they must NOT
// fall into the legacy minutes-from-midnight branch (00:00-01:00) which made
// every same-day pair overlap.

const baseEventIso = {
  eventDate: "2026-06-01T10:00:00",
  timezone: "UTC",
  durationMinutes: 60,
};

const overlapIso = {
  eventDate: "2026-06-01T10:30:00",
  timezone: "UTC",
  durationMinutes: 60,
};

const separateIso = {
  eventDate: "2026-06-01T12:00:00",
  timezone: "UTC",
  durationMinutes: 60,
};

assert.equal(doEventsOverlap(baseEventIso, overlapIso, 60, "UTC"), true);
assert.equal(doEventsOverlap(baseEventIso, separateIso, 60, "UTC"), false);

// Explicit-offset timestamps (Z suffix) parse directly to the instant
assert.equal(
  doEventsOverlap(
    { eventDate: "2026-06-01T10:00:00Z", durationMinutes: 60 },
    { eventDate: "2026-06-01T12:00:00Z", durationMinutes: 60 },
    60,
    "UTC"
  ),
  false
);

// getEventUTCRange resolves the ISO timestamp into a real ms range
const isoRange = getEventUTCRange({
  eventDate: "2026-06-01T10:00:00",
  timezone: "UTC",
  durationMinutes: 60,
});
assert.equal(isoRange.startMs, Date.UTC(2026, 5, 1, 10, 0, 0));
assert.equal(isoRange.endMs, Date.UTC(2026, 5, 1, 11, 0, 0));

// Restored MyEvents records expose only eventSummary (date = ISO timestamp);
// conflict detection must still resolve them against the new event.
const restoredSummary = {
  id: 7,
  title: "Restored",
  date: "2026-06-01T10:00:00",
};
const conflictsWithRestored = findConflictingEvents(
  { ...baseEventIso, id: 1 },
  [{ event: null, eventSummary: restoredSummary }, { event: separateIso }],
  60,
  "UTC"
);
assert.equal(conflictsWithRestored.length, 1);

console.log("conflictDetection tests passed ✓");
