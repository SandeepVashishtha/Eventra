import assert from "node:assert/strict";
import { normalizeDateToUTC } from "../src/utils/calendarUtils.js";

// The Google Calendar URL builders (generateGoogleCalendarUrl /
// addEventToGoogleCalendar / addHackathonToGoogleCalendar) were removed from
// src/utils/calendarUtils.js when the module was narrowed to timezone
// normalization (#14086). The current module only exports normalizeDateToUTC.

assert.equal(
  typeof normalizeDateToUTC,
  "function",
  "calendarUtils must export normalizeDateToUTC"
);

// Date-only inputs are parsed as UTC and normalized to a UTC ISO string.
assert.equal(
  normalizeDateToUTC("2026-05-28"),
  "2026-05-28T00:00:00.000Z"
);

// The normalized output is always a valid UTC ISO string that round-trips.
const normalized = normalizeDateToUTC("2026-05-28T10:00:00Z");
assert.equal(normalized, "2026-05-28T10:00:00.000Z");
assert.equal(new Date(normalized).toISOString(), normalized);

// The normalized output must preserve the instant even when the input carries
// a non-UTC offset.
assert.equal(
  normalizeDateToUTC("2026-05-28T10:00:00+05:30"),
  "2026-05-28T04:30:00.000Z"
);

// Invalid dates fall back to the Unix epoch in UTC.
assert.equal(
  normalizeDateToUTC("not-a-date"),
  new Date(0).toISOString(),
  "invalid dates fall back to the epoch"
);
assert.equal(
  normalizeDateToUTC(undefined),
  new Date(0).toISOString(),
  "undefined dates fall back to the epoch"
);

console.log("calendarUtils tests passed ✓");
