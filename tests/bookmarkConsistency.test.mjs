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

// Simple synchronous hash identical to useBookmarks.js
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
  if (typeof useBookmarksModule !== "undefined" && useBookmarksModule._cache) {
    useBookmarksModule._cache.clear();
  }
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
  useMemo: (fn) => fn(),
};

// Mock Auth Context
let currentAuth = {
  token: null,
  user: null,
  isAuthenticated: false,
  loading: false,
};

globalThis.mockAuth = () => currentAuth;

// Import hook under test
const useBookmarksModule = await import("../src/hooks/useBookmarks.js");
const useBookmarks = useBookmarksModule.default;

let hookInstance1 = null;
let hookInstance2 = null;

function renderHook1() {
  _stateIndex = 0;
  _effectIndex = 0;
  _effects = [];

  hookInstance1 = useBookmarks();

  for (const { fn, idx } of _effects) {
    const cleanup = fn();
    if (typeof cleanup === "function") {
      _cleanups[idx] = cleanup;
    }
  }
}

function renderHook2() {
  // Use offsets to simulate a second component's hooks in the state slots array
  const offset = 20;
  _stateIndex = offset;
  _effectIndex = offset;
  _effects = [];

  hookInstance2 = useBookmarks();

  for (const { fn, idx } of _effects) {
    const cleanup = fn();
    if (typeof cleanup === "function") {
      _cleanups[idx] = cleanup;
    }
  }
}

const runAll = async () => {
  console.log("Starting bookmark consistency integration tests...");

  // Test 1: Add bookmark, remove bookmark, and prevent duplicates
  {
    console.log("Running Consistency Test 1: Add, Remove, and Duplicate Prevention");
    resetReact();
    localStorage.clear();
    currentAuth = { token: null, user: null, isAuthenticated: false, loading: false };

    renderHook1();
    assert.deepEqual(hookInstance1.bookmarks, [], "Initially empty");

    // Add a bookmark
    hookInstance1.toggleBookmark({ id: "event-1", title: "Test Event" });
    renderHook1();
    assert.equal(hookInstance1.bookmarks.length, 1);
    assert.equal(hookInstance1.bookmarks[0].id, "event-1");
    assert.equal(hookInstance1.isBookmarked("event-1"), true);

    // Try adding the same event again (duplicate prevention via toggle behavior)
    hookInstance1.toggleBookmark({ id: "event-1", title: "Test Event" });
    renderHook1();
    assert.equal(hookInstance1.bookmarks.length, 0, "Toggling again should remove it");

    // Add it back
    hookInstance1.toggleBookmark({ id: "event-1", title: "Test Event" });
    renderHook1();
    assert.equal(hookInstance1.bookmarks.length, 1);
  }

  // Test 2: Same-tab cross-page synchronization (via eventraBookmarksChanged)
  {
    console.log("Running Consistency Test 2: Same-tab Cross-page Sync");
    resetReact();
    localStorage.clear();
    currentAuth = { token: null, user: null, isAuthenticated: false, loading: false };

    renderHook1();
    renderHook2();

    assert.deepEqual(hookInstance1.bookmarks, [], "Instance 1 initially empty");
    assert.deepEqual(hookInstance2.bookmarks, [], "Instance 2 initially empty");

    // Toggle bookmark in instance 1
    hookInstance1.toggleBookmark({ id: "event-2", title: "Shared Event" });
    renderHook1();

    // Rerender instance 2 to let it pick up the dispatched CustomEvent
    renderHook2();
    assert.deepEqual(hookInstance2.bookmarks, hookInstance1.bookmarks, "Instance 2 synced with Instance 1");
    assert.equal(hookInstance2.bookmarks.length, 1);
    assert.equal(hookInstance2.bookmarks[0].id, "event-2");
  }

  // Test 3: User-scoped persistence (ensures scoped keys and auth resolution logic)
  {
    console.log("Running Consistency Test 3: User-scoped Persistence");
    resetReact();
    localStorage.clear();
    currentAuth = {
      token: "user-token",
      user: { id: "user-999", email: "bob@example.com" },
      isAuthenticated: true,
      loading: false,
    };

    renderHook1();
    hookInstance1.toggleBookmark({ id: "event-bob", title: "Bob's Event" });
    renderHook1();

    const bobKey = `bookmarks_${hashUserId("user-999")}`;
    const storedBob = JSON.parse(localStorage.getItem(bobKey));
    assert.ok(storedBob, "Should persist to Bob's key");
    assert.equal(storedBob.length, 1);
    assert.equal(storedBob[0].id, "event-bob");

    // Switch to another user
    currentAuth = {
      token: "another-token",
      user: { id: "user-888", email: "alice@example.com" },
      isAuthenticated: true,
      loading: false,
    };
    resetReact();
    renderHook1();
    assert.deepEqual(hookInstance1.bookmarks, [], "Alice's bookmarks should start empty");
  }

  // Test 4: Migration of legacy data on mount
  {
    console.log("Running Consistency Test 4: Legacy Data Migration");
    resetReact();
    localStorage.clear();
    currentAuth = { token: null, user: null, isAuthenticated: false, loading: false };

    const legacyData = [
      { id: "legacy-1", title: "Legacy Event 1", bookmarkedAt: new Date().toISOString() },
      { id: "legacy-2", title: "Legacy Event 2", savedAt: Date.now() - 10000 },
    ];
    localStorage.setItem("eventra_bookmarked_events", JSON.stringify(legacyData));

    renderHook1();
    renderHook1();
    assert.equal(hookInstance1.bookmarks.length, 2, "Should migrate and load legacy bookmarks");
    assert.equal(hookInstance1.bookmarks[0].id, "legacy-1");
    assert.equal(hookInstance1.bookmarks[1].id, "legacy-2");

    // Verify legacy key is deleted
    assert.equal(localStorage.getItem("eventra_bookmarked_events"), null, "Legacy storage should be deleted");
  }

  console.log("All bookmark consistency integration tests passed successfully! ✓");
};

runAll().catch((err) => {
  console.error("Consistency test suite failed:", err);
  process.exit(1);
});
