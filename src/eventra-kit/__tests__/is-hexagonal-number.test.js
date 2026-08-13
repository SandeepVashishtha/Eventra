import { describe, it, expect } from "vitest";
import * as IsHexagonalNumber from "../is-hexagonal-number.js";

describe("is-hexagonal-number", () => {
  it("exports a module", () => {
    expect(IsHexagonalNumber).toBeDefined();
  });

  it("returns true for 45", () => {
    expect(IsHexagonalNumber.isHexagonalNumber(45)).toBe(true);
  });

  it("returns false for 46", () => {
    expect(IsHexagonalNumber.isHexagonalNumber(46)).toBe(false);
  });

  it("returns false for invalid inputs", () => {
    expect(IsHexagonalNumber.isHexagonalNumber(NaN)).toBe(false);
  });
});
