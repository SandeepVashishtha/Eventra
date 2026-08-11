import { describe, it, expect } from "vitest";
import * as IsPerfectNumber from "../is-perfect-number.js";

describe("is-perfect-number", () => {
  it("returns true for 6", () => {
    expect(IsPerfectNumber.isPerfectNumber(6)).toBe(true);
  });

  it("returns false for 12", () => {
    expect(IsPerfectNumber.isPerfectNumber(12)).toBe(false);
  });
});
