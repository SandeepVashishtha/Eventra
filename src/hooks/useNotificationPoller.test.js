import { renderHook, act, waitFor } from "@testing-library/react";
import { useNotificationPoller } from "./useNotificationPoller";
import { showUndoToast } from "../utils/toast.js";

let mockAuth = { token: "tok-123", user: { id: "user-1" } };
vi.mock("../context/AuthContext", () => ({
  useAuth: () => mockAuth,
}));

vi.mock("../utils/toast.js", () => ({
  showUndoToast: vi.fn(),
}));

vi.mock("./usePageVisibility", () => ({
  default: () => true,
}));

vi.mock("../utils/notificationQueue.js", () => ({
  pushToNotificationQueue: vi.fn(),
  syncNotificationQueue: vi.fn().mockResolvedValue(undefined),
}));

const mockIdbGet = vi.fn().mockResolvedValue(undefined);
const mockIdbDel = vi.fn().mockResolvedValue(undefined);

vi.mock("idb-keyval", () => ({
  get: (...args) => mockIdbGet(...args),
  del: (...args) => mockIdbDel(...args),
}));

const mockGet = vi.fn();
const mockDelete = vi.fn();

vi.mock("../config/api.js", () => ({
  apiUtils: {
    get: (...args) => mockGet(...args),
    delete: (...args) => mockDelete(...args),
    put: vi.fn().mockResolvedValue({ data: {} }),
  },
  API_ENDPOINTS: {
    NOTIFICATIONS: {
      ALL: "/notifications",
      BASE: "/notifications",
      READ: (id) => `/notifications/${id}/read`,
      DELETE: (id) => `/notifications/${id}`,
      READ_ALL: "/notifications/read-all",
    },
  },
}));

describe("useNotificationPoller - deleteNotification", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockDelete.mockResolvedValue({ data: {} });
  });

  it("decrements unreadCount immediately when an unread notification is deleted", async () => {
    mockGet.mockResolvedValue({
      data: [
        { id: "n1", isRead: false, title: "Unread one", timestamp: "2026-01-01T00:00:00.000Z" },
        { id: "n2", isRead: true, title: "Read one", timestamp: "2026-01-01T00:00:00.000Z" },
      ],
    });

    const hasCompletedInitialFetchRef = { current: false };
    const deliverNew = vi.fn();

    const { result } = renderHook(() =>
      useNotificationPoller(deliverNew, hasCompletedInitialFetchRef),
    );

    await waitFor(() => expect(result.current.notifications).toHaveLength(2));
    expect(result.current.unreadCount).toBe(1);

    await act(async () => {
      await result.current.deleteNotification("n1");
    });

    expect(result.current.unreadCount).toBe(0);
    expect(result.current.notifications.find((n) => n.id === "n1")).toBeUndefined();
  });

  it("does not decrement unreadCount when a read notification is deleted", async () => {
    mockGet.mockResolvedValue({
      data: [
        { id: "n1", isRead: false, title: "Unread one", timestamp: "2026-01-01T00:00:00.000Z" },
        { id: "n2", isRead: true, title: "Read one", timestamp: "2026-01-01T00:00:00.000Z" },
      ],
    });

    const hasCompletedInitialFetchRef = { current: false };
    const deliverNew = vi.fn();

    const { result } = renderHook(() =>
      useNotificationPoller(deliverNew, hasCompletedInitialFetchRef),
    );

    await waitFor(() => expect(result.current.notifications).toHaveLength(2));
    expect(result.current.unreadCount).toBe(1);

    await act(async () => {
      await result.current.deleteNotification("n2");
    });

    expect(result.current.unreadCount).toBe(1);
    expect(result.current.notifications.find((n) => n.id === "n2")).toBeUndefined();
  });

  it("restores a deleted notification and its unread count when undo is triggered (#12074)", async () => {
    mockGet.mockResolvedValue({
      data: [
        { id: "n1", isRead: false, title: "Unread one", timestamp: "2026-01-01T00:00:00.000Z" },
        { id: "n2", isRead: true, title: "Read one", timestamp: "2026-01-01T00:00:00.000Z" },
      ],
    });

    const hasCompletedInitialFetchRef = { current: false };
    const deliverNew = vi.fn();

    const { result } = renderHook(() =>
      useNotificationPoller(deliverNew, hasCompletedInitialFetchRef),
    );

    await waitFor(() => expect(result.current.notifications).toHaveLength(2));
    expect(result.current.unreadCount).toBe(1);

    await act(async () => {
      await result.current.deleteNotification("n1");
    });

    expect(result.current.notifications.find((n) => n.id === "n1")).toBeUndefined();
    expect(result.current.unreadCount).toBe(0);

    const toastCall = vi.mocked(showUndoToast).mock.calls[0][0];
    expect(toastCall.onUndo).toBeTypeOf("function");
    expect(toastCall.onCommit).toBeTypeOf("function");

    await act(async () => {
      toastCall.onUndo();
    });

    const restored = result.current.notifications.find((n) => n.id === "n1");
    expect(restored).toBeDefined();
    expect(restored.isRead).toBe(false);
    expect(result.current.unreadCount).toBe(1);

    const persisted = JSON.parse(localStorage.getItem("eventra_notification_inbox"));
    expect(persisted.some((n) => n.id === "n1")).toBe(true);

    // Undo cancels the commit, so the delete must not reach the server.
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("migrates legacy IndexedDB notifications when user logs in after mounting logged-out (#16538)", async () => {
    const legacyItem = {
      id: "legacy-1",
      title: "Legacy Notification",
      message: "Old event",
      isRead: false,
      timestamp: "2026-01-01T00:00:00.000Z",
    };

    mockIdbGet.mockResolvedValue(JSON.stringify([legacyItem]));
    mockGet.mockResolvedValue({ data: [] });

    mockAuth = { token: null, user: null };

    const hasCompletedInitialFetchRef = { current: false };
    const deliverNew = vi.fn();

    const { result, rerender } = renderHook(() =>
      useNotificationPoller(deliverNew, hasCompletedInitialFetchRef),
    );

    await waitFor(() => {
      expect(mockIdbGet).toHaveBeenCalledWith("eventra_notifications");
    });

    // Now user logs in
    mockAuth = { token: "tok-abc", user: { id: "user-456" } };
    rerender();

    await waitFor(() => {
      expect(result.current.notifications.some((n) => n.id === "legacy-1")).toBe(true);
    });

    expect(result.current.unreadCount).toBeGreaterThanOrEqual(1);
    expect(mockIdbDel).toHaveBeenCalledWith("eventra_notifications");
  });
});
