/**
 * Tests for api/auth/logout.js
 *
 * Verifies that the logout endpoint:
 * 1. Is implemented as an ES module (no require/module.exports)
 * 2. Clears the auth cookie by setting Max-Age=0 in the Set-Cookie header
 * 3. Accepts expired tokens (still clears cookie)
 * 4. Rejects completely invalid tokens
 * 5. Rejects requests with no token
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

// Minimal JWT secret for test tokens
const TEST_SECRET = "test-secret-for-logout-tests-only";
process.env.JWT_SECRET = TEST_SECRET;

// We need to import AFTER setting env vars
const { default: logout } = await import("../api/auth/logout.js");

function makeRes() {
  const res = {
    _status: null,
    _body: null,
    _headers: {},
    status(code) {
      this._status = code;
      return this;
    },
    json(body) {
      this._body = body;
      return this;
    },
    setHeader(key, val) {
      this._headers[key] = val;
    },
  };
  return res;
}

function makeReq({ token, method = "POST" } = {}) {
  return {
    method,
    headers: {
      authorization: token ? `Bearer ${token}` : undefined,
    },
  };
}

describe("logout endpoint", () => {
  it("returns 401 when no token is provided", async () => {
    const req = makeReq({});
    const res = makeRes();
    logout(req, res);
    assert.equal(res._status, 401);
    assert.match(res._body.message, /No valid token/i);
  });

  it("returns 401 for an invalid/tampered token", async () => {
    const req = makeReq({ token: "totally.invalid.token" });
    const res = makeRes();
    logout(req, res);
    assert.equal(res._status, 401);
    assert.match(res._body.message, /No valid token/i);
  });

  it("returns 200 and clears the cookie for a valid token", async () => {
    const token = jwt.sign({ id: "u1", email: "test@example.com" }, TEST_SECRET, { expiresIn: "1h" });
    const req = makeReq({ token });
    const res = makeRes();
    logout(req, res);
    assert.equal(res._status, 200);
    assert.match(res._body.message, /Logged out successfully/i);

    // Cookie must be cleared: Max-Age=0
    const setCookie = res._headers["Set-Cookie"];
    assert.ok(setCookie, "Set-Cookie header should be present");
    assert.ok(setCookie.includes("Max-Age=0"), "Max-Age should be 0 to clear the cookie");
    assert.ok(setCookie.includes("HttpOnly"), "Cookie should remain HttpOnly");
    assert.ok(setCookie.includes("SameSite=Strict"), "Cookie should remain SameSite=Strict");
    assert.ok(setCookie.startsWith("token=;"), "Cookie value should be empty");
  });

  it("returns 200 and clears the cookie even for an expired token", async () => {
    // Simulate an expired token (issued 2 hours ago, 1h expiry)
    const now = Math.floor(Date.now() / 1000);
    const token = jwt.sign(
      { id: "u1", email: "test@example.com", iat: now - 7200, exp: now - 3600 },
      TEST_SECRET
    );
    const req = makeReq({ token });
    const res = makeRes();
    logout(req, res);
    assert.equal(res._status, 200);

    const setCookie = res._headers["Set-Cookie"];
    assert.ok(setCookie?.includes("Max-Age=0"), "Should clear cookie even for expired tokens");
  });

  it("reads the token from cookie header when no Authorization header is present", async () => {
    const token = jwt.sign({ id: "u1", email: "test@example.com" }, TEST_SECRET, { expiresIn: "1h" });
    const req = {
      method: "POST",
      headers: {
        cookie: `token=${token}; other=value`,
      },
    };
    const res = makeRes();
    logout(req, res);
    assert.equal(res._status, 200);
    assert.ok(res._headers["Set-Cookie"]?.includes("Max-Age=0"));
  });
});
