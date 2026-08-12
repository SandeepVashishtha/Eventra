import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseEventToUTC, isDST, getUserTimezone } from "../src/utils/timezoneUtils.js";
import { buildVTimezoneBlock } from "../src/utils/calendarExportIcs.js";

describe("Timezone Offset Drift & DST Boundary Tests", () => {
  it("should calculate epoch UTC timestamps accurately for explicit timezones", () => {
    const epochNY = parseEventToUTC("2026-06-15", "10:00 AM", "America/New_York");
    const epochIndia = parseEventToUTC("2026-06-15", "10:00 AM", "Asia/Kolkata");

    assert.ok(typeof epochNY === "number" && !isNaN(epochNY));
    assert.ok(typeof epochIndia === "number" && !isNaN(epochIndia));
    // 10 AM IST is earlier than 10 AM EDT in UTC
    assert.ok(epochIndia < epochNY);
  });

  it("should return valid user timezone fallback", () => {
    const tz = getUserTimezone();
    assert.ok(typeof tz === "string" && tz.length > 0);
  });

  it("should detect DST status safely without crashing", () => {
    const juneDate = new Date("2026-06-15T00:00:00Z");
    const result = isDST(juneDate);
    assert.ok(typeof result === "boolean");
  });

  it("should generate standard VTIMEZONE block for ICS export", () => {
    const block = buildVTimezoneBlock("America/New_York");
    assert.ok(block.includes("BEGIN:VTIMEZONE"));
    assert.ok(block.includes("TZID:America/New_York"));
    assert.ok(block.includes("END:VTIMEZONE"));
  });
});
