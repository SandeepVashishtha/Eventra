import assert from "node:assert/strict";
import { computeDateStatus, getEventStatus, isEventRegistrationClosed } from "../src/utils/eventUtils.js";

const now = new Date();
const upcomingEvent = { date: new Date(now.getTime() + 86400000).toISOString() };
const pastEvent = { date: new Date(now.getTime() - 86400000).toISOString() };

assert.equal(computeDateStatus(upcomingEvent), "upcoming");
assert.equal(computeDateStatus(pastEvent), "past");

assert.equal(getEventStatus({ status: "ended" }), "ended");
assert.equal(isEventRegistrationClosed(pastEvent), true);

console.log("eventUtils tests passed ✓");
