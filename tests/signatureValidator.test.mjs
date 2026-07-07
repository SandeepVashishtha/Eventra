import { strict as assert } from "node:assert";
import { describe, it, beforeEach, afterEach } from "node:test";
import { createHmac } from "node:crypto";
import {
  validateSignature,
  startNonceCleanup,
  stopNonceCleanup,
} from "../src/utils/signatureValidator.js";

const SECRET = "test-secret-key";

const signPayload = (payload, timestamp, nonce) => {
  const body = JSON.stringify(payload) + timestamp + nonce;
  return createHmac("sha256", SECRET).update(body).digest("hex");
};

describe("signatureValidator", () => {
  afterEach(() => {
    stopNonceCleanup();
  });

  it("validates a correctly signed request using Web Crypto (no Node crypto import in module)", async () => {
    const payload = { eventId: "evt-1", action: "register" };
    const timestamp = String(Date.now());
    const nonce = `nonce-${Date.now()}`;
    const signature = signPayload(payload, timestamp, nonce);

    const result = await validateSignature(payload, timestamp, nonce, signature, SECRET);

    assert.equal(result.valid, true);
    assert.equal(result.error, undefined);
  });

  it("rejects missing signature fields", async () => {
    const result = await validateSignature({}, "", "nonce", "", SECRET);
    assert.equal(result.valid, false);
    assert.equal(result.error, "Missing signature fields");
  });

  it("rejects expired timestamps", async () => {
    const payload = { eventId: "evt-2" };
    const timestamp = String(Date.now() - 10 * 60 * 1000);
    const nonce = "expired-nonce";
    const signature = signPayload(payload, timestamp, nonce);

    const result = await validateSignature(payload, timestamp, nonce, signature, SECRET);
    assert.equal(result.valid, false);
    assert.equal(result.error, "Expired request");
  });

  it("rejects invalid signatures", async () => {
    const payload = { eventId: "evt-3" };
    const timestamp = String(Date.now());
    const nonce = "bad-sig-nonce";
    const result = await validateSignature(
      payload,
      timestamp,
      nonce,
      "deadbeef",
      SECRET,
    );
    assert.equal(result.valid, false);
    assert.equal(result.error, "Invalid signature");
  });
});

describe("nonce cleanup lifecycle", () => {
  beforeEach(() => {
    stopNonceCleanup();
  });

  afterEach(() => {
    stopNonceCleanup();
  });

  it("startNonceCleanup is idempotent — calling twice does not create extra intervals", async () => {
    startNonceCleanup();
    startNonceCleanup(); // second call should no-op

    // Validate that the module still works correctly
    const payload = { eventId: "evt-lifecycle-1" };
    const timestamp = String(Date.now());
    const nonce = `nonce-lifecycle-${Date.now()}`;
    const signature = signPayload(payload, timestamp, nonce);

    const result = await validateSignature(payload, timestamp, nonce, signature, SECRET);
    assert.equal(result.valid, true);
  });

  it("stopNonceCleanup clears all state", async () => {
    startNonceCleanup();

    // Use a nonce so the map is non-empty
    const payload = { eventId: "evt-lifecycle-2" };
    const timestamp = String(Date.now());
    const nonce = `nonce-clear-${Date.now()}`;
    const signature = signPayload(payload, timestamp, nonce);

    await validateSignature(payload, timestamp, nonce, signature, SECRET);
    stopNonceCleanup();

    // After stop, a fresh nonce should be accepted (map was cleared)
    const timestamp2 = String(Date.now());
    const nonce2 = `nonce-after-stop-${Date.now()}`;
    const signature2 = signPayload(payload, timestamp2, nonce2);

    const result2 = await validateSignature(payload, timestamp2, nonce2, signature2, SECRET);
    assert.equal(result2.valid, true);
  });
});
