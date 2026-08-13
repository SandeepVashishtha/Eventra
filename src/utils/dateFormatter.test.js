import { describe, it, expect, vi } from "vitest";
import {
  formatEventDate,
  formatEventDateRange,
  getRelativeTime,
  parseDateInTimezone,
  generateGoogleCalendarUrl,
  generateICalDataUrl,
} from "./dateFormatter";

vi.mock("./timezoneUtils", () => ({
  getUserTimezone: () => "UTC",
}));

describe("formatEventDate", () => {
  it("formats a valid ISO date string in medium format", () => {
    const result = formatEventDate("2026-06-15T10:00:00Z");
    expect(result).toContain("2026");
    expect(result).toContain("Jun");
  });

  it("formats a Date object", () => {
    const result = formatEventDate(new Date("2026-06-15T10:00:00Z"));
    expect(result).toContain("2026");
  });

  it("returns Invalid date for bad input", () => {
    expect(formatEventDate("not-a-date")).toBe("Invalid date");
  });

  it("formats in full format", () => {
    const result = formatEventDate("2026-06-15T10:00:00Z", { format: "full", timezone: "UTC" });
    expect(result).toContain("2026");
  });

  it("formats in long format", () => {
    const result = formatEventDate("2026-06-15T10:00:00Z", { format: "long", timezone: "UTC" });
    expect(result).toContain("2026");
  });

  it("formats in short format", () => {
    const result = formatEventDate("2026-06-15T10:00:00Z", { format: "short", timezone: "UTC" });
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("formatEventDateRange", () => {
  it("returns a range string with separator", () => {
    const result = formatEventDateRange(
      "2026-06-15T10:00:00Z",
      "2026-06-15T12:00:00Z"
    );
    expect(result).toMatch(/–|-/);
  });

  it("includes start date in result", () => {
    const result = formatEventDateRange(
      "2026-06-15T10:00:00Z",
      "2026-06-15T12:00:00Z"
    );
    expect(result).toContain("2026");
  });
});

describe("getRelativeTime", () => {
  it("returns a string for future date", () => {
    const future = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const result = getRelativeTime(future);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns a string for past date", () => {
    const past = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const result = getRelativeTime(past);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns a string for near-now date", () => {
    const now = new Date(Date.now() + 30 * 1000);
    const result = getRelativeTime(now);
    expect(typeof result).toBe("string");
  });

  it("returns empty string for invalid date", () => {
    const result = getRelativeTime("not-a-date");
    expect(result).toBe("");
  });
});

describe("parseDateInTimezone", () => {
  it("parses naive ISO date-time in target timezone to UTC Date", () => {
    const parsed = parseDateInTimezone("2026-06-15T10:00:00", "America/New_York");
    // 10:00 EDT (UTC-4) is 14:00 UTC
    expect(parsed.toISOString()).toBe("2026-06-15T14:00:00.000Z");
  });

  it("preserves explicit UTC offset or Z designator", () => {
    const parsed = parseDateInTimezone("2026-06-15T10:00:00Z", "America/New_York");
    expect(parsed.toISOString()).toBe("2026-06-15T10:00:00.000Z");
  });

  it("returns invalid date for bad inputs", () => {
    expect(isNaN(parseDateInTimezone("invalid-date").getTime())).toBe(true);
    expect(isNaN(parseDateInTimezone(null).getTime())).toBe(true);
  });
});

describe("generateGoogleCalendarUrl", () => {
  it("generates timezone-correct Google Calendar URL for naive date strings", () => {
    const url = generateGoogleCalendarUrl({
      title: "Design Sync",
      startDate: "2026-06-15T10:00:00",
      endDate: "2026-06-15T12:00:00",
      timezone: "America/New_York",
      description: "Weekly sync",
      location: "Room 404",
    });

    expect(url).toContain("calendar.google.com/calendar/render");
    // 10:00 EDT -> 14:00 UTC, 12:00 EDT -> 16:00 UTC
    expect(url).toContain("dates=20260615T140000Z%2F20260615T160000Z");
    expect(url).toContain("ctz=America%2FNew_York");
  });

  it("returns empty string if start or end date is invalid", () => {
    const url = generateGoogleCalendarUrl({
      title: "Bad Event",
      startDate: "invalid",
      endDate: "2026-06-15T12:00:00",
    });
    expect(url).toBe("");
  });
});

describe("generateICalDataUrl", () => {
  it("generates timezone-correct iCal data URI for naive date strings", () => {
    const dataUrl = generateICalDataUrl({
      title: "Keynote Talk",
      startDate: "2026-06-15T10:00:00",
      endDate: "2026-06-15T12:00:00",
      timezone: "America/New_York",
      description: "Opening keynote",
      location: "Main Stage",
    });

    expect(dataUrl.startsWith("data:text/calendar;charset=utf8,")).toBe(true);
    const decoded = decodeURIComponent(dataUrl.replace("data:text/calendar;charset=utf8,", ""));

    expect(decoded).toContain("X-WR-TIMEZONE:America/New_York");
    // 10:00 EDT -> 14:00 UTC, 12:00 EDT -> 16:00 UTC
    expect(decoded).toContain("DTSTART:20260615T140000Z");
    expect(decoded).toContain("DTEND:20260615T160000Z");
    expect(decoded).toContain("SUMMARY:Keynote Talk");
  });

  it("returns empty string if start or end date is invalid", () => {
    const dataUrl = generateICalDataUrl({
      title: "Bad Event",
      startDate: "2026-06-15T10:00:00",
      endDate: "bad-date",
    });
    expect(dataUrl).toBe("");
  });
});