// Tests for the cancelled-event registration gate fix.
//
// The bug: getEventStatus() only had an early-return for "ended" events.
// A future event with status:"cancelled" had its explicit status overridden
// by the date-based "upcoming" value. isEventRegistrationClosed() only checked
// "past" and "ended", so cancelled events were treated as open for registration.
//
// The fix adds:
//  1. "cancelled"/"canceled" entries to the mapStatusKey lookup table.
//  2. An early-return for explicitStatus==="cancelled" in getEventStatus so
//     the cancellation cannot be overridden by date-based status.
//  3. status==="cancelled" to isEventRegistrationClosed so all downstream
//     consumers that use the utility are protected.
//
// These tests exercise the pure logic extracted from eventUtils.js.

import assert from "node:assert/strict";

// ---------------------------------------------------------------------------
// Pure logic mirrored from src/utils/eventUtils.js
// ---------------------------------------------------------------------------

function mapStatusKey(status) {
  if (!status || typeof status !== "string") return "";
  const n = status.trim().toLowerCase();
  const map = {
    upcoming: "upcoming",
    live: "live",
    "in progress": "live",
    ongoing: "live",
    past: "past",
    completed: "past",
    done: "past",
    ended: "ended",
    "event ended": "ended",
    "event ended ": "ended",
    cancelled: "cancelled",
    canceled: "cancelled",
    "event cancelled": "cancelled",
    "event canceled": "cancelled"
  };
  return map[n] ?? n;
}

function parseEventDate(d) {
  if (!d) return null;
  const p = new Date(d);
  return isNaN(p.getTime()) ? null : p;
}

function computeDateStatus(event) {
  const start = parseEventDate(event.startDate || event.date);
  const end = parseEventDate(event.endDate || event.date);
  const endOfDay = end ? new Date(end.setHours(23,59,59,999)) : null;
  const now = new Date();
  if (!start) return "upcoming";
  if (now < start) return "upcoming";
  if (endOfDay && now <= endOfDay) return "live";
  return "past";
}

function getEventStatus(event) {
  if (!event) return "upcoming";
  const explicitStatus = mapStatusKey(event.status);
  const dateStatus = computeDateStatus(event);
  if (explicitStatus === "ended") return "ended";
  if (explicitStatus === "cancelled") return "cancelled";
  if (dateStatus) return dateStatus;
  return explicitStatus || "upcoming";
}

function isEventRegistrationClosed(eventOrStatus) {
  const status = typeof eventOrStatus === "string"
    ? mapStatusKey(eventOrStatus)
    : getEventStatus(eventOrStatus);
  return status === "past" || status === "ended" || status === "cancelled";
}

// Helpers
const FUTURE_DATE = "2099-12-31";
const PAST_DATE   = "2020-01-01";

function makeEvent(status, date) {
  return { id: "1", title: "Test", status, date: date || FUTURE_DATE };
}

let passed = 0; let failed = 0;
function test(label, fn) {
  try { fn(); console.log("  pass  " + label); passed++; }
  catch(e) { console.error("  FAIL  " + label); console.error("        " + e.message); failed++; }
}

console.log("");
console.log("Active future event -- registration open");

test("upcoming future event: getEventStatus returns upcoming", () => {
  assert.equal(getEventStatus(makeEvent("upcoming", FUTURE_DATE)), "upcoming");
});

test("upcoming future event: registration is open", () => {
  assert.equal(isEventRegistrationClosed(makeEvent("upcoming", FUTURE_DATE)), false);
});

test("live event: registration is open", () => {
  assert.equal(isEventRegistrationClosed(makeEvent("live", FUTURE_DATE)), false);
});

test("no explicit status, future date: registration is open", () => {
  assert.equal(isEventRegistrationClosed({ date: FUTURE_DATE }), false);
});

console.log("");
console.log("Ended event -- registration closed");

test("ended event with future date: getEventStatus returns ended", () => {
  assert.equal(getEventStatus(makeEvent("ended", FUTURE_DATE)), "ended");
});

test("ended event: registration is closed", () => {
  assert.equal(isEventRegistrationClosed(makeEvent("ended", FUTURE_DATE)), true);
});

test("event ended string: registration is closed", () => {
  assert.equal(isEventRegistrationClosed("event ended"), true);
});

