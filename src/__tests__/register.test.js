import { describe, test, assert, beforeEach } from "vitest";

describe("registerForEvent", () => {
  let registerForEvent;

  beforeEach(async () => {
    const mod = await import("../../api/events/register.js");
    registerForEvent = mod.default;
  });

  function mockRes() {
    const state = { statusCode: null, body: null };
    const res = {
      status(code) {
        state.statusCode = code;
        return {
          json(body) {
            state.body = body;
            state.statusCode = code;
          },
        };
      },
    };
    return { res, state };
  }

  test("rejects non-POST methods", async () => {
    const { res, state } = mockRes();
    await registerForEvent({ method: "GET" }, res);
    assert.strictEqual(state.statusCode, 405);
  });

  test("rejects unauthenticated requests", async () => {
    const { res, state } = mockRes();
    await registerForEvent({ method: "POST", user: null }, res);
    assert.strictEqual(state.statusCode, 401);
  });

  test("rejects missing eventId", async () => {
    const { res, state } = mockRes();
    await registerForEvent(
      { method: "POST", user: { id: "user-1" } },
      res,
      { getEventId: () => null }
    );
    assert.strictEqual(state.statusCode, 400);
  });

  test("rejects when dependencies are missing", async () => {
    const { res, state } = mockRes();
    await registerForEvent(
      { method: "POST", user: { id: "user-1" }, body: { eventId: "event-1" } },
      res,
      {}
    );
    assert.strictEqual(state.statusCode, 503);
  });

  test("registers successfully when capacity available", async () => {
    const { res, state } = mockRes();
    const deps = {
      getEventById: async () => ({ id: "event-1", maxAttendees: 100 }),
      getRegistrationCount: async () => 10,
      isAlreadyRegistered: async () => false,
      registerAttendee: async () => ({ id: "reg-1", eventId: "event-1", userId: "user-1" }),
    };
    await registerForEvent(
      { method: "POST", user: { id: "user-1" }, body: { eventId: "event-1" } },
      res,
      deps
    );
    assert.strictEqual(state.statusCode, 201);
    assert.ok(state.body.registration);
    assert.strictEqual(state.body.message, "Registration successful");
  });

  test("returns 409 for duplicate registration", async () => {
    const { res, state } = mockRes();
    const deps = {
      getEventById: async () => ({ id: "event-1", maxAttendees: 100 }),
      getRegistrationCount: async () => 10,
      isAlreadyRegistered: async () => true,
      registerAttendee: async () => {},
    };
    await registerForEvent(
      { method: "POST", user: { id: "user-1" }, body: { eventId: "event-1" } },
      res,
      deps
    );
    assert.strictEqual(state.statusCode, 409);
  });

  test("returns 409 at full capacity pre-flight", async () => {
    const { res, state } = mockRes();
    const deps = {
      getEventById: async () => ({ id: "event-1", maxAttendees: 100 }),
      getRegistrationCount: async () => 100,
      isAlreadyRegistered: async () => false,
      registerAttendee: async () => {},
    };
    await registerForEvent(
      { method: "POST", user: { id: "user-1" }, body: { eventId: "event-1" } },
      res,
      deps
    );
    assert.strictEqual(state.statusCode, 409);
    assert.ok(state.body.error.includes("capacity"));
  });

  test("handles CAPACITY_FULL from atomic insert race", async () => {
    const { res, state } = mockRes();
    const err = new Error("capacity full");
    err.code = "CAPACITY_FULL";
    const deps = {
      getEventById: async () => ({ id: "event-1", maxAttendees: 100 }),
      getRegistrationCount: async () => 99,
      isAlreadyRegistered: async () => false,
      registerAttendee: async () => { throw err; },
    };
    await registerForEvent(
      { method: "POST", user: { id: "user-1" }, body: { eventId: "event-1" } },
      res,
      deps
    );
    assert.strictEqual(state.statusCode, 409);
  });

  test("handles DUPLICATE_REGISTRATION from atomic insert", async () => {
    const { res, state } = mockRes();
    const err = new Error("duplicate");
    err.code = "DUPLICATE_REGISTRATION";
    const deps = {
      getEventById: async () => ({ id: "event-1", maxAttendees: 100 }),
      getRegistrationCount: async () => 50,
      isAlreadyRegistered: async () => false,
      registerAttendee: async () => { throw err; },
    };
    await registerForEvent(
      { method: "POST", user: { id: "user-1" }, body: { eventId: "event-1" } },
      res,
      deps
    );
    assert.strictEqual(state.statusCode, 409);
  });

  test("handles unexpected errors gracefully", async () => {
    const { res, state } = mockRes();
    const deps = {
      getEventById: async () => { throw new Error("db failure"); },
      getRegistrationCount: async () => 0,
      isAlreadyRegistered: async () => false,
      registerAttendee: async () => {},
    };
    await registerForEvent(
      { method: "POST", user: { id: "user-1" }, body: { eventId: "event-1" } },
      res,
      deps
    );
    assert.strictEqual(state.statusCode, 500);
  });
});
