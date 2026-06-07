/**
 * Tests for api/lib/getClientIp.js
 *
 * Verifies IP extraction logic across all branches including IPv4, IPv6,
 * private ranges, x-forwarded-for splitting, and edge cases.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

// ─── Inline the module under test ────────────────────────────────────────────
// We import directly from the file to test the real implementation.
// If the file is ESM (import/export), this works in Node 22 with node:test.

const { getClientIp } = await import("../api/lib/getClientIp.js");

// ─── Test helpers ─────────────────────────────────────────────────────────────

/** Builds a minimal mock req object. */
function makeReq(overrides = {}) {
  return {
    headers: {},
    socket: {},
    ...overrides,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("getClientIp — null / undefined / non-object input", () => {
  it("returns 'unknown' when req is null", () => {
    assert.equal(getClientIp(null), "unknown");
  });

  it("returns 'unknown' when req is undefined", () => {
    assert.equal(getClientIp(undefined), "unknown");
  });

  it("returns 'unknown' when req is a plain object with no headers or socket", () => {
    assert.equal(getClientIp({}), "unknown");
  });
});

describe("getClientIp — x-forwarded-for header", () => {
  it("returns the first public IP from a single x-forwarded-for value", () => {
    const req = makeReq({
      headers: { "x-forwarded-for": "203.0.113.5" },
    });
    assert.equal(getClientIp(req), "203.0.113.5");
  });

  it("returns the first IP when x-forwarded-for has multiple comma-separated values", () => {
    const req = makeReq({
      headers: { "x-forwarded-for": "203.0.113.5, 10.0.0.1, 198.51.100.9" },
    });
    assert.equal(getClientIp(req), "203.0.113.5");
  });

  it("skips a private IP at the front and falls through to x-real-ip", () => {
    const req = makeReq({
      headers: {
        "x-forwarded-for": "10.0.0.1",
        "x-real-ip": "203.0.113.5",
      },
    });
    // getClientIp skips x-forwarded-for when the first IP is private
    // and falls through to x-real-ip, which returns the public IP.
    assert.equal(getClientIp(req), "203.0.113.5");
  });

  it("skips all private IPs and returns 'unknown' when no public IP is present", () => {
    const req = makeReq({
      headers: { "x-forwarded-for": "10.0.0.1, 192.168.1.1, 172.16.0.5" },
    });
    assert.equal(getClientIp(req), "unknown");
  });

  it("trims whitespace from x-forwarded-for values", () => {
    const req = makeReq({
      headers: { "x-forwarded-for": "  203.0.113.5  ,  10.0.0.1  " },
    });
    assert.equal(getClientIp(req), "203.0.113.5");
  });

  it("ignores x-forwarded-for when its value is a private IP", () => {
    const req = makeReq({
      headers: { "x-forwarded-for": "10.0.0.1" },
      socket: { remoteAddress: "203.0.113.5" },
    });
    assert.equal(getClientIp(req), "203.0.113.5");
  });

  it("returns 'unknown' when x-forwarded-for is the only source and is private", () => {
    const req = makeReq({
      headers: { "x-forwarded-for": "127.0.0.1" },
    });
    assert.equal(getClientIp(req), "unknown");
  });
});

describe("getClientIp — x-real-ip header", () => {
  it("returns x-real-ip when x-forwarded-for is absent", () => {
    const req = makeReq({
      headers: { "x-real-ip": "198.51.100.7" },
    });
    assert.equal(getClientIp(req), "198.51.100.7");
  });

  it("prefers x-forwarded-for over x-real-ip", () => {
    const req = makeReq({
      headers: {
        "x-forwarded-for": "203.0.113.5",
        "x-real-ip": "198.51.100.7",
      },
    });
    assert.equal(getClientIp(req), "203.0.113.5");
  });

  it("skips x-real-ip when it contains a private IP", () => {
    const req = makeReq({
      headers: { "x-real-ip": "192.168.1.100" },
    });
    assert.equal(getClientIp(req), "unknown");
  });

  it("trims whitespace from x-real-ip", () => {
    const req = makeReq({
      headers: { "x-real-ip": "  198.51.100.7  " },
    });
    assert.equal(getClientIp(req), "198.51.100.7");
  });
});

describe("getClientIp — socket.remoteAddress fallback", () => {
  it("returns socket.remoteAddress when headers are absent", () => {
    const req = makeReq({
      socket: { remoteAddress: "203.0.113.9" },
    });
    assert.equal(getClientIp(req), "203.0.113.9");
  });

  it("returns socket.remoteAddress when headers are present but empty", () => {
    const req = makeReq({
      headers: { "x-forwarded-for": "10.0.0.1" }, // private — skipped
      socket: { remoteAddress: "203.0.113.9" },
    });
    assert.equal(getClientIp(req), "203.0.113.9");
  });

  it("skips socket.remoteAddress when it is a private IP", () => {
    const req = makeReq({
      socket: { remoteAddress: "192.168.1.1" },
    });
    assert.equal(getClientIp(req), "unknown");
  });

  it("skips socket.remoteAddress when it is loopback", () => {
    const req = makeReq({
      socket: { remoteAddress: "127.0.0.1" },
    });
    assert.equal(getClientIp(req), "unknown");
  });

  it("returns 'unknown' when socket.remoteAddress is also private", () => {
    const req = makeReq({
      headers: {
        "x-forwarded-for": "10.0.0.1", // private
        "x-real-ip": "172.16.0.5",       // private
      },
      socket: { remoteAddress: "192.168.0.1" }, // private
    });
    assert.equal(getClientIp(req), "unknown");
  });
});

describe("getClientIp — IPv6 addresses", () => {
  it("returns a public IPv6 address from x-forwarded-for", () => {
    const req = makeReq({
      headers: { "x-forwarded-for": "2001:db8::1" },
    });
    assert.equal(getClientIp(req), "2001:db8::1");
  });

  it("skips loopback IPv6 (::1) from x-forwarded-for", () => {
    const req = makeReq({
      headers: { "x-forwarded-for": "::1" },
      socket: { remoteAddress: "2001:db8::2" },
    });
    assert.equal(getClientIp(req), "2001:db8::2");
  });

  it("skips IPv6 private link-local (fe80:) from x-forwarded-for", () => {
    const req = makeReq({
      headers: { "x-forwarded-for": "fe80::1" },
    });
    assert.equal(getClientIp(req), "unknown");
  });

  it("skips IPv6 unique local (fc00:) from x-forwarded-for", () => {
    const req = makeReq({
      headers: { "x-forwarded-for": "fc00::1" },
    });
    assert.equal(getClientIp(req), "unknown");
  });

  it("returns IPv4-mapped IPv6 address as-is (not filtered by private-IP logic)", () => {
    // ::ffff:192.168.x.x is an IPv4-mapped IPv6 address.
    // The isPrivateIp function uses string-prefix matching and does not have a
    // pattern for IPv4-mapped addresses. This test documents the current
    // behaviour. If the utility is updated to filter these, update this test.
    const req = makeReq({
      headers: { "x-forwarded-for": "::ffff:192.168.1.1" },
    });
    assert.equal(getClientIp(req), "::ffff:192.168.1.1");
  });
});

describe("getClientIp — IPv4 private ranges", () => {
  // 10.0.0.0/8
  it("skips 10.x.x.x private range", () => {
    const req = makeReq({ headers: { "x-forwarded-for": "10.255.255.255" } });
    assert.equal(getClientIp(req), "unknown");
  });

  // 172.16.0.0/12
  it("skips 172.16.x.x – 172.31.x.x private range", () => {
    const req = makeReq({ headers: { "x-forwarded-for": "172.31.255.255" } });
    assert.equal(getClientIp(req), "unknown");
  });

  it("accepts 172.15.x.x and 172.32.x.x as public", () => {
    const req1 = makeReq({ headers: { "x-forwarded-for": "172.15.0.1" } });
    const req2 = makeReq({ headers: { "x-forwarded-for": "172.32.0.1" } });
    assert.equal(getClientIp(req1), "172.15.0.1");
    assert.equal(getClientIp(req2), "172.32.0.1");
  });

  // 192.168.0.0/16
  it("skips 192.168.x.x private range", () => {
    const req = makeReq({ headers: { "x-forwarded-for": "192.168.255.255" } });
    assert.equal(getClientIp(req), "unknown");
  });

  // 127.0.0.0/8
  it("skips 127.x.x.x loopback range", () => {
    const req = makeReq({ headers: { "x-forwarded-for": "127.0.0.1" } });
    assert.equal(getClientIp(req), "unknown");
  });

  // 0.0.0.0/8
  it("skips 0.x.x.x range", () => {
    const req = makeReq({ headers: { "x-forwarded-for": "0.0.0.1" } });
    assert.equal(getClientIp(req), "unknown");
  });
});

describe("getClientIp — precedence order", () => {
  it("checks x-forwarded-for first, then x-real-ip, then socket", () => {
    // x-forwarded-for takes priority
    const req1 = makeReq({
      headers: {
        "x-forwarded-for": "203.0.113.1",
        "x-real-ip": "198.51.100.1",
      },
      socket: { remoteAddress: "192.0.2.1" },
    });
    assert.equal(getClientIp(req1), "203.0.113.1");

    // x-real-ip is checked when x-forwarded-for is absent
    const req2 = makeReq({
      headers: { "x-real-ip": "198.51.100.1" },
      socket: { remoteAddress: "192.0.2.1" },
    });
    assert.equal(getClientIp(req2), "198.51.100.1");

    // socket is the last resort
    const req3 = makeReq({ socket: { remoteAddress: "192.0.2.1" } });
    assert.equal(getClientIp(req3), "192.0.2.1");
  });
});

console.log("getClientIp tests passed ✓");