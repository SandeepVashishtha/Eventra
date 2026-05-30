import assert from "node:assert/strict";

const originalEnv = process.env.NODE_ENV;
process.env.NODE_ENV = "test";

const {
  getPublicErrorMessage,
  AUTH_ERRORS,
  FORM_ERRORS,
} = await import("../src/utils/errorMessages.js");

assert.equal(
  getPublicErrorMessage({ status: 404 }),
  "The requested resource was not found.",
  "maps HTTP 404 to safe message"
);
assert.equal(
  getPublicErrorMessage({ response: { status: 401 } }),
  "Your credentials are incorrect or your session has expired. Please sign in again.",
  "maps nested response status"
);
assert.equal(
  getPublicErrorMessage({ message: "Email already exists" }),
  "This email is already registered. Try signing in instead.",
  "maps keyword patterns from raw message"
);
assert.equal(
  getPublicErrorMessage(null, "Custom fallback"),
  "Custom fallback",
  "uses fallback for null error"
);
assert.equal(
  getPublicErrorMessage({ message: "unknown server glitch" }),
  "An unexpected error occurred. Please try again.",
  "uses default fallback when no match"
);

assert.equal(AUTH_ERRORS.loginFailed, "Invalid email or password.");
assert.equal(FORM_ERRORS.networkError, "Unable to reach the server. Please check your connection.");

process.env.NODE_ENV = originalEnv;

console.log("errorMessages tests passed ✓");
