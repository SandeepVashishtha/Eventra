/**
 * getClientIp Security Tests
 *
 * Test suite for secure client IP extraction with trusted proxy validation
 * to prevent IP spoofing attacks.
 */

import assert from "node:assert/strict";
import { getClientIp } from "../api/_lib/getClientIp.js";

// Test 1: Valid trusted proxy chain - should extract real client IP
process.env.TRUSTED_PROXIES = "127.0.0.1,::1,10.0.0.1";
assert.strictEqual(
  getClientIp({
    headers: { "x-forwarded-for": "1.2.3.4, 10.0.0.1" },
    socket: { remoteAddress: "10.0.0.1" }
  }),
  "1.2.3.4",
  "Test 1: should extract real client IP from valid trusted proxy chain"
);

// Test 2: Spoofed X-Forwarded-For header from untrusted source - should be ignored
process.env.TRUSTED_PROXIES = "127.0.0.1,::1";
assert.strictEqual(
  getClientIp({
    headers: { "x-forwarded-for": "1.2.3.4" },
    socket: { remoteAddress: "192.168.1.100" }
  }),
  "192.168.1.100",
  "Test 2: should ignore spoofed X-Forwarded-For from untrusted source"
);

// Test 3: Malformed IP values - should be rejected
process.env.TRUSTED_PROXIES = "127.0.0.1,::1";
assert.strictEqual(
  getClientIp({
    headers: { "x-forwarded-for": "invalid,malicious" },
    socket: { remoteAddress: "127.0.0.1" }
  }),
  "127.0.0.1",
  "Test 3: should reject malformed IP values in X-Forwarded-For"
);

// Test 4: Missing forwarding headers - should fallback to connection IP
process.env.TRUSTED_PROXIES = "127.0.0.1,::1";
assert.strictEqual(
  getClientIp({
    headers: {},
    socket: { remoteAddress: "10.0.0.5" }
  }),
  "10.0.0.5",
  "Test 4: should fallback to connection IP when headers are missing"
);

// Test 5: Trusted proxy configuration absent - should use default localhost
delete process.env.TRUSTED_PROXIES;
assert.strictEqual(
  getClientIp({
    headers: { "x-forwarded-for": "1.2.3.4" },
    socket: { remoteAddress: "192.168.1.100" }
  }),
  "192.168.1.100",
  "Test 5: should not trust headers when trusted proxy config uses default (localhost only)"
);

// Test 6: IPv6 forwarding chain - should extract correctly
process.env.TRUSTED_PROXIES = "127.0.0.1,::1,2001:db8::1";
assert.strictEqual(
  getClientIp({
    headers: { "x-forwarded-for": "2001:db8::5, 2001:db8::1" },
    socket: { remoteAddress: "2001:db8::1" }
  }),
  "2001:db8::5",
  "Test 6: should correctly extract IPv6 client IP from trusted proxy chain"
);

// Test 7: X-Real-IP from trusted proxy - should be accepted
process.env.TRUSTED_PROXIES = "127.0.0.1,::1";
assert.strictEqual(
  getClientIp({
    headers: { "x-real-ip": "5.6.7.8" },
    socket: { remoteAddress: "127.0.0.1" }
  }),
  "5.6.7.8",
  "should accept X-Real-IP from trusted proxy"
);

// Test 8: X-Real-IP from untrusted source - should be ignored
process.env.TRUSTED_PROXIES = "127.0.0.1,::1";
assert.strictEqual(
  getClientIp({
    headers: { "x-real-ip": "5.6.7.8" },
    socket: { remoteAddress: "192.168.1.100" }
  }),
  "192.168.1.100",
  "should ignore X-Real-IP from untrusted source"
);

// Test 9: Invalid X-Real-IP value - should fall back
process.env.TRUSTED_PROXIES = "127.0.0.1,::1";
assert.strictEqual(
  getClientIp({
    headers: { "x-real-ip": "not-an-ip" },
    socket: { remoteAddress: "127.0.0.1" }
  }),
  "127.0.0.1",
  "should fall back to connection IP for invalid X-Real-IP"
);

