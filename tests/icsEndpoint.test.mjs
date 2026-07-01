import assert from "node:assert/strict";
import handler from "../api/events/[eventId]/ics.js";

async function runTests() {
  console.log("Starting ICS calendar exporter endpoint tests...");

  // Test Case 1: GET request successfully returns ICS file
  {
    const req = {
      method: "GET",
      query: { eventId: "test-event-123" },
      headers: { origin: "http://localhost:3000" }
    };

    let responseHeaders = {};
    let responseBody = null;
    let statusCode = null;

    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        responseBody = data;
        return this;
      },
      send(data) {
        responseBody = data;
        return this;
      },
      setHeader(name, value) {
        responseHeaders[name] = value;
        return this;
      }
    };

    // Since handler is async, we await it
    // Wait, the handler returns immediately after calling createEvent callback which executes asynchronously.
    // So we should wrap the handler invocation in a Promise to wait for res.send or res.status to be called.
    await new Promise((resolve, reject) => {
      const originalSend = res.send;
      res.send = (data) => {
        const ret = originalSend.call(res, data);
        resolve(ret);
        return ret;
      };
      const originalJson = res.json;
      res.json = (data) => {
        const ret = originalJson.call(res, data);
        resolve(ret);
        return ret;
      };

      handler(req, res).catch(reject);
    });

    assert.equal(statusCode, 200, "Response status code should be 200");
    assert.ok(responseBody, "Response body should not be empty");
    assert.ok(responseBody.includes("BEGIN:VCALENDAR"), "Response body should contain VCALENDAR");
    assert.ok(responseBody.includes("SUMMARY:Sample Eventra Event"), "Response body should contain event summary");
    assert.ok(responseBody.includes("URL:http://localhost:3000/events/test-event-123"), "Response body should contain URL with eventId");
    assert.equal(responseHeaders["Content-Type"], "text/calendar; charset=utf-8", "Content-Type header should be text/calendar");
    assert.equal(responseHeaders["Content-Disposition"], 'attachment; filename="event_test-event-123.ics"', "Content-Disposition should match event filename");
  }

  // Test Case 2: Reject non-GET requests
  {
    const req = {
      method: "POST",
      query: { eventId: "test-event-123" }
    };

    let statusCode = null;
    let responseBody = null;

    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        responseBody = data;
        return this;
      }
    };

    await handler(req, res);

    assert.equal(statusCode, 405, "Status code should be 405 for POST request");
    assert.equal(responseBody.message, "Method not allowed", "Error message should be 'Method not allowed'");
  }

  console.log("All ICS calendar exporter endpoint tests passed successfully! ✓");
}

runTests().catch(err => {
  console.error("Test suite failed:", err);
  process.exit(1);
});
