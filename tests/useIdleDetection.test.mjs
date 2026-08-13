/**
 * useIdleDetection.test.mjs
 *
 * Tests for the useIdleDetection hook.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useIdleDetection from "../src/hooks/useIdleDetection";

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

const fireActivity = (eventType = "mousemove") => {
  act(() => { window.dispatchEvent(new Event(eventType)); });
};

// ─────────────────────────────────────────────────────────────────────────────
// Initial state
// ─────────────────────────────────────────────────────────────────────────────

describe("useIdleDetection — initial state", () => {
  it("isIdle=false on mount", () => {
    const { result } = renderHook(() => useIdleDetection({ idleMs: 5000 }));
    expect(result.current.isIdle).toBe(false);
  });

  it("lastActiveAt is a Date", () => {
    const { result } = renderHook(() => useIdleDetection({ idleMs: 5000 }));
    expect(result.current.lastActiveAt).toBeInstanceOf(Date);
  });

  it("idleFor starts at 0", () => {
    const { result } = renderHook(() => useIdleDetection({ idleMs: 5000 }));
    expect(result.current.idleFor).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Idle detection
// ─────────────────────────────────────────────────────────────────────────────

describe("useIdleDetection — idle detection", () => {
  it("sets isIdle=true after idleMs elapses", () => {
    const { result } = renderHook(() =>
      useIdleDetection({ idleMs: 3000, throttleMs: 0 })
    );
    act(() => { vi.advanceTimersByTime(4000); });
    expect(result.current.isIdle).toBe(true);
  });

  it("calls onIdle once when idle threshold reached", () => {
    const onIdle = vi.fn();
    renderHook(() =>
      useIdleDetection({ idleMs: 3000, throttleMs: 0, onIdle })
    );
    act(() => { vi.advanceTimersByTime(4000); });
    expect(onIdle).toHaveBeenCalledTimes(1);
  });

  it("does not call onIdle multiple times", () => {
    const onIdle = vi.fn();
    renderHook(() =>
      useIdleDetection({ idleMs: 3000, throttleMs: 0, onIdle })
    );
    act(() => { vi.advanceTimersByTime(10000); });
    expect(onIdle).toHaveBeenCalledTimes(1);
  });

  it("updates idleFor every second", () => {
    const { result } = renderHook(() =>
      useIdleDetection({ idleMs: 60000, throttleMs: 0 })
    );
    act(() => { vi.advanceTimersByTime(5000); });
    expect(result.current.idleFor).toBeGreaterThanOrEqual(4000);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Activity detection
// ─────────────────────────────────────────────────────────────────────────────

describe("useIdleDetection — activity detection", () => {
  it("does not go idle when user is active", () => {
    const { result } = renderHook(() =>
      useIdleDetection({ idleMs: 3000, throttleMs: 0 })
    );
    act(() => { vi.advanceTimersByTime(1000); });
    fireActivity("mousemove");
    act(() => { vi.advanceTimersByTime(1000); });
    fireActivity("mousemove");
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.isIdle).toBe(false);
  });

  it("calls onActive when user returns from idle", () => {
    const onActive = vi.fn();
    renderHook(() =>
      useIdleDetection({ idleMs: 2000, throttleMs: 0, onActive })
    );
    act(() => { vi.advanceTimersByTime(3000); }); // go idle
    fireActivity();
    expect(onActive).toHaveBeenCalledTimes(1);
  });

  it("sets isIdle=false when user returns from idle", () => {
    const { result } = renderHook(() =>
      useIdleDetection({ idleMs: 2000, throttleMs: 0 })
    );
    act(() => { vi.advanceTimersByTime(3000); });
    expect(result.current.isIdle).toBe(true);
    fireActivity();
    expect(result.current.isIdle).toBe(false);
  });

  it("updates lastActiveAt on activity", () => {
    const { result } = renderHook(() =>
      useIdleDetection({ idleMs: 60000, throttleMs: 0 })
    );
    const before = result.current.lastActiveAt;
    act(() => { vi.advanceTimersByTime(2000); });
    fireActivity();
    expect(result.current.lastActiveAt.getTime()).toBeGreaterThan(before.getTime());
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Throttling
// ─────────────────────────────────────────────────────────────────────────────

describe("useIdleDetection — throttling", () => {
  it("throttles activity updates within throttleMs", () => {
    const { result } = renderHook(() =>
      useIdleDetection({ idleMs: 60000, throttleMs: 1000 })
    );
    const before = result.current.lastActiveAt;
    // Fire 10 events within 500ms (less than throttle)
    for (let i = 0; i < 10; i++) {
      act(() => { vi.advanceTimersByTime(50); });
      fireActivity();
    }
    // lastActiveAt should only update once (throttled)
    const diff = result.current.lastActiveAt.getTime() - before.getTime();
    expect(diff).toBeLessThan(600);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// reset()
// ─────────────────────────────────────────────────────────────────────────────

describe("useIdleDetection — reset", () => {
  it("reset() prevents going idle after being called", () => {
    const { result } = renderHook(() =>
      useIdleDetection({ idleMs: 3000, throttleMs: 0 })
    );
    act(() => { vi.advanceTimersByTime(2000); });
    act(() => { result.current.reset(); }); // reset before idle
    act(() => { vi.advanceTimersByTime(2000); });
    expect(result.current.isIdle).toBe(false);
  });

  it("reset() recovers from idle state", () => {
    const { result } = renderHook(() =>
      useIdleDetection({ idleMs: 2000, throttleMs: 0 })
    );
    act(() => { vi.advanceTimersByTime(3000); });
    expect(result.current.isIdle).toBe(true);
    act(() => { result.current.reset(); });
    expect(result.current.isIdle).toBe(false);
    expect(result.current.idleFor).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Enabled flag
// ─────────────────────────────────────────────────────────────────────────────

describe("useIdleDetection — enabled", () => {
  it("does not go idle when enabled=false", () => {
    const { result } = renderHook(() =>
      useIdleDetection({ idleMs: 2000, throttleMs: 0, enabled: false })
    );
    act(() => { vi.advanceTimersByTime(5000); });
    expect(result.current.isIdle).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Cleanup
// ─────────────────────────────────────────────────────────────────────────────

describe("useIdleDetection — cleanup", () => {
  it("removes event listeners on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() =>
      useIdleDetection({ idleMs: 5000 })
    );
    unmount();
    const mousemoveRemovals = removeSpy.mock.calls.filter(([e]) => e === "mousemove");
    expect(mousemoveRemovals.length).toBeGreaterThanOrEqual(1);
  });

  it("stops idle timer on unmount", () => {
    const clearSpy = vi.spyOn(global, "clearInterval");
    const { unmount } = renderHook(() =>
      useIdleDetection({ idleMs: 5000 })
    );
    unmount();
    expect(clearSpy).toHaveBeenCalled();
  });
});
