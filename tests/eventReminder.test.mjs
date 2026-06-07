/**
 * Tests for src/utils/eventReminder.js
 *
 * Verifies notification permission and reminder scheduling utilities.
 *
 * Note on mocking: The module uses bare `Notification` identifier which resolves
 * to globalThis.Notification at call time. We must set the mock BEFORE importing.
 */

import { describe, it, after } from "node:test";
import assert from "node:assert/strict";

// ─── State ────────────────────────────────────────────────────────────────────

let mockPermission = "default";
let notificationInstances = [];

const MockNotification = class MockNotification {
  static requestPermission = () => Promise.resolve(mockPermission);
  constructor(title, options) {
    this.title = title;
    this.body = options?.body;
    notificationInstances.push(this);
  }
};

// Set mock BEFORE importing — bare `Notification` in module resolves via globalThis
(globalThis.Notification) = MockNotification;
(globalThis.window) = { Notification: MockNotification };

const {
  requestNotificationPermission,
  scheduleReminder,
} = await import("../src/utils/eventReminder.js");

// ─── Cleanup ─────────────────────────────────────────────────────────────────

after(() => {
  delete globalThis.Notification;
  delete globalThis.window;
});

// ─── requestNotificationPermission ──────────────────────────────────────────

describe("requestNotificationPermission", () => {
  it("returns false when Notification is not available in window", async () => {
    // Remove Notification from window (but keep it on globalThis for subsequent tests)
    const saved = globalThis.window.Notification;
    delete globalThis.window.Notification;
    const result = await requestNotificationPermission();
    globalThis.window.Notification = saved;
    assert.equal(result, false);
  });

  it("returns false when permission is denied", async () => {
    mockPermission = "denied";
    const result = await requestNotificationPermission();
    mockPermission = "default";
    assert.equal(result, false);
  });

  it("returns false when permission is default", async () => {
    mockPermission = "default";
    const result = await requestNotificationPermission();
    assert.equal(result, false);
  });

  it("returns true when permission is granted", async () => {
    mockPermission = "granted";
    const result = await requestNotificationPermission();
    mockPermission = "default";
    assert.equal(result, true);
  });
});

// ─── scheduleReminder ─────────────────────────────────────────────────────────

describe("scheduleReminder", () => {
  it("does not throw synchronously when called with valid args", async () => {
    notificationInstances.length = 0;
    scheduleReminder("My Event", 10);
    await new Promise((resolve) => setTimeout(resolve, 30));
    assert.equal(notificationInstances.length, 1);
  });

  it("does not throw for empty title", async () => {
    notificationInstances.length = 0;
    scheduleReminder("", 10);
    await new Promise((resolve) => setTimeout(resolve, 30));
    assert.equal(notificationInstances.length, 1);
  });

  it("does not throw for zero delay", async () => {
    notificationInstances.length = 0;
    scheduleReminder("Zero", 0);
    await new Promise((resolve) => setTimeout(resolve, 20));
    assert.equal(notificationInstances.length, 1);
  });

  it("fires Notification after delay expires", async () => {
    notificationInstances.length = 0;
    scheduleReminder("Delayed Event", 20);
    await new Promise((resolve) => setTimeout(resolve, 60));
    assert.equal(notificationInstances.length, 1);
    assert.equal(notificationInstances[0].title, "Event Reminder");
    assert.ok(notificationInstances[0].body?.includes("Delayed Event"));
  });

  it("fires Notification with zero delay on next tick", async () => {
    notificationInstances.length = 0;
    scheduleReminder("Zero Delay", 0);
    await new Promise((resolve) => setTimeout(resolve, 20));
    assert.equal(notificationInstances.length, 1);
    assert.ok(notificationInstances[0].body?.includes("Zero Delay"));
  });

  it("body includes the event title", async () => {
    notificationInstances.length = 0;
    scheduleReminder("Hackathon Starting", 10);
    await new Promise((resolve) => setTimeout(resolve, 40));
    assert.ok(notificationInstances[0].body?.includes("Hackathon Starting"));
  });

  it("handles empty string title", async () => {
    notificationInstances.length = 0;
    scheduleReminder("", 10);
    await new Promise((resolve) => setTimeout(resolve, 40));
    assert.equal(notificationInstances.length, 1);
  });

  it("handles very long title", async () => {
    notificationInstances.length = 0;
    const longTitle = "A".repeat(1000);
    scheduleReminder(longTitle, 10);
    await new Promise((resolve) => setTimeout(resolve, 40));
    assert.ok(notificationInstances[0].body?.includes(longTitle));
  });
});

console.log("eventReminder tests passed ✓");