import assert from "node:assert/strict";

const {
  sanitizeSessionValue,
  sanitizeSessionState,
} = await import("../src/utils/sessionSanitization.js");

const jwt =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature";

assert.equal(sanitizeSessionValue(jwt), "[REDACTED_JWT]");
assert.equal(sanitizeSessionValue("hello"), "hello");

const sanitized = sanitizeSessionState({
  user: { name: "Ada" },
  token: "secret-token",
  nested: { apiKey: "abc123", note: jwt },
});

assert.equal(sanitized.user.name, "Ada");
assert.equal(sanitized.token, "[REDACTED]");
assert.equal(sanitized.nested.apiKey, "[REDACTED]");
assert.equal(sanitized.nested.note, "[REDACTED_JWT]");

assert.deepEqual(
  sanitizeSessionState([{ password: "x" }, { ok: true }]),
  [{ password: "[REDACTED]" }, { ok: true }]
);

console.log("sessionSanitization tests passed ✓");
