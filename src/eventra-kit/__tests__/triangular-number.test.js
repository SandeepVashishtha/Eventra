import { describe, it, expect } from "vitest";
import * as TriangularNumber from "../triangular-number.js";

describe("triangular-number", () => {
  it("exports a module", () => {
    expect(TriangularNumber).toBeDefined();
  });

  it("computes 4th triangular number", () => {
    expect(TriangularNumber.triangularNumber(4)).toBe(10);
  });

  it("returns 0 for negative index", () => {
    expect(TriangularNumber.triangularNumber(-1)).toBe(0);
  });
});
