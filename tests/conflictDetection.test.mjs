import assert from "node:assert/strict";

const { doEventsOverlap, findConflictingEvents, checkRegistrationConflict, parseTimeToMinutes, suggestAlternativeEvents } =
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

// --- Issue 12463: suggestAlternativeEvents with a real (unwrapped) array ---
// The conflict modal must show alternative events. EventRegistration.js unwraps
// the paged API payload ({ content: [...] }) into a plain array before calling
// this function; given a real array it must return same-category,
// non-conflicting suggestions (excluding the target and registered events).

const targetEvent = {
  id: 1,
  title: "React Workshop",
  date: "2026-06-01",
  time: "10:00 AM",
  timezone: "UTC",
  durationMinutes: 60,
  category: "Workshop",
};

const alreadyRegistered = {
  id: 2,
  title: "Registered Event",
  date: "2026-06-01",
  time: "12:00 PM",
  timezone: "UTC",
  durationMinutes: 60,
  category: "Workshop",
};

const altSameCategory = {
  id: 3,
  title: "Advanced React",
  date: "2026-06-02",
  time: "10:00 AM",
  timezone: "UTC",
  durationMinutes: 60,
  category: "Workshop",
};

const altOtherCategory = {
  id: 4,
  title: "Cloud Conf",
  date: "2026-06-03",
  time: "10:00 AM",
  timezone: "UTC",
  durationMinutes: 60,
  category: "Conference",
};

const altConflicting = {
  id: 5,
  title: "Overlapping Registered Workshop",
  date: "2026-06-01",
  time: "12:30 PM",
  timezone: "UTC",
  durationMinutes: 60,
  category: "Workshop",
};

const suggestions = suggestAlternativeEvents(
  targetEvent,
  [alreadyRegistered, altSameCategory, altOtherCategory, altConflicting],
  [{ event: alreadyRegistered }],
  60,
  3,
  "UTC"
);

// Excludes the already-registered event (2) and the one that conflicts with it
// (5, 12:30 PM overlaps the 12:00 PM registration); prioritises the
// same-category event (3) over the other category (4).
assert.deepEqual(suggestions.map((s) => s.id), [3, 4]);

console.log("conflictDetection tests passed ✓");
