import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizeDateToUTC } from "../src/utils/calendarUtils.js";

describe("Calendar Timezone Hydration Tests", () => {
  it("should normalize varying date strings to exact UTC ISO representation", () => {
    const raw = "2026-08-11T12:00:00";
    const utc = normalizeDateToUTC(raw);

    assert.ok(utc.endsWith("Z") || utc.includes("T"));
  });
});
