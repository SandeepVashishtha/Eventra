/**
 * usePaginatedFetch.test.mjs
 *
 * Tests for the usePaginatedFetch hook.
 * Covers: basic fetch, loading state, error handling, pagination,
 * AbortController cleanup, retry logic, and refetch.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import usePaginatedFetch from "../src/hooks/usePaginatedFetch";

// ─────────────────────────────────────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const mockFetch = (data, delay = 0) =>
  vi.fn().mockImplementation(async (signal) => {
    if (delay) await new Promise((r) => setTimeout(r, delay));
    if (signal?.aborted) throw Object.assign(new Error("Aborted"), { name: "AbortError" });
    return { data };
  });

// ─────────────────────────────────────────────────────────────────────────────
// Basic fetch
// ─────────────────────────────────────────────────────────────────────────────

describe("usePaginatedFetch — basic fetch", () => {
  it("returns data after successful fetch", async () => {
    const fn = mockFetch([{ id: 1 }, { id: 2 }]);
    const { result } = renderHook(() => usePaginatedFetch(fn));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([{ id: 1 }, { id: 2 }]);
    expect(result.current.error).toBe(null);
  });

  it("sets isLoading=true initially", () => {
    const fn = mockFetch([], 500);
    const { result } = renderHook(() => usePaginatedFetch(fn));
    expect(result.current.isLoading).toBe(true);
  });

  it("sets isLoading=false after fetch resolves", async () => {
    const fn = mockFetch([]);
    const { result } = renderHook(() => usePaginatedFetch(fn));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it("does not fetch when enabled=false", async () => {
    const fn = mockFetch([]);
    const { result } = renderHook(() =>
      usePaginatedFetch(fn, { enabled: false })
    );
    await act(async () => {});
    expect(fn).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Error handling
// ─────────────────────────────────────────────────────────────────────────────

describe("usePaginatedFetch — error handling", () => {
  it("sets error when fetch throws", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("Network failure"));
    const { result } = renderHook(() => usePaginatedFetch(fn));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe("Network failure");
  });

  it("preserves previous data on error", async () => {
    const fn = vi.fn()
      .mockResolvedValueOnce({ data: [{ id: 1 }] })
      .mockRejectedValueOnce(new Error("Failed"));

    const { result } = renderHook(() => usePaginatedFetch(fn));
    await waitFor(() => expect(result.current.data).toEqual([{ id: 1 }]));

    act(() => result.current.refetch());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Previous data should still be visible during error
    expect(result.current.data).toEqual([{ id: 1 }]);
    expect(result.current.error).toBe("Failed");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Retry logic
// ─────────────────────────────────────────────────────────────────────────────

describe("usePaginatedFetch — retry", () => {
  it("retries up to maxRetries times on failure", async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error("fail 1"))
      .mockRejectedValueOnce(new Error("fail 2"))
      .mockResolvedValueOnce({ data: [{ id: 1 }] });

    const { result } = renderHook(() =>
      usePaginatedFetch(fn, { maxRetries: 2, retryBaseMs: 100 })
    );

    // Advance through retry delays
    await act(async () => { vi.advanceTimersByTime(100); });
    await act(async () => { vi.advanceTimersByTime(200); });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fn).toHaveBeenCalledTimes(3);
    expect(result.current.data).toEqual([{ id: 1 }]);
    expect(result.current.error).toBe(null);
  });

  it("sets error after all retries exhausted", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("persistent failure"));
    const { result } = renderHook(() =>
      usePaginatedFetch(fn, { maxRetries: 2, retryBaseMs: 100 })
    );
    await act(async () => { vi.advanceTimersByTime(100); });
    await act(async () => { vi.advanceTimersByTime(200); });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe("persistent failure");
    expect(fn).toHaveBeenCalledTimes(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────────────────────────────────────

describe("usePaginatedFetch — pagination", () => {
  it("passes page and perPage to fetchFn", async () => {
    const fn = mockFetch({ content: [], totalPages: 5, totalElements: 100 });
    renderHook(() =>
      usePaginatedFetch(fn, { paginated: true, initialPage: 2, initialPerPage: 10 })
    );
    await act(async () => {});
    expect(fn).toHaveBeenCalledWith(expect.any(AbortSignal), 2, 10);
  });

  it("updates totalPages from response", async () => {
    const fn = mockFetch({ content: [], totalPages: 7, totalElements: 140 });
    const { result } = renderHook(() =>
      usePaginatedFetch(fn, { paginated: true })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.totalPages).toBe(7);
    expect(result.current.totalElements).toBe(140);
  });

  it("refetches when setPage is called", async () => {
    const fn = mockFetch({ content: [] });
    const { result } = renderHook(() =>
      usePaginatedFetch(fn, { paginated: true })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.setPage(3));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith(expect.any(AbortSignal), 3, 20);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AbortController cleanup
// ─────────────────────────────────────────────────────────────────────────────

describe("usePaginatedFetch — cleanup", () => {
  it("aborts in-flight request on unmount", async () => {
    let capturedSignal;
    const fn = vi.fn().mockImplementation(async (signal) => {
      capturedSignal = signal;
      await new Promise((r) => setTimeout(r, 1000));
      return { data: [] };
    });

    const { unmount } = renderHook(() => usePaginatedFetch(fn));
    unmount();

    expect(capturedSignal?.aborted).toBe(true);
  });

  it("does not update state after unmount", async () => {
    const fn = mockFetch([], 500);
    const { result, unmount } = renderHook(() => usePaginatedFetch(fn));
    unmount();
    await act(async () => { vi.advanceTimersByTime(500); });
    // No setState calls should fire — no errors thrown
    expect(result.current.isLoading).toBe(true); // state frozen at unmount
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// refetch
// ─────────────────────────────────────────────────────────────────────────────

describe("usePaginatedFetch — refetch", () => {
  it("re-runs fetchFn when refetch is called", async () => {
    const fn = mockFetch([{ id: 1 }]);
    const { result } = renderHook(() => usePaginatedFetch(fn));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.refetch());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
