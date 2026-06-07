import assert from "node:assert/strict";

const { resolveEventInstant, parseEventToUTC } = await import(
  "../src/utils/timezoneUtils.js"
);

// --- resolveEventInstant returns a Date matching parseEventToUTC ---
{
  const instant = resolveEventInstant("2026-06-15", "6:00 PM", "Asia/Kolkata");
  assert.ok(instant instanceof Date, "returns a Date");
  assert.equal(
    instant.getTime(),
    parseEventToUTC("2026-06-15", "6:00 PM", "Asia/Kolkata"),
    "matches parseEventToUTC epoch"
  );
}

// --- the same wall-clock time in different zones yields different instants ---
{
  // 18:00 in IST (UTC+5:30) is an earlier absolute moment than 18:00 in
  // America/Los_Angeles (UTC-7/-8). The naive `new Date("2026-06-15T18:00")`
  // would instead produce the SAME wall-clock interpreted as the viewer's zone,
  // which is exactly the bug. Anchoring to the event zone fixes it.
  const ist = resolveEventInstant("2026-06-15", "18:00", "Asia/Kolkata");
  const la = resolveEventInstant("2026-06-15", "18:00", "America/Los_Angeles");

  assert.ok(ist instanceof Date && la instanceof Date, "both resolve");
  assert.notEqual(
    ist.getTime(),
    la.getTime(),
    "identical wall-clock in different zones maps to different instants"
  );

  // IST is east of UTC, LA is west, so 18:00 IST happens before 18:00 LA.
  assert.ok(
    ist.getTime() < la.getTime(),
    "18:00 IST is an earlier absolute moment than 18:00 LA"
  );
}

// --- a known absolute moment is independent of the viewer ---
{
  // 2026-06-15 18:00 IST == 2026-06-15 12:30 UTC.
  const ist = resolveEventInstant("2026-06-15", "18:00", "Asia/Kolkata");
  const expectedUtc = Date.UTC(2026, 5, 15, 12, 30, 0, 0);
  assert.equal(
    ist.getTime(),
    expectedUtc,
    "18:00 IST resolves to 12:30 UTC"
  );
}

// --- invalid inputs return null rather than an Invalid Date ---
{
  assert.equal(
    resolveEventInstant("not-a-date", "18:00", "UTC"),
    null,
    "invalid date returns null"
  );
  assert.equal(
    resolveEventInstant("2026-06-15", "not-a-time", "UTC"),
    null,
    "invalid time returns null"
  );
}

console.log("resolveEventInstant timezone tests passed ✓");
