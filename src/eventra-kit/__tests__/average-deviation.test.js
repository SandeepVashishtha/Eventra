import { describe, it, expect } from "vitest";
import * as AverageDeviation from "../average-deviation.js";

describe("average-deviation", () => {
  it("exports a module", () => {
    expect(AverageDeviation).toBeDefined();
  });

  it("computes average deviation of a simple dataset", () => {
    expect(AverageDeviation.averageDeviation([2, 2, 3, 4, 14])).toBe(3.6);
  });

  it("returns 0 for empty array", () => {
    expect(AverageDeviation.averageDeviation([])).toBe(0);
  });

  it("ignores invalid values in dataset", () => {
    expect(AverageDeviation.averageDeviation([2, NaN, 2, 3, 4, 14])).toBe(3.6);
  });
});
