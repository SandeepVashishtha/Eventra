import assert from "node:assert/strict";
import { sanitizeSessionValue, sanitizeSessionState } from "../src/utils/sessionSanitization.js";

assert.equal(sanitizeSessionValue(null), null, "null input returns null");
assert.equal(sanitizeSessionValue(undefined), undefined, "undefined input returns undefined");
assert.equal(sanitizeSessionValue("plain text"), "plain text", "plain string returns unchanged");

const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgRG9lIiwiaWF0IjoxNTE2MjExOTIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
assert.equal(sanitizeSessionValue(jwtToken), "[REDACTED_JWT]", "JWT-formatted string returns [REDACTED_JWT]");
assert.equal(sanitizeSessionValue("notajwt"), "notajwt", "non-JWT string unchanged");

assert.equal(sanitizeSessionState(null), null, "null returns null");
assert.equal(sanitizeSessionState(undefined), undefined, "undefined returns undefined");

assert.deepEqual(sanitizeSessionState({}), {}, "empty object returns empty object");
assert.deepEqual(sanitizeSessionState({ name: "Ada" }), { name: "Ada" }, "object without sensitive keys unchanged");
assert.deepEqual(sanitizeSessionState({ token: "abc123" }), { token: "[REDACTED]" }, "token key is redacted");
assert.deepEqual(sanitizeSessionState({ accessToken: "tok123" }), { accessToken: "[REDACTED]" }, "accessToken key is redacted");
assert.deepEqual(sanitizeSessionState({ password: "secret" }), { password: "[REDACTED]" }, "password key is redacted");
assert.deepEqual(sanitizeSessionState({ authorization: "Bearer xyz" }), { authorization: "[REDACTED]" }, "authorization key is redacted");
assert.deepEqual(sanitizeSessionState({ refreshToken: "refresh123" }), { refreshToken: "[REDACTED]" }, "refreshToken key is redacted");
assert.deepEqual(sanitizeSessionState({ idToken: "id123" }), { idToken: "[REDACTED]" }, "idToken key is redacted");
assert.deepEqual(sanitizeSessionState({ apiKey: "key123" }), { apiKey: "[REDACTED]" }, "apiKey key is redacted");
assert.deepEqual(sanitizeSessionState({ api_key: "key123" }), { api_key: "[REDACTED]" }, "api_key key is redacted");
assert.deepEqual(sanitizeSessionState({ jwt: "jwt123" }), { jwt: "[REDACTED]" }, "jwt key is redacted");
assert.deepEqual(sanitizeSessionState({ mnemonic: "word1 word2" }), { mnemonic: "[REDACTED]" }, "mnemonic key is redacted");
assert.deepEqual(sanitizeSessionState({ privateKey: "privkey" }), { privateKey: "[REDACTED]" }, "privateKey key is redacted");

assert.deepEqual(sanitizeSessionState({ token: "secret", name: "Ada" }), { token: "[REDACTED]", name: "Ada" }, "mixed sensitive and non-sensitive keys");

assert.deepEqual(sanitizeSessionState([{ token: "abc" }, { name: "Bob" }]), [{ token: "[REDACTED]" }, { name: "Bob" }], "arrays are processed");
assert.deepEqual(sanitizeSessionState([{ token: "abc" }]), [{ token: "[REDACTED]" }], "array with sensitive key");

assert.deepEqual(sanitizeSessionState({ nested: { token: "secret" } }), { nested: { token: "[REDACTED]" } }, "nested objects are sanitized");
assert.deepEqual(sanitizeSessionState({ level1: { level2: { token: "deep" } } }), { level1: { level2: { token: "[REDACTED]" } } }, "deeply nested objects");

const dateObj = new Date("2025-01-01");
const result = sanitizeSessionState({ date: dateObj });
assert.equal(result.date, dateObj, "non-plain objects (Date) are returned unchanged");

const result2 = sanitizeSessionState({ token: "abc", nested: { secret: "hidden", normal: "visible" } });
assert.deepEqual(result2, { token: "[REDACTED]", nested: { secret: "[REDACTED]", normal: "visible" } }, "nested sensitive keys redacted");

console.log("All sessionSanitization tests passed!");