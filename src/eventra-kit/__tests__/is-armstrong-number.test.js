import { describe, it, expect } from "vitest";
import * as IsArmstrongNumber from "../is-armstrong-number.js";

describe("is-armstrong-number", () => {
  it("returns true for 153", () => {
    expect(IsArmstrongNumber.isArmstrongNumber(153)).toBe(true);
  });

  it("returns false for 154", () => {
    expect(IsArmstrongNumber.isArmstrongNumber(154)).toBe(false);
  });
});
