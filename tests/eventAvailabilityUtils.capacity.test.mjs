import assert from "node:assert/strict";

const { isCapacityConflictError, CAPACITY_CONFLICT_STATUSES } = await import(
  "../src/utils/eventAvailabilityUtils.mjs"
);
const { getRegistrationFailureMessage } = await import(
  "../src/utils/registrationErrors.js"
);

const capacityMessage =
  "This event has reached maximum capacity. Please choose another event.";

const makeError = (status) => ({
  status,
  data: { message: "Event is at full capacity, no spots left" },
});

// Issue #16244: isCapacityConflictError must recognize 423 (not just 409) and
// must agree with getRegistrationFailureMessage on the set of statuses.

for (const status of CAPACITY_CONFLICT_STATUSES) {
  const err = makeError(status);
  assert.equal(
    isCapacityConflictError(err),
    true,
    `isCapacityConflictError should be true for status ${status}`
  );
  assert.equal(
    getRegistrationFailureMessage(err),
    capacityMessage,
    `getRegistrationFailureMessage should show capacity message for status ${status}`
  );
}

// A 409 that is NOT a capacity conflict (already-registered) is a conflict but
// a different message; isCapacityConflictError must be false for non-capacity 409s.
const dupError = {
  status: 409,
  data: { message: "You are already registered for this event" },
};
assert.equal(isCapacityConflictError(dupError), false);

// Non-capacity statuses are not capacity conflicts.
assert.equal(isCapacityConflictError({ status: 500, data: { message: "boom" } }), false);
assert.equal(isCapacityConflictError(null), false);
