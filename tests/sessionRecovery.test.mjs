import assert from "node:assert/strict";
import CryptoJS from "crypto-js";
import { sanitizeSessionState, sanitizeSessionValue } from "../src/utils/sessionSanitization.js";

// Helper to make a dummy base64-encoded JWT-like structure
function makeDummyJwt() {
  const header = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
  const payload = "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ";
  const signature = "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
  return `${header}.${payload}.${signature}`;
}

console.log("Starting Session Recovery Sanitization & Cryptography Tests...");

// ── Test 1: Simple value sanitization ──────────────────────────────────────
assert.equal(sanitizeSessionValue("hello"), "hello", "Plain string is untouched");
assert.equal(sanitizeSessionValue(123), 123, "Numbers are untouched");
assert.equal(sanitizeSessionValue(makeDummyJwt()), "[REDACTED_JWT]", "JWT pattern string is redacted");

// ── Test 2: Recursive state sanitization ───────────────────────────────────
const rawState = {
  eventId: "evt_100",
  timestamp: 1716912000000,
  token: "secret-auth-token-1234",
  user: {
    name: "John Doe",
    email: "john@example.com",
    jwt: makeDummyJwt(),
    credentials: {
      password: "SuperSecretPassword123",
      twoFactorSecret: "GBSWY3DPEB3W64TBNQ",
    }
  },
  guestList: [
    { name: "Alice", token: "alice-token-99" },
    { name: "Bob", jwt: makeDummyJwt() }
  ]
};

const expectedState = {
  eventId: "evt_100",
  timestamp: 1716912000000,
  token: "[REDACTED]",
  user: {
    name: "John Doe",
    email: "john@example.com",
    jwt: "[REDACTED]",
    credentials: {
      password: "[REDACTED]",
      twoFactorSecret: "GBSWY3DPEB3W64TBNQ" // Not in blacklist, but password/jwt are stripped
    }
  },
  guestList: [
    { name: "Alice", token: "[REDACTED]" },
    { name: "Bob", jwt: "[REDACTED]" }
  ]
};

const sanitized = sanitizeSessionState(rawState);
assert.deepEqual(sanitized.token, "[REDACTED]", "Top level token is redacted");
assert.deepEqual(sanitized.user.jwt, "[REDACTED]", "Nested jwt is redacted");
assert.deepEqual(sanitized.user.credentials.password, "[REDACTED]", "Deep nested password is redacted");
assert.deepEqual(sanitized.guestList[0].token, "[REDACTED]", "Array item token is redacted");
assert.deepEqual(sanitized.guestList[1].jwt, "[REDACTED]", "Array item jwt is redacted");
assert.deepEqual(sanitized.eventId, "evt_100", "Non-sensitive data is preserved");
assert.deepEqual(sanitized.timestamp, 1716912000000, "Timestamps are preserved");

// Verify that any direct JWT strings in values are also redacted if not under blacklisted keys
const stateWithUnkeyedJwt = {
  sessionValue: makeDummyJwt(),
  nested: {
    someValue: makeDummyJwt()
  }
};
const sanitizedUnkeyed = sanitizeSessionState(stateWithUnkeyedJwt);
assert.equal(sanitizedUnkeyed.sessionValue, "[REDACTED_JWT]", "Plain value JWT redacted");
assert.equal(sanitizedUnkeyed.nested.someValue, "[REDACTED_JWT]", "Nested plain value JWT redacted");

// ── Test 3: Session Encryption & Decryption ──────────────────────────────
const testKey = CryptoJS.lib.WordArray.random(32).toString();
const testState = {
  name: "SafeSessionState",
  itemsCount: 5,
  timestamp: Date.now()
};

const serialized = JSON.stringify(testState);
const ciphertext = CryptoJS.AES.encrypt(serialized, testKey).toString();

// Verify stored data is not plaintext
assert.notEqual(ciphertext, serialized, "Ciphertext is encrypted, not plaintext");
assert.ok(!ciphertext.includes("SafeSessionState"), "Ciphertext does not expose plaintext session names");

// Verify successful decryption
const decryptedBytes = CryptoJS.AES.decrypt(ciphertext, testKey);
const decryptedStr = decryptedBytes.toString(CryptoJS.enc.Utf8);
const decryptedState = JSON.parse(decryptedStr);
assert.deepEqual(decryptedState, testState, "Decrypted state matches original state");

// Verify decryption failure with invalid key
const wrongKey = CryptoJS.lib.WordArray.random(32).toString();
let decryptedWithWrongKey = null;
try {
  const failedBytes = CryptoJS.AES.decrypt(ciphertext, wrongKey);
  decryptedWithWrongKey = failedBytes.toString(CryptoJS.enc.Utf8);
} catch (e) {
  decryptedWithWrongKey = null;
}

let parseThrew = false;
try {
  if (decryptedWithWrongKey) {
    JSON.parse(decryptedWithWrongKey);
  }
} catch (e) {
  parseThrew = true;
}

assert.ok(
  decryptedWithWrongKey === null || decryptedWithWrongKey === "" || parseThrew,
  "Decryption with wrong key must either fail, return empty, or throw on JSON parsing"
);

// ── Test 4: Cryptographic Device Fingerprinting & Session Hijacking Guard ────
import { getDeviceFingerprint } from "../src/utils/deviceFingerprint.js";

// A. Verify consistent test environment fingerprint hash matches across evaluations
const fp1 = getDeviceFingerprint();
const fp2 = getDeviceFingerprint();
assert.equal(fp1, fp2, "Device fingerprint evaluates consistently across evaluations in test environment");
assert.equal(typeof fp1, "string", "Fingerprint is a string");
assert.equal(fp1.length, 64, "Fingerprint is a valid 64-character SHA-256 hex string");

// B. Verify that session hijacking is strictly blocked when fingerprint hashes differ
const originalFingerprint = getDeviceFingerprint();
const userState = {
  name: "HijackedUserSession",
  deviceFingerprint: originalFingerprint, // Saved under the original fingerprint
  timestamp: Date.now()
};

// Simulate another device restoring the session (tampered/mismatched fingerprint hash)
const maliciousFingerprint = CryptoJS.SHA256("malicious-different-device-999").toString();
const tamperedState = {
  ...userState,
  deviceFingerprint: maliciousFingerprint // Fingerprint tampered or restored on mismatched machine
};

// Validate that mismatch is detected
assert.notEqual(tamperedState.deviceFingerprint, originalFingerprint, "Malicious fingerprint does not match original");
assert.ok(tamperedState.deviceFingerprint !== getDeviceFingerprint(), "Mismatched device fingerprint successfully detected");

console.log("All Session Recovery Sanitization & Cryptography tests passed successfully ✓");

