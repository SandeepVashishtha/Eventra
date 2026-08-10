import { describe, it, expect } from "vitest";
import * as IsFibonacciNumber from "../is-fibonacci-number.js";

describe("is-fibonacci-number", () => {
  it("exports a module", () => {
    expect(IsFibonacciNumber).toBeDefined();
  });

  it("returns true for 5", () => {
    expect(IsFibonacciNumber.isFibonacciNumber(5)).toBe(true);
  });

  it("returns true for 8", () => {
    expect(IsFibonacciNumber.isFibonacciNumber(8)).toBe(true);
  });

  it("returns false for 4", () => {
    expect(IsFibonacciNumber.isFibonacciNumber(4)).toBe(false);
  });
});
