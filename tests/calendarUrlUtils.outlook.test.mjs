import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import { getOutlookCalendarUrl } from "../src/utils/calendarUrlUtils.js";

describe("calendarUrlUtils outlook timezone #16250", () => {
  it("emits a trailing Z on startdt/enddt so Outlook reads UTC", () => {
    const url = getOutlookCalendarUrl(
      { title: "T", date: "2026-06-01", time: "10:00 AM", durationMinutes: 60 },
      "America/New_York"
    );

    const start = url.match(/[?&]startdt=([^&]+)/)[1];
    const end = url.match(/[?&]enddt=([^&]+)/)[1];

    assert.ok(start.endsWith("Z"), `startdt should end with Z, got ${start}`);
    assert.ok(end.endsWith("Z"), `enddt should end with Z, got ${end}`);
  });

  it("does not append Z in the date-only fallback path", () => {
    const url = getOutlookCalendarUrl({ title: "T", date: "2026-06-01" });
    const start = url.match(/[?&]startdt=([^&]+)/)[1];
    assert.ok(!start.endsWith("Z"), `date-only fallback should not carry Z, got ${start}`);
  });
});