// Test 10: Multiple proxy chain validation
process.env.TRUSTED_PROXIES = "127.0.0.1,::1,10.0.0.1,172.16.0.1";
assert.strictEqual(
  getClientIp({
    headers: { "x-forwarded-for": "1.2.3.4, 10.0.0.1, 172.16.0.1" },
    socket: { remoteAddress: "172.16.0.1" }
  }),
  "1.2.3.4",
  "should validate entire proxy chain and extract client IP"
);

// Test 11: Invalid proxy in chain - should reject
process.env.TRUSTED_PROXIES = "127.0.0.1,::1,10.0.0.1";
assert.strictEqual(
  getClientIp({
    headers: { "x-forwarded-for": "1.2.3.4, 10.0.0.1, 192.168.1.100" },
    socket: { remoteAddress: "192.168.1.100" }
  }),
  "192.168.1.100",
  "should reject chain with untrusted proxy"
);

// Test 12: X-Forwarded-For takes precedence over X-Real-IP
process.env.TRUSTED_PROXIES = "127.0.0.1,::1";
assert.strictEqual(
  getClientIp({
    headers: {
      "x-forwarded-for": "1.2.3.4",
      "x-real-ip": "5.6.7.8"
    },
    socket: { remoteAddress: "127.0.0.1" }
  }),
  "1.2.3.4",
  "should prefer X-Forwarded-For over X-Real-IP"
);

// Test 13: Null request
process.env.TRUSTED_PROXIES = "127.0.0.1,::1";
assert.strictEqual(
  getClientIp(null),
  "unknown",
  "should return unknown for null request"
);

// Test 14: Undefined request
assert.strictEqual(
  getClientIp(undefined),
  "unknown",
  "should return unknown for undefined request"
);

// Test 15: Missing socket
assert.strictEqual(
  getClientIp({
    headers: { "x-forwarded-for": "1.2.3.4" }
  }),
  "unknown",
  "should return unknown when socket is missing"
);

// Test 16: Script injection attempt - should be rejected
process.env.TRUSTED_PROXIES = "127.0.0.1,::1";
assert.strictEqual(
  getClientIp({
    headers: { "x-forwarded-for": "<script>alert('xss')</script>" },
    socket: { remoteAddress: "127.0.0.1" }
  }),
  "127.0.0.1",
  "should reject script injection attempts"
);

// Test 17: Empty X-Forwarded-For - should fall back
process.env.TRUSTED_PROXIES = "127.0.0.1,::1";
assert.strictEqual(
  getClientIp({
    headers: { "x-forwarded-for": "" },
    socket: { remoteAddress: "10.0.0.1" }
  }),
  "10.0.0.1",
  "should fall back for empty X-Forwarded-For"
);

// Test 18: Single IP in chain from trusted proxy
process.env.TRUSTED_PROXIES = "127.0.0.1,::1";
assert.strictEqual(
  getClientIp({
    headers: { "x-forwarded-for": "1.2.3.4" },
    socket: { remoteAddress: "127.0.0.1" }
  }),
  "1.2.3.4",
  "should accept single IP from trusted proxy"
);

// Test 19: Invalid trusted proxy config - should log warning and continue
process.env.TRUSTED_PROXIES = "127.0.0.1,invalid-ip,::1";
assert.strictEqual(
  getClientIp({
    headers: { "x-forwarded-for": "1.2.3.4" },
    socket: { remoteAddress: "127.0.0.1" }
  }),
  "1.2.3.4",
  "should handle invalid trusted proxy config gracefully"
);

// Test 20: Connection IP unknown - should return unknown
process.env.TRUSTED_PROXIES = "127.0.0.1,::1";
assert.strictEqual(
  getClientIp({
    headers: { "x-forwarded-for": "1.2.3.4" },
    socket: { remoteAddress: "unknown" }
  }),
  "unknown",
  "should return unknown when connection IP is unknown"
);

console.log("✓ All getClientIp security tests passed");
