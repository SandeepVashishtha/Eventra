import assert from "node:assert/strict";
import { getUserTimezone, normalizeDateString, parseTimeString, parseEventToUTC, parseEventDateTimeLocal } from "../src/utils/timezoneUtils.js";

assert.equal(typeof getUserTimezone(), "string");
assert.equal(normalizeDateString("2026-05-28T10:00:00Z"), "2026-05-28");
assert.deepEqual(parseTimeString("10:00 AM"), { hours: 10, minutes: 0 });
assert.deepEqual(parseTimeString("22:30"), { hours: 22, minutes: 30 });

const utcTime = parseEventToUTC("2026-05-28", "10:00 AM", "UTC");
assert.equal(typeof utcTime, "number");

const local = parseEventDateTimeLocal("2026-05-28", "10:00 AM");
assert.ok(local instanceof Date);

console.log("timezoneUtils tests passed ✓");
