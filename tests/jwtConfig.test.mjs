import "./helpers/authTestEnv.mjs";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { JWT_EXPIRES_IN, JWT_COOKIE_MAX_AGE_SECONDS } from "../api/auth/jwt-config.js";

describe("jwt-config validation", () => {
  it("should have correct defaults", () => {
    assert.equal(JWT_EXPIRES_IN, "1h");
    assert.equal(JWT_COOKIE_MAX_AGE_SECONDS, 3600); // 1 hour in seconds
  });
});
