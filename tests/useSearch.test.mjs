/**
 * useSearch.test.mjs
 *
 * Tests for the useSearch hook.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import useSearch from "../src/hooks/useSearch";

vi.mock("../src/utils/inputSanitization", () => ({
  prepareSafeSearchQuery: (v) => v?.trim().replace(/<[^>]*>/g, "") ?? "",
}));

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={["/"]}>{children}</MemoryRouter>
);

beforeEach(() => {
  vi.useFakeTimers();
  sessionStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  sessionStorage.clear();
});

// ─────────────────────────────────────────────────────────────────────────────
// Initial state
// ─────────────────────────────────────────────────────────────────────────────

describe("useSearch — initial state", () => {
  it("initializes with empty query", () => {
    const { result } = renderHook(() => useSearch(), { wrapper });
    expect(result.current.query).toBe("");
    expect(result.current.debouncedQuery).toBe("");
    expect(result.current.isSearching).toBe(false);
  });

  it("initializes with URL param when syncUrl=true", () => {
    const customWrapper = ({ children }) => (
      <MemoryRouter initialEntries={["/?q=react"]}>{children}</MemoryRouter>
    );
    const { result } = renderHook(() => useSearch({ urlParam: "q" }), {
      wrapper: customWrapper,
    });
    expect(result.current.query).toBe("react");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// setQuery and debounce
// ─────────────────────────────────────────────────────────────────────────────

describe("useSearch — setQuery", () => {
  it("updates query immediately", () => {
    const { result } = renderHook(() => useSearch(), { wrapper });
    act(() => { result.current.setQuery("hello"); });
    expect(result.current.query).toBe("hello");
  });

  it("sets isSearching=true immediately", () => {
    const { result } = renderHook(() => useSearch(), { wrapper });
    act(() => { result.current.setQuery("hello"); });
    expect(result.current.isSearching).toBe(true);
  });

  it("updates debouncedQuery after debounceMs", () => {
    const { result } = renderHook(() => useSearch({ debounceMs: 300 }), { wrapper });
    act(() => { result.current.setQuery("hello"); });
    expect(result.current.debouncedQuery).toBe("");
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current.debouncedQuery).toBe("hello");
  });

  it("sets isSearching=false after debounce", () => {
    const { result } = renderHook(() => useSearch({ debounceMs: 300 }), { wrapper });
    act(() => { result.current.setQuery("hello"); });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current.isSearching).toBe(false);
  });

  it("debounces rapid input — only fires once", () => {
    const { result } = renderHook(() => useSearch({ debounceMs: 300 }), { wrapper });
    act(() => { result.current.setQuery("h"); });
    act(() => { result.current.setQuery("he"); });
    act(() => { result.current.setQuery("hel"); });
    act(() => { result.current.setQuery("hell"); });
    act(() => { result.current.setQuery("hello"); });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current.debouncedQuery).toBe("hello");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Sanitization
// ─────────────────────────────────────────────────────────────────────────────

describe("useSearch — sanitization", () => {
  it("strips XSS from debouncedQuery", () => {
    const { result } = renderHook(() => useSearch({ sanitize: true }), { wrapper });
    act(() => { result.current.setQuery("<script>alert(1)</script>search"); });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current.debouncedQuery).not.toContain("<script>");
  });

  it("skips sanitization when sanitize=false", () => {
    const { result } = renderHook(() => useSearch({ sanitize: false }), { wrapper });
    act(() => { result.current.setQuery("  raw query  "); });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current.debouncedQuery).toBe("  raw query  ");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Search history
// ─────────────────────────────────────────────────────────────────────────────

describe("useSearch — history", () => {
  it("saves search term to history after debounce", () => {
    const { result } = renderHook(() =>
      useSearch({ historyKey: "test-history", historySize: 5 }),
      { wrapper }
    );
    act(() => { result.current.setQuery("react hooks"); });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current.history).toContain("react hooks");
  });

  it("does not save empty query to history", () => {
    const { result } = renderHook(() =>
      useSearch({ historyKey: "test-history2" }),
      { wrapper }
    );
    act(() => { result.current.setQuery(""); });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current.history).toHaveLength(0);
  });

  it("deduplicates history entries", () => {
    const { result } = renderHook(() =>
      useSearch({ historyKey: "test-history3", historySize: 5 }),
      { wrapper }
    );
    act(() => { result.current.setQuery("react"); });
    act(() => { vi.advanceTimersByTime(300); });
    act(() => { result.current.setQuery("vue"); });
    act(() => { vi.advanceTimersByTime(300); });
    act(() => { result.current.setQuery("react"); });
    act(() => { vi.advanceTimersByTime(300); });
    const reactCount = result.current.history.filter((h) => h === "react").length;
    expect(reactCount).toBe(1);
  });

  it("respects historySize limit", () => {
    const { result } = renderHook(() =>
      useSearch({ historyKey: "test-history4", historySize: 3 }),
      { wrapper }
    );
    for (const term of ["a", "b", "c", "d"]) {
      act(() => { result.current.setQuery(term); });
      act(() => { vi.advanceTimersByTime(300); });
    }
    expect(result.current.history.length).toBeLessThanOrEqual(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// clear()
// ─────────────────────────────────────────────────────────────────────────────

describe("useSearch — clear", () => {
  it("clears query and debouncedQuery", () => {
    const { result } = renderHook(() => useSearch(), { wrapper });
    act(() => { result.current.setQuery("hello"); });
    act(() => { vi.advanceTimersByTime(300); });
    act(() => { result.current.clear(); });
    expect(result.current.query).toBe("");
    expect(result.current.debouncedQuery).toBe("");
  });

  it("sets isSearching=false on clear", () => {
    const { result } = renderHook(() => useSearch(), { wrapper });
    act(() => { result.current.setQuery("hello"); });
    act(() => { result.current.clear(); });
    expect(result.current.isSearching).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Cleanup
// ─────────────────────────────────────────────────────────────────────────────

describe("useSearch — cleanup", () => {
  it("cancels pending debounce on unmount", () => {
    const clearSpy = vi.spyOn(global, "clearTimeout");
    const { result, unmount } = renderHook(() => useSearch(), { wrapper });
    act(() => { result.current.setQuery("hello"); });
    unmount();
    expect(clearSpy).toHaveBeenCalled();
  });
});
