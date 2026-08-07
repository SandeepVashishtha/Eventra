/**
 * Unit tests for src/utils/eventDurationUtils.js
 *
 * getEventDuration reports durations based on calendar-day boundaries so
 * DST transitions cannot skew the result. Tests cover DST-transition
 * dates, overnight events, multi-day/week spans and identical start/end.
 *
 * Dates are parsed without a timezone suffix, so they are interpreted in
 * the runner's local timezone; the calendar-day based implementation is
 * timezone-independent, keeping the assertions deterministic everywhere.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { getEventDuration } from "../src/utils/eventDurationUtils.js";

test("returns empty string when endDate is missing", () => {
  assert.equal(getEventDuration({ startDate: "2026-03-08T09:00:00" }), "");
});

test("returns empty string for invalid dates", () => {
  assert.equal(getEventDuration({ startDate: "not-a-date", endDate: "2026-03-09T09:00:00" }), "");
});

test("returns 'Same Day' for identical start/end instants", () => {
  assert.equal(
    getEventDuration({ startDate: "2026-03-08T09:00:00", endDate: "2026-03-08T09:00:00" }),
    "Same Day",
  );
});

test("returns '1 Day' for a same-calendar-day event", () => {
  assert.equal(
    getEventDuration({ startDate: "2026-03-08T09:00:00", endDate: "2026-03-08T17:00:00" }),
    "1 Day",
  );
});

test("returns '2 Days' for a two-calendar-day event crossing spring-forward", () => {
  // 2026 US spring-forward: Mar 8 02:00. Start/end straddle midnight, so the
  // wall-clock span is short, but two calendar days are covered.
  assert.equal(
    getEventDuration({ startDate: "2026-03-08T23:00:00", endDate: "2026-03-09T01:00:00" }),
    "2 Days",
  );
});

test("returns '1 Day' for a same-calendar-day event on a fall-back (25h) day", () => {
  // 2026 US fall-back: Nov 1 02:00. Both instants fall on Nov 1 (a 25-hour
  // wall-clock day), so it is still a single calendar day.
  assert.equal(
    getEventDuration({ startDate: "2026-11-01T00:00:00", endDate: "2026-11-01T23:30:00" }),
    "1 Day",
  );
});

test("returns '2 Days' for an overnight event ending the following calendar morning", () => {
  assert.equal(
    getEventDuration({ startDate: "2026-03-08T18:00:00", endDate: "2026-03-09T06:00:00" }),
    "2 Days",
  );
});

test("returns '3 Days' for a three-calendar-day event", () => {
  assert.equal(
    getEventDuration({ startDate: "2026-03-08T09:00:00", endDate: "2026-03-10T17:00:00" }),
    "3 Days",
  );
});

test("returns week granularity for spans of seven or more days", () => {
  assert.equal(
    getEventDuration({ startDate: "2026-03-08T09:00:00", endDate: "2026-03-15T17:00:00" }),
    "2 Weeks",
  );
});
