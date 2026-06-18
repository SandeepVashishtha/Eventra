import assert from "node:assert/strict";

import {
  formatEventDate,
  formatEventDateRange,
  getRelativeTime,
  getUserTimezone,
} from "../src/utils/dateFormatter.js";

assert.equal(typeof getUserTimezone(), "string");
assert.notEqual(getUserTimezone(), "");

assert.match(
  formatEventDate("2026-06-15T14:30:00.000Z", { timezone: "UTC", format: "short" }),
  /\d/,
);

assert.equal(formatEventDate("not-a-date"), "Invalid date");

const range = formatEventDateRange(
  "2026-06-15T10:00:00.000Z",
  "2026-06-15T12:00:00.000Z",
  { timezone: "UTC" },
);
assert.match(range, / - /);

const future = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
assert.match(getRelativeTime(future), /day|天/i);

console.log("dateFormatter tests passed ✓");
