import assert from "node:assert/strict";
import { scheduleReminder, getActiveReminders, cancelReminder } from "../src/utils/eventReminder.js";

// Mock Notification and window since we are in Node.js environment
globalThis.window = {
  focus: () => {},
  Notification: class {
    static permission = "granted";
    static requestPermission() {
      return Promise.resolve("granted");
    }
    constructor(title, options) {
      this.title = title;
      this.options = options;
    }
    close() {}
  }
};
globalThis.Notification = globalThis.window.Notification;

// 1. Basic scheduling and verification
const reminderId = scheduleReminder("Test Event", 50);
assert.ok(reminderId, "Should return a reminder ID");

const active = getActiveReminders();
assert.equal(active.length, 1, "Should have 1 active reminder");
assert.equal(active[0].id, reminderId, "Active reminder ID should match");

// 2. Cancellation verification
const cancelled = cancelReminder(reminderId);
assert.equal(cancelled, true, "Cancel should return true");
assert.equal(getActiveReminders().length, 0, "Active reminders should be empty after cancellation");

// 3. Overflow delay scheduling
const largeDelay = 3000000000; // > 2147483647
const largeReminderId = scheduleReminder("Future Event", largeDelay);
assert.ok(largeReminderId, "Should return a reminder ID for large delay");

const activeLarge = getActiveReminders();
assert.equal(activeLarge.length, 1, "Should have 1 active reminder for large delay");

// Clean up
cancelReminder(largeReminderId);

console.log("eventReminder scheduler and overflow tests passed ✓");
