import assert from "node:assert/strict";
import { getPublicErrorMessage, AUTH_ERRORS, FORM_ERRORS } from "../src/utils/errorMessages.js";

// Save Node environment
const originalNodeEnv = process.env.NODE_ENV;

// Test with null / undefined inputs
assert.equal(
  getPublicErrorMessage(null),
  "An unexpected error occurred. Please try again.",
  "null error returns default fallback"
);
assert.equal(
  getPublicErrorMessage(undefined, "Custom fallback"),
  "Custom fallback",
  "undefined error returns custom fallback argument"
);

// Test HTTP status code matching
const err400 = { status: 400 };
assert.equal(
  getPublicErrorMessage(err400),
  "The request could not be understood. Please check your input and try again.",
  "Matches 400 status message"
);

const err401 = { response: { status: 401 } };
assert.equal(
  getPublicErrorMessage(err401),
  "Your credentials are incorrect or your session has expired. Please sign in again.",
  "Matches 401 nested status message"
);

const err429 = { statusCode: 429 };
assert.equal(
  getPublicErrorMessage(err429),
  "Too many requests. Please wait a moment before trying again.",
  "Matches 429 statusCode message"
);

// Test keyword matching from err.message
const errDuplicateEmail = { message: "This email is already registered." };
assert.equal(
  getPublicErrorMessage(errDuplicateEmail),
  "This email is already registered. Try signing in instead.",
  "Matches email registration keyword message"
);

// Test keyword matching from nested response data
const errWrongPassword = { response: { data: { message: "Invalid password supplied." } } };
assert.equal(
  getPublicErrorMessage(errWrongPassword),
  "Invalid email or password.",
  "Matches password incorrect keyword message"
);

const errTokenExpired = { response: { data: { error: "jwt expired" } } };
assert.equal(
  getPublicErrorMessage(errTokenExpired),
  "Your session has expired. Please sign in again.",
  "Matches jwt expired keyword message"
);

// Test keyword matching for network failures
const errNetwork = { message: "Failed to fetch resource from server" };
assert.equal(
  getPublicErrorMessage(errNetwork),
  "Unable to reach the server. Please check your connection.",
  "Matches fetch network keyword message"
);

// Test fallback when no status code or keyword matches
const errUnmatched = { message: "Some internal developer error details" };
assert.equal(
  getPublicErrorMessage(errUnmatched),
  "An unexpected error occurred. Please try again.",
  "Falls back to default message when unmatched"
);

// Test exported constant error maps
assert.equal(AUTH_ERRORS.loginFailed, "Invalid email or password.", "AUTH_ERRORS export verified");
assert.equal(FORM_ERRORS.submitFailed, "Submission failed. Please check your input and try again.", "FORM_ERRORS export verified");

console.log("errorMessages tests passed ✓");
