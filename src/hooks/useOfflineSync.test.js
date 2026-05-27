/* eslint-disable testing-library/no-unnecessary-act */
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

global.IS_REACT_ACT_ENVIRONMENT = true;

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
      { id: "1", retryCount: 2, endpoint: "/api/register/1", payload: {} },
      { id: "2", retryCount: 1, endpoint: "/api/register/2", payload: {} },
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
    const queue = [{ id: "1", retryCount: 3, endpoint: "/api/register/1", payload: {} }];
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
    expect(setQueue).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: "1", retryCount: 3 })])
    );
    expect(clearQueue).not.toHaveBeenCalled();
  });
});
