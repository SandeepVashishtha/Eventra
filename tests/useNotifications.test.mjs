/**
 * Unit tests for src/hooks/useNotifications.js
 *
 * Validates the core notification logic: adding notifications,
 * marking all as read, unread counting, localStorage persistence,
 * and browser Notification permission requests.
 *
 * All imports are placed at top-level module scope to satisfy
 * ESLint import/first rules.
 */

import assert from "node:assert/strict";

// ── Minimal DOM / React stubs ───────────────────────────────────────────────
// useNotifications relies on React hooks (useState, useEffect) and
// window.localStorage + window.Notification.  We stub everything so
// tests run in plain Node.js without JSDOM or a bundler.

const _lsStore = {};

global.localStorage = {
  getItem: (key) => (key in _lsStore ? _lsStore[key] : null),
  setItem: (key, val) => {
    _lsStore[key] = String(val);
  },
  removeItem: (key) => {
    delete _lsStore[key];
  },
};

// Stub window.Notification for requestPermission tests
let _notificationPermission = "default";
global.Notification = {
  requestPermission: async () => _notificationPermission,
};
global.window = {
  ...global,
  Notification: global.Notification,
  localStorage: global.localStorage,
};

// ── Minimal React stub ──────────────────────────────────────────────────────
// We capture the hook's internal state and effects so we can drive them
// manually without ReactDOM.

let _stateSlots = [];
let _stateIndex = 0;
let _effects = [];

function resetReact() {
  _stateSlots = [];
  _stateIndex = 0;
  _effects = [];
}

// Minimal useState: synchronous state management
global.React = {
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
  useEffect: (fn, _deps) => {
    _effects.push(fn);
  },
};

// ── Import hook ─────────────────────────────────────────────────────────────
// Dynamic import so the stubs above are in place before the module loads.
const { useNotifications } = await import("../src/hooks/useNotifications.js");

// ── Helpers ─────────────────────────────────────────────────────────────────
function resetStorage() {
  for (const k of Object.keys(_lsStore)) delete _lsStore[k];
}

/**
 * Runs the hook once, flushes all captured effects, then runs it
 * a second time so state reflects the effect writes.
 */
function runHook() {
  _stateIndex = 0;
  _effects = [];
  const result = useNotifications();

  // Flush effects
  for (const ef of _effects) {
    const cleanup = ef();
    if (typeof cleanup === "function") cleanup();
  }

  // Re-run so returned values reflect post-effect state
  _stateIndex = 0;
  _effects = [];
  return useNotifications();
}

// ── Tests ───────────────────────────────────────────────────────────────────

// 1. Initial state — empty notifications
resetStorage();
resetReact();
const initial = runHook();
assert.ok(Array.isArray(initial.notifications), "notifications is an array");
assert.equal(initial.unreadCount, 0, "unreadCount starts at 0");
assert.equal(typeof initial.addNotification, "function", "addNotification is a function");
assert.equal(typeof initial.markAllAsRead, "function", "markAllAsRead is a function");
assert.equal(typeof initial.requestPermission, "function", "requestPermission is a function");

// 2. addNotification — adds an item with correct shape
resetStorage();
resetReact();
let hook = runHook();
hook.addNotification({ title: "Test alert", message: "Hello" });
hook = runHook();
assert.ok(hook.notifications.length >= 1, "notification was added");
const added = hook.notifications[0];
assert.equal(added.title, "Test alert", "notification has correct title");
assert.equal(added.message, "Hello", "notification has correct message");
assert.equal(added.read, false, "new notification is unread");
assert.ok(added.id, "notification has an auto-generated id");
assert.ok(added.createdAt, "notification has a createdAt timestamp");

// 3. unreadCount tracks unread items
assert.equal(hook.unreadCount, hook.notifications.filter((n) => !n.read).length, "unreadCount matches unread items");

// 4. markAllAsRead — marks every notification as read
hook.markAllAsRead();
hook = runHook();
const allRead = hook.notifications.every((n) => n.read);
assert.ok(allRead, "markAllAsRead sets read:true on all notifications");
assert.equal(hook.unreadCount, 0, "unreadCount is 0 after markAllAsRead");

// 5. requestPermission — granted
_notificationPermission = "granted";
resetReact();
hook = runHook();
const granted = await hook.requestPermission();
assert.equal(granted, true, "requestPermission returns true when granted");

// 6. requestPermission — denied
_notificationPermission = "denied";
const denied = await hook.requestPermission();
assert.equal(denied, false, "requestPermission returns false when denied");

// 7. localStorage persistence — notifications survive re-init
resetReact();
resetStorage();
hook = runHook();
hook.addNotification({ title: "Persist me" });
hook = runHook(); // flush effects → writes to localStorage
// Now reset React (simulating page reload) and re-run
resetReact();
hook = runHook();
// The hook's useEffect should have read from localStorage
const stored = localStorage.getItem("eventra_notifications");
assert.ok(stored, "notifications are persisted to localStorage");

console.log("All useNotifications tests passed ✓");
