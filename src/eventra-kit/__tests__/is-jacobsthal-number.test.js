import { describe, it, expect } from "vitest";
import * as IsJacobsthalNumber from "../is-jacobsthal-number.js";

describe("is-jacobsthal-number", () => {
  it("returns true for 11", () => {
    expect(IsJacobsthalNumber.isJacobsthalNumber(11)).toBe(true);
  });

  it("returns false for 12", () => {
    expect(IsJacobsthalNumber.isJacobsthalNumber(12)).toBe(false);
  });
});
