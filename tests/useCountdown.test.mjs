/**
 * useCountdown.test.mjs
 *
 * Tests for the useCountdown hook.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useCountdown from "../src/hooks/useCountdown";

vi.mock("../src/utils/timeSync", () => ({
  getServerTime: () => new Date(),
}));

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

const futureDate = (ms) => new Date(Date.now() + ms).toISOString();
const pastDate = () => new Date(Date.now() - 1000).toISOString();

// ─────────────────────────────────────────────────────────────────────────────
// Deadline mode
// ─────────────────────────────────────────────────────────────────────────────

describe("useCountdown — deadline mode", () => {
  it("returns positive timeLeft for future deadline", () => {
    const { result } = renderHook(() =>
      useCountdown(futureDate(10 * 60 * 1000)) // 10 minutes
    );
    expect(result.current.minutes).toBeGreaterThan(0);
    expect(result.current.ended).toBe(false);
  });

  it("returns ended=true for past deadline", () => {
    const { result } = renderHook(() => useCountdown(pastDate()));
    expect(result.current.ended).toBe(true);
    expect(result.current.days).toBe(0);
    expect(result.current.seconds).toBe(0);
  });

  it("returns ended=true for null deadline", () => {
    const { result } = renderHook(() => useCountdown(null));
    expect(result.current.ended).toBe(true);
  });

  it("ticks down every second", () => {
    const { result } = renderHook(() =>
      useCountdown(futureDate(30 * 1000)) // 30 seconds
    );
    const initial = result.current.seconds;
    act(() => { vi.advanceTimersByTime(3000); });
    // seconds should decrease (by ~3)
    expect(result.current.seconds).toBeLessThan(initial + 1);
  });

  it("calls onEnd exactly once when deadline passes", () => {
    const onEnd = vi.fn();
    renderHook(() =>
      useCountdown(futureDate(2000), { onEnd })
    );
    act(() => { vi.advanceTimersByTime(3000); });
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it("does not call onEnd multiple times", () => {
    const onEnd = vi.fn();
    renderHook(() =>
      useCountdown(futureDate(1000), { onEnd })
    );
    act(() => { vi.advanceTimersByTime(5000); });
    expect(onEnd).toHaveBeenCalledTimes(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Seconds mode
// ─────────────────────────────────────────────────────────────────────────────

describe("useCountdown — seconds mode", () => {
  it("starts at totalSeconds", () => {
    const { result } = renderHook(() =>
      useCountdown(null, { totalSeconds: 15 })
    );
    expect(result.current.seconds).toBe(15);
    expect(result.current.ended).toBe(false);
  });

  it("counts down each second", () => {
    const { result } = renderHook(() =>
      useCountdown(null, { totalSeconds: 10 })
    );
    act(() => { vi.advanceTimersByTime(3000); });
    expect(result.current.seconds).toBe(7);
  });

  it("sets ended=true at 0", () => {
    const { result } = renderHook(() =>
      useCountdown(null, { totalSeconds: 3 })
    );
    act(() => { vi.advanceTimersByTime(4000); });
    expect(result.current.ended).toBe(true);
    expect(result.current.seconds).toBe(0);
  });

  it("loops when loop=true", () => {
    const { result } = renderHook(() =>
      useCountdown(null, { totalSeconds: 3, loop: true })
    );
    act(() => { vi.advanceTimersByTime(4000); });
    // Should have restarted
    expect(result.current.ended).toBe(false);
    expect(result.current.seconds).toBeLessThanOrEqual(3);
  });

  it("calls onEnd when loop=false and reaches 0", () => {
    const onEnd = vi.fn();
    renderHook(() =>
      useCountdown(null, { totalSeconds: 2, onEnd })
    );
    act(() => { vi.advanceTimersByTime(3000); });
    expect(onEnd).toHaveBeenCalledTimes(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Pausable mode
// ─────────────────────────────────────────────────────────────────────────────

describe("useCountdown — pausable mode", () => {
  it("does not tick when paused", () => {
    const { result } = renderHook(() =>
      useCountdown(null, { totalSeconds: 10, pausable: true })
    );
    act(() => { result.current.pause(); });
    act(() => { vi.advanceTimersByTime(3000); });
    expect(result.current.seconds).toBe(10); // unchanged
    expect(result.current.paused).toBe(true);
  });

  it("resumes ticking after resume()", () => {
    const { result } = renderHook(() =>
      useCountdown(null, { totalSeconds: 10, pausable: true })
    );
    act(() => { result.current.pause(); });
    act(() => { vi.advanceTimersByTime(3000); });
    act(() => { result.current.resume(); });
    act(() => { vi.advanceTimersByTime(2000); });
    expect(result.current.seconds).toBe(8); // ticked 2 seconds after resume
    expect(result.current.paused).toBe(false);
  });

  it("resets to totalSeconds on reset()", () => {
    const { result } = renderHook(() =>
      useCountdown(null, { totalSeconds: 10, pausable: true })
    );
    act(() => { vi.advanceTimersByTime(5000); });
    act(() => { result.current.reset(); });
    expect(result.current.seconds).toBe(10);
    expect(result.current.ended).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Enabled flag
// ─────────────────────────────────────────────────────────────────────────────

describe("useCountdown — enabled flag", () => {
  it("does not start when enabled=false", () => {
    const { result } = renderHook(() =>
      useCountdown(null, { totalSeconds: 10, enabled: false })
    );
    act(() => { vi.advanceTimersByTime(5000); });
    expect(result.current.seconds).toBe(10); // unchanged
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Cleanup
// ─────────────────────────────────────────────────────────────────────────────

describe("useCountdown — cleanup", () => {
  it("does not setState after unmount", () => {
    const { unmount } = renderHook(() =>
      useCountdown(null, { totalSeconds: 10 })
    );
    unmount();
    // Advancing timers after unmount should not throw
    act(() => { vi.advanceTimersByTime(5000); });
  });
});
