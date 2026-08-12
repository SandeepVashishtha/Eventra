import { describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";

function constantTimeEquals(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
}

describe("JWT Key Rotation Timing Attack Prevention Tests", () => {
  it("should return true for identical signature strings using timingSafeEqual", () => {
    const s1 = "signature_payload_xyz";
    const s2 = "signature_payload_xyz";
    const s3 = "signature_payload_wrong";

    assert.equal(constantTimeEquals(s1, s2), true);
    assert.equal(constantTimeEquals(s1, s3), false);
  });
});
