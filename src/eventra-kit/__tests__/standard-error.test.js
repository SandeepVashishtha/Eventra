import { describe, it, expect } from "vitest";
import * as StandardError from "../standard-error.js";

describe("standard-error", () => {
  it("exports a module", () => {
    expect(StandardError).toBeDefined();
  });

  it("computes SEM of a dataset", () => {
    expect(StandardError.standardError([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(0.7559, 4);
  });

  it("returns 0 for small arrays", () => {
    expect(StandardError.standardError([1])).toBe(0);
  });
});
