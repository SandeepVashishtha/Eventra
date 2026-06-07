import test from "node:test";
import assert from "node:assert/strict";
import { isTokenExpired, isTokenValid, getTokenTTL } from "../src/utils/auth.js";

test("isTokenExpired detects expired JWT", () => {
  const expiredToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
    btoa(JSON.stringify({ sub: "1", exp: Math.floor(Date.now() / 1000) - 120 })) +
    ".signature";

  assert.equal(isTokenExpired(expiredToken), true);
  assert.equal(isTokenValid(expiredToken), false);
});

test("isTokenValid accepts future JWT", () => {
  const validToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
    btoa(JSON.stringify({ sub: "1", exp: Math.floor(Date.now() / 1000) + 3600 })) +
    ".signature";

  assert.equal(isTokenValid(validToken), true);
  assert.ok(getTokenTTL(validToken) > 0);
});

test("getTokenTTL returns negative value for expired token", () => {
  const expiredToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
    btoa(JSON.stringify({ sub: "1", exp: Math.floor(Date.now() / 1000) - 10 })) +
    ".signature";

  assert.ok(getTokenTTL(expiredToken) <= 0);
});
