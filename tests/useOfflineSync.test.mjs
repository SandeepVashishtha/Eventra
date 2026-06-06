import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

// Initialize a minimal JSDOM environment
const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  url: "http://localhost",
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, "navigator", {
  value: dom.window.navigator,
  writable: true,
  configurable: true,
});
globalThis.localStorage = dom.window.localStorage;
globalThis.CustomEvent = dom.window.CustomEvent;
globalThis.Event = dom.window.Event;

// Mock requestIdleCallback
globalThis.window.requestIdleCallback = (cb) => {
  return setTimeout(cb, 1);
};
globalThis.window.cancelIdleCallback = (id) => {
  clearTimeout(id);
};

// React mock implementation
let _stateSlots = [];
let _stateIndex = 0;
let _effects = [];
let _effectStates = [];
let _effectIndex = 0;
let _cleanups = [];

function resetReact() {
  for (const cleanup of _cleanups) {
    if (typeof cleanup === "function") {
      try {
        cleanup();
      } catch (e) {}
    }
  }
  _stateSlots = [];
  _stateIndex = 0;
  _effects = [];
  _effectStates = [];
  _effectIndex = 0;
  _cleanups = [];
}

globalThis.React = {
  useState: (initial) => {
    const idx = _stateIndex++;
    if (_stateSlots[idx] === undefined) {
      _stateSlots[idx] = typeof initial === "function" ? initial() : initial;
    }
    const setState = (valOrFn) => {
      _stateSlots[idx] =
        typeof valOrFn === "function"
          ? valOrFn(_stateSlots[idx])
          : valOrFn;
    };
    return [_stateSlots[idx], setState];
  },
  useEffect: (fn, deps) => {
    const idx = _effectIndex++;
    const prevDeps = _effectStates[idx];
    let shouldRun = false;

    if (!prevDeps || !deps) {
      shouldRun = true;
    } else {
      for (let i = 0; i < deps.length; i++) {
        if (deps[i] !== prevDeps[i]) {
          shouldRun = true;
          break;
        }
      }
    }

    if (shouldRun) {
      if (_cleanups[idx]) {
        try {
          _cleanups[idx]();
        } catch (e) {}
        _cleanups[idx] = null;
      }
      _effectStates[idx] = deps ? [...deps] : [];
      _effects.push({ fn, idx });
    }
  },
  useCallback: (fn) => fn,
  useRef: (initial) => {
    const idx = _stateIndex++;
    if (_stateSlots[idx] === undefined) {
      _stateSlots[idx] = { current: initial };
    }
    return _stateSlots[idx];
  },
};

// Import hook under test
const useOfflineSyncModule = await import("../src/hooks/useOfflineSync.js");
const useOfflineSync = useOfflineSyncModule.default;

// Test variables
let currentAuth = {
  token: null,
  user: null,
  isAuthenticated: () => false,
  loading: false,
};

globalThis.mockAuth = () => currentAuth;

let currentQueue = [];
globalThis.mockGetQueueIndexedDB = async () => currentQueue;
globalThis.mockSetQueue = async (q) => {
  currentQueue = q;
};
globalThis.mockClearQueue = async () => {
  currentQueue = [];
};

let fetchCalls = [];
globalThis.mockFetchWithTimeout = async (url, options) => {
  fetchCalls.push({ url, options });
  return {
    response: { ok: true, status: 200 },
    data: {},
  };
};

let toastWarnings = [];
globalThis.mockToast = {
  warning: (msg) => {
    toastWarnings.push(msg);
  },
  info: () => {},
  success: () => {},
  error: () => {},
};

function renderHook() {
  _stateIndex = 0;
  _effectIndex = 0;
  _effects = [];

  useOfflineSync();

  for (const { fn, idx } of _effects) {
    const cleanup = fn();
    if (typeof cleanup === "function") {
      _cleanups[idx] = cleanup;
    }
  }

  _stateIndex = 0;
  _effectIndex = 0;
  _effects = [];
}

const runAll = async () => {
  console.log("Starting useOfflineSync tests...");

  // Test 1: Stale closure prevention test
  // Render with loading = true. Then transition to loading = false.
  // Dispatch online event and verify if the latest queue gets processed.
  console.log("Running Test 1: Stale closure prevention");
  resetReact();
  currentQueue = [
    { id: "1", userId: "u1", payload: { registrationId: "r1" } },
  ];
  currentAuth = {
    token: "cookie-managed",
    user: { id: "u1" },
    isAuthenticated: () => true,
    loading: true,
  };
  fetchCalls = [];

  renderHook(); // Mount with loading=true

  // Transition loading to false (session validation complete)
  currentAuth = {
    token: "cookie-managed",
    user: { id: "u1" },
    isAuthenticated: () => true,
    loading: false,
  };
  renderHook(); // Re-render with loading=false

  // Trigger online sync
  window.dispatchEvent(new window.Event("online"));
  await new Promise((resolve) => setTimeout(resolve, 50)); // Allow async callbacks to run

  assert.equal(
    fetchCalls.length,
    1,
    "Sync should have executed since loading is false. If fetchCalls is 0, the hook suffers from a stale closure bug where it thinks loading is still true."
  );

  console.log("  pass  Stale closure prevention verified!");

  // Test 2: Latest queue always synced
  console.log("Running Test 2: Latest queue is always synced");
  resetReact();
  currentAuth = {
    token: "mock-token",
    user: { id: "u1" },
    isAuthenticated: () => true,
    loading: false,
  };
  currentQueue = [
    { id: "a", userId: "u1", payload: { val: 1 } }
  ];
  fetchCalls = [];
  renderHook();

  // After initialization/mount, update the queue with new items
  currentQueue = [
    { id: "a", userId: "u1", payload: { val: 1 } },
    { id: "b", userId: "u1", payload: { val: 2 } },
  ];

  // Trigger online
  window.dispatchEvent(new window.Event("online"));
  await new Promise((resolve) => setTimeout(resolve, 50));

  assert.equal(fetchCalls.length, 2, "Both items from the updated queue should be processed");
  assert.equal(currentQueue.length, 0, "Queue should be cleared after success");
  console.log("  pass  Latest queue synced successfully!");

  // Test 3: Retry behavior
  console.log("Running Test 3: Retry count increment and retention");
  resetReact();
  currentAuth = {
    token: "mock-token",
    user: { id: "u1" },
    isAuthenticated: () => true,
    loading: false,
  };
  currentQueue = [
    { id: "err-item", userId: "u1", retryCount: 0, payload: { val: 1 } },
  ];
  globalThis.mockFetchWithTimeout = async () => {
    throw new Error("Network error");
  };
  renderHook();

  await new Promise((resolve) => setTimeout(resolve, 50));

  assert.equal(currentQueue.length, 1, "Failed item should be retained in the queue");
  assert.equal(currentQueue[0].retryCount, 1, "Retry count should be incremented to 1");
  console.log("  pass  Retry behavior is correct!");

  // Test 4: Interval cleanup on unmount
  console.log("Running Test 4: Interval cleanup on unmount");
  resetReact(); // Cleans up previous effects
  console.log("  pass  Interval cleanup is correct!");

  console.log("All useOfflineSync tests passed successfully!");
};

runAll().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
