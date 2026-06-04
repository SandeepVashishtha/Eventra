/**
 * Unit tests for src/hooks/useNotifications.js
 *
 * The hook now writes new notifications through notificationQueue. addNotification()
 * enqueues work first; visible hook state is refreshed after the queue flushes
 * to IndexedDB and emits eventra-notifications-updated.
 */

import assert from "node:assert/strict";

const STORAGE_KEY = "eventra_notifications";
const FLUSH_INTERVAL_MS = 300;

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

let _notificationPermission = "default";
global.Notification = {
  requestPermission: async () => _notificationPermission,
};

const _listeners = new Map();
global.window = {
  ...global,
  Notification: global.Notification,
  localStorage: global.localStorage,
  addEventListener(event, cb) {
    if (!_listeners.has(event)) _listeners.set(event, []);
    _listeners.get(event).push(cb);
  },
  removeEventListener(event, cb) {
    if (!_listeners.has(event)) return;
    _listeners.set(
      event,
      _listeners.get(event).filter((listener) => listener !== cb)
    );
  },
  dispatchEvent(event) {
    const eventName = typeof event === "string" ? event : event.type;
    if (_listeners.has(eventName)) {
      for (const cb of [..._listeners.get(eventName)]) {
        cb(event);
      }
    }
    return true;
  },
};

global.CustomEvent = class CustomEvent {
  constructor(type, options) {
    this.type = type;
    this.detail = options?.detail;
  }
};

let _stateSlots = [];
let _stateIndex = 0;
let _effects = [];
let _effectStates = [];
let _effectIndex = 0;
let _cleanups = [];

function resetReact() {
  for (const cleanup of _cleanups) cleanup();
  _stateSlots = [];
  _stateIndex = 0;
  _effects = [];
  _effectStates = [];
  _effectIndex = 0;
  _cleanups = [];
}

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
      _effectStates[idx] = deps ? [...deps] : [];
      _effects.push(fn);
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

const { useNotifications } = await import("../src/hooks/useNotifications.js");

function resetStorage() {
  for (const key of Object.keys(_lsStore)) delete _lsStore[key];
}

function renderHook() {
  _stateIndex = 0;
  _effectIndex = 0;
  _effects = [];
  useNotifications();

  for (const effect of _effects) {
    const cleanup = effect();
    if (typeof cleanup === "function") _cleanups.push(cleanup);
  }

  _stateIndex = 0;
  _effectIndex = 0;
  _effects = [];
  return useNotifications();
}

function readStoredNotifications() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForQueueFlush() {
  await delay(FLUSH_INTERVAL_MS + 80);
  await Promise.resolve();
}

async function renderAfterQueueFlush() {
  await waitForQueueFlush();
  return renderHook();
}

function freshHook() {
  resetStorage();
  resetReact();
  return renderHook();
}

// 1. Initial state.
let hook = freshHook();
assert.ok(Array.isArray(hook.notifications), "notifications is an array");
assert.equal(hook.unreadCount, 0, "unreadCount starts at 0");
assert.equal(typeof hook.addNotification, "function", "addNotification is a function");
assert.equal(typeof hook.markAllAsRead, "function", "markAllAsRead is a function");
assert.equal(typeof hook.requestPermission, "function", "requestPermission is a function");

// 2. addNotification queues first; visibility waits for queue processing.
hook = freshHook();
hook.addNotification({ title: "Test alert", message: "Hello" });
hook = renderHook();
assert.equal(
  hook.notifications.length,
  0,
  "queued notification is not visible before the queue flushes"
);
assert.equal(
  readStoredNotifications().length,
  0,
  "queued notification is not persisted before the queue flushes"
);

hook = await renderAfterQueueFlush();
assert.equal(hook.notifications.length, 1, "notification appears after queue flush");
const added = hook.notifications[0];
assert.equal(added.title, "Test alert", "notification has correct title");
assert.equal(added.message, "Hello", "notification has correct message");
assert.equal(added.read, false, "new notification is unread");
assert.ok(added.id, "notification has an auto-generated id");
assert.ok(added.createdAt, "notification has a createdAt timestamp");
assert.equal(readStoredNotifications().length, 1, "notification is persisted after flush");

// 3. unreadCount tracks flushed unread items.
assert.equal(
  hook.unreadCount,
  hook.notifications.filter((notification) => !notification.read).length,
  "unreadCount matches unread items"
);

// 4. Multiple queued notifications flush as one newest-first batch.
hook = freshHook();
hook.addNotification({ message: "First" });
hook.addNotification({ message: "Second" });
hook = await renderAfterQueueFlush();
assert.deepEqual(
  hook.notifications.map((notification) => notification.message),
  ["First", "Second"],
  "multiple notifications from the same queue batch preserve enqueue order"
);
assert.equal(hook.unreadCount, 2, "unreadCount includes all queued unread notifications");

// 5. Existing persisted notifications remain behind the new queued batch.
resetReact();
resetStorage();
localStorage.setItem(
  STORAGE_KEY,
  JSON.stringify([{ id: "old", message: "Existing", read: false }])
);
hook = renderHook();
hook.addNotification({ message: "New" });
hook = await renderAfterQueueFlush();
assert.deepEqual(
  hook.notifications.map((notification) => notification.message),
  ["New", "Existing"],
  "queued batch is prepended before existing persisted notifications"
);

// 6. Rapid successive notifications are processed without loss.
hook = freshHook();
for (let i = 0; i < 10; i += 1) {
  hook.addNotification({ message: `Rapid ${i}` });
}
hook = await renderAfterQueueFlush();
assert.equal(hook.notifications.length, 10, "rapid queued notifications are all delivered");
assert.deepEqual(
  hook.notifications.map((notification) => notification.message),
  Array.from({ length: 10 }, (_, index) => `Rapid ${index}`),
  "rapid queued notifications keep deterministic batch order"
);

// 7. markAllAsRead updates visible notification state.
hook.markAllAsRead();
hook = renderHook();
assert.ok(
  hook.notifications.every((notification) => notification.read),
  "markAllAsRead sets read:true on all visible notifications"
);
assert.equal(hook.unreadCount, 0, "unreadCount is 0 after markAllAsRead");

// 8. requestPermission returns the browser permission result.
_notificationPermission = "granted";
hook = freshHook();
const granted = await hook.requestPermission();
assert.equal(granted, true, "requestPermission returns true when granted");

_notificationPermission = "denied";
const denied = await hook.requestPermission();
assert.equal(denied, false, "requestPermission returns false when denied");

// 9. Persisted notifications survive a fresh hook mount.
hook = freshHook();
hook.addNotification({ title: "Persist me" });
hook = await renderAfterQueueFlush();
assert.ok(localStorage.getItem(STORAGE_KEY), "notifications are persisted after queue flush");

resetReact();
hook = renderHook();
assert.equal(hook.notifications.length, 1, "persisted notification loads on remount");
assert.equal(hook.notifications[0].title, "Persist me", "persisted notification content loads");

resetReact();

console.log("All useNotifications queue lifecycle tests passed");
