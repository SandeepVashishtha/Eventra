import assert from "node:assert/strict";
import { normalizeEventAvailability } from "../src/utils/eventAvailabilityUtils.mjs";

const event = { attendees: 10, maxAttendees: 10 };
const norm = normalizeEventAvailability(event);
assert.equal(norm.isFull, true);
assert.equal(norm.spotsLeft, 0);
console.log("eventAvailabilityUtils edge tests passed ✓");
