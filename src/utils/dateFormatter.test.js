import { describe, it, expect, vi } from "vitest";
import { formatEventDate, formatEventDateRange, getRelativeTime } from "./dateFormatter";

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
  it("returns a range string with dash separator", () => {
    const result = formatEventDateRange("2026-06-15T10:00:00Z", "2026-06-15T12:00:00Z");
    expect(result).toContain(" - ");
  });

  it("includes start date in result", () => {
    const result = formatEventDateRange("2026-06-15T10:00:00Z", "2026-06-15T12:00:00Z");
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
