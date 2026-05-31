import assert from "node:assert/strict";

import { decodeTokenPayload, isTokenExpired, isTokenValid } from "../src/utils/tokenUtils.js";

assert.equal(decodeTokenPayload(null), null);
assert.equal(decodeTokenPayload(undefined), null);
assert.equal(decodeTokenPayload(123), null);
assert.equal(decodeTokenPayload("not-a-jwt"), null);
assert.equal(decodeTokenPayload("header.payload"), null);

const expiredPayload = Buffer.from(
  JSON.stringify({ sub: "user-1", exp: Math.floor(Date.now() / 1000) - 3600 }),
).toString("base64url");
const expiredToken = `eyJhbGciOiJIUzI1NiJ9.${expiredPayload}.sig`;

assert.equal(isTokenExpired(expiredToken), true);
assert.equal(isTokenValid(expiredToken), false);
assert.equal(isTokenValid(null), false);
assert.equal(isTokenValid(""), false);

const malformedToken = "eyJhbGciOiJIUzI1NiJ9.!!!invalid-base64!!!.sig";
assert.equal(decodeTokenPayload(malformedToken), null);

console.log("tokenUtils edge-case tests passed ✓");
