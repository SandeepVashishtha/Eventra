import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

// ── Minimal JSDOM Environment Setup ──────────────────────────────────────────
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

// ── Custom React Mock Loop for hookResult rendering ─────────────────────────
let renderingEnabled = false;
let isRunningRender = false;
let _stateSlots = [];
let _stateIndex = 0;
let _effects = [];
let _effectStates = [];
let _effectIndex = 0;
let _cleanups = [];
let hookResult = null;

function resetReact() {
  renderingEnabled = false;
  isRunningRender = false;
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
  hookResult = null;
}

globalThis.React = {
  useState: (initial) => {
    const idx = _stateIndex++;
    if (_stateSlots[idx] === undefined) {
      _stateSlots[idx] = typeof initial === "function" ? initial() : initial;
    }
    const setState = (valOrFn) => {
      const prev = _stateSlots[idx];
      const next = typeof valOrFn === "function" ? valOrFn(prev) : valOrFn;
      if (prev !== next) {
        _stateSlots[idx] = next;
        if (renderingEnabled && !isRunningRender) {
          renderHook();
        }
      }
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

globalThis.mockAuth = () => ({
  token: "mock-token",
  user: { id: "user-1", email: "user-1@example.com" },
  isAuthenticated: () => true,
  loading: false,
});

// ── Imports under test ───────────────────────────────────────────────────────
const { useNotificationPoller } = await import("../src/hooks/useNotificationPoller.js");
const { joinWaitlist, promoteNextUser } = await import("../src/utils/waitlistUtils.js");
const { apiUtils } = await import("../src/config/api.js");

function renderHook() {
  if (isRunningRender) return;
  isRunningRender = true;
  try {
    _stateIndex = 0;
    _effectIndex = 0;
    _effects = [];

    const deliverNew = () => {};
    const hasCompletedInitialFetchRef = { current: true };

    hookResult = useNotificationPoller(deliverNew, hasCompletedInitialFetchRef);

    // Run the collected effects
    const currentEffects = [..._effects];
    _effects = [];
    for (const { fn, idx } of currentEffects) {
      const cleanup = fn();
      if (typeof cleanup === "function") {
        _cleanups[idx] = cleanup;
      }
    }
  } finally {
    isRunningRender = false;
  }
}

// ── Test Helpers ─────────────────────────────────────────────────────────────
const resetAll = () => {
  localStorage.clear();
  resetReact();
};

const runAll = async () => {
  console.log("Running Notification Synchronization tests...");

  // 1 & 2 & 3. Waitlist promotion, inbox write, and unread increment
  {
    resetAll();
    const eventId = 1;
    const user = { id: "user-1", email: "user1@example.com", fullName: "User One" };

    // Join waitlist
    await joinWaitlist(eventId, user, {});

    // Render hook to initialize state
    renderingEnabled = true;
    renderHook();

    assert.equal(hookResult.notifications.length, 0, "Initially 0 notifications");
    assert.equal(hookResult.unreadCount, 0, "Initially unread count is 0");

    // Promote user (triggers addLocalNotification)
    await promoteNextUser(eventId, { id: eventId, title: "Special Masterclass" });

    // Verify localStorage has the new notification
    const inboxRaw = localStorage.getItem("eventra_notification_inbox");
    assert.ok(inboxRaw, "Notification should be in local storage");
    const inbox = JSON.parse(inboxRaw);
    assert.equal(inbox.length, 2);
    assert.equal(inbox[0].title, "Waitlist Promotion");
    assert.match(inbox[0].message, /Special Masterclass/);

    // Verify hook state synchronized automatically via the window event listener
    assert.equal(hookResult.notifications.length, 2, "Notifications length should be 2");
    assert.equal(hookResult.notifications[0].title, "Waitlist Promotion");
    assert.equal(hookResult.unreadCount, 2, "Unread count should be 2");

    console.log("✓ Test 1-3: Waitlist promotion, inbox write, and unread increment passed!");
  }

  // 4. Mark as read works
  {
    resetAll();
    const eventId = 2;
    const user = { id: "user-2", email: "user2@example.com", fullName: "User Two" };

    await joinWaitlist(eventId, user, {});
    await promoteNextUser(eventId, { id: eventId, title: "React Meetup" });

    renderingEnabled = true;
    renderHook();
    window.dispatchEvent(new CustomEvent("eventra-notifications-updated"));

    assert.equal(hookResult.unreadCount, 2);
    const notificationId = hookResult.notifications[0].id;

    // Mock API put call for marking read
    let apiPutCalled = false;
    apiUtils.put = async (url, data) => {
      apiPutCalled = true;
      return { ok: true, status: 200 };
    };

    await hookResult.markAsRead(notificationId);

    assert.ok(apiPutCalled, "apiUtils.put should have been called");
    assert.equal(hookResult.unreadCount, 1, "Unread count should become 1");
    assert.equal(hookResult.notifications[0].isRead, true, "Notification should be marked read");

    // Verify localStorage persistence
    const inbox = JSON.parse(localStorage.getItem("eventra_notification_inbox"));
    assert.equal(inbox[0].isRead, true, "Persisted notification should be marked read");

    console.log("✓ Test 4: Mark as read works passed!");
  }

  // 5 & 6. Legacy IndexedDB migration and deduplication works
  {
    resetAll();

    // Seed legacy IndexedDB notifications (stored in localStorage under eventra_notifications by mockIdbKeyval)
    const legacyNotifications = [
      { id: "legacy-1", title: "Legacy Promotion", message: "You were promoted!", isRead: false, timestamp: new Date().toISOString() },
      { id: "legacy-2", title: "Legacy Reminder", message: "Event tomorrow", isRead: true, timestamp: new Date().toISOString() },
    ];
    localStorage.setItem("eventra_notifications", JSON.stringify(legacyNotifications));

    // Seed current canonical store with an overlapping notification to test deduplication
    const currentInbox = [
      { id: "legacy-1", title: "Legacy Promotion", message: "You were promoted!", isRead: false, timestamp: new Date().toISOString() },
      { id: "new-notif", title: "New Announcement", message: "Welcome", isRead: false, timestamp: new Date().toISOString() },
    ];
    localStorage.setItem("eventra_notification_inbox", JSON.stringify(currentInbox));

    renderingEnabled = true;
    renderHook();

    // Allow async migration effect to run
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Verify legacy store deleted
    assert.equal(localStorage.getItem("eventra_notifications"), null, "Legacy notifications key should be deleted");

    // Verify merged and deduplicated results
    const mergedInbox = JSON.parse(localStorage.getItem("eventra_notification_inbox"));
    assert.equal(mergedInbox.length, 3, "Merged inbox size should be 3 (deduplicated 'legacy-1')");

    // Check presence of all expected items
    const ids = mergedInbox.map(n => n.id);
    assert.ok(ids.includes("legacy-1"));
    assert.ok(ids.includes("legacy-2"));
    assert.ok(ids.includes("new-notif"));

    // Verify hook state contains all items
    assert.equal(hookResult.notifications.length, 3);
    assert.equal(hookResult.unreadCount, 2); // 'legacy-1' (unread) and 'new-notif' (unread), 'legacy-2' (read)

    console.log("✓ Test 5-6: Migration and deduplication passed!");
  }

  // 7. Deletion works
  {
    resetAll();

    const inbox = [
      { id: "del-1", title: "To Delete", message: "Delete me", isRead: false, timestamp: new Date().toISOString() },
    ];
    localStorage.setItem("eventra_notification_inbox", JSON.stringify(inbox));

    renderingEnabled = true;
    renderHook();
    window.dispatchEvent(new CustomEvent("eventra-notifications-updated"));

    assert.equal(hookResult.notifications.length, 1);

    // Mock API delete call
    let apiDeleteCalled = false;
    apiUtils.delete = async (url) => {
      apiDeleteCalled = true;
      return { ok: true, status: 200 };
    };

    await hookResult.deleteNotification("del-1");

    assert.ok(apiDeleteCalled, "apiUtils.delete should have been called");
    assert.equal(hookResult.notifications.length, 0, "Notifications should be empty after deletion");
    assert.equal(hookResult.unreadCount, 0, "Unread count should be 0");

    // Verify localStorage persistence
    const saved = JSON.parse(localStorage.getItem("eventra_notification_inbox"));
    assert.equal(saved.length, 0, "Persisted store should be empty");

    console.log("✓ Test 7: Deletion works passed!");
  }

  console.log("\nAll Notification Synchronization tests passed successfully! ✓");
};

runAll().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
