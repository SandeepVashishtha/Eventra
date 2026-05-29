import assert from "node:assert/strict";
import { decodeTokenPayload, isTokenExpired, isTokenValid } from "../src/utils/tokenUtils.js";

const header = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
const payload = Buffer.from(JSON.stringify({ id: 123, exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url");
const signature = "sig";
const mockJwt = `${header}.${payload}.${signature}`;

const decoded = decodeTokenPayload(mockJwt);
assert.equal(decoded.id, 123);
assert.equal(isTokenExpired(mockJwt), false);
assert.equal(isTokenValid(mockJwt), true);

console.log("tokenUtils tests passed ✓");
