/**
 * Unit tests for src/utils/reminderUtils.js
 *
 * Covers the pure business-logic layer (getReminderId, isPastEvent,
 * getReminderTriggerTime, addReminder, removeReminder, hasReminder, etc.).
 *
 * The localStorage-backed read/write layer is stubbed via global.window so
 * all tests run in plain Node.js without a browser.
 */

import assert from "node:assert/strict";

// ── Minimal window / localStorage stubs ─────────────────────────────────────
const _lsStore = {};
const _listeners = {};

global.window = {
  localStorage: {
    getItem: (key) => (key in _lsStore ? _lsStore[key] : null),
    setItem: (key, val) => { _lsStore[key] = String(val); },
    removeItem: (key) => { delete _lsStore[key]; },
  },
  addEventListener: (event, cb) => {
    if (!_listeners[event]) _listeners[event] = [];
    _listeners[event].push(cb);
  },
  removeEventListener: (event, cb) => {
    if (_listeners[event]) {
      _listeners[event] = _listeners[event].filter((fn) => fn !== cb);
    }
  },
  dispatchEvent: (evt) => {
    const handlers = _listeners[evt.type] || [];
    handlers.forEach((fn) => fn(evt));
  },
};

global.CustomEvent = class CustomEvent {
  constructor(type, opts) {
    this.type = type;
    this.detail = opts?.detail;
  }
};

// ── Import module ────────────────────────────────────────────────────────────
const {
  REMINDER_TIMINGS,
  getReminderId,
  isPastEvent,
  getReminderTriggerTime,
  addReminder,
  removeReminder,
  hasReminder,
  getEventReminders,
  getReminders,
} = await import("../src/utils/reminderUtils.js");

// ── Helper ───────────────────────────────────────────────────────────────────
function resetStorage() {
  for (const k of Object.keys(_lsStore)) delete _lsStore[k];
}

function futureEvent(offsetMinutes = 120) {
  const d = new Date(Date.now() + offsetMinutes * 60 * 1000);
  return {
    id: "evt-1",
    title: "Test Event",
    date: d.toISOString().split("T")[0],   // YYYY-MM-DD
    time: d.toTimeString().slice(0, 5),    // HH:MM
    location: "Berlin",
  };
}

// ── REMINDER_TIMINGS constant ────────────────────────────────────────────────
assert.ok(Array.isArray(REMINDER_TIMINGS), "REMINDER_TIMINGS is an array");
assert.ok(REMINDER_TIMINGS.length > 0, "REMINDER_TIMINGS has at least one entry");
assert.ok(
  REMINDER_TIMINGS.every((t) => t.value && t.label && typeof t.minutesBefore === "number"),
  "each timing entry has value, label, and minutesBefore"
);

// ── getReminderId ────────────────────────────────────────────────────────────
assert.equal(
  getReminderId("evt-42", "15m"),
  "evt-42::15m",
  "getReminderId returns a colon-separated composite key"
);
assert.equal(
  getReminderId(99, "1h"),
  "99::1h",
  "getReminderId coerces numeric eventId to string"
);

// ── isPastEvent ──────────────────────────────────────────────────────────────
const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
assert.equal(
  isPastEvent({ date: pastDate.toISOString().split("T")[0] }),
  true,
  "isPastEvent returns true for a date in the past"
);

const event = futureEvent(360); // 6 hours in the future
assert.equal(
  isPastEvent(event),
  false,
  "isPastEvent returns false for an event 6 hours in the future"
);

assert.equal(
  isPastEvent({}),
  true,
  "isPastEvent returns true when event has no date"
);

// ── getReminderTriggerTime ────────────────────────────────────────────────────
const futureEvt = futureEvent(120);
const triggerTime = getReminderTriggerTime(futureEvt, "1h");
assert.ok(triggerTime instanceof Date, "getReminderTriggerTime returns a Date");
// Trigger should be ≈ 60 minutes before the event (within 10 seconds of expected)
const eventMs = new Date(`${futureEvt.date}T${futureEvt.time}`).getTime();
const expectedTrigger = eventMs - 60 * 60 * 1000;
assert.ok(
  Math.abs(triggerTime.getTime() - expectedTrigger) < 10_000,
  "getReminderTriggerTime is approximately 1 hour before the event"
);

assert.equal(
  getReminderTriggerTime(futureEvt, "invalid_timing"),
  null,
  "getReminderTriggerTime returns null for an unknown timing"
);

// ── addReminder : success ────────────────────────────────────────────────────
resetStorage();
const evt = futureEvent(480); // 8 hours ahead
const result = addReminder(evt, "1h");
assert.equal(result.ok, true, "addReminder returns ok:true for a valid future event");
assert.ok(result.reminder.id, "returned reminder has an id");
assert.equal(result.reminder.timing, "1h", "returned reminder has correct timing");
assert.ok(result.reminder.triggerAt, "returned reminder has a triggerAt timestamp");

// ── addReminder : duplicate ──────────────────────────────────────────────────
const dup = addReminder(evt, "1h");
assert.equal(dup.ok, false, "addReminder rejects a duplicate reminder");
assert.equal(dup.reason, "duplicate", "duplicate reason is 'duplicate'");

// ── addReminder : past event ─────────────────────────────────────────────────
const pastEvt = { id: "old-1", date: "2020-01-01", time: "10:00", title: "Past" };
const pastResult = addReminder(pastEvt, "15m");
assert.equal(pastResult.ok, false, "addReminder rejects a past event");
assert.equal(pastResult.reason, "past", "reason is 'past' for past events");

// ── hasReminder ───────────────────────────────────────────────────────────────
resetStorage();
const evtH = futureEvent(240);
addReminder(evtH, "15m");
assert.equal(hasReminder(evtH.id, "15m"), true, "hasReminder returns true after addReminder");
assert.equal(hasReminder(evtH.id, "1h"), false, "hasReminder returns false for missing timing");

// ── getReminders ──────────────────────────────────────────────────────────────
resetStorage();
const evtG = futureEvent(300);
addReminder(evtG, "15m");
addReminder(evtG, "1h");
const all = getReminders();
assert.equal(all.length, 2, "getReminders returns all stored reminders");

// ── getEventReminders ─────────────────────────────────────────────────────────
resetStorage();
const evtA = { ...futureEvent(300), id: "evtA" };
const evtB = { ...futureEvent(300), id: "evtB" };
addReminder(evtA, "15m");
addReminder(evtB, "1h");
const evtAReminders = getEventReminders("evtA");
assert.equal(evtAReminders.length, 1, "getEventReminders filters by eventId");
assert.equal(evtAReminders[0].eventId, "evtA", "returned reminder belongs to evtA");

// ── removeReminder ─────────────────────────────────────────────────────────────
resetStorage();
const evtR = futureEvent(200);
addReminder(evtR, "15m");
assert.equal(hasReminder(evtR.id, "15m"), true, "reminder exists before removal");
removeReminder(evtR.id, "15m");
assert.equal(hasReminder(evtR.id, "15m"), false, "reminder absent after removeReminder");

console.log("All reminderUtils tests passed ✓");
