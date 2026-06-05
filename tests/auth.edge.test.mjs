import assert from "node:assert/strict";
import { decodeJwtPayload, isTokenExpired, isTokenValid } from "../src/utils/auth.js";

assert.equal(decodeJwtPayload(null), null);
assert.equal(decodeJwtPayload("invalidToken"), null);
assert.equal(isTokenExpired(null), true);
assert.equal(isTokenValid(null), false);

console.log("auth edge tests passed ✓");