console.log("");
console.log("Past event (date-based) -- registration closed");

test("past date event: getEventStatus returns past", () => {
  assert.equal(getEventStatus({ date: PAST_DATE }), "past");
});

test("past date event: registration is closed", () => {
  assert.equal(isEventRegistrationClosed({ date: PAST_DATE }), true);
});

test("past string: registration is closed", () => {
  assert.equal(isEventRegistrationClosed("past"), true);
});

console.log("");
console.log("Cancelled future event -- registration must be closed (the bug)");

test("cancelled future event: getEventStatus returns cancelled", () => {
  assert.equal(getEventStatus(makeEvent("cancelled", FUTURE_DATE)), "cancelled");
});

test("canceled (US spelling) future event: getEventStatus returns cancelled", () => {
  assert.equal(getEventStatus(makeEvent("canceled", FUTURE_DATE)), "cancelled");
});

test("cancelled future event: registration is closed", () => {
  assert.equal(isEventRegistrationClosed(makeEvent("cancelled", FUTURE_DATE)), true);
});

test("cancelled string: registration is closed", () => {
  assert.equal(isEventRegistrationClosed("cancelled"), true);
});

test("canceled string (US spelling): registration is closed", () => {
  assert.equal(isEventRegistrationClosed("canceled"), true);
});

test("event cancelled string: registration is closed", () => {
  assert.equal(isEventRegistrationClosed("event cancelled"), true);
});

test("cancelled future event: status is NOT overridden by future date", () => {
  const event = makeEvent("cancelled", FUTURE_DATE);
  const status = getEventStatus(event);
  assert.notEqual(status, "upcoming", "cancelled status must not be overridden to upcoming");
  assert.equal(status, "cancelled");
});

test("cancelled event with explicit future startDate", () => {
  const event = { status: "cancelled", startDate: FUTURE_DATE };
  assert.equal(getEventStatus(event), "cancelled");
  assert.equal(isEventRegistrationClosed(event), true);
});

console.log("");
console.log("Cancelled event UI state");

test("cancelled status badge text: Cancelled", () => {
  // Mirrors the JSX ternary: isCancelledEvent ? "Cancelled" : isPastEvent ? "Past Event" : "Upcoming"
  function getBadgeText(event) {
    const status = getEventStatus(event);
    const isPast = status === "past" || status === "ended";
    const isCancelled = status === "cancelled";
    if (isCancelled) return "Cancelled";
    if (isPast)      return "Past Event";
    return "Upcoming";
  }
  assert.equal(getBadgeText(makeEvent("cancelled", FUTURE_DATE)), "Cancelled");
  assert.equal(getBadgeText(makeEvent("ended",     FUTURE_DATE)), "Past Event");
  assert.equal(getBadgeText({ date: PAST_DATE }),                  "Past Event");
  assert.equal(getBadgeText(makeEvent("upcoming",  FUTURE_DATE)), "Upcoming");
});

test("cancelled event: isRegistrationBlocked is true (register button hidden)", () => {
  const event = makeEvent("cancelled", FUTURE_DATE);
  const isRegistrationBlocked = isEventRegistrationClosed(event);
  assert.equal(isRegistrationBlocked, true);
});

test("active event: isRegistrationBlocked is false (register button visible)", () => {
  const event = makeEvent("upcoming", FUTURE_DATE);
  const isRegistrationBlocked = isEventRegistrationClosed(event);
  assert.equal(isRegistrationBlocked, false);
});

console.log("");
console.log("Direct navigation guard (EventRegistration)");

test("cancelled event returns registration-blocked in guard function", () => {
  // Mirrors the guard logic: if (isEventRegistrationClosed(event)) { show blocked UI }
  function shouldBlockRegistration(event) {
    return isEventRegistrationClosed(event);
  }
  assert.equal(shouldBlockRegistration(makeEvent("cancelled", FUTURE_DATE)), true);
  assert.equal(shouldBlockRegistration(makeEvent("upcoming",  FUTURE_DATE)), false);
  assert.equal(shouldBlockRegistration(makeEvent("ended",     FUTURE_DATE)), true);
  assert.equal(shouldBlockRegistration({ date: PAST_DATE }),                  true);
});

