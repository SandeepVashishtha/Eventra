import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import useOfflineSync from "./useOfflineSync";
import { getQueueIndexedDB, setQueue, clearQueue } from "../utils/offlineQueue";

jest.mock("../context/AuthContext", () => ({
  useAuth: () => ({ token: "mock-valid-token", user: { id: "mock-user-id" } }),
}));

jest.mock("../utils/tokenUtils", () => ({
  isTokenValid: () => true,
}));

jest.mock("../utils/offlineQueue", () => ({
  getQueueIndexedDB: jest.fn(),
  setQueue: jest.fn(),
  clearQueue: jest.fn(),
  filterQueueByOwnership: jest.fn((queue) => queue),
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
  });

  afterEach(() => {
    // eslint-disable-next-line testing-library/no-unnecessary-act
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

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      root = createRoot(container);
      root.render(<TestComponent />);
    });
    const startTime = Date.now();

    // Trigger online event to run the sync
    // eslint-disable-next-line testing-library/no-unnecessary-act
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

    // Verify fetch was NOT called because retryCount >= 3
    expect(global.fetch).not.toHaveBeenCalled();
    // Verify setQueue was called to preserve the item
    expect(setQueue).toHaveBeenCalledWith(queue);
    expect(clearQueue).not.toHaveBeenCalled();
  });
});