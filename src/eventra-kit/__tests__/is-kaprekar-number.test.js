import { describe, it, expect } from "vitest";
import * as IsKaprekarNumber from "../is-kaprekar-number.js";

describe("is-kaprekar-number", () => {
  it("returns true for 45", () => {
    expect(IsKaprekarNumber.isKaprekarNumber(45)).toBe(true);
  });

  it("returns false for 46", () => {
    expect(IsKaprekarNumber.isKaprekarNumber(46)).toBe(false);
  });
});
