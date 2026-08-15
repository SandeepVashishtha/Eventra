/**
 * useInfiniteScroll.test.mjs
 *
 * Tests for the useInfiniteScroll hook.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import useInfiniteScroll from "../src/hooks/useInfiniteScroll";

// ─────────────────────────────────────────────────────────────────────────────
// Mock IntersectionObserver
// ─────────────────────────────────────────────────────────────────────────────

let observerCallback = null;
const MockIntersectionObserver = vi.fn((callback) => {
  observerCallback = callback;
  return {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  };
});

const triggerIntersection = (isIntersecting = true) => {
  act(() => {
    observerCallback?.([{ isIntersecting }]);
  });
};

beforeEach(() => {
  vi.useFakeTimers();
  observerCallback = null;
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const makeFetchPage = (pages) =>
  vi.fn().mockImplementation(async (page, signal) => {
    if (signal?.aborted) throw Object.assign(new Error("Aborted"), { name: "AbortError" });
    const items = pages[page - 1] ?? [];
    return { items, hasMore: page < pages.length };
  });

// ─────────────────────────────────────────────────────────────────────────────
// Initial load
// ─────────────────────────────────────────────────────────────────────────────

describe("useInfiniteScroll — initial load", () => {
  it("loads page 1 on mount", async () => {
    const fn = makeFetchPage([[{ id: 1 }, { id: 2 }]]);
    const { result } = renderHook(() => useInfiniteScroll(fn));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("sets isLoading=true initially", () => {
    const fn = makeFetchPage([[{ id: 1 }]]);
    const { result } = renderHook(() => useInfiniteScroll(fn));
    expect(result.current.isLoading).toBe(true);
  });

  it("sets isLoading=false after first page loads", async () => {
    const fn = makeFetchPage([[{ id: 1 }]]);
    const { result } = renderHook(() => useInfiniteScroll(fn));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it("sets hasMore=false when only one page exists", async () => {
    const fn = makeFetchPage([[{ id: 1 }]]);
    const { result } = renderHook(() => useInfiniteScroll(fn));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.hasMore).toBe(false);
  });

  it("sets hasMore=true when multiple pages exist", async () => {
    const fn = makeFetchPage([[{ id: 1 }], [{ id: 2 }]]);
    const { result } = renderHook(() => useInfiniteScroll(fn));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.hasMore).toBe(true);
  });

  it("does not fetch when enabled=false", () => {
    const fn = makeFetchPage([[{ id: 1 }]]);
    renderHook(() => useInfiniteScroll(fn, { enabled: false }));
    expect(fn).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Error handling
// ─────────────────────────────────────────────────────────────────────────────

describe("useInfiniteScroll — error handling", () => {
  it("sets error on fetch failure", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => useInfiniteScroll(fn));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe("Network error");
  });

  it("sets hasMore=false on error", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => useInfiniteScroll(fn));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.hasMore).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Scroll-triggered loading
// ─────────────────────────────────────────────────────────────────────────────

describe("useInfiniteScroll — scroll trigger", () => {
  it("loads next page when sentinel intersects", async () => {
    const fn = makeFetchPage([[{ id: 1 }], [{ id: 2 }]]);
    const { result } = renderHook(() => useInfiniteScroll(fn));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    triggerIntersection(true);
    await waitFor(() => expect(result.current.isLoadingMore).toBe(false));

    expect(result.current.data).toEqual([{ id: 1 }, { id: 2 }]);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("does not trigger next page when not intersecting", async () => {
    const fn = makeFetchPage([[{ id: 1 }], [{ id: 2 }]]);
    renderHook(() => useInfiniteScroll(fn));
    await waitFor(() => expect(fn).toHaveBeenCalledTimes(1));

    triggerIntersection(false);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("does not trigger next page when hasMore=false", async () => {
    const fn = makeFetchPage([[{ id: 1 }]]); // only 1 page
    renderHook(() => useInfiniteScroll(fn));
    await waitFor(() => expect(fn).toHaveBeenCalledTimes(1));

    triggerIntersection(true);
    expect(fn).toHaveBeenCalledTimes(1); // no additional fetch
  });

  it("sets isLoadingMore=true during next page fetch", async () => {
    let resolve;
    const fn = vi.fn()
      .mockResolvedValueOnce({ items: [{ id: 1 }], hasMore: true })
      .mockImplementationOnce(() => new Promise((r) => { resolve = r; }));

    const { result } = renderHook(() => useInfiniteScroll(fn));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    triggerIntersection(true);
    expect(result.current.isLoadingMore).toBe(true);

    act(() => resolve({ items: [{ id: 2 }], hasMore: false }));
    await waitFor(() => expect(result.current.isLoadingMore).toBe(false));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Reset
// ─────────────────────────────────────────────────────────────────────────────

describe("useInfiniteScroll — reset", () => {
  it("reset() clears data and reloads from page 1", async () => {
    const fn = makeFetchPage([[{ id: 1 }], [{ id: 2 }]]);
    const { result } = renderHook(() => useInfiniteScroll(fn));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    triggerIntersection(true);
    await waitFor(() => expect(result.current.data).toHaveLength(2));

    act(() => result.current.reset());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual([{ id: 1 }]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Cleanup
// ─────────────────────────────────────────────────────────────────────────────

describe("useInfiniteScroll — cleanup", () => {
  it("disconnects IntersectionObserver on unmount", () => {
    const fn = makeFetchPage([[{ id: 1 }]]);
    const { unmount } = renderHook(() => useInfiniteScroll(fn));
    const observer = MockIntersectionObserver.mock.results[0]?.value;
    unmount();
    expect(observer?.disconnect).toHaveBeenCalled();
  });

  it("aborts in-flight request on unmount", async () => {
    let capturedSignal;
    const fn = vi.fn().mockImplementation(async (page, signal) => {
      capturedSignal = signal;
      await new Promise(() => {}); // never resolves
    });

    const { unmount } = renderHook(() => useInfiniteScroll(fn));
    unmount();
    expect(capturedSignal?.aborted).toBe(true);
  });
});
