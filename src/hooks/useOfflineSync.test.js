import { createRoot } from "react-dom/client";
import { act } from "react";
import useOfflineSync from "./useOfflineSync";
import { processQueue } from "../utils/offlineQueue";

let mockAuthState = {
  token: "mock-valid-token",
  user: { id: "mock-user-id" },
  isAuthenticated: () => true,
  loading: false,
};

jest.mock("../context/AuthContext", () => ({
  useAuth: () => mockAuthState,
}));

jest.mock("../utils/tokenUtils", () => ({
  isTokenValid: () => true,
}));

jest.mock("../utils/offlineQueue", () => ({
  processQueue: jest.fn(),
}));

describe("useOfflineSync", () => {
  let container;
  let root;
  let swListeners;

  const defaultProcessResult = { processed: 2, succeeded: 2, dropped: 0, remaining: 0 };

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    jest.clearAllMocks();

    mockAuthState = {
      token: "mock-valid-token",
      user: { id: "mock-user-id" },
      isAuthenticated: () => true,
      loading: false,
    };

    processQueue.mockResolvedValue(defaultProcessResult);

    // jsdom does not provide navigator.serviceWorker; give the hook a stub so
    // we can assert the SW message -> drain wiring.
    swListeners = {};
    Object.defineProperty(navigator, "serviceWorker", {
      value: {
        addEventListener: jest.fn((type, cb) => {
          swListeners[type] = cb;
        }),
        removeEventListener: jest.fn((type) => {
          delete swListeners[type];
        }),
      },
      configurable: true,
    });
  });

  afterEach(() => {
    act(() => {
      if (root) {
        root.unmount();
      }
    });
    document.body.removeChild(container);
    container = null;
    delete navigator.serviceWorker;
    jest.restoreAllMocks();
  });

  const renderHook = async () => {
    let hookResult;
    const TestComponent = () => {
      hookResult = useOfflineSync();
      return null;
    };

    await act(async () => {
      root = createRoot(container);
      root.render(<TestComponent />);
    });
    return () => hookResult;
  };

  const flush = () => new Promise((resolve) => setTimeout(resolve, 10));

  it("drains the IndexedDB queue via processQueue when the connection returns", async () => {
    const getResult = await renderHook();

    await act(async () => {
      window.dispatchEvent(new Event("online"));
      await flush();
    });

    expect(processQueue).toHaveBeenCalledTimes(1);
    expect(processQueue).toHaveBeenCalledWith(
      "mock-user-id",
      expect.any(Function),
      expect.anything()
    );
    expect(getResult().syncStatus).toBe("SUCCESS");
  });

  it("triggers a drain when the OfflineManager dispatches eventra-background-sync", async () => {
    await renderHook();

    await act(async () => {
      window.dispatchEvent(new CustomEvent("eventra-background-sync"));
      await flush();
    });

    expect(processQueue).toHaveBeenCalledTimes(1);
  });

  it("triggers a drain when the service worker posts EVENTRA_BACKGROUND_SYNC", async () => {
    await renderHook();

    await act(async () => {
      swListeners["message"]({ data: { type: "EVENTRA_BACKGROUND_SYNC" } });
      await flush();
    });

    expect(processQueue).toHaveBeenCalledTimes(1);
  });

  it("builds a fetch function that attaches the Bearer token from auth context", async () => {
    await renderHook();

    let capturedFetchFn;
    processQueue.mockImplementationOnce(async (userId, fetchFn) => {
      capturedFetchFn = fetchFn;
      return defaultProcessResult;
    });

    await act(async () => {
      window.dispatchEvent(new Event("online"));
      await flush();
    });

    expect(capturedFetchFn).toBeDefined();
    await capturedFetchFn("https://api.example.test/events/1/register", {
      method: "POST",
      body: "{}",
    });
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.test/events/1/register",
      expect.objectContaining({
        method: "POST",
        body: "{}",
        headers: { Authorization: "Bearer mock-valid-token" },
      })
    );
  });

  it("does not send a Bearer header when the session is cookie-managed", async () => {
    mockAuthState = { ...mockAuthState, token: "cookie-managed" };
    await renderHook();

    let capturedFetchFn;
    processQueue.mockImplementationOnce(async (userId, fetchFn) => {
      capturedFetchFn = fetchFn;
      return defaultProcessResult;
    });

    await act(async () => {
      window.dispatchEvent(new Event("online"));
      await flush();
    });

    await capturedFetchFn("https://api.example.test/events/1/register", {
      method: "POST",
      body: "{}",
    });
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.test/events/1/register",
      expect.not.objectContaining({ Authorization: expect.any(String) })
    );
  });

  it("does not drain the queue while the auth session is still loading", async () => {
    mockAuthState = { ...mockAuthState, loading: true };
    await renderHook();

    await act(async () => {
      window.dispatchEvent(new Event("online"));
      await flush();
    });

    expect(processQueue).not.toHaveBeenCalled();
  });

  it("does not drain the queue for an unauthenticated visitor", async () => {
    mockAuthState = { ...mockAuthState, isAuthenticated: () => false, user: null };
    await renderHook();

    await act(async () => {
      window.dispatchEvent(new Event("online"));
      await flush();
    });

    expect(processQueue).not.toHaveBeenCalled();
  });

  it("reports PARTIAL when some items remain or were dropped", async () => {
    processQueue.mockResolvedValue({ processed: 3, succeeded: 1, dropped: 1, remaining: 1 });
    const getResult = await renderHook();

    await act(async () => {
      window.dispatchEvent(new Event("online"));
      await flush();
    });

    expect(getResult().syncStatus).toBe("PARTIAL");
  });

  it("reports FAILED when processQueue rejects", async () => {
    processQueue.mockRejectedValue(new Error("network down"));
    const getResult = await renderHook();

    await act(async () => {
      window.dispatchEvent(new Event("online"));
      await flush();
    });

    expect(getResult().syncStatus).toBe("FAILED");
  });

  it("does not start a second drain while one is already running", async () => {
    let resolveProcess;
    processQueue.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveProcess = resolve;
        })
    );
    await renderHook();

    await act(async () => {
      window.dispatchEvent(new Event("online"));
      window.dispatchEvent(new CustomEvent("eventra-background-sync"));
      await flush();
    });

    expect(processQueue).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolveProcess(defaultProcessResult);
    });
  });

  it("dispatches eventra-offline-queue-processed after a run so OfflineManager resets", async () => {
    const dispatched = [];
    const originalDispatch = window.dispatchEvent.bind(window);
    jest.spyOn(window, "dispatchEvent").mockImplementation((event) => {
      if (event.type === "eventra-offline-queue-processed") {
        dispatched.push(event.type);
      }
      return originalDispatch(event);
    });

    await renderHook();

    await act(async () => {
      window.dispatchEvent(new Event("online"));
      await flush();
    });

    expect(dispatched).toContain("eventra-offline-queue-processed");
  });
});
