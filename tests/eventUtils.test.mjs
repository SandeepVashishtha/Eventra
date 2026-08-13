import assert from "node:assert/strict";
import { computeDateStatus, getEventStatus, isEventRegistrationClosed } from "../src/utils/eventUtils.js";

const now = new Date();
const upcomingEvent = { date: new Date(now.getTime() + 86400000).toISOString() };
const pastEvent = { date: new Date(now.getTime() - 86400000).toISOString() };

assert.equal(computeDateStatus(upcomingEvent), "upcoming");
assert.equal(computeDateStatus(pastEvent), "past");

assert.equal(getEventStatus({ status: "ended" }), "ended");
assert.equal(isEventRegistrationClosed(pastEvent), true);

// ── Issue 12462 + 15450: day-granular "live" with moment-based registration ─
// An event whose start time has passed — even earlier the SAME calendar day —
// is classified "live" for display/filtering (matching the backend LIVE timing
// filter of EventSpecifications), but registration is still closed the moment
// the start time passes (matching the backend's Event.isEventPast()). This
// keeps the Live Now tab usable (#15450) without re-enabling a registration
// form the server rejects (#12462).

const sameDayPastEvent = { startDate: new Date(now.getTime() - 2 * 3600 * 1000).toISOString() };
assert.equal(computeDateStatus(sameDayPastEvent), "live");
assert.equal(getEventStatus(sameDayPastEvent), "live");
assert.equal(isEventRegistrationClosed(sameDayPastEvent), true);

const sameDayUpcomingEvent = { startDate: new Date(now.getTime() + 2 * 3600 * 1000).toISOString() };
assert.equal(computeDateStatus(sameDayUpcomingEvent), "upcoming");
assert.equal(isEventRegistrationClosed(sameDayUpcomingEvent), false);

// Explicit backend "live" status still wins over the date-derived status.
assert.equal(getEventStatus({ status: "live", startDate: new Date(now.getTime() - 3600 * 1000).toISOString() }), "live");

console.log("eventUtils tests passed ✓");
