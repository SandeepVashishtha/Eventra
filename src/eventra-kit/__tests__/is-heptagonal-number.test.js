import { describe, it, expect } from "vitest";
import * as IsHeptagonalNumber from "../is-heptagonal-number.js";

describe("is-heptagonal-number", () => {
  it("exports a module", () => {
    expect(IsHeptagonalNumber).toBeDefined();
  });

  it("returns true for 55", () => {
    expect(IsHeptagonalNumber.isHeptagonalNumber(55)).toBe(true);
  });

  it("returns false for 56", () => {
    expect(IsHeptagonalNumber.isHeptagonalNumber(56)).toBe(false);
  });
});
