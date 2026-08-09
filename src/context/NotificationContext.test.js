import { render, act, cleanup } from "@testing-library/react";
import { NotificationProvider, useNotification } from "./NotificationContext";

const fetchNotifications = vi.fn();

vi.mock("./AuthContext", () => ({
  useAuth: () => ({ token: "tok-123" }),
}));

let realtimeStatus = "idle";
vi.mock("../hooks/useRealTimeConnection", () => ({
  __esModule: true,
  default: () => ({ status: realtimeStatus }),
  SSE_STATUS: { IDLE: "idle", CONNECTED: "connected" },
}));

vi.mock("../hooks/useNotificationPreferences", () => ({
  useNotificationPreferences: () => ({
    preferences: {},
    defaultPreferences: {},
    updatePreferences: vi.fn(),
    savePreferences: vi.fn(),
  }),
}));

vi.mock("../hooks/usePushSubscription", () => ({
  usePushSubscription: () => ({
    pushStatus: "unsupported",
    requestPushPermission: vi.fn(),
    subscribeToPush: vi.fn(),
    unsubscribeFromPush: vi.fn(),
  }),
}));

vi.mock("../hooks/useNotificationDelivery", () => ({
  useNotificationDelivery: () => ({
    showBrowserNotification: vi.fn(),
    deliverNew: vi.fn(),
    markAsReadRef: { current: undefined },
  }),
}));

vi.mock("../hooks/useNotificationPoller", () => ({
  useNotificationPoller: () => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    fetchNotifications,
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    deleteNotification: vi.fn(),
    applyList: vi.fn(),
    seenIds: { current: new Set() },
  }),
}));

vi.mock("../hooks/useAchievements", () => ({
  useAchievements: () => ({ achievements: [], fetchAchievements: vi.fn() }),
}));

function Consumer() {
  useNotification();
  return null;
}

describe("useBackgroundInterval - SSE idle polling (#12076)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    fetchNotifications.mockClear();
    realtimeStatus = "idle";
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it("polls every 30s while the realtime status is SSE_STATUS.IDLE", async () => {
    render(
      <NotificationProvider>
        <Consumer />
      </NotificationProvider>,
    );

    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });
    expect(fetchNotifications).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });
    expect(fetchNotifications).toHaveBeenCalledTimes(2);
  });

  it("does not poll when the realtime status is connected", async () => {
    realtimeStatus = "connected";
    render(
      <NotificationProvider>
        <Consumer />
      </NotificationProvider>,
    );

    await act(async () => {
      vi.advanceTimersByTime(60_000);
    });
    expect(fetchNotifications).not.toHaveBeenCalled();
  });

  it("stops polling once the status leaves IDLE", async () => {
    const { rerender } = render(
      <NotificationProvider>
        <Consumer />
      </NotificationProvider>,
    );

    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });
    expect(fetchNotifications).toHaveBeenCalledTimes(1);

    realtimeStatus = "connected";
    rerender(
      <NotificationProvider>
        <Consumer />
      </NotificationProvider>,
    );

    await act(async () => {
      vi.advanceTimersByTime(60_000);
    });
    expect(fetchNotifications).toHaveBeenCalledTimes(1);
  });
});
