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
  loading: true,
};

globalThis.mockAuth = () => currentAuth;

// Import hook under test
const useBookmarksModule = await import("../src/hooks/useBookmarks.js");
const useBookmarks = useBookmarksModule.default;

let hookResult = null;

function renderHook() {
  _stateIndex = 0;
  _effectIndex = 0;
  _effects = [];

  hookResult = useBookmarks();

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
  console.log("Starting bookmarksAuthScope integration tests...");

  // Test 1: Hook blocks loading & saving while auth is resolving
  {
    console.log("Running Test 1: Blocks loading & saving during auth resolution");
    resetReact();
    localStorage.clear();
    currentAuth = {
      token: null,
      user: null,
      isAuthenticated: false,
      loading: true,
    };

    localStorage.setItem("bookmarks_guest", JSON.stringify([{ id: "event-1", title: "Guest Event" }]));

    renderHook();
    assert.deepEqual(hookResult.bookmarks, [], "Bookmarks must be empty when auth is loading");
    assert.equal(hookResult.loading, true, "Hook should return loading: true");

    // Try to toggle a bookmark while auth loading (should be empty and not save)
    hookResult.toggleBookmark({ id: "event-2", title: "Attempted Event" });
    renderHook();

    // Verify localStorage guest key is untouched
    const guestStored = JSON.parse(localStorage.getItem("bookmarks_guest"));
    assert.equal(guestStored.length, 1, "Guest stored data should remain unchanged");
    assert.equal(guestStored[0].id, "event-1");
  }

  // Test 2: Loads guest bucket when auth resolves as guest
  {
    console.log("Running Test 2: Loads guest bucket when unauthenticated");
    resetReact();
    localStorage.clear();
    currentAuth = {
      token: null,
      user: null,
      isAuthenticated: false,
      loading: false,
    };

    const guestEvents = [{ id: "event-1", title: "Guest Event", savedAt: 100 }];
    localStorage.setItem("bookmarks_guest", JSON.stringify(guestEvents));

    renderHook();
    assert.deepEqual(hookResult.bookmarks, guestEvents, "Loads guest bookmarks when resolved");
    assert.equal(hookResult.loading, false, "Hook should return loading: false");
  }

  // Test 3: Loads user bucket when auth resolves as user
  {
    console.log("Running Test 3: Loads authenticated user bucket");
    resetReact();
    localStorage.clear();
    currentAuth = {
      token: "some-token",
      user: { id: "user-123", email: "user@example.com" },
      isAuthenticated: true,
      loading: false,
    };

    const userEvents = [{ id: "event-user", title: "User Event", savedAt: 200 }];
    const userKey = `bookmarks_${hashUserId("user-123")}`;
    localStorage.setItem(userKey, JSON.stringify(userEvents));

    renderHook();
    assert.deepEqual(hookResult.bookmarks, userEvents, "Loads user bookmarks");
    assert.equal(hookResult.loading, false, "Hook should return loading: false");
  }

  // Test 4: Migration of guest bookmarks to user bookmarks upon login
  {
    console.log("Running Test 4: Guest bookmarks are migrated and merged on login");
    resetReact();
    localStorage.clear();

    // Setup guest bookmarks
    const guestEvents = [
      { id: "event-common", title: "Common Event", savedAt: 150 },
      { id: "event-guest-only", title: "Guest Only Event", savedAt: 100 },
    ];
    localStorage.setItem("bookmarks_guest", JSON.stringify(guestEvents));

    // Setup existing user bookmarks
    const userEvents = [
      { id: "event-common", title: "Common Event", savedAt: 300 }, // User event is newer
      { id: "event-user-only", title: "User Only Event", savedAt: 200 },
    ];
    const userKey = `bookmarks_${hashUserId("user-456")}`;
    localStorage.setItem(userKey, JSON.stringify(userEvents));

    // Transition to logged-in user
    currentAuth = {
      token: "some-token",
      user: { id: "user-456", email: "user@example.com" },
      isAuthenticated: true,
      loading: false,
    };

    renderHook(); // 1st render triggers effect
    renderHook(); // 2nd render returns updated state

    const expectedMerged = [
      { id: "event-common", title: "Common Event", savedAt: 300 },
      { id: "event-user-only", title: "User Only Event", savedAt: 200 },
      { id: "event-guest-only", title: "Guest Only Event", savedAt: 100 },
    ];

    assert.deepEqual(hookResult.bookmarks, expectedMerged, "Merged list should contain unique items and preserve timestamps");
    
    // Verify user storage saved properly
    const savedUser = JSON.parse(localStorage.getItem(userKey));
    assert.deepEqual(savedUser, expectedMerged);

    // Verify guest storage is deleted after successful merge
    assert.equal(localStorage.getItem("bookmarks_guest"), null, "Guest storage must be deleted");
  }

  // Test 5: Logout resets back to guest bucket
  {
    console.log("Running Test 5: Logout transitions back to guest bucket");
    resetReact();
    localStorage.clear();

    const userEvents = [{ id: "event-user", title: "User Event" }];
    const userKey = `bookmarks_${hashUserId("user-789")}`;
    localStorage.setItem(userKey, JSON.stringify(userEvents));

    // Logged in (no guest bookmarks exist)
    currentAuth = {
      token: "some-token",
      user: { id: "user-789", email: "user@example.com" },
      isAuthenticated: true,
      loading: false,
    };
    renderHook();
    assert.deepEqual(hookResult.bookmarks, userEvents);

    // Log out
    currentAuth = {
      token: null,
      user: null,
      isAuthenticated: false,
      loading: false,
    };
    renderHook(); // 1st render triggers effect
    renderHook(); // 2nd render returns updated state
    assert.deepEqual(hookResult.bookmarks, [], "Resets to empty guest bucket on logout");

    // Add a guest bookmark after logout
    hookResult.toggleBookmark({ id: "event-guest-new", title: "New Guest Event" });
    renderHook();

    // Verify it saved to guest bucket
    const guestStored = JSON.parse(localStorage.getItem("bookmarks_guest"));
    assert.equal(guestStored.length, 1);
    assert.equal(guestStored[0].id, "event-guest-new");
  }

  console.log("All bookmarksAuthScope integration tests passed successfully! ✓");
};

runAll().catch((err) => {
  console.error("Test suite failed:", err);
  process.exit(1);
});
