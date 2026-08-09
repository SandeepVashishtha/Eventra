import assert from "node:assert/strict";
import test from "node:test";
import registerForEvent from "../api/events/register.js";
import { rsvpLockManager } from "../api/_lib/rsvpLockManager.js";

// Mock req and res objects
function mockRequest(method, body = {}, params = {}, user = { id: "user-123" }) {
  return {
    method,
    body,
    params,
    user,
    headers: {}
  };
}

function mockResponse() {
  const res = {
    statusCode: 200,
    body: null,
    headers: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(obj) {
      this.body = obj;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
      return this;
    }
  };
  return res;
}

// Mock dependencies
const mockDeps = {
  getEventById: async (id) => {
    if (id === "event-404") return null;
    return { id, maxAttendees: 100, title: "Mock Event" };
  },
  getRegistrationCount: async (id) => {
    if (id === "event-full") return 100;
    return 10;
  },
  isAlreadyRegistered: async (eventId, userId) => {
    if (eventId === "event-dup") return true;
    return false;
  },
  registerAttendee: async (eventId, userId) => {
    if (eventId === "event-fail") {
      const err = new Error("Capacity full");
      err.code = "CAPACITY_FULL";
      throw err;
    }
    return { id: "reg-1", eventId, userId };
  },
  getEventId: (req) => req.params?.id ?? req.body?.eventId
};

test("Event Registration Endpoint Handler", async (t) => {
  t.afterEach(() => {
    rsvpLockManager.reset();
  });

  await t.test("should reject non-POST requests with 405", async () => {
    const req = mockRequest("GET");
    const res = mockResponse();
    await registerForEvent(req, res, mockDeps);
    
    assert.equal(res.statusCode, 405);
    assert.equal(res.body.error, "Method not allowed");
  });

  await t.test("should require authenticated user with 401", async () => {
    const req = mockRequest("POST", {}, {}, null);
    const res = mockResponse();
    await registerForEvent(req, res, mockDeps);
    
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.error, "Authentication required");
  });

  await t.test("should require eventId with 400", async () => {
    const req = mockRequest("POST", { eventId: "" });
    const res = mockResponse();
    await registerForEvent(req, res, mockDeps);
    
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, "Event id is required");
  });

  await t.test("should reject with 503 if required dependencies are missing", async () => {
    const req = mockRequest("POST", { eventId: "event-123" });
    const res = mockResponse();
    // Pass empty deps
    await registerForEvent(req, res, {});
    
    assert.equal(res.statusCode, 503);
    assert.equal(res.body.error, "Registration service unavailable");
  });

  await t.test("should reject with 404 if event is not found", async () => {
    const req = mockRequest("POST", { eventId: "event-404" });
    const res = mockResponse();
    await registerForEvent(req, res, mockDeps);
    
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.error, "Event not found");
  });

  await t.test("should reject with 409 if user is already registered", async () => {
    const req = mockRequest("POST", { eventId: "event-dup" });
    const res = mockResponse();
    await registerForEvent(req, res, mockDeps);
    
    assert.equal(res.statusCode, 409);
    assert.equal(res.body.error, "You are already registered for this event");
  });

  await t.test("should reject with 409 if capacity is full", async () => {
    const req = mockRequest("POST", { eventId: "event-full" });
    const res = mockResponse();
    await registerForEvent(req, res, mockDeps);
    
    assert.equal(res.statusCode, 409);
    assert.match(res.body.error, /capacity/i);
  });

  await t.test("should register successfully and return 201", async () => {
    const req = mockRequest("POST", { eventId: "event-123" });
    const res = mockResponse();
    await registerForEvent(req, res, mockDeps);
    
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.message, "Registration successful");
    assert.equal(res.body.registration.eventId, "event-123");
  });

  await t.test("should handle CAPACITY_FULL throw and clean up lock counter", async () => {
    const req = mockRequest("POST", { eventId: "event-fail" });
    const res = mockResponse();
    await registerForEvent(req, res, mockDeps);
    
    assert.equal(res.statusCode, 409);
    assert.equal(res.body.error, "Event is at full capacity");
    assert.equal(rsvpLockManager.getCount("event-fail"), 0);
  });
});
