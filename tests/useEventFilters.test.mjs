/**
 * useEventFilters.test.mjs
 *
 * Tests for the centralised useEventFilters hook.
 * Covers: initialization from URL, storage fallback, defaults,
 * setFilter, resetFilters, URL sync, and debounced search.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import useEventFilters from "../src/hooks/useEventFilters";

// ─────────────────────────────────────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "test-filters-v1";

const DEFAULTS = {
  search: "",
  category: "all",
  sort: "Newest",
  page: 1,
};

const wrapper = ({ children, initialEntries = ["/"] }) => (
  <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
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
// Initial state — defaults
// ─────────────────────────────────────────────────────────────────────────────

describe("useEventFilters — defaults", () => {
  it("initializes with default values when URL and storage are empty", () => {
    const { result } = renderHook(
      () => useEventFilters({ storageKey: STORAGE_KEY, defaults: DEFAULTS }),
      { wrapper }
    );
    expect(result.current.filters.category).toBe("all");
    expect(result.current.filters.sort).toBe("Newest");
    expect(result.current.filters.page).toBe(1);
  });

  it("sets isHydrated=true after initialization", async () => {
    const { result } = renderHook(
      () => useEventFilters({ storageKey: STORAGE_KEY, defaults: DEFAULTS }),
      { wrapper }
    );
    await act(async () => {});
    expect(result.current.isHydrated).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// URL param initialization
// ─────────────────────────────────────────────────────────────────────────────

describe("useEventFilters — URL params", () => {
  it("reads category from URL params on mount", async () => {
    const { result } = renderHook(
      () => useEventFilters({ storageKey: STORAGE_KEY, defaults: DEFAULTS }),
      {
        wrapper: ({ children }) => (
          <MemoryRouter initialEntries={["/?category=hackathon"]}>
            {children}
          </MemoryRouter>
        ),
      }
    );
    await act(async () => {});
    expect(result.current.filters.category).toBe("hackathon");
  });

  it("reads sort from URL params on mount", async () => {
    const { result } = renderHook(
      () => useEventFilters({ storageKey: STORAGE_KEY, defaults: DEFAULTS }),
      {
        wrapper: ({ children }) => (
          <MemoryRouter initialEntries={["/?sort=Oldest"]}>
            {children}
          </MemoryRouter>
        ),
      }
    );
    await act(async () => {});
    expect(result.current.filters.sort).toBe("Oldest");
  });

  it("parses numeric page from URL params", async () => {
    const { result } = renderHook(
      () => useEventFilters({ storageKey: STORAGE_KEY, defaults: DEFAULTS }),
      {
        wrapper: ({ children }) => (
          <MemoryRouter initialEntries={["/?page=3"]}>
            {children}
          </MemoryRouter>
        ),
      }
    );
    await act(async () => {});
    expect(result.current.filters.page).toBe(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// sessionStorage fallback
// ─────────────────────────────────────────────────────────────────────────────

describe("useEventFilters — storage fallback", () => {
  it("reads from sessionStorage when URL param is absent", async () => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ category: "conference", sort: "Newest", search: "", page: 1 }));
    const { result } = renderHook(
      () => useEventFilters({ storageKey: STORAGE_KEY, defaults: DEFAULTS }),
      { wrapper }
    );
    await act(async () => {});
    expect(result.current.filters.category).toBe("conference");
  });

  it("URL param takes priority over storage", async () => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ category: "conference" }));
    const { result } = renderHook(
      () => useEventFilters({ storageKey: STORAGE_KEY, defaults: DEFAULTS }),
      {
        wrapper: ({ children }) => (
          <MemoryRouter initialEntries={["/?category=hackathon"]}>
            {children}
          </MemoryRouter>
        ),
      }
    );
    await act(async () => {});
    expect(result.current.filters.category).toBe("hackathon");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// setFilter
// ─────────────────────────────────────────────────────────────────────────────

describe("useEventFilters — setFilter", () => {
  it("updates a single filter value", async () => {
    const { result } = renderHook(
      () => useEventFilters({ storageKey: STORAGE_KEY, defaults: DEFAULTS }),
      { wrapper }
    );
    await act(async () => {});
    act(() => { result.current.setFilter("category", "hackathon"); });
    expect(result.current.filters.category).toBe("hackathon");
  });

  it("updates multiple filters at once via object", async () => {
    const { result } = renderHook(
      () => useEventFilters({ storageKey: STORAGE_KEY, defaults: DEFAULTS }),
      { wrapper }
    );
    await act(async () => {});
    act(() => {
      result.current.setFilter({ category: "hackathon", sort: "Oldest" });
    });
    expect(result.current.filters.category).toBe("hackathon");
    expect(result.current.filters.sort).toBe("Oldest");
  });

  it("persists to sessionStorage after setFilter", async () => {
    const { result } = renderHook(
      () => useEventFilters({ storageKey: STORAGE_KEY, defaults: DEFAULTS }),
      { wrapper }
    );
    await act(async () => {});
    act(() => { result.current.setFilter("category", "workshop"); });
    await act(async () => {});
    const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}");
    expect(stored.category).toBe("workshop");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// resetFilters
// ─────────────────────────────────────────────────────────────────────────────

describe("useEventFilters — resetFilters", () => {
  it("resets all filters to defaults", async () => {
    const { result } = renderHook(
      () => useEventFilters({ storageKey: STORAGE_KEY, defaults: DEFAULTS }),
      { wrapper }
    );
    await act(async () => {});
    act(() => { result.current.setFilter("category", "hackathon"); });
    act(() => { result.current.resetFilters(); });
    expect(result.current.filters.category).toBe("all");
    expect(result.current.filters.sort).toBe("Newest");
  });

  it("clears sessionStorage on reset", async () => {
    const { result } = renderHook(
      () => useEventFilters({ storageKey: STORAGE_KEY, defaults: DEFAULTS }),
      { wrapper }
    );
    await act(async () => {});
    act(() => { result.current.setFilter("category", "hackathon"); });
    act(() => { result.current.resetFilters(); });
    await act(async () => {});
    const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}");
    expect(stored.category).toBe("all");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Debounced search
// ─────────────────────────────────────────────────────────────────────────────

describe("useEventFilters — debouncedSearch", () => {
  it("debounces search input", async () => {
    const { result } = renderHook(
      () => useEventFilters({ storageKey: STORAGE_KEY, defaults: DEFAULTS, debounceMs: 300 }),
      { wrapper }
    );
    await act(async () => {});
    act(() => { result.current.setFilter("search", "react"); });
    expect(result.current.debouncedSearch).toBe("");
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current.debouncedSearch).toBe("react");
  });
});
