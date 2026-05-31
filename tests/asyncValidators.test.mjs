import assert from "node:assert/strict";
import {
  createAsyncValidator,
  withRetry,
  validateUsernameAvailable,
  validateEmailAvailable,
  validatePasswordStrength,
  createCustomAsyncValidator,
} from "../src/utils/asyncValidators.js";

// Mock fetch for tests that call APIs
global.fetch = async () => ({
  ok: true,
  json: async () => ({ available: true, valid: true }),
});

// ── createAsyncValidator tests ────────────────────────────────────────────────

{
  let callCount = 0;
  const validator = createAsyncValidator(async (value) => {
    callCount++;
    return value === "valid" ? true : "Invalid";
  }, 50);

  validator("valid");
  validator("invalid");

  // Wait for debounce
  await new Promise((r) => setTimeout(r, 100));
  assert.equal(callCount > 0, true, "validator should have been called");
}

// ── withRetry tests ───────────────────────────────────────────────────────────

{
  let attempts = 0;
  const flakyValidator = async () => {
    attempts++;
    if (attempts < 3) throw new Error("Temporary failure");
    return true;
  };

  const retryValidator = withRetry(flakyValidator, 3, 10);
  const result = await retryValidator("test");
  assert.equal(result, true, "should succeed after retries");
  assert.equal(attempts, 3, "should have attempted 3 times");
}

{
  let attempts = 0;
  const alwaysFails = async () => {
    attempts++;
    throw new Error("Permanent failure");
  };

  const retryValidator = withRetry(alwaysFails, 2, 10);
  let threw = false;
  try {
    await retryValidator("test");
  } catch (e) {
    threw = true;
    assert.match(e.message, /Permanent failure/);
  }
  assert.equal(threw, true, "should have thrown");
  assert.equal(attempts, 2, "should have retried 2 times");
}

// ── validateUsernameAvailable tests ─────────────────────────────────────────

{
  global.fetch = async () => ({ ok: true, json: async () => ({ available: true }) });
  const result = await validateUsernameAvailable("newuser");
  assert.equal(result, true, "available username should return true");
}

{
  global.fetch = async () => ({ ok: true, json: async () => ({ available: false }) });
  const result = await validateUsernameAvailable("takenuser");
  assert.equal(result, "Username already taken", "taken username should return error message");
}

{
  const result = await validateUsernameAvailable("ab");
  assert.equal(result, true, "username shorter than 3 chars should return true (no validation)");
}

{
  global.fetch = async () => ({ ok: true, json: async () => ({ available: true }) });
  const result = await validateUsernameAvailable("");
  assert.equal(result, true, "empty username should return true");
}

// ── validateEmailAvailable tests ─────────────────────────────────────────────

{
  global.fetch = async () => ({ ok: true, json: async () => ({ available: true }) });
  const result = await validateEmailAvailable("new@example.com");
  assert.equal(result, true, "available email should return true");
}

{
  global.fetch = async () => ({ ok: true, json: async () => ({ available: false }) });
  const result = await validateEmailAvailable("taken@example.com");
  assert.equal(result, "Email already registered", "taken email should return error message");
}

{
  const result = await validateEmailAvailable("");
  assert.equal(result, true, "empty email should return true");
}

// ── validatePasswordStrength tests ──────────────────────────────────────────

{
  const result = await validatePasswordStrength("StrongPass1!");
  assert.equal(result, true, "strong password should return true");
}

{
  const result = await validatePasswordStrength("weak");
  assert.equal(result, "Password does not meet strength requirements", "weak password should return error");
}

{
  const result = await validatePasswordStrength("NoSpecial1");
  assert.equal(result, "Password does not meet strength requirements", "password without special char should fail");
}

{
  const result = await validatePasswordStrength("nouppercase1!");
  assert.equal(result, "Password does not meet strength requirements", "password without uppercase should fail");
}

{
  const result = await validatePasswordStrength("NOLOWERCASE1!");
  assert.equal(result, "Password does not meet strength requirements", "password without lowercase should fail");
}

{
  const result = await validatePasswordStrength("NoNumber!");
  assert.equal(result, "Password does not meet strength requirements", "password without number should fail");
}

{
  const result = await validatePasswordStrength("");
  assert.equal(result, true, "empty password should return true");
}

// ── createCustomAsyncValidator tests ─────────────────────────────────────────

{
  global.fetch = async () => ({ ok: true, json: async () => ({ valid: true }) });
  const validator = createCustomAsyncValidator("/api/check", {
    successField: "valid",
    errorMessage: "Custom validation failed",
  });
  const result = await validator("testvalue");
  assert.equal(result, true, "valid response should return true");
}

{
  global.fetch = async () => ({ ok: true, json: async () => ({ valid: false }) });
  const validator = createCustomAsyncValidator("/api/check", {
    successField: "valid",
    errorMessage: "Custom validation failed",
  });
  const result = await validator("testvalue");
  assert.equal(result, "Custom validation failed", "invalid response should return error message");
}

{
  global.fetch = async () => ({ ok: true, json: async () => ({ exists: true }) });
  const validator = createCustomAsyncValidator("/api/check", {
    method: "POST",
    paramName: "eventId",
    successField: "exists",
    errorMessage: "Event not found",
  });
  const result = await validator("event123");
  assert.equal(result, true, "POST validator should work with custom param");
}

{
  const result = await createCustomAsyncValidator("/api/check")("");
  assert.equal(result, true, "empty value should return true");
}

console.log("All asyncValidators tests passed!");
