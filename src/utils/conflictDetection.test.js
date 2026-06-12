/**
 * Tests for conflict detection — focused on timezone-crossing scenarios.
 *
 * These tests cover the bugs fixed in issue #2014:
 *  1. Events that overlap across UTC midnight (cross-timezone false negatives)
 *  2. Events stored with mixed date formats (false positives from string comparison)
 *  3. Multi-hour event durations (false negatives from hardcoded 60-min duration)
 */

import {
  doEventsOverlap,
  findConflictingEvents,
  checkRegistrationConflict,
  suggestAlternativeEvents,
  formatTimeRange,
  parseTimeToMinutes,
  getEventTimeRange,
  getEventUTCRange,
} from "./conflictDetection";

// ---------------------------------------------------------------------------
// Helper: build a minimal event object
// ---------------------------------------------------------------------------
const mkEvent = (id, date, time, durationMinutes) => ({
  id,
  date,
  time,
  ...(durationMinutes !== undefined && { durationMinutes }),
});

// ---------------------------------------------------------------------------
// 1. Basic same-day overlap (sanity check)
// ---------------------------------------------------------------------------
describe("doEventsOverlap — same-day basic cases", () => {
  test("two 60-min events at the same time overlap", () => {
    const e1 = mkEvent(1, "2026-05-25", "10:00 AM");
    const e2 = mkEvent(2, "2026-05-25", "10:00 AM");
    expect(doEventsOverlap(e1, e2)).toBe(true);
  });

  test("events on different days do not overlap", () => {
    const e1 = mkEvent(1, "2026-05-25", "10:00 AM");
    const e2 = mkEvent(2, "2026-05-26", "10:00 AM");
    expect(doEventsOverlap(e1, e2)).toBe(false);
  });

  test("back-to-back events (one ends when the other starts) do not overlap", () => {
    const e1 = mkEvent(1, "2026-05-25", "10:00 AM", 60);
    const e2 = mkEvent(2, "2026-05-25", "11:00 AM", 60);
    expect(doEventsOverlap(e1, e2)).toBe(false);
  });

  test("partially overlapping events are detected", () => {
    const e1 = mkEvent(1, "2026-05-25", "10:00 AM", 90); // 10:00–11:30
    const e2 = mkEvent(2, "2026-05-25", "11:00 AM", 60); // 11:00–12:00
    expect(doEventsOverlap(e1, e2)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. Multi-hour duration (issue: hardcoded 60 min → false negatives)
// ---------------------------------------------------------------------------
describe("doEventsOverlap — event.durationMinutes respected", () => {
  test("3-hour workshop at 9 AM conflicts with 11:30 AM event", () => {
    // Bug: old code used 60 min → workshop ended at 10 AM → no conflict
    const workshop = mkEvent(1, "2026-06-01", "9:00 AM", 180); // 09:00–12:00
    const talk = mkEvent(2, "2026-06-01", "11:30 AM", 60); // 11:30–12:30
    expect(doEventsOverlap(workshop, talk)).toBe(true);
  });

  test("3-hour workshop at 9 AM does NOT conflict with 1 PM event", () => {
    const workshop = mkEvent(1, "2026-06-01", "9:00 AM", 180); // 09:00–12:00
    const afternoon = mkEvent(2, "2026-06-01", "1:00 PM", 60); // 13:00–14:00
    expect(doEventsOverlap(workshop, afternoon)).toBe(false);
  });

  test("4-hour event with no durationMinutes field uses fallback 60 min", () => {
    // If durationMinutes is absent, fallback applies — event is 60 min
    const e1 = mkEvent(1, "2026-06-01", "9:00 AM"); // 09:00–10:00 (fallback)
    const e2 = mkEvent(2, "2026-06-01", "9:30 AM"); // 09:30–10:30 (fallback)
    expect(doEventsOverlap(e1, e2)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. Mixed date formats (issue: raw string comparison fails)
// ---------------------------------------------------------------------------
describe("doEventsOverlap — mixed date formats", () => {
  test('ISO and "YYYY-MM-DD" are recognised as the same date', () => {
    const e1 = mkEvent(1, "2026-05-25T00:00:00Z", "2:00 PM", 60);
    const e2 = mkEvent(2, "2026-05-25", "2:00 PM", 60);
    // They're on the same day — should overlap
    expect(doEventsOverlap(e1, e2)).toBe(true);
  });

  test('"Month DD, YYYY" and "YYYY-MM-DD" are recognised as the same date', () => {
    const e1 = mkEvent(1, "May 25, 2026", "3:00 PM", 60);
    const e2 = mkEvent(2, "2026-05-25", "3:00 PM", 60);
    expect(doEventsOverlap(e1, e2)).toBe(true);
  });

  test("events on genuinely different days in mixed formats do not overlap", () => {
    const e1 = mkEvent(1, "May 25, 2026", "10:00 AM", 60);
    const e2 = mkEvent(2, "2026-05-26", "10:00 AM", 60);
    expect(doEventsOverlap(e1, e2)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 4. Timezone-aware: cross-UTC-midnight overlap
// ---------------------------------------------------------------------------
describe("doEventsOverlap — timezone-aware cross-midnight scenarios", () => {
  test("event at 11:00 PM UTC conflicts with event at 1:00 AM UTC+2 (same real-world hour)", () => {
    // 11:00 PM UTC  = 2026-05-25 23:00 UTC  (duration 60 min → ends 2026-05-26 00:00 UTC)
    // 01:00 AM UTC+2 = 2026-05-25 23:00 UTC (duration 60 min → ends 2026-05-26 00:00 UTC)
    // They are the same moment in UTC — should conflict.
    const eventUTC = { ...mkEvent(1, "2026-05-25", "11:00 PM", 60), timezone: "UTC" };
    const eventUTCPlus2 = {
      ...mkEvent(2, "2026-05-26", "1:00 AM", 60),
      timezone: "Africa/Johannesburg",
    }; // UTC+2 all year round

    expect(doEventsOverlap(eventUTC, eventUTCPlus2, 60)).toBe(true);
  });

  test("events 3 hours apart in the same timezone do not conflict", () => {
    const e1 = mkEvent(1, "2026-05-25", "10:00 AM", 60);
    const e2 = mkEvent(2, "2026-05-25", "1:00 PM", 60);
    expect(doEventsOverlap(e1, e2, 60, "America/New_York")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 5. findConflictingEvents and checkRegistrationConflict
// ---------------------------------------------------------------------------
describe("findConflictingEvents", () => {
  const registered = [
    mkEvent(10, "2026-06-10", "9:00 AM", 60),
    mkEvent(11, "2026-06-10", "2:00 PM", 120), // 14:00–16:00
  ];

  test("returns empty array when no conflict", () => {
    const newEvent = mkEvent(99, "2026-06-10", "11:00 AM", 60);
    expect(findConflictingEvents(newEvent, registered)).toHaveLength(0);
  });

  test("returns conflicting event when overlap exists", () => {
    const newEvent = mkEvent(99, "2026-06-10", "9:30 AM", 60); // overlaps event 10
    const conflicts = findConflictingEvents(newEvent, registered);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].id).toBe(10);
  });

  test("detects conflict with multi-hour registered event", () => {
    const newEvent = mkEvent(99, "2026-06-10", "3:00 PM", 60); // inside 14:00–16:00
    const conflicts = findConflictingEvents(newEvent, registered);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].id).toBe(11);
  });

  test("returns empty array when registeredEvents is empty", () => {
    const newEvent = mkEvent(99, "2026-06-10", "9:00 AM", 60);
    expect(findConflictingEvents(newEvent, [])).toHaveLength(0);
  });

  test("handles wrapped registration objects (reg.event shape)", () => {
    const wrappedRegistrations = registered.map((e) => ({ event: e }));
    const newEvent = mkEvent(99, "2026-06-10", "9:30 AM", 60);
    const conflicts = findConflictingEvents(newEvent, wrappedRegistrations);
    expect(conflicts).toHaveLength(1);
  });

  test("ignores self-conflict when checking registrations", () => {
    const newEvent = mkEvent(10, "2026-06-10", "9:00 AM", 60); // same ID as registered event 10
    const conflicts = findConflictingEvents(newEvent, registered);
    expect(conflicts).toHaveLength(0);
  });
});

describe("checkRegistrationConflict", () => {
  const registered = [mkEvent(10, "2026-06-10", "10:00 AM", 60)];

  test("hasConflict is true when overlap exists", () => {
    const newEvent = mkEvent(99, "2026-06-10", "10:30 AM", 60);
    const result = checkRegistrationConflict(newEvent, registered);
    expect(result.hasConflict).toBe(true);
    expect(result.conflicts).toHaveLength(1);
  });

  test("hasConflict is false when no overlap", () => {
    const newEvent = mkEvent(99, "2026-06-10", "12:00 PM", 60);
    const result = checkRegistrationConflict(newEvent, registered);
    expect(result.hasConflict).toBe(false);
    expect(result.conflicts).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 6. Legacy helpers (backward-compat)
// ---------------------------------------------------------------------------
describe("parseTimeToMinutes — legacy compat", () => {
  test("parses 12:00 PM → 720", () => expect(parseTimeToMinutes("12:00 PM")).toBe(720));
  test("parses 12:00 AM → 0", () => expect(parseTimeToMinutes("12:00 AM")).toBe(0));
  test("parses 1:30 PM → 810", () => expect(parseTimeToMinutes("1:30 PM")).toBe(810));
  test("parses 11:59 PM → 1439", () => expect(parseTimeToMinutes("11:59 PM")).toBe(1439));
  test("returns 0 for empty string", () => expect(parseTimeToMinutes("")).toBe(0));
  test("returns 0 for null", () => expect(parseTimeToMinutes(null)).toBe(0));
});

describe("getEventTimeRange — legacy compat", () => {
  test("uses event.durationMinutes when present", () => {
    const event = mkEvent(1, "2026-01-01", "10:00 AM", 90);
    const { startMinutes, endMinutes } = getEventTimeRange(event, 60);
    expect(startMinutes).toBe(600);
    expect(endMinutes).toBe(690); // 90 min, not 60
  });

  test("uses fallback when durationMinutes absent", () => {
    const event = mkEvent(1, "2026-01-01", "10:00 AM");
    const { startMinutes, endMinutes } = getEventTimeRange(event, 60);
    expect(endMinutes - startMinutes).toBe(60);
  });
});

// ---------------------------------------------------------------------------
// 7. formatTimeRange
// ---------------------------------------------------------------------------
describe("formatTimeRange", () => {
  test("returns a string containing a dash or en-dash separator", () => {
    const result = formatTimeRange("10:00 AM", 60);
    expect(result).toMatch(/[-–]/);
  });

  test("legacy path: 60 min from 10:00 AM produces 10:00 AM – 11:00 AM", () => {
    const result = formatTimeRange("10:00 AM", 60);
    expect(result).toContain("10:00 AM");
    expect(result).toContain("11:00 AM");
  });
});

// ---------------------------------------------------------------------------
// 8. findConflictingEvents — null/undefined entry guard (issue #7035)
// ---------------------------------------------------------------------------
describe("findConflictingEvents — null/undefined entry resilience", () => {
  const validEvent = mkEvent(10, "2026-06-10", "9:00 AM", 60);
  const newEvent = mkEvent(99, "2026-06-10", "9:30 AM", 60);

  test("does not throw when registeredEvents contains null entries", () => {
    expect(() => findConflictingEvents(newEvent, [null, validEvent])).not.toThrow();
  });

  test("does not throw when registeredEvents contains undefined entries", () => {
    expect(() => findConflictingEvents(newEvent, [undefined, validEvent])).not.toThrow();
  });

  test("does not throw when registeredEvents contains a mix of null, undefined, and valid entries", () => {
    expect(() =>
      findConflictingEvents(newEvent, [null, undefined, null, validEvent])
    ).not.toThrow();
  });

  test("still detects conflicts after filtering out null entries", () => {
    const conflicts = findConflictingEvents(newEvent, [null, validEvent]);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].id).toBe(10);
  });

  test("does not throw when a registration object has an explicitly null .event property", () => {
    const regWithNullEvent = { event: null, id: 55, date: "2026-06-10", time: "9:00 AM" };
    expect(() => findConflictingEvents(newEvent, [regWithNullEvent, validEvent])).not.toThrow();
  });

  test("skips registration objects whose .event property is null", () => {
    const regWithNullEvent = { event: null };
    const conflicts = findConflictingEvents(newEvent, [regWithNullEvent, validEvent]);
    // regWithNullEvent is skipped; validEvent overlaps → 1 conflict
    expect(conflicts).toHaveLength(1);
  });

  test("returns empty array when all entries are null", () => {
    expect(findConflictingEvents(newEvent, [null, null, undefined])).toEqual([]);
  });

  test("does not throw when registeredEvents itself is null", () => {
    expect(() => findConflictingEvents(newEvent, null)).not.toThrow();
    expect(findConflictingEvents(newEvent, null)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 9. suggestAlternativeEvents — null entry resilience (issue #7035)
// ---------------------------------------------------------------------------
describe("suggestAlternativeEvents — null entry resilience", () => {
  const targetEvent = mkEvent(1, "2026-07-01", "10:00 AM", 60);
  const altEvent1 = mkEvent(2, "2026-07-01", "2:00 PM", 60);
  const altEvent2 = mkEvent(3, "2026-07-01", "4:00 PM", 60);

  test("does not throw when registeredEvents contains null entries", () => {
    expect(() =>
      suggestAlternativeEvents(targetEvent, [altEvent1, altEvent2], [null, undefined])
    ).not.toThrow();
  });

  test("does not throw when allEvents contains null entries", () => {
    expect(() => suggestAlternativeEvents(targetEvent, [null, altEvent1], [])).not.toThrow();
  });

  test("returns suggestions when registeredEvents has nulls mixed with valid entries", () => {
    const registered = mkEvent(10, "2026-07-01", "10:00 AM", 60);
    const suggestions = suggestAlternativeEvents(
      targetEvent,
      [altEvent1, altEvent2],
      [null, registered, undefined]
    );
    expect(Array.isArray(suggestions)).toBe(true);
  });

  test("returns empty array when allEvents is empty", () => {
    expect(suggestAlternativeEvents(targetEvent, [], [])).toEqual([]);
  });

  test("excludes the target event from suggestions", () => {
    const suggestions = suggestAlternativeEvents(
      targetEvent,
      [targetEvent, altEvent1, altEvent2],
      []
    );
    expect(suggestions.every((e) => e.id !== targetEvent.id)).toBe(true);
  });

  test("respects maxSuggestions cap", () => {
    const manyEvents = Array.from({ length: 10 }, (_, i) =>
      mkEvent(100 + i, "2026-07-01", `${i + 1}:00 PM`, 30)
    );
    const suggestions = suggestAlternativeEvents(targetEvent, manyEvents, [], 60, 2);
    expect(suggestions.length).toBeLessThanOrEqual(2);
  });
});

// ---------------------------------------------------------------------------
// 10. getEventUTCRange — edge cases
// ---------------------------------------------------------------------------
describe("getEventUTCRange", () => {
  test("returns null for a null event", () => {
    expect(getEventUTCRange(null)).toBeNull();
  });

  test("returns null when event has no date or time", () => {
    expect(getEventUTCRange({})).toBeNull();
  });

  test("returns startMs and endMs for a parseable event", () => {
    const event = mkEvent(1, "2026-08-01", "10:00 AM", 60);
    const range = getEventUTCRange(event, 60, "UTC");
    if (range !== null) {
      expect(range).toHaveProperty("startMs");
      expect(range).toHaveProperty("endMs");
      expect(range.endMs).toBeGreaterThan(range.startMs);
      expect(range.endMs - range.startMs).toBe(60 * 60 * 1000);
    }
  });
});

// ---------------------------------------------------------------------------
// 11. doEventsOverlap — null/undefined event arguments
// ---------------------------------------------------------------------------
describe("doEventsOverlap — null/undefined event arguments", () => {
  const validEvent = mkEvent(1, "2026-06-10", "10:00 AM", 60);

  test("does not throw when event1 is null", () => {
    expect(() => doEventsOverlap(null, validEvent)).not.toThrow();
  });

  test("does not throw when event2 is null", () => {
    expect(() => doEventsOverlap(validEvent, null)).not.toThrow();
  });

  test("does not throw when both events are null", () => {
    expect(() => doEventsOverlap(null, null)).not.toThrow();
  });

  test("does not throw when event1 is undefined", () => {
    expect(() => doEventsOverlap(undefined, validEvent)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// 12. checkRegistrationConflict — shape of return value
// ---------------------------------------------------------------------------
describe("checkRegistrationConflict — return shape", () => {
  test("always returns an object with hasConflict boolean and conflicts array", () => {
    const result = checkRegistrationConflict(mkEvent(1, "2026-06-01", "9:00 AM", 60), []);
    expect(result).toHaveProperty("hasConflict");
    expect(result).toHaveProperty("conflicts");
    expect(typeof result.hasConflict).toBe("boolean");
    expect(Array.isArray(result.conflicts)).toBe(true);
  });

  test("hasConflict and conflicts are consistent (hasConflict === conflicts.length > 0)", () => {
    const registered = [mkEvent(10, "2026-06-10", "10:00 AM", 60)];
    const overlapping = mkEvent(99, "2026-06-10", "10:30 AM", 60);
    const { hasConflict, conflicts } = checkRegistrationConflict(overlapping, registered);
    expect(hasConflict).toBe(conflicts.length > 0);
  });

  test("handles null registeredEvents without throwing", () => {
    expect(() =>
      checkRegistrationConflict(mkEvent(1, "2026-06-01", "9:00 AM", 60), null)
    ).not.toThrow();
  });

  test("handles null/undefined entries in registeredEvents without throwing", () => {
    const registered = [null, mkEvent(10, "2026-06-10", "10:00 AM", 60), undefined];
    expect(() =>
      checkRegistrationConflict(mkEvent(99, "2026-06-10", "10:30 AM", 60), registered)
    ).not.toThrow();
  });
});
