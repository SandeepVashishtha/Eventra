import assert from "node:assert/strict";
import { computeDateStatus, getEventStatus, isEventRegistrationClosed } from "../src/utils/eventUtils.js";

const now = new Date();
const upcomingEvent = { date: new Date(now.getTime() + 86400000).toISOString() };
const pastEvent = { date: new Date(now.getTime() - 86400000).toISOString() };

assert.equal(computeDateStatus(upcomingEvent), "upcoming");
assert.equal(computeDateStatus(pastEvent), "past");

assert.equal(getEventStatus({ status: "ended" }), "ended");
assert.equal(isEventRegistrationClosed(pastEvent), true);

// ── Issue 12462: moment-based live/past classification ──────────────────────
// An event whose start time has passed — even earlier the SAME calendar day —
// must be classified "past" (and registration closed), matching the backend's
// Event.isEventPast(). Previously the day-granular "live until midnight" kept
// the form enabled while the server rejected every submission.

const sameDayPastEvent = { eventDate: new Date(now.getTime() - 2 * 3600 * 1000).toISOString() };
assert.equal(computeDateStatus(sameDayPastEvent), "past");
assert.equal(getEventStatus(sameDayPastEvent), "past");
assert.equal(isEventRegistrationClosed(sameDayPastEvent), true);

const sameDayUpcomingEvent = { eventDate: new Date(now.getTime() + 2 * 3600 * 1000).toISOString() };
assert.equal(computeDateStatus(sameDayUpcomingEvent), "upcoming");
assert.equal(isEventRegistrationClosed(sameDayUpcomingEvent), false);

// Explicit backend "live" status still wins over the date-derived status.
assert.equal(getEventStatus({ status: "live", eventDate: new Date(now.getTime() - 3600 * 1000).toISOString() }), "live");

console.log("eventUtils tests passed ✓");
