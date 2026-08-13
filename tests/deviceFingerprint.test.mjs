import { strict as assert } from "node:assert";
import { describe, it, beforeEach } from "node:test";

import { getDeviceFingerprint, getFastFingerprint, _clearFingerprintCache } from "../src/utils/deviceFingerprint.js";

describe("deviceFingerprint #16247", () => {
  beforeEach(() => _clearFingerprintCache());

  it("getFastFingerprint must equal getDeviceFingerprint for the same device", () => {
    const canonical = getDeviceFingerprint();
    const fast = getFastFingerprint();
    assert.strictEqual(fast, canonical, "fast and canonical fingerprints must match");
  });

  it("remains stable across repeated calls", () => {
    const canonical = getDeviceFingerprint();
    assert.strictEqual(getDeviceFingerprint(), canonical);
    assert.strictEqual(getFastFingerprint(), canonical);
  });
});
