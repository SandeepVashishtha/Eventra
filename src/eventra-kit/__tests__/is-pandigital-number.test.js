import { describe, it, expect } from "vitest";
import * as IsPandigitalNumber from "../is-pandigital-number.js";

describe("is-pandigital-number", () => {
  it("returns true for 123456789", () => {
    expect(IsPandigitalNumber.isPandigitalNumber(123456789)).toBe(true);
  });

  it("returns false for 112233445", () => {
    expect(IsPandigitalNumber.isPandigitalNumber(112233445)).toBe(false);
  });
});
