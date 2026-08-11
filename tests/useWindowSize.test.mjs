/**
 * useWindowSize.test.mjs
 *
 * Tests for the centralised useWindowSize hook.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useWindowSize from "../src/hooks/useWindowSize";

beforeEach(() => {
  vi.useFakeTimers();
  Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: 1280 });
  Object.defineProperty(window, "innerHeight", { configurable: true, writable: true, value: 800 });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const fireResize = (width, height = 800) => {
  window.innerWidth = width;
  window.innerHeight = height;
  act(() => { window.dispatchEvent(new Event("resize")); });
};

describe("useWindowSize — initial state", () => {
  it("returns current window dimensions on mount", () => {
    const { result } = renderHook(() => useWindowSize());
    expect(result.current.width).toBe(1280);
    expect(result.current.height).toBe(800);
  });

  it("isLarge=true when width >= 1024", () => {
    const { result } = renderHook(() => useWindowSize());
    expect(result.current.isLarge).toBe(true);
  });

  it("isXL=true when width >= 1280", () => {
    const { result } = renderHook(() => useWindowSize());
    expect(result.current.isXL).toBe(true);
  });
});

describe("useWindowSize — breakpoints", () => {
  it("isSmall=true when width < 640", () => {
    window.innerWidth = 375;
    const { result } = renderHook(() => useWindowSize());
    expect(result.current.isSmall).toBe(true);
    expect(result.current.isMedium).toBe(false);
    expect(result.current.isLarge).toBe(false);
  });

  it("isMedium=true when 640 <= width < 1024", () => {
    window.innerWidth = 768;
    const { result } = renderHook(() => useWindowSize());
    expect(result.current.isMedium).toBe(true);
    expect(result.current.isSmall).toBe(false);
    expect(result.current.isLarge).toBe(false);
  });

  it("isLarge=true when width >= 1024", () => {
    window.innerWidth = 1024;
    const { result } = renderHook(() => useWindowSize());
    expect(result.current.isLarge).toBe(true);
  });
});

describe("useWindowSize — resize events", () => {
  it("updates width after debounce on resize", () => {
    const { result } = renderHook(() => useWindowSize({ debounceMs: 100 }));
    fireResize(768);
    expect(result.current.width).toBe(1280); // Not updated yet
    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current.width).toBe(768);
  });

  it("debounces rapid resize events — only fires once", () => {
    const { result } = renderHook(() => useWindowSize({ debounceMs: 100 }));
    fireResize(500);
    fireResize(600);
    fireResize(700);
    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current.width).toBe(700);
  });

  it("updates breakpoints after resize", () => {
    const { result } = renderHook(() => useWindowSize({ debounceMs: 100 }));
    fireResize(375);
    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current.isSmall).toBe(true);
    expect(result.current.isLarge).toBe(false);
  });
});

describe("useWindowSize — cleanup", () => {
  it("removes resize listener on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useWindowSize());
    unmount();
    const resizeListeners = removeSpy.mock.calls.filter(([type]) => type === "resize");
    expect(resizeListeners.length).toBeGreaterThanOrEqual(1);
  });
});
