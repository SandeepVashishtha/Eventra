import test from "node:test";
import assert from "node:assert/strict";
import { getRegistrationFailureMessage } from "../src/utils/registrationErrors.js";

test("returns rate-limit message for HTTP 429 responses", () => {
  const message = getRegistrationFailureMessage({
    status: 429,
    name: "RateLimitError",
    message: "Too many requests",
  });

  assert.equal(
    message,
    "Too many registration attempts. Please wait a moment and try again."
  );
});

test("returns rate-limit message when server message mentions rate limiting", () => {
  const message = getRegistrationFailureMessage({
    status: 500,
    message: "Rate limit exceeded for this endpoint",
  });

  assert.equal(
    message,
    "Too many registration attempts. Please wait a moment and try again."
  );
});
