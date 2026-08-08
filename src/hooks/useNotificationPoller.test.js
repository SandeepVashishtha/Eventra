import { renderHook, act, waitFor } from "@testing-library/react";
import { useNotificationPoller } from "./useNotificationPoller";

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ token: "tok-123", user: { id: "user-1" } }),
}));

vi.mock("./usePageVisibility", () => ({
  default: () => true,
}));

vi.mock("../utils/notificationQueue.js", () => ({
  pushToNotificationQueue: vi.fn(),
  syncNotificationQueue: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("idb-keyval", () => ({
  get: vi.fn().mockResolvedValue(undefined),
  del: vi.fn().mockResolvedValue(undefined),
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
});
