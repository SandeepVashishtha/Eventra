import assert from "node:assert/strict";
import { getRegistrationFailureMessage } from "../src/utils/registrationFailureMessage.js";

assert.equal(
  getRegistrationFailureMessage({ status: 429 }),
  "Too many requests. Please wait a moment and try again.",
);

assert.equal(
  getRegistrationFailureMessage({ status: 409, data: { message: "Already registered" } }),
  "You are already registered for this event.",
);

console.log("useEventRegistration failure message tests passed ✓");
