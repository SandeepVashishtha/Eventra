import { renderHook, act } from "@testing-library/react";
import useRecentlyViewed from "./useRecentlyViewed";

const STORAGE_KEY = "eventra_recently_viewed";

const mockEvent = (id, title = `Event ${id}`) => ({
  id,
  title,
  date: "2025-09-01",
  location: "Mumbai",
  category: "Tech",
});

describe("useRecentlyViewed", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initialises with an empty list when localStorage is empty", () => {
    const { result } = renderHook(() => useRecentlyViewed());
    expect(result.current.recentlyViewed).toEqual([]);
  });

  it("loads persisted events from localStorage on mount", () => {
    const stored = [mockEvent(1), mockEvent(2)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    const { result } = renderHook(() => useRecentlyViewed());
    expect(result.current.recentlyViewed).toEqual(stored);
  });

  it("addRecentlyViewed prepends a new event to the list", () => {
    const { result } = renderHook(() => useRecentlyViewed());

    act(() => {
      result.current.addRecentlyViewed(mockEvent(1));
    });
    act(() => {
      result.current.addRecentlyViewed(mockEvent(2));
    });

    expect(result.current.recentlyViewed[0].id).toBe(2);
    expect(result.current.recentlyViewed[1].id).toBe(1);
  });

  it("moves a duplicate event to the front instead of creating a second entry", () => {
    const { result } = renderHook(() => useRecentlyViewed());

    act(() => {
      result.current.addRecentlyViewed(mockEvent(1));
      result.current.addRecentlyViewed(mockEvent(2));
      result.current.addRecentlyViewed(mockEvent(1)); // duplicate
    });

    expect(result.current.recentlyViewed.length).toBe(2);
    expect(result.current.recentlyViewed[0].id).toBe(1);
  });

  it("caps the list at MAX_ITEMS (10) entries", () => {
    const { result } = renderHook(() => useRecentlyViewed());

    act(() => {
      for (let i = 1; i <= 12; i++) {
        result.current.addRecentlyViewed(mockEvent(i));
      }
    });

    expect(result.current.recentlyViewed.length).toBe(10);
    // Most-recently added should be at the front
    expect(result.current.recentlyViewed[0].id).toBe(12);
  });

  it("ignores addRecentlyViewed calls with null or missing id", () => {
    const { result } = renderHook(() => useRecentlyViewed());

    act(() => {
      result.current.addRecentlyViewed(null);
      result.current.addRecentlyViewed({ title: "No ID" });
    });

    expect(result.current.recentlyViewed).toEqual([]);
  });

  it("removeRecentlyViewed removes the specific event by id", () => {
    const { result } = renderHook(() => useRecentlyViewed());

    act(() => {
      result.current.addRecentlyViewed(mockEvent(1));
      result.current.addRecentlyViewed(mockEvent(2));
      result.current.addRecentlyViewed(mockEvent(3));
    });
    act(() => {
      result.current.removeRecentlyViewed(2);
    });

    const ids = result.current.recentlyViewed.map((e) => e.id);
    expect(ids).not.toContain(2);
    expect(ids).toContain(1);
    expect(ids).toContain(3);
  });

  it("removeRecentlyViewed is a no-op when the id is not in the list", () => {
    const { result } = renderHook(() => useRecentlyViewed());

    act(() => {
      result.current.addRecentlyViewed(mockEvent(1));
    });
    act(() => {
      result.current.removeRecentlyViewed(999);
    });

    expect(result.current.recentlyViewed.length).toBe(1);
  });

  it("clearHistory empties the list and removes the localStorage entry", () => {
    const { result } = renderHook(() => useRecentlyViewed());

    act(() => {
      result.current.addRecentlyViewed(mockEvent(1));
      result.current.addRecentlyViewed(mockEvent(2));
    });
    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.recentlyViewed).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("persists state to localStorage whenever the list changes", () => {
    const { result } = renderHook(() => useRecentlyViewed());

    act(() => {
      result.current.addRecentlyViewed(mockEvent(5));
    });

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(5);
  });

  it("recovers gracefully when localStorage contains invalid JSON", () => {
    localStorage.setItem(STORAGE_KEY, "{ this is not valid json }}}");

    // Should not throw and should fall back to an empty list
    const { result } = renderHook(() => useRecentlyViewed());
    expect(Array.isArray(result.current.recentlyViewed)).toBe(true);
  });
});
