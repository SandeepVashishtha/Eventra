/**
 * @fileoverview errorMessages.test.mjs
 *
 * Comprehensive test suite validating localized error parsing, keyword extraction
 * filters, Axios-shaped JSON payloads, status code checks, and fallback mechanisms
 * under the Eventra framework.
 */

import assert from "node:assert/strict";
import {
  getPublicErrorMessage,
  AUTH_ERRORS,
  FORM_ERRORS,
} from "../src/utils/errorMessages.js";

// Suppress console.error noise from dev-mode logging to keep test console clean
const originalConsoleError = console.error;
console.error = () => {};

try {
  const FALLBACK = "An unexpected error occurred. Please try again.";

  // ===========================================================================
  // Test Group 1: Falsy and Nullish Arguments
  // ===========================================================================
  console.log("Running Test Group 1: Falsy & Nullish Arguments...");
  assert.equal(getPublicErrorMessage(null), FALLBACK, "Null error should yield generic fallback");
  assert.equal(getPublicErrorMessage(undefined), FALLBACK, "Undefined error should yield generic fallback");
  assert.equal(getPublicErrorMessage(0), FALLBACK, "Numeric zero error should yield generic fallback");
  assert.equal(getPublicErrorMessage(""), FALLBACK, "Empty string error should yield generic fallback");

  // ===========================================================================
  // Test Group 2: Explicit Status Codes via error.status
  // ===========================================================================
  console.log("Running Test Group 2: HTTP Status Codes...");
  assert.equal(
    getPublicErrorMessage({ status: 400 }),
    "The request could not be understood. Please check your input and try again.",
    "Status 400 should yield localized bad request message"
  );
  assert.equal(
    getPublicErrorMessage({ status: 401 }),
    "Your credentials are incorrect or your session has expired. Please sign in again.",
    "Status 401 should yield localized unauthorized message"
  );
  assert.equal(
    getPublicErrorMessage({ status: 403 }),
    "You don't have permission to perform this action.",
    "Status 403 should yield localized forbidden message"
  );
  assert.equal(
    getPublicErrorMessage({ status: 404 }),
    "The requested resource was not found.",
    "Status 404 should yield localized not found message"
  );
  assert.equal(
    getPublicErrorMessage({ status: 429 }),
    "Too many requests. Please wait a moment before trying again.",
    "Status 429 should yield localized rate limit message"
  );
  assert.equal(
    getPublicErrorMessage({ status: 500 }),
    "Something went wrong on our end. Please try again shortly.",
    "Status 500 should yield localized server error message"
  );
  assert.equal(
    getPublicErrorMessage({ status: 503 }),
    "The service is temporarily unavailable. Please try again shortly.",
    "Status 503 should yield localized service unavailable message"
  );

  // ===========================================================================
  // Test Group 3: Axios Response Structures (err.response.status)
  // ===========================================================================
  console.log("Running Test Group 3: Axios Nested Response Status Codes...");
  assert.equal(
    getPublicErrorMessage({ response: { status: 409 } }),
    "This information is already in use. Please try a different value.",
    "Axios status 409 should resolve duplicate conflict message"
  );

  // ===========================================================================
  // Test Group 4: Custom status fields (err.statusCode)
  // ===========================================================================
  console.log("Running Test Group 4: Custom API statusCode Fields...");
  assert.equal(
    getPublicErrorMessage({ statusCode: 422 }),
    "Some fields contain invalid values. Please review and correct them.",
    "statusCode 422 should resolve unprocessable entry message"
  );

  // ===========================================================================
  // Test Group 5: Keyword matching via err.message (Standard Error Strings)
  // ===========================================================================
  console.log("Running Test Group 5: Error Message Keyword Matching...");
  assert.equal(
    getPublicErrorMessage({ message: "email already exists in database" }),
    "This email is already registered. Try signing in instead.",
    "Email duplicate database pattern match should map to sign-in prompt"
  );
  assert.equal(
    getPublicErrorMessage({ message: "Invalid password provided" }),
    "Invalid email or password.",
    "Password incorrect pattern match should map to standard credentials error"
  );
  assert.equal(
    getPublicErrorMessage({ message: "jwt expired" }),
    "Your credentials are incorrect or your session has expired. Please sign in again.",
    "Token expiration keyword should map to login expiration message"
  );
  assert.equal(
    getPublicErrorMessage({ message: "ECONNREFUSED" }),
    "Unable to reach the server. Please check your connection.",
    "ECONNREFUSED network disconnect should map to offline assistance prompt"
  );
  assert.equal(
    getPublicErrorMessage({ message: "account locked after too many attempts" }),
    "Your account has been temporarily locked. Please try again later.",
    "Account lock keyword should map to lockout prompt"
  );

  // ===========================================================================
  // Test Group 6: Nested Axios Message structures
  // ===========================================================================
  console.log("Running Test Group 6: Axios Nested Response Body Keyword Matches...");
  assert.equal(
    getPublicErrorMessage({ response: { data: { message: "user not found" } } }),
    "No account found with those details.",
    "Axios nested user not found should resolve to account not found prompt"
  );
  assert.equal(
    getPublicErrorMessage({ response: { data: { error: "DUPLICATE_EMAIL_DETECTED" } } }),
    "This email is already registered. Try signing in instead.",
    "Axios nested error body duplicate email should resolve to email registered prompt"
  );

  // ===========================================================================
  // Test Group 7: Advanced Character Casings and Obscure Errors
  // ===========================================================================
  console.log("Running Test Group 7: Mixed Case and Padding Keywords...");
  assert.equal(
    getPublicErrorMessage({ message: "   JWT   EXPIRED   " }),
    "Your credentials are incorrect or your session has expired. Please sign in again.",
    "Excessive spacing and capitalization variations of keywords should still map correctly"
  );
  assert.equal(
    getPublicErrorMessage({ message: "some obscure database index error code 45" }, "Custom fallback message"),
    "Custom fallback message",
    "Obscure errors without matches must fallback to specified user message"
  );

  // ===========================================================================
  // Test Group 8: Bounded Keyword Pattern Gaps
  // ===========================================================================
  console.log("Running Test Group 8: Bounded Regex Keyword Gaps...");
  const oversizedKeywordGap = `email ${"x ".repeat(250)} already ${"x ".repeat(250)} exist`;
  assert.equal(
    getPublicErrorMessage({ message: oversizedKeywordGap }, "Safe fallback"),
    "Safe fallback",
    "Keyword regex matching should not span unbounded attacker-controlled message gaps"
  );

  // ===========================================================================
  // Test Group 9: Validation of Expose Error Constant Objects
  // ===========================================================================
  console.log("Running Test Group 9: Static Error Constant Dictionaries...");
  assert.equal(typeof AUTH_ERRORS.loginFailed, "string");
  assert.ok(AUTH_ERRORS.loginFailed.length > 0);
  assert.equal(typeof AUTH_ERRORS.sessionExpired, "string");
  assert.equal(typeof AUTH_ERRORS.emailTaken, "string");
  assert.equal(typeof AUTH_ERRORS.passwordWeak, "string");

  assert.equal(typeof FORM_ERRORS.submitFailed, "string");
  assert.ok(FORM_ERRORS.networkError.length > 0);
  assert.equal(typeof FORM_ERRORS.serverError, "string");
  assert.equal(typeof FORM_ERRORS.validationFailed, "string");

  console.log("errorMessages tests passed ✓");
} finally {
  console.error = originalConsoleError;
}
