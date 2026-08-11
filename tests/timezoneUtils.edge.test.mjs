import assert from "node:assert/strict";

const {
  normalizeDateString,
  parseTimeString,
  parseEventToUTC,
  parseEventDateTimeLocal,
  formatEventDateTime,
} = await import("../src/utils/timezoneUtils.js");

assert.equal(normalizeDateString(""), null);
assert.equal(normalizeDateString("2026-05-28"), "2026-05-28");
assert.equal(normalizeDateString("2026-05-28T15:30:00Z"), "2026-05-28");
assert.equal(normalizeDateString("not-a-date"), null);

assert.deepEqual(parseTimeString("12:00 AM"), { hours: 0, minutes: 0 });
assert.deepEqual(parseTimeString("12:30 PM"), { hours: 12, minutes: 30 });
assert.equal(parseTimeString("bad time"), null);

const utcMs = parseEventToUTC("2026-05-28", "10:00 AM", "UTC");
assert.equal(typeof utcMs, "number");

const localDate = parseEventDateTimeLocal("2026-05-28", "10:00 AM");
assert.ok(localDate instanceof Date);
assert.equal(formatEventDateTime(""), "");

console.log("timezoneUtils edge-case tests passed ✓");
