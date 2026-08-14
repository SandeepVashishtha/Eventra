import fs from "node:fs";
import assert from "node:assert/strict";

const source = fs.readFileSync("src/services/waitlistService.js", "utf8");

assert.equal(
  source.includes("API_ENDPOINTS.WAITLIST.JOIN(eventId)"),
  false,
  "joinWaitlist must not call WAITLIST.JOIN as a string function bug",
);
assert.equal(
  source.includes("API_ENDPOINTS.WAITLIST.COUNT(eventId)"),
  false,
  "getWaitlistCount must not reference a missing COUNT endpoint",
);
assert.equal(
  source.includes("API_ENDPOINTS.EVENTS.WAITLIST(eventId)"),
  true,
  "waitlistService should use the backend's event-scoped waitlist route",
);

console.log("waitlist service endpoint contract checks passed");
