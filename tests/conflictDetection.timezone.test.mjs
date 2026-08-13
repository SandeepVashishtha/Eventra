import assert from "node:assert/strict";

const { getEventUTCRange, doEventsOverlap } = await import(
  "../src/utils/conflictDetection.js"
);

// --- Issue #16241: wall-clock date+time must be interpreted in the EVENT's
// timezone, not the viewer's browser timezone. ---

const nyEvent = {
  date: "2026-08-13",
  time: "10:00 AM",
  durationMinutes: 60,
  timezone: "America/New_York",
};

// 10:00 AM America/New_York on 2026-08-13 (EDT, UTC-4) is 14:00:00 UTC.
const EXPECTED_START = Date.parse("2026-08-13T10:00:00-04:00");
const EXPECTED_END = EXPECTED_START + 60 * 60 * 1000;

// Resolving from an Asia/Kolkata viewer should still yield the New York instant.
const fromViewerTz = getEventUTCRange(nyEvent, 60, "Asia/Kolkata");
const fromOwnTz = getEventUTCRange(nyEvent, 60, "America/New_York");

assert.equal(fromOwnTz.startMs, EXPECTED_START);
assert.equal(fromOwnTz.endMs, EXPECTED_END);
// The viewer's browser timezone must NOT shift the event's instant.
assert.equal(fromViewerTz.startMs, EXPECTED_START);
assert.equal(fromViewerTz.endMs, EXPECTED_END);

// Two NY events separated in absolute time must NOT be reported as overlapping
// just because their wall-clock times look adjacent when mis-shifted to IST.
const nyMorning = {
  date: "2026-08-13",
  time: "09:00 AM",
  durationMinutes: 60,
  timezone: "America/New_York",
};
const nyEvening = {
  date: "2026-08-13",
  time: "06:00 PM",
  durationMinutes: 60,
  timezone: "America/New_York",
};
assert.equal(doEventsOverlap(nyMorning, nyEvening, 60, "Asia/Kolkata"), false);

// ICS TZID should also be honored when an explicit timezone field is absent.
const icsEvent = {
  date: "2026-08-13",
  time: "10:00 AM",
  durationMinutes: 60,
  tzid: "America/New_York",
};
const fromIcsTzid = getEventUTCRange(icsEvent, 60, "Asia/Kolkata");
assert.equal(fromIcsTzid.startMs, EXPECTED_START);
