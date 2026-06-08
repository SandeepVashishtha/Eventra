import assert from "node:assert/strict";

const { resolveCapacity, checkCapacity } = await import(
  "../api/lib/capacityValidator.js"
);
const handlerModule = await import("../api/events/register.js");
const registerForEvent = handlerModule.default;

function makeRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

// --- resolveCapacity precedence and guards ---
{
  assert.equal(resolveCapacity({ maxAttendees: 50 }), 50, "uses maxAttendees");
  assert.equal(resolveCapacity({ capacity: 30 }), 30, "falls back to capacity");
  assert.equal(
    resolveCapacity({ maxAttendees: 50, capacity: 30 }),
    50,
    "maxAttendees wins"
  );
  assert.equal(resolveCapacity({}), 0, "missing capacity is 0");
  assert.equal(resolveCapacity({ capacity: -5 }), 0, "negative clamped to 0");
  assert.equal(resolveCapacity(null), 0, "null event is 0");
}

// --- checkCapacity: below, at, and over limit ---
{
  const event = { capacity: 100 };

  assert.equal(
    checkCapacity({ event, currentCount: 99 }).allowed,
    true,
    "99/100 allows one more"
  );

  const atLimit = checkCapacity({ event, currentCount: 100 });
  assert.equal(atLimit.allowed, false, "100/100 rejected");
  assert.equal(atLimit.reason, "Event is at full capacity", "full message");
  assert.equal(atLimit.remaining, 0, "no remaining seats");

  const over = checkCapacity({ event, currentCount: 150 });
  assert.equal(over.allowed, false, "over capacity rejected");
}

// --- checkCapacity: unlimited when capacity 0 ---
{
  const result = checkCapacity({ event: {}, currentCount: 9999 });
  assert.equal(result.allowed, true, "0 capacity treated as unlimited");
  assert.equal(result.remaining, Infinity, "remaining is Infinity");
}

// --- checkCapacity: multi-seat requests ---
{
  const event = { capacity: 100 };
  assert.equal(
    checkCapacity({ event, currentCount: 98, requestedSeats: 2 }).allowed,
    true,
    "98 + 2 seats fits exactly"
  );
  assert.equal(
    checkCapacity({ event, currentCount: 99, requestedSeats: 2 }).allowed,
    false,
    "99 + 2 seats exceeds"
  );
}

const event = { id: "evt-1", capacity: 100 };

function baseDeps(count) {
  return {
    getEventById: async () => event,
    getRegistrationCount: async () => count,
    isAlreadyRegistered: async () => false,
    registerAttendee: async (eventId, userId) => ({
      id: "reg-new",
      eventId,
      userId,
    }),
    getEventId: (req) => req.params.id,
  };
}

const user = { id: 42 };

// --- handler: registration succeeds with open seats ---
{
  const res = makeRes();
  await registerForEvent(
    { method: "POST", user, params: { id: "evt-1" } },
    res,
    baseDeps(50)
  );
  assert.equal(res.statusCode, 201, "registration accepted with open seats");
  assert.equal(res.body.registration.userId, 42, "registration records user");
}

// --- handler: registration rejected at capacity (the core fix) ---
{
  const res = makeRes();
  await registerForEvent(
    { method: "POST", user, params: { id: "evt-1" } },
    res,
    baseDeps(100)
  );
  assert.equal(res.statusCode, 409, "registration rejected at capacity");
  assert.equal(res.body.error, "Event is at full capacity", "409 message");
}

// --- handler: duplicate registration rejected ---
{
  const deps = baseDeps(10);
  deps.isAlreadyRegistered = async () => true;
  const res = makeRes();
  await registerForEvent(
    { method: "POST", user, params: { id: "evt-1" } },
    res,
    deps
  );
  assert.equal(res.statusCode, 409, "duplicate registration rejected");
}

// --- handler: concurrent fill surfaced as 409 via CAPACITY_FULL ---
{
  const deps = baseDeps(99);
  deps.registerAttendee = async () => {
    const err = new Error("race");
    err.code = "CAPACITY_FULL";
    throw err;
  };
  const res = makeRes();
  await registerForEvent(
    { method: "POST", user, params: { id: "evt-1" } },
    res,
    deps
  );
  assert.equal(res.statusCode, 409, "atomic insert conflict returns 409");
}

// --- handler: unauthenticated rejected ---
{
  const res = makeRes();
  await registerForEvent(
    { method: "POST", params: { id: "evt-1" } },
    res,
    baseDeps(0)
  );
  assert.equal(res.statusCode, 401, "missing user returns 401");
}

// --- handler: unknown event returns 404 ---
{
  const deps = baseDeps(0);
  deps.getEventById = async () => null;
  const res = makeRes();
  await registerForEvent(
    { method: "POST", user, params: { id: "missing" } },
    res,
    deps
  );
  assert.equal(res.statusCode, 404, "unknown event returns 404");
}

console.log("event capacity validation tests passed ✓");
