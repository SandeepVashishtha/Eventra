import { describe, it, expect } from "vitest";
import * as HarmonicMean from "../harmonic-mean.js";

describe("harmonic-mean", () => {
  it("exports a module", () => {
    expect(HarmonicMean).toBeDefined();
  });

  it("computes harmonic mean of a simple dataset", () => {
    expect(HarmonicMean.harmonicMean([1, 2, 4])).toBeCloseTo(1.7143, 4);
  });

  it("returns 0 if any value is 0", () => {
    expect(HarmonicMean.harmonicMean([1, 0, 4])).toBe(0);
  });

  it("returns 0 for empty array", () => {
    expect(HarmonicMean.harmonicMean([])).toBe(0);
  });
});
