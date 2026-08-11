import fs from "node:fs";
import assert from "node:assert/strict";

const source = fs.readFileSync("public/service-worker.js", "utf8");

assert.equal(
  source.includes("'/api/events',"),
  false,
  "service worker must not broadly allowlist every /api/events subroute",
);
assert.equal(
  source.includes("PUBLIC_EVENT_ROUTE_PATTERNS"),
  true,
  "service worker should use explicit public event route patterns",
);
assert.equal(
  source.includes("request?.headers?.has('Authorization')"),
  true,
  "service worker should avoid caching authenticated API requests",
);
assert.equal(
  source.includes("request?.headers?.has('Cookie')"),
  true,
  "service worker should avoid caching cookie-authenticated API requests",
);

console.log("service worker cache policy checks passed");
