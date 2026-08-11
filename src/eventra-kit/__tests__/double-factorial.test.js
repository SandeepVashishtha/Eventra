import { describe, it, expect } from "vitest";
import * as DoubleFactorial from "../double-factorial.js";

describe("double-factorial", () => {
  it("computes double factorial of 5", () => {
    expect(DoubleFactorial.doubleFactorial(5)).toBe(15);
  });
});
