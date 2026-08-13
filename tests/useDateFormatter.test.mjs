/**
 * useDateFormatter.test.mjs
 *
 * Tests for the useDateFormatter hook.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import useDateFormatter from "../src/hooks/useDateFormatter";

// Mock dateFormatter utils
vi.mock("../src/utils/dateFormatter", () => ({
  formatEventDate: vi.fn((date, opts) => `formatted:${date}:${opts?.format ?? "medium"}`),
  formatEventDateRange: vi.fn((start, end) => `range:${start}:${end}`),
  getRelativeTime: vi.fn((date) => `relative:${date}`),
}));

beforeEach(() => { vi.clearAllMocks(); });
afterEach(() => { vi.restoreAllMocks(); });

// ─────────────────────────────────────────────────────────────────────────────
// formatEventDate
// ─────────────────────────────────────────────────────────────────────────────

describe("useDateFormatter — formatEventDate", () => {
  it("calls formatEventDate with correct args", () => {
    const { result } = renderHook(() => useDateFormatter());
    result.current.formatEventDate("2026-06-12", { format: "long" });
    const { formatEventDate } = await import("../src/utils/dateFormatter");
    expect(formatEventDate).toHaveBeenCalledWith("2026-06-12", expect.objectContaining({ format: "long" }));
  });

  it("passes default timezone to formatEventDate", () => {
    const { result } = renderHook(() => useDateFormatter({ timezone: "America/New_York" }));
    result.current.formatEventDate("2026-06-12");
    const { formatEventDate } = await import("../src/utils/dateFormatter");
    expect(formatEventDate).toHaveBeenCalledWith("2026-06-12", expect.objectContaining({ timezone: "America/New_York" }));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// formatShort
// ─────────────────────────────────────────────────────────────────────────────

describe("useDateFormatter — formatShort", () => {
  it("returns a short date string", () => {
    const { result } = renderHook(() => useDateFormatter());
    const out = result.current.formatShort(new Date(2026, 5, 12)); // June 12, 2026
    expect(out).toMatch(/Jun/);
    expect(out).toMatch(/12/);
  });

  it("returns '—' for invalid date", () => {
    const { result } = renderHook(() => useDateFormatter());
    expect(result.current.formatShort("not-a-date")).toBe("—");
    expect(result.current.formatShort(null)).toBe("—");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// formatDate
// ─────────────────────────────────────────────────────────────────────────────

describe("useDateFormatter — formatDate", () => {
  it("returns date without time", () => {
    const { result } = renderHook(() => useDateFormatter());
    const out = result.current.formatDate(new Date(2026, 5, 12));
    expect(out).toMatch(/June/);
    expect(out).toMatch(/2026/);
  });

  it("returns '—' for invalid date", () => {
    const { result } = renderHook(() => useDateFormatter());
    expect(result.current.formatDate("bad")).toBe("—");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// formatTime
// ─────────────────────────────────────────────────────────────────────────────

describe("useDateFormatter — formatTime", () => {
  it("returns time without date", () => {
    const { result } = renderHook(() => useDateFormatter());
    const date = new Date(2026, 5, 12, 14, 30);
    const out = result.current.formatTime(date);
    expect(out).toMatch(/2:30|14:30/);
  });

  it("returns '—' for invalid date", () => {
    const { result } = renderHook(() => useDateFormatter());
    expect(result.current.formatTime("bad")).toBe("—");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// isValid
// ─────────────────────────────────────────────────────────────────────────────

describe("useDateFormatter — isValid", () => {
  it("returns true for valid date string", () => {
    const { result } = renderHook(() => useDateFormatter());
    expect(result.current.isValid("2026-06-12")).toBe(true);
  });

  it("returns true for Date object", () => {
    const { result } = renderHook(() => useDateFormatter());
    expect(result.current.isValid(new Date())).toBe(true);
  });

  it("returns false for invalid string", () => {
    const { result } = renderHook(() => useDateFormatter());
    expect(result.current.isValid("not-a-date")).toBe(false);
  });

  it("returns false for null/undefined", () => {
    const { result } = renderHook(() => useDateFormatter());
    expect(result.current.isValid(null)).toBe(false);
    expect(result.current.isValid(undefined)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getRelativeTime
// ─────────────────────────────────────────────────────────────────────────────

describe("useDateFormatter — getRelativeTime", () => {
  it("calls getRelativeTime from dateFormatter", () => {
    const { result } = renderHook(() => useDateFormatter());
    const out = result.current.getRelativeTime("2026-06-12");
    expect(out).toBe("relative:2026-06-12");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Stable references
// ─────────────────────────────────────────────────────────────────────────────

describe("useDateFormatter — stable refs", () => {
  it("returns same function references across renders", () => {
    const { result, rerender } = renderHook(() => useDateFormatter());
    const first = result.current.formatShort;
    rerender();
    expect(result.current.formatShort).toBe(first);
  });
});
