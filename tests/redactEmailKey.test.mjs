import assert from "node:assert/strict";
import {
  redactSensitiveData,
  redactionPlaceholders,
} from "../src/utils/security/redactSensitiveData.js";

// #14588: an `email`-keyed field value must be redacted as [REDACTED_SECRET]
// (it is a sensitive key), while emails embedded inside arbitrary string
// values must still become [REDACTED_EMAIL].
const input = {
  email: "dev@example.com",
  contact: "Ask admin@example.org for help",
  nested: { email: "inner@example.com", note: "cc ops@example.com" },
};

const redacted = redactSensitiveData(input);

assert.equal(
  redacted.email,
  redactionPlaceholders.secret,
  "email-keyed value must be [REDACTED_SECRET]",
);
assert.equal(
  redacted.nested.email,
  redactionPlaceholders.secret,
  "nested email-keyed value must be [REDACTED_SECRET]",
);
assert.ok(
  redacted.contact.includes(redactionPlaceholders.email),
  "email embedded in a string value must stay [REDACTED_EMAIL]",
);
assert.ok(
  !redacted.contact.includes("admin@example.org"),
  "raw email must be gone from the string value",
);
assert.ok(
  redacted.nested.note.includes(redactionPlaceholders.email),
  "email embedded in nested string must stay [REDACTED_EMAIL]",
);

console.log("redact email-key regression tests passed");
