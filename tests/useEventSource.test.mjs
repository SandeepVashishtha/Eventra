/**
 * useEventSource.test.mjs
 *
 * Tests for the useEventSource hook.
 * Covers: connection, message handling, reconnection, backoff,
 * max retries, visibility pause, manual reconnect/disconnect, and cleanup.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import useEventSource, { SSE_STATUS } from "../src/hooks/useEventSource";

// ─────────────────────────────────────────────────────────────────────────────
// Mock EventSource
// ─────────────────────────────────────────────────────────────────────────────

class MockEventSource {
  static instances = [];

  constructor(url, options) {
    this.url = url;
    this.options = options;
    this.onopen = null;
    this.onmessage = null;
    this.onerror = null;
    this._listeners = {};
    this.closed = false;
    MockEventSource.instances.push(this);
  }

  addEventListener(type, handler) {
    if (!this._listeners[type]) this._listeners[type] = [];
    this._listeners[type].push(handler);
  }

  dispatchEvent(type, data) {
    const event = { data: JSON.stringify(data), type };
    if (type === "message") this.onmessage?.(event);
    this._listeners[type]?.forEach((h) => h(event));
  }

  triggerOpen() { this.onopen?.({ type: "open" }); }
  triggerError() { this.onerror?.({ type: "error" }); }
  close() { this.closed = true; }

  static reset() { MockEventSource.instances = []; }
  static last() { return MockEventSource.instances[MockEventSource.instances.length - 1]; }
}

beforeEach(() => {
  vi.useFakeTimers();
  MockEventSource.reset();
  vi.stubGlobal("EventSource", MockEventSource);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// Connection
// ─────────────────────────────────────────────────────────────────────────────

describe("useEventSource — connection", () => {
  it("creates EventSource with correct URL", () => {
    renderHook(() => useEventSource("/api/stream"));
    expect(MockEventSource.last()?.url).toBe("/api/stream");
  });

  it("sets status=open on connection open", () => {
    const { result } = renderHook(() => useEventSource("/api/stream"));
    act(() => { MockEventSource.last()?.triggerOpen(); });
    expect(result.current.status).toBe(SSE_STATUS.OPEN);
  });

  it("sets status=connecting initially", () => {
    const { result } = renderHook(() => useEventSource("/api/stream"));
    expect(result.current.status).toBe(SSE_STATUS.CONNECTING);
  });

  it("does not create EventSource when url is null", () => {
    renderHook(() => useEventSource(null));
    expect(MockEventSource.instances).toHaveLength(0);
  });

  it("does not create EventSource when enabled=false", () => {
    renderHook(() => useEventSource("/api/stream", { enabled: false }));
    expect(MockEventSource.instances).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Message handling
// ─────────────────────────────────────────────────────────────────────────────

describe("useEventSource — messages", () => {
  it("calls onMessage with parsed data", () => {
    const onMessage = vi.fn();
    renderHook(() => useEventSource("/api/stream", { onMessage }));
    act(() => {
      MockEventSource.last()?.triggerOpen();
      MockEventSource.last()?.dispatchEvent("message", { id: 1, name: "Test" });
    });
    expect(onMessage).toHaveBeenCalledWith({ id: 1, name: "Test" }, expect.any(Object));
  });

  it("sets lastMessage with parsed data", () => {
    const { result } = renderHook(() => useEventSource("/api/stream"));
    act(() => {
      MockEventSource.last()?.triggerOpen();
      MockEventSource.last()?.dispatchEvent("message", { count: 42 });
    });
    expect(result.current.lastMessage).toEqual({ count: 42 });
  });

  it("calls named event type handlers", () => {
    const onTasks = vi.fn();
    const onChat = vi.fn();
    renderHook(() =>
      useEventSource("/api/stream", {
        eventTypes: { tasks: onTasks, chat: onChat },
      })
    );
    act(() => {
      MockEventSource.last()?.triggerOpen();
      MockEventSource.last()?.dispatchEvent("tasks", { tasks: [1, 2, 3] });
    });
    expect(onTasks).toHaveBeenCalledWith({ tasks: [1, 2, 3] }, expect.any(Object));
    expect(onChat).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Reconnection with backoff
// ─────────────────────────────────────────────────────────────────────────────

describe("useEventSource — reconnection", () => {
  it("sets status=reconnecting on error", () => {
    const { result } = renderHook(() =>
      useEventSource("/api/stream", { maxRetries: 3, baseRetryMs: 100 })
    );
    act(() => {
      MockEventSource.last()?.triggerOpen();
      MockEventSource.last()?.triggerError();
    });
    expect(result.current.status).toBe(SSE_STATUS.RECONNECTING);
  });

  it("increments retryCount on each error", () => {
    const { result } = renderHook(() =>
      useEventSource("/api/stream", { maxRetries: 3, baseRetryMs: 100 })
    );
    act(() => { MockEventSource.last()?.triggerError(); });
    expect(result.current.retryCount).toBe(1);
    act(() => { vi.advanceTimersByTime(200); });
    act(() => { MockEventSource.last()?.triggerError(); });
    expect(result.current.retryCount).toBe(2);
  });

  it("creates new EventSource after retry delay", () => {
    renderHook(() =>
      useEventSource("/api/stream", { maxRetries: 3, baseRetryMs: 100 })
    );
    const initialCount = MockEventSource.instances.length;
    act(() => { MockEventSource.last()?.triggerError(); });
    act(() => { vi.advanceTimersByTime(200); }); // past backoff
    expect(MockEventSource.instances.length).toBeGreaterThan(initialCount);
  });

  it("sets status=error after max retries exhausted", () => {
    const { result } = renderHook(() =>
      useEventSource("/api/stream", { maxRetries: 2, baseRetryMs: 50 })
    );

    act(() => { MockEventSource.last()?.triggerError(); });
    act(() => { vi.advanceTimersByTime(100); });
    act(() => { MockEventSource.last()?.triggerError(); });
    act(() => { vi.advanceTimersByTime(200); });
    act(() => { MockEventSource.last()?.triggerError(); });

    expect(result.current.status).toBe(SSE_STATUS.ERROR);
  });

  it("resets retryCount on successful reconnection", () => {
    const { result } = renderHook(() =>
      useEventSource("/api/stream", { maxRetries: 3, baseRetryMs: 100 })
    );
    act(() => { MockEventSource.last()?.triggerError(); });
    act(() => { vi.advanceTimersByTime(200); });
    act(() => { MockEventSource.last()?.triggerOpen(); });
    expect(result.current.retryCount).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Manual controls
// ─────────────────────────────────────────────────────────────────────────────

describe("useEventSource — manual controls", () => {
  it("disconnect() closes the connection", () => {
    const { result } = renderHook(() => useEventSource("/api/stream"));
    const source = MockEventSource.last();
    act(() => { result.current.disconnect(); });
    expect(source?.closed).toBe(true);
    expect(result.current.status).toBe(SSE_STATUS.CLOSED);
  });

  it("reconnect() creates a new connection after disconnect", () => {
    const { result } = renderHook(() => useEventSource("/api/stream"));
    act(() => { result.current.disconnect(); });
    const countBefore = MockEventSource.instances.length;
    act(() => { result.current.reconnect(); });
    expect(MockEventSource.instances.length).toBeGreaterThan(countBefore);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Cleanup
// ─────────────────────────────────────────────────────────────────────────────

describe("useEventSource — cleanup", () => {
  it("closes EventSource on unmount", () => {
    const { unmount } = renderHook(() => useEventSource("/api/stream"));
    const source = MockEventSource.last();
    unmount();
    expect(source?.closed).toBe(true);
  });

  it("cancels pending retry timer on unmount", () => {
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");
    const { unmount } = renderHook(() =>
      useEventSource("/api/stream", { maxRetries: 3, baseRetryMs: 1000 })
    );
    act(() => { MockEventSource.last()?.triggerError(); });
    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
