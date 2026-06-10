import assert from "node:assert/strict";
import { decodeJwtPayload, isTokenExpired, isTokenValid, getTokenTTL } from "../src/utils/auth.js";

function makeToken(payloadObj) {
  const header = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
  const payloadStr = JSON.stringify(payloadObj);
  const payloadBase64 = Buffer.from(payloadStr).toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `${header}.${payloadBase64}.signature`;
}

// Test decodeJwtPayload with invalid formats
assert.equal(decodeJwtPayload(null), null);
assert.equal(decodeJwtPayload(""), null);
assert.equal(decodeJwtPayload("abc"), null);
assert.equal(decodeJwtPayload("a.b"), null);

// Test decodeJwtPayload with valid payload
const payload = { sub: "1234567890", name: "Ada Lovelace", iat: 1516239022 };
const token = makeToken(payload);
assert.deepEqual(decodeJwtPayload(token), payload);

// Test isTokenExpired when 'exp' claim is missing
const missingExpToken = makeToken({ name: "Ada" });
assert.equal(isTokenExpired(missingExpToken), true);

// Test isTokenExpired when expired
const expiredExp = Math.floor(Date.now() / 1000) - 100;
const expiredToken = makeToken({ exp: expiredExp });
assert.equal(isTokenExpired(expiredToken), true);

// Test isTokenExpired when valid
const validExp = Math.floor(Date.now() / 1000) + 120;
const validToken = makeToken({ exp: validExp });
assert.equal(isTokenExpired(validToken), false);

// Test isTokenValid
assert.equal(isTokenValid(null), false);
assert.equal(isTokenValid(""), false);
assert.equal(isTokenValid(expiredToken), false);
assert.equal(isTokenValid(validToken), true);

// Test getTokenTTL
assert.equal(getTokenTTL(missingExpToken), -1);
assert.ok(getTokenTTL(validToken) > 0);
assert.ok(getTokenTTL(expiredToken) < 0);

console.log("All tests passed.");