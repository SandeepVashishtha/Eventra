import { createRoot } from "react-dom/client";
import { act } from "react";
import useOfflineSync from "./useOfflineSync";
import { getQueueIndexedDB, setQueue, clearQueue } from "../utils/offlineQueue";

jest.mock("../context/AuthContext", () => ({
  useAuth: () => ({ token: "mock-valid-token", user: { id: "mock-user-id" }, isAuthenticated: () => true, loading: false }),
}));

jest.mock("../utils/tokenUtils", () => ({
  isTokenValid: () => true,
}));

jest.mock("../utils/offlineQueue", () => ({
  getQueueIndexedDB: jest.fn(),
  setQueue: jest.fn(),
  clearQueue: jest.fn(),
  filterQueueByOwnership: jest.fn((queue) => queue),
  validateQueueSession: jest.fn((queue) => queue),
}));


describe("useOfflineSync", () => {
  let container;
  let root;

  let originalOnLine;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    jest.clearAllMocks();

    originalOnLine = navigator.onLine;
    Object.defineProperty(navigator, "onLine", {
      value: false,
      configurable: true,
    });

    // Mock global fetch
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve("ok"),
      })
    );

    jest
      .requireMock("../utils/offlineQueue")
      .filterQueueByOwnership.mockImplementation((queue) => queue);

    jest
      .requireMock("../utils/offlineQueue")
      .validateQueueSession.mockImplementation((queue) => queue);
  });

  afterEach(() => {
     
    act(() => {
      if (root) {
        root.unmount();
      }
    });
    document.body.removeChild(container);
    container = null;
    delete global.fetch;
    Object.defineProperty(navigator, "onLine", {
      value: originalOnLine,
      configurable: true,
    });
  });

  it("attempts to sync immediately without backoff delay on first try in active sync run", async () => {
    const queue = [
      { id: "1", userId: "mock-user-id", retryCount: 0, payload: { name: "test-1" } },
      { id: "2", userId: "mock-user-id", retryCount: 0, payload: { name: "test-2" } }
    ];
    getQueueIndexedDB.mockResolvedValue(queue);

    const TestComponent = () => {
      useOfflineSync();
      return null;
    };

     
    await act(async () => {
      root = createRoot(container);
      root.render(<TestComponent />);
    });
    const startTime = Date.now();

    // Trigger online event to run the sync
     
    await act(async () => {
      window.dispatchEvent(new Event("online"));

      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    const duration = Date.now() - startTime;

    // Verify both items were synced and fetch was called
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(clearQueue).toHaveBeenCalled();

    // Verify it completed quickly (meaning no 1s/2s sequential backoff was applied)
    // Since items had retryCount: 2 and 1 respectively, the original implementation
    // would have blocked for 2s + 1s = 3 seconds.
    // Our fix should complete it in under 500ms.
    expect(duration).toBeLessThan(500);
  });

  it("preserves items with retryCount >= MAX_RETRIES in the offline queue instead of deleting them", async () => {
    const queue = [
      { id: "1", userId: "mock-user-id", retryCount: 3, payload: { name: "test-expired" } }
    ];
    getQueueIndexedDB.mockResolvedValue(queue);

    const TestComponent = () => {
      useOfflineSync();
      return null;
    };

     
    await act(async () => {
      root = createRoot(container);
      root.render(<TestComponent />);
    });

     
    await act(async () => {
      window.dispatchEvent(new Event("online"));
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Verify fetch was NOT called because retryCount >= 3
    expect(global.fetch).not.toHaveBeenCalled();
    // Verify setQueue was called to preserve the item
    expect(setQueue).toHaveBeenCalledWith(queue);
    expect(clearQueue).not.toHaveBeenCalled();
  });

  // ── Security: Issue #5727 — cross-user action replay prevention ───────────

  it("[Security] does not replay queued actions that belong to a different user", async () => {
    // Queue contains items from user-A only
    const queue = [
      { id: "x1", userId: "user-A", retryCount: 0, payload: { name: "stale-action" } },
    ];
    getQueueIndexedDB.mockResolvedValue(queue);

    // filterQueueByOwnership drops all items since current user is mock-user-id, not user-A
    jest
      .requireMock("../utils/offlineQueue")
      .filterQueueByOwnership.mockImplementation((_queue, currentUserId) =>
        _queue.filter((item) => item.userId === currentUserId)
      );

    const TestComponent = () => {
      useOfflineSync();
      return null;
    };

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      root = createRoot(container);
      root.render(<TestComponent />);
    });

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      window.dispatchEvent(new Event("online"));
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Fetch must NOT have been called — user-A's action should not run under mock-user-id's session
    expect(global.fetch).not.toHaveBeenCalled();
    // Queue should be cleared since all items were foreign
    expect(clearQueue).toHaveBeenCalled();
  });

  it("[Security] does not replay actions with a stale session ID", async () => {
    const queue = [
      { id: "s1", userId: "mock-user-id", sessionId: "old-session-xyz", retryCount: 0, payload: { name: "stale-session-action" } },
    ];
    getQueueIndexedDB.mockResolvedValue(queue);

    // validateQueueSession drops all items because their sessionId doesn't match the current session
    jest
      .requireMock("../utils/offlineQueue")
      .validateQueueSession.mockImplementation((_queue, _currentSession) =>
        _queue.filter((item) => item.sessionId === _currentSession)
      );

    // Simulate a different current session
    const originalSessionStorage = global.sessionStorage;
    Object.defineProperty(window, "sessionStorage", {
      value: { getItem: jest.fn(() => "new-session-abc") },
      configurable: true,
    });

    const TestComponent = () => {
      useOfflineSync();
      return null;
    };

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      root = createRoot(container);
      root.render(<TestComponent />);
    });

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      window.dispatchEvent(new Event("online"));
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Fetch must NOT be called — stale session items should be dropped
    expect(global.fetch).not.toHaveBeenCalled();
    expect(clearQueue).toHaveBeenCalled();

    Object.defineProperty(window, "sessionStorage", {
      value: originalSessionStorage,
      configurable: true,
    });
  });

  it("[Security] filterQueueByOwnership is always called during replay — not optional", async () => {
    const queue = [
      { id: "f1", userId: "mock-user-id", retryCount: 0, payload: { name: "normal-action" } },
    ];
    getQueueIndexedDB.mockResolvedValue(queue);

    const { filterQueueByOwnership } = jest.requireMock("../utils/offlineQueue");

    const TestComponent = () => {
      useOfflineSync();
      return null;
    };

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      root = createRoot(container);
      root.render(<TestComponent />);
    });

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      window.dispatchEvent(new Event("online"));
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // filterQueueByOwnership MUST have been called — it is not optional
    expect(filterQueueByOwnership).toHaveBeenCalled();
    // It must be called with the current user's ID
    expect(filterQueueByOwnership).toHaveBeenCalledWith(queue, "mock-user-id");
  });

  it("[Security] validateQueueSession is always called during replay", async () => {
    const queue = [
      { id: "v1", userId: "mock-user-id", sessionId: "sess-abc", retryCount: 0, payload: { name: "action" } },
    ];
    getQueueIndexedDB.mockResolvedValue(queue);

    const { validateQueueSession } = jest.requireMock("../utils/offlineQueue");

    const TestComponent = () => {
      useOfflineSync();
      return null;
    };

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      root = createRoot(container);
      root.render(<TestComponent />);
    });

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      window.dispatchEvent(new Event("online"));
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // validateQueueSession MUST have been called in all replay paths
    expect(validateQueueSession).toHaveBeenCalled();
  });
});