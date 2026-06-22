import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validate } from "../src/validation.js";

describe("validate.password", () => {
  it("should return true for a valid strong password", () => {
    const res = validate.password("SecurePass123!");
    assert.strictEqual(res, true);
  });

  it("should fail for a password shorter than 8 characters", () => {
    const res = validate.password("Sec1!");
    assert.strictEqual(res, "Password must be at least 8 characters");
  });

  it("should fail if missing an uppercase letter", () => {
    const res = validate.password("securepass123!");
    assert.match(res, /meet all 5 security criteria/i);
  });

  it("should fail if missing a lowercase letter", () => {
    const res = validate.password("SECUREPASS123!");
    assert.match(res, /meet all 5 security criteria/i);
  });

  it("should fail if missing a number", () => {
    const res = validate.password("SecurePass!");
    assert.match(res, /meet all 5 security criteria/i);
  });

  it("should fail if missing a special character", () => {
    const res = validate.password("SecurePass123");
    assert.match(res, /meet all 5 security criteria/i);
  });
});
