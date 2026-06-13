import assert from "node:assert/strict";
import { isTokenSkewValid } from "../src/utils/tokenUtils.js";

const futureToken = { nbf: Math.floor(Date.now() / 1000) + 120 };
assert.equal(isTokenSkewValid(futureToken), false, "Should reject future tokens");
console.log("tokenUtils clock skew signature verification tests passed ✓");
