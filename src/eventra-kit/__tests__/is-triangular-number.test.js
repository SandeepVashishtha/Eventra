import { describe, it, expect } from "vitest";
import * as IsTriangularNumber from "../is-triangular-number.js";

describe("is-triangular-number", () => {
  it("exports a module", () => {
    expect(IsTriangularNumber).toBeDefined();
  });

  it("returns true for 10", () => {
    expect(IsTriangularNumber.isTriangularNumber(10)).toBe(true);
  });

  it("returns false for 11", () => {
    expect(IsTriangularNumber.isTriangularNumber(11)).toBe(false);
  });
});
