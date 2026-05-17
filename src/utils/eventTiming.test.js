import {
  getEventTimingStatus,
  matchesEventTimingFilter,
  parseEventDateTime,
} from "./eventTiming";

describe("eventTiming", () => {
  const referenceDate = new Date(2026, 4, 17, 12, 0, 0);

  it("parses 12-hour event times", () => {
    const parsed = parseEventDateTime({
      date: "2026-06-01",
      time: "10:30 AM",
    });

    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(5);
    expect(parsed.getDate()).toBe(1);
    expect(parsed.getHours()).toBe(10);
    expect(parsed.getMinutes()).toBe(30);
  });

  it("derives upcoming status from a future date-time", () => {
    const status = getEventTimingStatus(
      { date: "2026-12-10", time: "9:00 AM", status: "past" },
      referenceDate
    );

    expect(status).toBe("upcoming");
  });

  it("derives past status from an elapsed date-time", () => {
    const status = getEventTimingStatus(
      { date: "2026-01-01", time: "9:00 AM", status: "upcoming" },
      referenceDate
    );

    expect(status).toBe("past");
  });

  it("filters events by derived timing instead of hardcoded status", () => {
    const event = { date: "2026-12-10", time: "9:00 AM", status: "past", type: "summit" };

    expect(matchesEventTimingFilter(event, "upcoming")).toBe(true);
    expect(matchesEventTimingFilter(event, "past")).toBe(false);
    expect(matchesEventTimingFilter(event, "summit")).toBe(true);
  });
});
