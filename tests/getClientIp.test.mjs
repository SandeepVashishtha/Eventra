import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getClientIp } from "../api/lib/getClientIp.js";

describe("getClientIp", () => {
  it("should return public IP from x-forwarded-for if present", () => {
    const req = {
      headers: {
        "x-forwarded-for": "203.0.113.195, 70.41.3.18",
      },
    };
    assert.equal(getClientIp(req), "203.0.113.195");
  });

  it("should return public IP from x-real-ip if x-forwarded-for is missing/private", () => {
    const req = {
      headers: {
        "x-forwarded-for": "127.0.0.1",
        "x-real-ip": "203.0.113.196",
      },
    };
    assert.equal(getClientIp(req), "203.0.113.196");
  });

  it("should return public IP from remoteAddress if headers are missing/private", () => {
    const req = {
      headers: {
        "x-real-ip": "10.0.0.1",
      },
      socket: {
        remoteAddress: "203.0.113.197",
      },
    };
    assert.equal(getClientIp(req), "203.0.113.197");
  });

  it("should fall back to private IP from x-forwarded-for if only private/loopback is available", () => {
    const req = {
      headers: {
        "x-forwarded-for": "127.0.0.1",
      },
    };
    assert.equal(getClientIp(req), "127.0.0.1");
  });

  it("should fall back to private IP from socket if no headers are present", () => {
    const req = {
      socket: {
        remoteAddress: "::1",
      },
    };
    assert.equal(getClientIp(req), "::1");
  });

  it("should return 'unknown' if no request details or IP can be resolved", () => {
    assert.equal(getClientIp(null), "unknown");
    assert.equal(getClientIp({}), "unknown");
  });
});
