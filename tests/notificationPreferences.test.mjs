import assert from "node:assert/strict";

// Mock browser globals
const mockStorage = {
  data: {},
  getItem(key) { return this.data[key] ?? null; },
  setItem(key, value) { this.data[key] = value; },
  removeItem(key) { delete this.data[key]; },
};
global.localStorage = mockStorage;
global.window = {
  localStorage: mockStorage,
  location: { href: "http://test/" },
  dispatchEvent: () => {},
  AudioContext: class AudioContext {
    createOscillator() { return { type: "", frequency: { value: 0 }, connect: () => {}, start: () => {}, stop: () => {}, onended: () => {} }; }
    createGain() { return { gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }; }
    close() {}
  },
  webkitAudioContext: null,
};
global.CustomEvent = class CustomEvent {
  constructor(type, detail) { this.type = type; this.detail = detail; }
};

const {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_SOUNDS,
  DEFAULT_NOTIFICATION_PREFERENCES,
  getNotificationCategory,
  normalizeNotificationPreferences,
  readNotificationPreferences,
  writeNotificationPreferences,
  shouldDeliverNotification,
  getNotificationTitle,
  getNotificationMessage,
} = await import("../src/utils/notificationPreferences.js");

// Reset localStorage
global.localStorage.data = {};

// ── NOTIFICATION_CATEGORIES and NOTIFICATION_SOUNDS ─────────────────────────

{
  assert.ok(NOTIFICATION_CATEGORIES, "NOTIFICATION_CATEGORIES should be exported");
  assert.ok(NOTIFICATION_CATEGORIES.registrations, "registrations category should exist");
  assert.ok(NOTIFICATION_CATEGORIES.events, "events category should exist");
  assert.equal(NOTIFICATION_CATEGORIES.registrations.label, "Registrations");
}

{
  assert.ok(NOTIFICATION_SOUNDS, "NOTIFICATION_SOUNDS should be exported");
  assert.ok(NOTIFICATION_SOUNDS.none, "none sound should exist");
  assert.ok(NOTIFICATION_SOUNDS.chime, "chime sound should exist");
  assert.equal(NOTIFICATION_SOUNDS.chime.frequency, 660);
}

// ── getNotificationCategory tests ──────────────────────────────────────────────

{
  assert.equal(getNotificationCategory({ category: "registrations" }), "registrations");
  assert.equal(getNotificationCategory({ type: "events" }), "events");
  assert.equal(getNotificationCategory({ kind: "announcements" }), "announcements");
  assert.equal(getNotificationCategory({ metadata: { category: "social" } }), "social");
}

{
  assert.equal(getNotificationCategory({}), "system", "unknown category defaults to system");
  assert.equal(getNotificationCategory(null), "system", "null notification defaults to system");
  assert.equal(getNotificationCategory(undefined), "system", "undefined notification defaults to system");
}

// ── normalizeNotificationPreferences tests ──────────────────────────────────

{
  const normalized = normalizeNotificationPreferences({});
  assert.equal(normalized.inApp, true);
  assert.equal(normalized.push, false);
  assert.equal(normalized.email, true);
  assert.equal(normalized.sound, "chime");
}

{
  const normalized = normalizeNotificationPreferences({ inApp: false, sound: "bright" });
  assert.equal(normalized.inApp, false, "should override inApp");
  assert.equal(normalized.sound, "bright", "should override sound");
  assert.equal(normalized.email, true, "should keep default email");
}

{
  const normalized = normalizeNotificationPreferences({ sound: "invalid" });
  assert.equal(normalized.sound, "chime", "invalid sound should fallback to default");
}

{
  const normalized = normalizeNotificationPreferences({ categories: { registrations: { push: false } } });
  assert.equal(normalized.categories.registrations.push, false, "should override category push");
  assert.equal(normalized.categories.registrations.inApp, true, "should keep default category inApp");
}

// ── readNotificationPreferences / writeNotificationPreferences tests ────────────

{
  global.localStorage.data = {};
  const written = writeNotificationPreferences({ inApp: false, sound: "pulse" });
  const read = readNotificationPreferences();
  assert.equal(read.inApp, false);
  assert.equal(read.sound, "pulse");
}

{
  global.localStorage.data = {};
  global.localStorage.data["eventra_notification_preferences"] = "not json";
  const prefs = readNotificationPreferences();
  assert.equal(prefs.inApp, true, "should fallback to defaults on parse error");
}

// ── shouldDeliverNotification tests ──────────────────────────────────────────

{
  const prefs = { inApp: true, push: false, email: true, categories: { registrations: { inApp: true, push: false, email: true } } };
  const notification = { category: "registrations" };
  assert.equal(shouldDeliverNotification(notification, prefs, "inApp"), true);
  assert.equal(shouldDeliverNotification(notification, prefs, "push"), false, "push disabled for registrations");
  assert.equal(shouldDeliverNotification(notification, prefs, "email"), true);
}

{
  const prefs = { inApp: false, push: false, email: false, categories: { events: { inApp: false, push: false, email: false } } };
  const notification = { category: "events" };
  assert.equal(shouldDeliverNotification(notification, prefs, "inApp"), false, "all disabled");
}

{
  const prefs = { inApp: true, push: true, email: true, categories: { unknown_cat: { inApp: true, push: true, email: true } } };
  const notification = { category: "unknown_cat" };
  assert.equal(shouldDeliverNotification(notification, prefs, "inApp"), true, "unknown category should fallback to system");
}

// ── getNotificationTitle tests ────────────────────────────────────────────────

{
  assert.equal(getNotificationTitle({ title: "Hello" }), "Hello");
  assert.equal(getNotificationTitle({ heading: "World" }), "World");
  assert.equal(getNotificationTitle({ title: "A", heading: "B" }), "A", "title takes precedence");
  assert.equal(getNotificationTitle({}), NOTIFICATION_CATEGORIES.system.label);
  assert.equal(getNotificationTitle(undefined), NOTIFICATION_CATEGORIES.system.label);
}

// ── getNotificationMessage tests ──────────────────────────────────────────────

{
  assert.equal(getNotificationMessage({ message: "Msg1" }), "Msg1");
  assert.equal(getNotificationMessage({ body: "Body1" }), "Body1");
  assert.equal(getNotificationMessage({ description: "Desc1" }), "Desc1");
  assert.equal(getNotificationMessage({ message: "A", body: "B" }), "A", "message takes precedence");
  assert.equal(getNotificationMessage({}), "You have a new update.", "fallback message");
}

console.log("All notificationPreferences tests passed!");
