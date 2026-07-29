import { strict as assert } from "node:assert";
import { describe, it, beforeEach } from "node:test";
import { createHmac } from "node:crypto";
import { validateSignature } from "../src/utils/signatureValidator.js";

const SECRET = "test-secret-key";

const signPayload = (payload, timestamp, nonce) => {
  const body = JSON.stringify(payload) + timestamp + nonce;
  return createHmac("sha256", SECRET).update(body).digest("hex");
};

describe("signatureValidator", () => {
  beforeEach(() => {
    // Each test uses a unique nonce to avoid replay detection across cases.
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
