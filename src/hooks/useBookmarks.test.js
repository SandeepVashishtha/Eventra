import { renderHook, act } from "@testing-library/react";
import useBookmarks, { _cache } from "./useBookmarks";
import { safeJsonParse } from "../utils/safeJsonParse";

jest.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    token: null,
    user: null,
    isAuthenticated: false,
    loading: false,
  }),
}));

const makeEvent = (id, title = `Event ${id}`) => ({ id, title, date: "2025-10-01" });

const hashUserId = (userId) => {
  if (!userId || userId === "guest") return "guest";
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const chr = userId.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
};

describe("useBookmarks", () => {
  beforeEach(() => {
    localStorage.clear();
    _cache?.clear();
  });

  // ─── Initial state ──────────────────────────────────────────────────────────

  it("initialises with an empty bookmarks list for a new userId", () => {
    const { result } = renderHook(() => useBookmarks("user-1"));
    expect(result.current.bookmarks).toEqual([]);
  });

  it("loads pre-existing bookmarks from localStorage on mount", () => {
    const existing = [makeEvent(10)];
    localStorage.setItem(`bookmarks_${hashUserId("user-2")}`, JSON.stringify(existing));

    const { result } = renderHook(() => useBookmarks("user-2"));
    expect(result.current.bookmarks).toHaveLength(1);
    expect(result.current.bookmarks[0].id).toBe(10);
  });

  it("defaults to userId 'guest' when no argument is supplied", () => {
    const { result } = renderHook(() => useBookmarks());
    expect(result.current.bookmarks).toEqual([]);
    // Sanity: key must contain 'guest'
    act(() => {
      result.current.toggleBookmark(makeEvent(1));
    });
    expect(localStorage.getItem("bookmarks_guest")).not.toBeNull();
  });

  // ─── toggleBookmark ─────────────────────────────────────────────────────────

  it("toggleBookmark adds an event that is not yet bookmarked", () => {
    const { result } = renderHook(() => useBookmarks("user-3"));

    act(() => {
      result.current.toggleBookmark(makeEvent(1));
    });

    expect(result.current.bookmarks).toHaveLength(1);
    expect(result.current.bookmarks[0].id).toBe(1);
  });

  it("toggleBookmark removes an event that is already bookmarked", () => {
    const { result } = renderHook(() => useBookmarks("user-4"));

    act(() => {
      result.current.toggleBookmark(makeEvent(2));
    });
    act(() => {
      result.current.toggleBookmark(makeEvent(2));
    });

    expect(result.current.bookmarks).toEqual([]);
  });

  it("toggleBookmark stamps a savedAt timestamp on newly added bookmarks", () => {
    const before = Date.now();
    const { result } = renderHook(() => useBookmarks("user-5"));

    act(() => {
      result.current.toggleBookmark(makeEvent(3));
    });

    const { savedAt } = result.current.bookmarks[0];
    expect(savedAt).toBeGreaterThanOrEqual(before);
    expect(savedAt).toBeLessThanOrEqual(Date.now());
  });

  it("toggleBookmark does not mutate other bookmarks when removing one", () => {
    const { result } = renderHook(() => useBookmarks("user-6"));

    act(() => {
      result.current.toggleBookmark(makeEvent(1));
      result.current.toggleBookmark(makeEvent(2));
      result.current.toggleBookmark(makeEvent(3));
    });
    act(() => {
      result.current.toggleBookmark(makeEvent(2));
    });

    const ids = result.current.bookmarks.map((e) => e.id);
    expect(ids).toContain(1);
    expect(ids).toContain(3);
    expect(ids).not.toContain(2);
  });

  // ─── isBookmarked ───────────────────────────────────────────────────────────

  it("isBookmarked returns true for a bookmarked event", () => {
    const { result } = renderHook(() => useBookmarks("user-7"));

    act(() => {
      result.current.toggleBookmark(makeEvent(99));
    });

    expect(result.current.isBookmarked(99)).toBe(true);
  });

  it("isBookmarked returns false for an event that has not been bookmarked", () => {
    const { result } = renderHook(() => useBookmarks("user-8"));
    expect(result.current.isBookmarked(404)).toBe(false);
  });

  it("isBookmarked returns false after the event is un-bookmarked", () => {
    const { result } = renderHook(() => useBookmarks("user-9"));

    act(() => {
      result.current.toggleBookmark(makeEvent(7));
    });
    act(() => {
      result.current.toggleBookmark(makeEvent(7));
    });

    expect(result.current.isBookmarked(7)).toBe(false);
  });

  // ─── Persistence ────────────────────────────────────────────────────────────

  it("persists bookmarks to localStorage when the list changes", () => {
    const { result } = renderHook(() => useBookmarks("user-10"));

    act(() => {
      result.current.toggleBookmark(makeEvent(55));
    });

    const stored = safeJsonParse(localStorage.getItem(`bookmarks_${hashUserId("user-10")}`), []);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(55);
  });

  it("isolates bookmarks per userId — different users do not share data", () => {
    const { result: resultA } = renderHook(() => useBookmarks("alice"));
    const { result: resultB } = renderHook(() => useBookmarks("bob"));

    act(() => {
      resultA.current.toggleBookmark(makeEvent(1));
    });

    expect(resultB.current.bookmarks).toHaveLength(0);
  });

  it("recovers gracefully when localStorage contains corrupt data", () => {
    localStorage.setItem("bookmarks_corrupt-user", "this is not json!!!");
    const { result } = renderHook(() => useBookmarks("corrupt-user"));
    expect(result.current.bookmarks).toEqual([]);
  });
});
