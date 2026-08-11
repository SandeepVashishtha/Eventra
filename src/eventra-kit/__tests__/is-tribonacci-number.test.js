import { describe, it, expect } from "vitest";
import * as IsTribonacciNumber from "../is-tribonacci-number.js";

describe("is-tribonacci-number", () => {
  it("returns true for 4", () => {
    expect(IsTribonacciNumber.isTribonacciNumber(4)).toBe(true);
  });

  it("returns false for 5", () => {
    expect(IsTribonacciNumber.isTribonacciNumber(5)).toBe(false);
  });
});