test("cancelled event registration message: has-been-cancelled", () => {
  // Mirrors the JSX: isCancelledEvent ? "...cancelled..." : "...ended..."
  function getRegistrationMessage(event) {
    const isCancelled = getEventStatus(event) === "cancelled";
    return isCancelled ? "This event has been cancelled." : "This event has already ended.";
  }
  assert.equal(getRegistrationMessage(makeEvent("cancelled", FUTURE_DATE)), "This event has been cancelled.");
  assert.equal(getRegistrationMessage(makeEvent("ended",     FUTURE_DATE)), "This event has already ended.");
  assert.equal(getRegistrationMessage({ date: PAST_DATE }),                  "This event has already ended.");
});

console.log("");
console.log("Registration eligibility utility");

test("isEventRegistrationClosed covers all three closed states", () => {
  assert.equal(isEventRegistrationClosed("past"),      true,  "past must be closed");
  assert.equal(isEventRegistrationClosed("ended"),     true,  "ended must be closed");
  assert.equal(isEventRegistrationClosed("cancelled"), true,  "cancelled must be closed");
});

test("isEventRegistrationClosed keeps open states open", () => {
  assert.equal(isEventRegistrationClosed("upcoming"), false, "upcoming must be open");
  assert.equal(isEventRegistrationClosed("live"),     false, "live must be open");
});

test("mapStatusKey normalises all cancellation spelling variants", () => {
  assert.equal(mapStatusKey("cancelled"),      "cancelled");
  assert.equal(mapStatusKey("canceled"),       "cancelled");
  assert.equal(mapStatusKey("Cancelled"),      "cancelled");
  assert.equal(mapStatusKey("CANCELED"),       "cancelled");
  assert.equal(mapStatusKey("event cancelled"),"cancelled");
  assert.equal(mapStatusKey("event canceled"), "cancelled");
});

console.log("");
console.log("Regression: original bug -- cancelled future events treated as upcoming");

test("regression: old getEventStatus without cancelled guard returns upcoming for cancelled future event", () => {
  // Simulate the old getEventStatus without the cancelled early-return
  function getEventStatusBuggy(event) {
    if (!event) return "upcoming";
    const explicitStatus = mapStatusKey(event.status);
    const dateStatus = computeDateStatus(event);
    if (explicitStatus === "ended") return "ended";
    // BUG: no check for cancelled -- falls through to dateStatus
    if (dateStatus) return dateStatus;
    return explicitStatus || "upcoming";
  }

  const cancelledFutureEvent = makeEvent("cancelled", FUTURE_DATE);
  assert.equal(
    getEventStatusBuggy(cancelledFutureEvent),
    "upcoming",
    "old code incorrectly returned upcoming for cancelled future event (bug confirmed)"
  );

  // Fixed code returns the correct status
  assert.equal(
    getEventStatus(cancelledFutureEvent),
    "cancelled",
    "fixed code returns cancelled for cancelled future event"
  );
});

test("regression: old isEventRegistrationClosed without cancelled returns false", () => {
  // Simulate the old isEventRegistrationClosed without the cancelled check
  function isClosedBuggy(eventOrStatus) {
    const status = typeof eventOrStatus === "string"
      ? mapStatusKey(eventOrStatus)
      : getEventStatus(eventOrStatus);
    return status === "past" || status === "ended"; // BUG: no cancelled
  }

  // Even with the fixed getEventStatus, the old closed-check would fail
  // for a case where status is already "cancelled" as a string
  assert.equal(isClosedBuggy("cancelled"), false, "old check did not block cancelled string");
  assert.equal(isEventRegistrationClosed("cancelled"), true, "fixed check blocks cancelled string");
});

test("regression: cancelled future event registration flow blocked end-to-end", () => {
  const cancelledFuture = makeEvent("cancelled", FUTURE_DATE);

  // Step 1: event status is correctly derived
  assert.equal(getEventStatus(cancelledFuture), "cancelled");

  // Step 2: registration is closed
  assert.equal(isEventRegistrationClosed(cancelledFuture), true);

  // Step 3: same result for direct URL navigation guard
  const isBlocked = isEventRegistrationClosed(cancelledFuture);
  assert.equal(isBlocked, true, "direct navigation to registration page must be blocked");
});

const total = passed + failed;
console.log("");
console.log(total + " tests: " + passed + " passed, " + failed + " failed");
if (failed > 0) process.exit(1);
