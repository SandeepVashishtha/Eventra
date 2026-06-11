import assert from "node:assert/strict";
import { buildCorsHeaders } from "../api/auth/cors.js";

// CORS Security Hardening Tests

// 1. Rejects requests missing the Origin header
const h1 = buildCorsHeaders({ headers: {} });
assert.equal(h1["Access-Control-Allow-Origin"], undefined, "Missing Origin should return undefined CORS header");

// 2. Allows explicitly configured origins
const origin2 = "https://eventra.sandeepvashishtha.tech";
const h2 = buildCorsHeaders({ headers: { origin: origin2 } });
assert.equal(h2["Access-Control-Allow-Origin"], origin2, "Explicitly allowed origin should be returned");

// 3. Allows local development origins on non-production
process.env.NODE_ENV = "development";
const origin3 = "http://localhost:5173";
const h3 = buildCorsHeaders({ headers: { origin: origin3 } });
assert.equal(h3["Access-Control-Allow-Origin"], origin3, "Local dev origin should be allowed in development");

// 4. Rejects unauthorized cross-origin requests
const origin4 = "https://malicious.com";
const h4 = buildCorsHeaders({ headers: { origin: origin4 } });
assert.equal(h4["Access-Control-Allow-Origin"], undefined, "Unauthorized origin should return undefined CORS header");

console.log("PASS: CORS Security Hardening tests successfully verified");
