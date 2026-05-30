import assert from "node:assert/strict";

const store = {};
globalThis.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => { store[key] = String(val); },
  removeItem: (key) => { delete store[key]; }
};
globalThis.dispatchEvent = () => {};
Object.defineProperty(globalThis, "window", { value: globalThis, configurable: true });

import {
  getNotificationCategory,
  normalizeNotificationPreferences,
  readNotificationPreferences,
  writeNotificationPreferences,
  shouldDeliverNotification,
  getNotificationTitle,
  getNotificationMessage,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_SOUNDS,
  DEFAULT_NOTIFICATION_PREFERENCES
} from "../src/utils/notificationPreferences.js";

// Test getNotificationCategory
assert.strictEqual(getNotificationCategory({ category: "registrations" }), "registrations", "category field should work");
assert.strictEqual(getNotificationCategory({ type: "events" }), "events", "type field should work");
assert.strictEqual(getNotificationCategory({ kind: "social" }), "social", "kind field should work");
assert.strictEqual(getNotificationCategory({ metadata: { category: "announcements" } }), "announcements", "metadata.category should work");
assert.strictEqual(getNotificationCategory({}), "system", "empty object should default to system");
assert.strictEqual(getNotificationCategory({ category: "invalid" }), "system", "unknown category should default to system");
assert.strictEqual(getNotificationCategory(null), "system", "null should default to system");

// Test normalizeNotificationPreferences
const normalized1 = normalizeNotificationPreferences({ inApp: false, push: true });
assert.strictEqual(normalized1.inApp, false, "should preserve explicit false");
assert.strictEqual(normalized1.push, true, "should preserve explicit true");
assert.ok(normalized1.categories, "should have categories object");

const normalized2 = normalizeNotificationPreferences({ sound: "invalid_sound" });
assert.strictEqual(normalized2.sound, "chime", "invalid sound should fallback to default");

const normalized3 = normalizeNotificationPreferences({});
assert.strictEqual(normalized3.emailDigest, "daily", "should have default emailDigest");

// Test readNotificationPreferences
delete store["eventra_notification_preferences"];
const defaults = readNotificationPreferences();
assert.strictEqual(defaults.inApp, true, "should return defaults when nothing stored");
assert.strictEqual(defaults.sound, "chime", "should have default sound");

const testPrefs = { inApp: false, sound: "pulse" };
store["eventra_notification_preferences"] = JSON.stringify(testPrefs);
const stored = readNotificationPreferences();
assert.strictEqual(stored.sound, "pulse", "should read sound from localStorage");
assert.strictEqual(stored.inApp, false, "should read inApp from localStorage");

store["eventra_notification_preferences"] = "invalid-json";
const corrupt = readNotificationPreferences();
assert.strictEqual(corrupt.inApp, true, "should fallback to defaults on corrupt JSON");

// Test writeNotificationPreferences
delete store["eventra_notification_preferences"];
writeNotificationPreferences({ inApp: false, sound: "bright" });
const written = JSON.parse(store["eventra_notification_preferences"]);
assert.strictEqual(written.inApp, false, "should write to localStorage");
assert.strictEqual(written.sound, "bright", "should write sound to localStorage");

// Test shouldDeliverNotification
const prefs1 = { inApp: true, push: false, email: false, categories: { registrations: { inApp: true, push: false, email: false } } };
assert.strictEqual(shouldDeliverNotification({ category: "registrations" }, prefs1, "inApp"), true, "inApp delivery should work when enabled");
assert.strictEqual(shouldDeliverNotification({ category: "registrations" }, prefs1, "push"), false, "push delivery should be false when disabled");

const prefs2 = { inApp: false, push: true, email: true, categories: { events: { inApp: false, push: true, email: true } } };
assert.strictEqual(shouldDeliverNotification({ category: "events" }, prefs2, "inApp"), false, "inApp should be false when disabled");

// Test getNotificationTitle
assert.strictEqual(getNotificationTitle({ title: "Test Title" }), "Test Title", "title field should work");
assert.strictEqual(getNotificationTitle({ heading: "Test Heading" }), "Test Heading", "heading field should work");
assert.strictEqual(getNotificationTitle({}), NOTIFICATION_CATEGORIES.system.label, "empty object should use system label");

// Test getNotificationMessage
assert.strictEqual(getNotificationMessage({ message: "Test Message" }), "Test Message", "message field should work");
assert.strictEqual(getNotificationMessage({ body: "Test Body" }), "Test Body", "body field should work");
assert.strictEqual(getNotificationMessage({ description: "Test Desc" }), "Test Desc", "description field should work");
assert.strictEqual(getNotificationMessage({}), "You have a new update.", "empty object should use default message");

// Test NOTIFICATION_CATEGORIES and NOTIFICATION_SOUNDS
assert.ok(NOTIFICATION_CATEGORIES.registrations, "should have registrations category");
assert.ok(NOTIFICATION_CATEGORIES.system, "should have system category");
assert.ok(NOTIFICATION_SOUNDS.chime, "should have chime sound");
assert.ok(NOTIFICATION_SOUNDS.none, "should have none sound");

// Test DEFAULT_NOTIFICATION_PREFERENCES
assert.strictEqual(DEFAULT_NOTIFICATION_PREFERENCES.inApp, true);
assert.strictEqual(DEFAULT_NOTIFICATION_PREFERENCES.emailDigest, "daily");

console.log("notificationPreferences tests passed ✓");