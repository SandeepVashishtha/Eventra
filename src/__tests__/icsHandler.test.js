import { describe, test, assert, beforeEach } from "vitest";

describe("ics handler", () => {
  let handler;

  beforeEach(async () => {
    const mod = await import("../../api/events/[eventId]/ics.js");
    handler = mod.default;
  });

  function mockReqRes(method = "GET", eventId = "test-123") {
    const state = { statusCode: null, body: null, headers: {} };
    const req = {
      method,
      query: { eventId },
      headers: { origin: "http://localhost:3000" },
    };
    const res = {
      status(code) {
        state.statusCode = code;
        return {
          json(body) {
            state.body = body;
          },
          send(body) {
            state.body = body;
          },
        };
      },
      setHeader(key, value) {
        state.headers[key] = value;
      },
    };
    return { req, res, state };
  }

  test("rejects non-GET methods", async () => {
    const { req, res, state } = mockReqRes("POST");
    await handler(req, res);
    assert.strictEqual(state.statusCode, 405);
  });

  test("returns 200 with calendar for valid event", async () => {
    const { req, res, state } = mockReqRes("GET", "test-123");
    await handler(req, res);
    assert.strictEqual(state.statusCode, 200);
    assert.ok(state.body);
  });

  test("sets correct content-type header", async () => {
    const { req, res, state } = mockReqRes("GET", "test-123");
    await handler(req, res);
    assert.strictEqual(state.statusCode, 200);
    assert.strictEqual(state.headers["Content-Type"], "text/calendar; charset=utf-8");
  });

  test("sets content-disposition header with event id", async () => {
    const { req, res, state } = mockReqRes("GET", "evt-456");
    await handler(req, res);
    assert.ok(state.headers["Content-Disposition"]?.includes("evt-456.ics"));
  });
});
