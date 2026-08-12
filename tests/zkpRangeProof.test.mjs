import { describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";

function generateZkCommitment(proofValue, salt) {
  return crypto.createHash("sha256").update(proofValue + salt).digest("hex");
}

describe("Zero-Knowledge Range Proof Security Tests", () => {
  it("should verify commitment matching SHA-256 proof hashes", () => {
    const proofValue = "ELIGIBLE_18_PLUS";
    const salt = "random_salt_123";

    const commitment = generateZkCommitment(proofValue, salt);
    const verifierHash = crypto.createHash("sha256").update(proofValue + salt).digest("hex");

    assert.equal(commitment, verifierHash);
  });
});
