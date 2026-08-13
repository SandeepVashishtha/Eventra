import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  generateCertificateHash,
  buildVerificationUrl,
  verifyCertificateHash,
} from "../src/utils/certificateGenerator.js";

describe("Cryptographic Certificate Generator & SHA-256 Engine Tests", () => {
  it("should generate SHA-256 cryptographic certificate hash signature", async () => {
    const hash = await generateCertificateHash("Alex Rivera", "evt-2026-global");
    assert.ok(hash);
    assert.ok(hash.length >= 16);
  });

  it("should construct valid verification URL link", () => {
    const hash = "cert-sha256-a1b2c3d4";
    const url = buildVerificationUrl(hash);
    assert.equal(url, "https://eventra.io/verify-certificate?hash=cert-sha256-a1b2c3d4");
  });

  it("should verify certificate integrity mathematically", async () => {
    const name = "Sarah Chen";
    const eventId = "evt-hackathon-2026";
    const hash = await generateCertificateHash(name, eventId);

    const isValid = await verifyCertificateHash(name, eventId, hash);
    assert.equal(isValid, true);
  });
});
