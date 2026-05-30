import assert from "node:assert/strict";

const store = {};
global.localStorage = {
  getItem: (key) => (key in store ? store[key] : null),
  setItem: (key, value) => {
    store[key] = String(value);
  },
};
global.window = {
  localStorage: global.localStorage,
  dispatchEvent: () => {},
  atob: (value) => Buffer.from(value, "base64").toString("binary"),
};
global.CustomEvent = class CustomEvent {
  constructor(type, init) {
    this.type = type;
    this.detail = init?.detail;
  }
};

const {
  DEFAULT_NOTIFICATION_PREFERENCES,
  getNotificationCategory,
  normalizeNotificationPreferences,
  readNotificationPreferences,
  shouldDeliverNotification,
  urlBase64ToUint8Array,
} = await import("../src/utils/notificationPreferences.js");

assert.equal(getNotificationCategory({ category: "events" }), "events");
assert.equal(getNotificationCategory({ type: "UNKNOWN" }), "system");

const normalized = normalizeNotificationPreferences({ push: true, sound: "invalid" });
assert.equal(normalized.push, true);
assert.equal(normalized.sound, DEFAULT_NOTIFICATION_PREFERENCES.sound);
assert.equal(normalized.categories.events.inApp, true);

assert.deepEqual(readNotificationPreferences(), DEFAULT_NOTIFICATION_PREFERENCES);

assert.equal(
  shouldDeliverNotification({ category: "events" }, DEFAULT_NOTIFICATION_PREFERENCES, "inApp"),
  true
);
assert.equal(
  shouldDeliverNotification({ category: "events" }, { ...DEFAULT_NOTIFICATION_PREFERENCES, inApp: false }, "inApp"),
  false
);

const bytes = urlBase64ToUint8Array("AQID");
assert.deepEqual(Array.from(bytes), [1, 2, 3]);

console.log("notificationPreferences tests passed ✓");
