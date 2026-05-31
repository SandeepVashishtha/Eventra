import assert from "node:assert/strict";

import {
  createAsyncValidator,
  createCustomAsyncValidator,
  validatePasswordStrength,
  withRetry,
} from "../src/utils/asyncValidators.js";

const debounced = createAsyncValidator(async (value) => value.length >= 3 || "Too short", 10);
assert.equal(await debounced("abcd"), true);
assert.equal(await debounced("ab"), "Too short");

const errorValidator = createAsyncValidator(async () => {
  throw new Error("Network down");
}, 5);
assert.equal(await errorValidator("value"), "Network down");

let attempts = 0;
const failing = withRetry(async () => {
  attempts += 1;
  throw new Error("Temporary failure");
}, 2, 5);
await assert.rejects(failing(), /Temporary failure/);
assert.equal(attempts, 2);

assert.equal(await validatePasswordStrength(""), true);
assert.equal(await validatePasswordStrength("SecurePass123!"), true);
assert.equal(
  await validatePasswordStrength("weak"),
  "Password does not meet strength requirements",
);

global.fetch = async (url) => {
  assert.match(String(url), /eventId=evt-1/);
  return {
    ok: true,
    json: async () => ({ valid: true }),
  };
};

const validateEventId = createCustomAsyncValidator("/api/events/check", {
  paramName: "eventId",
  errorMessage: "Event not found",
});
assert.equal(await validateEventId("evt-1"), true);
delete global.fetch;

console.log("asyncValidators extended tests passed ✓");
