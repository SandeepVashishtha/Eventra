import assert from "node:assert/strict";

import {
  isCapacityConflictError,
  isEventAtCapacity,
  mergeAvailabilityIntoEvent,
  normalizeEventAvailability,
} from "../src/utils/eventAvailabilityUtils.mjs";

assert.deepEqual(
  normalizeEventAvailability({ capacity: 1, registeredCount: 1 }),
  {
    capacity: 1,
    registeredCount: 1,
    spotsLeft: 0,
    isFull: true,
  },
  "backend capacity/registeredCount payload marks event full"
);

assert.deepEqual(
  normalizeEventAvailability({ maxAttendees: 2, attendees: 1 }),
  {
    capacity: 2,
    registeredCount: 1,
    spotsLeft: 1,
    isFull: false,
  },
  "legacy frontend attendees/maxAttendees payload stays supported"
);

assert.equal(
  isEventAtCapacity({ capacity: 3, registeredCount: 3 }),
  true,
  "event is full when registered count reaches capacity"
);

assert.equal(
  isEventAtCapacity({ capacity: null, registeredCount: 500 }),
  false,
  "null capacity remains unlimited unless backend explicitly says full"
);

assert.equal(
  isEventAtCapacity({ isFull: true, capacity: 100, registeredCount: 20 }),
  true,
  "explicit backend isFull flag is respected"
);

assert.deepEqual(
  mergeAvailabilityIntoEvent(
    { id: 10, title: "React Workshop", maxAttendees: 5, attendees: 2 },
    { capacity: 5, registeredCount: 5, spotsLeft: 0, isFull: true }
  ),
  {
    id: 10,
    title: "React Workshop",
    maxAttendees: 5,
    attendees: 5,
    capacity: 5,
    registeredCount: 5,
    spotsLeft: 0,
    isFull: true,
  },
  "fresh backend availability is merged into existing event state"
);

assert.equal(
  isCapacityConflictError({
    status: 409,
    data: { message: "Event is already full. Capacity: 1" },
  }),
  true,
  "409 full/capacity conflict is recognized"
);

assert.equal(
  isCapacityConflictError({
    status: 400,
    data: { message: "Event is already full" },
  }),
  false,
  "non-conflict status is not treated as booking capacity conflict"
);

console.log("event availability utility tests passed");