/**
 * useNetworkStatus.test.mjs
 *
 * Tests for the centralised useNetworkStatus hook.
 * Covers: initial state, online/offline transitions, duration ticker,
 * wasOffline flag, Network Information API, and cleanup.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useNetworkStatus from "../src/hooks/useNetworkStatus";

// ─────────────────────────────────────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.useFakeTimers();
  // Default: online
  Object.defineProperty(navigator, "onLine", {
    configurable: true,
    get: () => true,
  });
  // Remove Network Information API by default (test graceful fallback)
  Object.defineProperty(navigator, "connection", {
    configurable: true,
    get: () => undefined,
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/** Helper: fire a browser online/offline event */
const fireNetworkEvent = (type) => {
  act(() => {
    window.dispatchEvent(new Event(type));
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Initial state
// ─────────────────────────────────────────────────────────────────────────────

describe("useNetworkStatus — initial state", () => {
  it("returns isOnline=true when navigator.onLine is true", () => {
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(true);
  });

  it("returns isOnline=false when navigator.onLine is false on mount", () => {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      get: () => false,
    });
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(false);
  });

  it("returns wasOffline=false initially when online", () => {
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.wasOffline).toBe(false);
  });

  it("returns offlineSince=null when online", () => {
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.offlineSince).toBe(null);
  });

  it("returns offlineDuration='0s' when online", () => {
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.offlineDuration).toBe("0s");
  });

  it("sets wasOffline=true when already offline on mount", () => {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      get: () => false,
    });
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.wasOffline).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Online → Offline transition
// ─────────────────────────────────────────────────────────────────────────────

describe("useNetworkStatus — going offline", () => {
  it("sets isOnline=false on offline event", () => {
    const { result } = renderHook(() => useNetworkStatus());
    fireNetworkEvent("offline");
    expect(result.current.isOnline).toBe(false);
  });

  it("sets offlineSince to a Date on offline event", () => {
    const { result } = renderHook(() => useNetworkStatus());
    fireNetworkEvent("offline");
    expect(result.current.offlineSince).toBeInstanceOf(Date);
  });

  it("sets wasOffline=true on offline event", () => {
    const { result } = renderHook(() => useNetworkStatus());
    fireNetworkEvent("offline");
    expect(result.current.wasOffline).toBe(true);
  });

  it("sets connectionType='none' on offline event", () => {
    const { result } = renderHook(() => useNetworkStatus());
    fireNetworkEvent("offline");
    expect(result.current.connectionType).toBe("none");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Offline duration ticker
// ─────────────────────────────────────────────────────────────────────────────

describe("useNetworkStatus — offline duration ticker", () => {
  it("updates offlineDuration every second while offline", () => {
    const { result } = renderHook(() => useNetworkStatus());
    fireNetworkEvent("offline");

    act(() => { vi.advanceTimersByTime(5000); });
    expect(result.current.offlineDuration).toBe("5s");
  });

  it("formats duration as minutes and seconds after 90s", () => {
    const { result } = renderHook(() => useNetworkStatus());
    fireNetworkEvent("offline");

    act(() => { vi.advanceTimersByTime(90_000); });
    expect(result.current.offlineDuration).toBe("1m 30s");
  });

  it("formats duration with hours after 3600s", () => {
    const { result } = renderHook(() => useNetworkStatus());
    fireNetworkEvent("offline");

    act(() => { vi.advanceTimersByTime(3_662_000); });
    expect(result.current.offlineDuration).toBe("1h 1m 2s");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Offline → Online transition
// ─────────────────────────────────────────────────────────────────────────────

describe("useNetworkStatus — coming back online", () => {
  it("sets isOnline=true on online event", () => {
    const { result } = renderHook(() => useNetworkStatus());
    fireNetworkEvent("offline");
    fireNetworkEvent("online");
    expect(result.current.isOnline).toBe(true);
  });

  it("clears offlineSince on online event", () => {
    const { result } = renderHook(() => useNetworkStatus());
    fireNetworkEvent("offline");
    fireNetworkEvent("online");
    expect(result.current.offlineSince).toBe(null);
  });

  it("resets offlineDuration to '0s' on online event", () => {
    const { result } = renderHook(() => useNetworkStatus());
    fireNetworkEvent("offline");
    act(() => { vi.advanceTimersByTime(10_000); });
    fireNetworkEvent("online");
    expect(result.current.offlineDuration).toBe("0s");
  });

  it("keeps wasOffline=true after coming back online", () => {
    const { result } = renderHook(() => useNetworkStatus());
    fireNetworkEvent("offline");
    fireNetworkEvent("online");
    // wasOffline persists for the session so consumers can show "syncing..." banners
    expect(result.current.wasOffline).toBe(true);
  });

  it("stops the duration ticker after coming back online", () => {
    const { result } = renderHook(() => useNetworkStatus());
    fireNetworkEvent("offline");
    act(() => { vi.advanceTimersByTime(5_000); });
    fireNetworkEvent("online");
    const durationAfterReconnect = result.current.offlineDuration;

    // Advance time further — duration should NOT keep incrementing
    act(() => { vi.advanceTimersByTime(5_000); });
    expect(result.current.offlineDuration).toBe(durationAfterReconnect);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Network Information API
// ─────────────────────────────────────────────────────────────────────────────

describe("useNetworkStatus — Network Information API", () => {
  it("returns connectionType from navigator.connection when available", () => {
    const mockConn = {
      type: "wifi",
      effectiveType: "4g",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      get: () => mockConn,
    });

    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.connectionType).toBe("wifi");
    expect(result.current.effectiveType).toBe("4g");
  });

  it("returns connectionType='unknown' when Network Info API is unsupported", () => {
    const { result } = renderHook(() => useNetworkStatus());
    // navigator.connection is undefined (set in beforeEach)
    expect(result.current.connectionType).toBe("unknown");
    expect(result.current.effectiveType).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Cleanup
// ─────────────────────────────────────────────────────────────────────────────

describe("useNetworkStatus — cleanup", () => {
  it("removes event listeners on unmount", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useNetworkStatus());
    unmount();

    const onlineListeners = removeSpy.mock.calls.filter(([type]) => type === "online");
    const offlineListeners = removeSpy.mock.calls.filter(([type]) => type === "offline");

    expect(onlineListeners.length).toBeGreaterThanOrEqual(1);
    expect(offlineListeners.length).toBeGreaterThanOrEqual(1);
  });

  it("stops the duration ticker on unmount", () => {
    const { result, unmount } = renderHook(() => useNetworkStatus());
    fireNetworkEvent("offline");
    act(() => { vi.advanceTimersByTime(3_000); });

    unmount();
    const durationAtUnmount = result.current.offlineDuration;

    // Advance timers after unmount — should not throw or update
    act(() => { vi.advanceTimersByTime(5_000); });
    expect(result.current.offlineDuration).toBe(durationAtUnmount);
  });
});
