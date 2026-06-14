/**
 * getClientIp Security Tests
 *
 * Test suite for secure client IP extraction using Node's built-in net.isIP()
 * to prevent IP spoofing attacks by validating all IP addresses.
 */

import assert from "node:assert/strict";
import { getClientIp } from "../api/lib/getClientIp.js";

// Valid X-Forwarded-For
assert.strictEqual(
  getClientIp({
    headers: { "x-forwarded-for": "1.2.3.4" },
    socket: { remoteAddress: "10.0.0.1" }
  }),
  "1.2.3.4",
  "should accept valid X-Forwarded-For"
);

// Invalid X-Forwarded-For falls back
assert.strictEqual(
  getClientIp({
    headers: { "x-forwarded-for": "not-an-ip" },
    socket: { remoteAddress: "10.0.0.1" }
  }),
  "10.0.0.1",
  "should fall back to socket.remoteAddress for invalid X-Forwarded-For"
);

// Valid X-Real-IP
assert.strictEqual(
  getClientIp({
    headers: { "x-real-ip": "5.6.7.8" },
    socket: { remoteAddress: "10.0.0.1" }
  }),
  "5.6.7.8",
  "should accept valid X-Real-IP"
);

// Invalid X-Real-IP
assert.strictEqual(
  getClientIp({
    headers: { "x-real-ip": "fake-ip" },
    socket: { remoteAddress: "10.0.0.1" }
  }),
  "10.0.0.1",
  "should fall back to socket.remoteAddress for invalid X-Real-IP"
);

// IPv6 support
assert.strictEqual(
  getClientIp({
    headers: { "x-forwarded-for": "2001:db8::1" },
    socket: { remoteAddress: "10.0.0.1" }
  }),
  "2001:db8::1",
  "should accept valid IPv6 in X-Forwarded-For"
);

// Unknown fallback
assert.strictEqual(
  getClientIp({}),
  "unknown",
  "should return unknown when no valid IP found"
);

// X-Forwarded-For with multiple IPs (leftmost is original client)
assert.strictEqual(
  getClientIp({
    headers: { "x-forwarded-for": "1.2.3.4, 10.0.0.1, 172.16.0.1" },
    socket: { remoteAddress: "10.0.0.1" }
  }),
  "1.2.3.4",
  "should extract leftmost IP from X-Forwarded-For chain"
);

// X-Forwarded-For takes precedence over X-Real-IP
assert.strictEqual(
  getClientIp({
    headers: {
      "x-forwarded-for": "1.2.3.4",
      "x-real-ip": "5.6.7.8"
    },
    socket: { remoteAddress: "10.0.0.1" }
  }),
  "1.2.3.4",
  "should prefer X-Forwarded-For over X-Real-IP"
);

// Both headers invalid, fall back to socket
assert.strictEqual(
  getClientIp({
    headers: {
      "x-forwarded-for": "invalid",
      "x-real-ip": "also-invalid"
    },
    socket: { remoteAddress: "10.0.0.1" }
  }),
  "10.0.0.1",
  "should fall back to socket.remoteAddress when both headers are invalid"
);

// Empty headers, use socket
assert.strictEqual(
  getClientIp({
    headers: {},
    socket: { remoteAddress: "10.0.0.1" }
  }),
  "10.0.0.1",
  "should use socket.remoteAddress when headers are missing"
);

// Null request
assert.strictEqual(
  getClientIp(null),
  "unknown",
  "should return unknown for null request"
);

// Undefined request
assert.strictEqual(
  getClientIp(undefined),
  "unknown",
  "should return unknown for undefined request"
);

// Missing socket
assert.strictEqual(
  getClientIp({
    headers: { "x-forwarded-for": "invalid" }
  }),
  "unknown",
  "should return unknown when socket is missing"
);

console.log("✓ All getClientIp validation tests passed");
