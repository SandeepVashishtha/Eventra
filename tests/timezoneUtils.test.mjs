import assert from "node:assert/strict";
import { getUserTimezone, normalizeDateString, parseTimeString, parseEventToUTC, parseEventDateTimeLocal } from "../src/utils/timezoneUtils.js";

assert.equal(typeof getUserTimezone(), "string");
assert.equal(normalizeDateString("2026-05-28T10:00:00Z"), "2026-05-28");
assert.deepEqual(parseTimeString("10:00 AM"), { hours: 10, minutes: 0 });
assert.deepEqual(parseTimeString("22:30"), { hours: 22, minutes: 30 });

const utcTime = parseEventToUTC("2026-05-28", "10:00 AM", "UTC");
assert.equal(typeof utcTime, "number");
assert.equal(
  new Date(utcTime).toISOString(),
  "2026-05-28T10:00:00.000Z",
  "UTC timezone parsing preserves the provided wall time"
);

assert.equal(
  new Date(parseEventToUTC("2026-06-02", "00:15", "Pacific/Kiritimati")).toISOString(),
  "2026-06-01T10:15:00.000Z",
  "timezone parsing handles near-midnight events ahead of UTC"
);
assert.equal(
  new Date(parseEventToUTC("2026-06-01", "23:45", "America/Los_Angeles")).toISOString(),
  "2026-06-02T06:45:00.000Z",
  "timezone parsing handles near-midnight events behind UTC"
);
assert.equal(
  new Date(parseEventToUTC("2026-03-08", "01:30 AM", "America/New_York")).toISOString(),
  "2026-03-08T06:30:00.000Z",
  "timezone parsing handles times before a DST spring-forward transition"
);
assert.equal(
  new Date(parseEventToUTC("2026-03-08", "03:30 AM", "America/New_York")).toISOString(),
  "2026-03-08T07:30:00.000Z",
  "timezone parsing handles times after a DST spring-forward transition"
);

const local = parseEventDateTimeLocal("2026-05-28", "10:00 AM");
assert.ok(local instanceof Date);

// Edge Cases: parseTimeString with 12:00 AM and 12:00 PM
assert.deepEqual(parseTimeString("12:00 AM"), { hours: 0, minutes: 0 });
assert.deepEqual(parseTimeString("12:00 PM"), { hours: 12, minutes: 0 });
assert.deepEqual(parseTimeString("11:59 PM"), { hours: 23, minutes: 59 });
assert.deepEqual(parseTimeString("12:01 AM"), { hours: 0, minutes: 1 });

// Graceful fallback for invalid/malformed date formats
assert.equal(normalizeDateString("invalid-date-string"), null);
assert.equal(normalizeDateString(""), null);
assert.equal(normalizeDateString(null), null);

console.log("timezoneUtils tests passed ✓");
