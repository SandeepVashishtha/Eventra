import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  sampleLaplaceNoise,
  addDifferentialPrivacyNoise,
  getPrivacyGuaranteeLabel,
} from "../src/utils/privacy/differentialPrivacy.js";

describe("Laplace Mechanism Differential Privacy Tests", () => {
  it("should generate numeric Laplace noise samples", () => {
    const noise = sampleLaplaceNoise(1.0, 0.5);
    assert.equal(typeof noise, "number");
    assert.ok(!isNaN(noise));
  });

  it("should add differential privacy noise to aggregate rating counts", () => {
    const rawVal = 100;
    const noisyVal = addDifferentialPrivacyNoise(rawVal, 0.5);

    assert.equal(typeof noisyVal, "number");
    assert.ok(noisyVal >= 0);
  });

  it("should format privacy guarantee label correctly", () => {
    const label = getPrivacyGuaranteeLabel(0.1);
    assert.equal(label, "Strict Privacy (High Noise)");
  });
});
