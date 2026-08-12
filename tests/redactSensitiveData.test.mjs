import assert from "node:assert/strict";
import {
  redactSensitiveData,
  redactionPlaceholders,
} from "../src/utils/security/redactSensitiveData.js";

const jwt =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.sflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

const input = {
  email: "dev@example.com",
  password: "correct-horse-battery-staple",
  apiKey: "sk_live_123456",
  nested: {
    message: `Authorization: Bearer ${jwt}`,
    contact: "Ask admin@example.org for help",
  },
  headers: {
    Authorization: `Bearer ${jwt}`,
    "x-api-key": "public-looking-but-secret",
  },
};

const redacted = redactSensitiveData(input);

assert.notEqual(redacted, input);
assert.equal(input.password, "correct-horse-battery-staple");
assert.equal(redacted.email, redactionPlaceholders.secret);
assert.equal(redacted.password, redactionPlaceholders.secret);
assert.equal(redacted.apiKey, redactionPlaceholders.secret);
assert.equal(redacted.headers.Authorization, redactionPlaceholders.secret);
assert.equal(redacted.headers["x-api-key"], redactionPlaceholders.secret);
assert.equal(redacted.nested.message.includes(jwt), false);
assert.equal(
  redacted.nested.message.includes(redactionPlaceholders.authorization),
  true,
);
assert.equal(redacted.nested.contact.includes("admin@example.org"), false);
assert.equal(redacted.nested.contact.includes(redactionPlaceholders.email), true);

const error = new Error(`Failed login for user@example.com with token ${jwt}`);
const redactedError = redactSensitiveData(error);
assert.ok(redactedError instanceof Error);
assert.equal(redactedError.message.includes("user@example.com"), false);
assert.equal(redactedError.message.includes(jwt), false);

console.log("redactSensitiveData tests passed");
