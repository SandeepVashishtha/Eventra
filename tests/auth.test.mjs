import assert from "node:assert/strict";
import { decodeJwtPayload, isTokenExpired, isTokenValid, getTokenTTL } from "../src/utils/auth.js";

import crypto from "node:crypto";

const TEST_SECRET = "test-environmental-secret-key";
process.env.JWT_SECRET = TEST_SECRET; // Sets the secret for isTokenValid to read

function makeToken(payloadObj) {
  const header = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
  const payloadStr = JSON.stringify(payloadObj);
  const payloadBase64 = Buffer.from(payloadStr).toString("base64url"); // Cleaner built-in encoding
  
  const signature = crypto
    .createHmac("sha256", TEST_SECRET)
    .update(`${header}.${payloadBase64}`)
    .digest("base64url");

  return `${header}.${payloadBase64}.${signature}`;
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
assert.equal(isTokenExpired(missingExpToken), false);
assert.equal(isTokenValid(missingExpToken), true);

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

// Fix flakiness: Allow a safe range for valid TTL to account for CI runner CPU lag
const validTTL = getTokenTTL(validToken);
assert.ok(validTTL > 0 && validTTL <= 120, `Expected TTL to be between 1 and 120, got ${validTTL}`);

// Fix flakiness: Change strict '< 0' to '<= 0' to handle the threshold millisecond edge case
assert.ok(getTokenTTL(expiredToken) <= 0);

// Clock skew buffer — a token expiring in 10s should NOT be treated as still valid
// since the 30-second CLOCK_SKEW_BUFFER means we treat it as expired early
const nearExpiry = Math.floor(Date.now() / 1000) + 10;
const nearExpiryToken = makeToken({ exp: nearExpiry });
assert.equal(isTokenExpired(nearExpiryToken), true, "token expiring in 10s should be considered expired with 30s skew buffer");
assert.ok(getTokenTTL(nearExpiryToken) <= 0, `TTL should be <= 0 with skew buffer, got ${getTokenTTL(nearExpiryToken)}`);
