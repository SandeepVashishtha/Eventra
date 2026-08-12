import { describe, it, expect } from "vitest";
import * as QuadraticMean from "../quadratic-mean.js";

describe("quadratic-mean", () => {
  it("exports a module", () => {
    expect(QuadraticMean).toBeDefined();
  });

  it("computes quadratic mean of a simple dataset", () => {
    expect(QuadraticMean.quadraticMean([1, 3, 5, 7])).toBeCloseTo(4.89897, 4);
  });

  it("returns 0 for empty array", () => {
    expect(QuadraticMean.quadraticMean([])).toBe(0);
  });
});
