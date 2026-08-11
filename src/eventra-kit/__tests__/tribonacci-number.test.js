import { describe, it, expect } from "vitest";
import * as TribonacciNumber from "../tribonacci-number.js";

describe("tribonacci-number", () => {
  it("computes 5th Tribonacci number", () => {
    expect(TribonacciNumber.tribonacciNumber(5)).toBe(4);
  });
});
