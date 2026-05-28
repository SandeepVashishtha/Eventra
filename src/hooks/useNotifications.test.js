import { renderHook, act, waitFor } from "@testing-library/react";

// ─── Mock idb-keyval ───────────────────────────────────────────────────────────
// useNotifications reads/writes through IndexedDB (idb-keyval).
// We swap it for a simple in-memory store so tests stay fast and hermetic.
const idbStore = {};
jest.mock("idb-keyval", () => ({
  get: jest.fn((key) => Promise.resolve(idbStore[key])),
  set: jest.fn((key, value) => {
    idbStore[key] = value;
    return Promise.resolve();
  }),
}));

import { useNotifications } from "./useNotifications";
import { get as idbGet, set as idbSet } from "idb-keyval";

const STORAGE_KEY = "eventra_notifications";

describe("useNotifications", () => {
  beforeEach(() => {
    // Wipe the in-memory idb store and reset all mock counters
    Object.keys(idbStore).forEach((k) => delete idbStore[k]);
    jest.clearAllMocks();
  });

  // ─── Initial state ───────────────────────────────────────────────────────────

  it("initialises with an empty notifications list", async () => {
    const { result } = renderHook(() => useNotifications());
    await waitFor(() => expect(idbGet).toHaveBeenCalledWith(STORAGE_KEY));
    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it("loads persisted notifications from IndexedDB on mount", async () => {
    const stored = JSON.stringify([
      { id: 1, read: false, message: "Hello", createdAt: "2025-01-01T00:00:00.000Z" },
    ]);
    idbStore[STORAGE_KEY] = stored;

    const { result } = renderHook(() => useNotifications());

    await waitFor(() =>
      expect(result.current.notifications).toHaveLength(1)
    );

    expect(result.current.notifications[0].id).toBe(1);
    expect(result.current.unreadCount).toBe(1);
  });

  it("handles corrupt IndexedDB data gracefully — falls back to empty list", async () => {
    idbStore[STORAGE_KEY] = "{ definitely not json";

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(idbGet).toHaveBeenCalled());
    expect(result.current.notifications).toEqual([]);
  });

  // ─── addNotification ─────────────────────────────────────────────────────────

  it("addNotification prepends a new notification with generated id and timestamp", async () => {
    const { result } = renderHook(() => useNotifications());
    await waitFor(() => expect(idbGet).toHaveBeenCalled());

    act(() => {
      result.current.addNotification({ message: "New event added" });
    });

    const notif = result.current.notifications[0];
    expect(notif.message).toBe("New event added");
    expect(typeof notif.id).toBe("number");
    expect(notif.read).toBe(false);
    expect(notif.createdAt).toBeTruthy();
  });

  it("addNotification places the newest notification at the front of the list", async () => {
    const { result } = renderHook(() => useNotifications());
    await waitFor(() => expect(idbGet).toHaveBeenCalled());

    act(() => {
      result.current.addNotification({ message: "First" });
    });
    act(() => {
      result.current.addNotification({ message: "Second" });
    });

    expect(result.current.notifications[0].message).toBe("Second");
    expect(result.current.notifications[1].message).toBe("First");
  });

  it("addNotification increments the unreadCount", async () => {
    const { result } = renderHook(() => useNotifications());
    await waitFor(() => expect(idbGet).toHaveBeenCalled());

    act(() => {
      result.current.addNotification({ message: "A" });
      result.current.addNotification({ message: "B" });
    });

    expect(result.current.unreadCount).toBe(2);
  });

  it("addNotification allows overriding the default read=false flag", async () => {
    const { result } = renderHook(() => useNotifications());
    await waitFor(() => expect(idbGet).toHaveBeenCalled());

    act(() => {
      result.current.addNotification({ message: "Pre-read", read: true });
    });

    expect(result.current.notifications[0].read).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  // ─── markAllAsRead ───────────────────────────────────────────────────────────

  it("markAllAsRead sets read=true on every notification", async () => {
    const { result } = renderHook(() => useNotifications());
    await waitFor(() => expect(idbGet).toHaveBeenCalled());

    act(() => {
      result.current.addNotification({ message: "A" });
      result.current.addNotification({ message: "B" });
    });
    act(() => {
      result.current.markAllAsRead();
    });

    expect(result.current.notifications.every((n) => n.read)).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  it("markAllAsRead is a no-op when there are no notifications", async () => {
    const { result } = renderHook(() => useNotifications());
    await waitFor(() => expect(idbGet).toHaveBeenCalled());

    act(() => {
      result.current.markAllAsRead();
    });

    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  // ─── unreadCount ─────────────────────────────────────────────────────────────

  it("unreadCount reflects only unread notifications", async () => {
    const { result } = renderHook(() => useNotifications());
    await waitFor(() => expect(idbGet).toHaveBeenCalled());

    act(() => {
      result.current.addNotification({ message: "Unread 1" });
      result.current.addNotification({ message: "Already read", read: true });
      result.current.addNotification({ message: "Unread 2" });
    });

    expect(result.current.unreadCount).toBe(2);
  });

  // ─── Persistence ─────────────────────────────────────────────────────────────

  it("persists notifications to IndexedDB after they are added", async () => {
    const { result } = renderHook(() => useNotifications());
    await waitFor(() => expect(idbGet).toHaveBeenCalled());

    act(() => {
      result.current.addNotification({ message: "Persist me" });
    });

    await waitFor(() => expect(idbSet).toHaveBeenCalled());

    const [savedKey, savedVal] = idbSet.mock.calls[0];
    expect(savedKey).toBe(STORAGE_KEY);
    const parsed = JSON.parse(savedVal);
    expect(parsed[0].message).toBe("Persist me");
  });
});
