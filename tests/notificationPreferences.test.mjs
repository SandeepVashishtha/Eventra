import assert from "node:assert/strict";
import {
  normalizeNotificationPreferences,
  shouldDeliverNotification,
  getNotificationTitle,
  getNotificationMessage,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_SOUNDS,
  DEFAULT_NOTIFICATION_PREFERENCES,
  getNotificationCategory,
} from "../src/utils/notificationPreferences.js";

assert.deepEqual(normalizeNotificationPreferences({}), DEFAULT_NOTIFICATION_PREFERENCES, "empty object returns defaults");

const partial = { inApp: false, email: false };
const merged = normalizeNotificationPreferences(partial);
assert.equal(merged.inApp, false, "partial prefs override inApp");
assert.equal(merged.email, false, "partial prefs override email");
assert.equal(merged.push, DEFAULT_NOTIFICATION_PREFERENCES.push, "unspecified push stays default");

const full = {
  inApp: true,
  push: true,
  email: false,
  sound: "pulse",
  categories: {
    registrations: { inApp: false, push: true, email: true },
  },
};
const normalized = normalizeNotificationPreferences(full);
assert.equal(normalized.email, false, "full prefs override email");
assert.equal(normalized.categories.registrations.inApp, false, "category override applies");
assert.equal(normalized.sound, "pulse", "sound is set");

assert.equal(normalizeNotificationPreferences({ sound: "nonexistent" }).sound, "chime", "invalid sound falls back to default");
assert.equal(normalizeNotificationPreferences({ sound: "bright" }).sound, "bright", "valid sound is kept");

const prefs = {
  inApp: true,
  push: true,
  email: true,
  categories: {
    registrations: { inApp: true, push: false, email: true },
    events: { inApp: true, push: true, email: false },
  },
};

assert.equal(shouldDeliverNotification({}, prefs, "inApp"), true, "inApp delivery when enabled");
assert.equal(shouldDeliverNotification({}, prefs, "push"), true, "push delivery for default system category");
assert.equal(shouldDeliverNotification({}, prefs, "email"), true, "email delivery when enabled");
assert.equal(shouldDeliverNotification({ category: "registrations" }, prefs, "push"), false, "push delivery blocked by category override");
const prefsInAppDisabled = { ...prefs, inApp: false };
assert.equal(shouldDeliverNotification({}, prefsInAppDisabled, "inApp"), false, "inApp delivery blocked when disabled globally");

assert.equal(getNotificationCategory({ category: "registrations" }), "registrations", "category field");
assert.equal(getNotificationCategory({ type: "events" }), "events", "type field");
assert.equal(getNotificationCategory({ kind: "announcements" }), "announcements", "kind field");
assert.equal(getNotificationCategory({ metadata: { category: "social" } }), "social", "nested metadata.category");
assert.equal(getNotificationCategory({}), "system", "default to system");

assert.equal(getNotificationTitle({ title: "Custom Title" }), "Custom Title", "title field takes priority");
assert.equal(getNotificationTitle({ heading: "Custom Heading" }), "Custom Heading", "heading field used when no title");
assert.equal(getNotificationTitle({}), NOTIFICATION_CATEGORIES.system.label, "default uses system category label");

assert.equal(getNotificationMessage({ message: "Custom Message" }), "Custom Message", "message field takes priority");
assert.equal(getNotificationMessage({ body: "Custom Body" }), "Custom Body", "body field used when no message");
assert.equal(getNotificationMessage({ description: "Custom Desc" }), "Custom Desc", "description field used when no body");
assert.equal(getNotificationMessage({}), "You have a new update.", "default message when nothing set");

assert.equal(getNotificationTitle({ title: "" }), NOTIFICATION_CATEGORIES.system.label, "empty title falls back");
assert.equal(getNotificationMessage({ message: "" }), "You have a new update.", "empty message falls back");

console.log("All notificationPreferences tests passed!");