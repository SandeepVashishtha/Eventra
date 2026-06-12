import assert from "node:assert/strict";
import {
  getPublicErrorMessage,
  AUTH_ERRORS,
  FORM_ERRORS,
} from "../src/utils/errorMessages.js";

// Suppress console.error noise from dev-mode logging
const originalConsoleError = console.error;
console.error = () => {};

try {
  const FALLBACK = "An unexpected error occurred. Please try again.";

  // ── Test 1: null / falsy error returns fallback ───────────────────────────
  assert.equal(getPublicErrorMessage(null), FALLBACK);
  assert.equal(getPublicErrorMessage(undefined), FALLBACK);
  assert.equal(getPublicErrorMessage(0), FALLBACK);

  // ── Test 2: HTTP status codes via err.status ──────────────────────────────
  assert.equal(
    getPublicErrorMessage({ status: 400 }),
    "The request could not be understood. Please check your input and try again."
  );
  assert.equal(
    getPublicErrorMessage({ status: 401 }),
    "Your credentials are incorrect or your session has expired. Please sign in again."
  );
  assert.equal(
    getPublicErrorMessage({ status: 403 }),
    "You don't have permission to perform this action."
  );
  assert.equal(
    getPublicErrorMessage({ status: 404 }),
    "The requested resource was not found."
  );
  assert.equal(
    getPublicErrorMessage({ status: 429 }),
    "Too many requests. Please wait a moment before trying again."
  );
  assert.equal(
    getPublicErrorMessage({ status: 500 }),
    "Something went wrong on our end. Please try again shortly."
  );
  assert.equal(
    getPublicErrorMessage({ status: 503 }),
    "The service is temporarily unavailable. Please try again shortly."
  );

  // ── Test 3: HTTP status via err.response.status ───────────────────────────
  assert.equal(
    getPublicErrorMessage({ response: { status: 409 } }),
    "This information is already in use. Please try a different value."
  );

  // ── Test 4: HTTP status via err.statusCode ────────────────────────────────
  assert.equal(
    getPublicErrorMessage({ statusCode: 422 }),
    "Some fields contain invalid values. Please review and correct them."
  );

  // ── Test 5: Keyword matching via err.message ──────────────────────────────
  assert.equal(
    getPublicErrorMessage({ message: "email already exists in database" }),
    "This email is already registered. Try signing in instead."
  );
  assert.equal(
    getPublicErrorMessage({ message: "Invalid password provided" }),
    "Invalid email or password."
  );
  assert.equal(
    getPublicErrorMessage({ message: "jwt expired" }),
    "Your session has expired. Please sign in again."
  );
  assert.equal(
    getPublicErrorMessage({ message: "ECONNREFUSED" }),
    "Unable to reach the server. Please check your connection."
  );
  assert.equal(
    getPublicErrorMessage({ message: "account locked after too many attempts" }),
    "Your account has been temporarily locked. Please try again later."
  );

  // ── Test 6: keyword matching via err.response.data.message ───────────────
  assert.equal(
    getPublicErrorMessage({ response: { data: { message: "user not found" } } }),
    "No account found with those details."
  );

  // ── Test 7: unknown error uses custom fallback ─────────────────────────────
  assert.equal(
    getPublicErrorMessage({ message: "some obscure error" }, "Custom fallback"),
    "Custom fallback"
  );

  // ── Test 8: AUTH_ERRORS constants are defined and non-empty ──────────────
  assert.equal(typeof AUTH_ERRORS.loginFailed, "string");
  assert.ok(AUTH_ERRORS.loginFailed.length > 0);
  assert.equal(typeof AUTH_ERRORS.sessionExpired, "string");
  assert.equal(typeof AUTH_ERRORS.emailTaken, "string");
  assert.equal(typeof AUTH_ERRORS.passwordWeak, "string");

  // ── Test 9: FORM_ERRORS constants are defined and non-empty ──────────────
  assert.equal(typeof FORM_ERRORS.submitFailed, "string");
  assert.ok(FORM_ERRORS.networkError.length > 0);
  assert.equal(typeof FORM_ERRORS.serverError, "string");
  assert.equal(typeof FORM_ERRORS.validationFailed, "string");

  console.log("errorMessages tests passed ✓");
} finally {
  console.error = originalConsoleError;
}
