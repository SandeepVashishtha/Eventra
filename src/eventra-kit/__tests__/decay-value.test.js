import { describe, it, expect } from "vitest";
import * as DecayValue from "../decay-value.js";

describe("decay-value", () => {
  it("exports a module", () => {
    expect(DecayValue).toBeDefined();
  });

  it("decays value over time", () => {
    expect(DecayValue.decayValue(100, 0.1, 10)).toBeCloseTo(36.78794, 4);
  });

  it("returns 0 for invalid inputs", () => {
    expect(DecayValue.decayValue(NaN, 1, 1)).toBe(0);
  });
});
