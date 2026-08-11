import { describe, it, expect } from "vitest";
import * as IsDeficientNumber from "../is-deficient-number.js";

describe("is-deficient-number", () => {
  it("returns true for 10", () => {
    expect(IsDeficientNumber.isDeficientNumber(10)).toBe(true);
  });

  it("returns false for 12", () => {
    expect(IsDeficientNumber.isDeficientNumber(12)).toBe(false);
  });
});
