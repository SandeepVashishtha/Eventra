import { describe, it, expect } from "vitest";
import * as JacobsthalNumber from "../jacobsthal-number.js";

describe("jacobsthal-number", () => {
  it("computes 5th Jacobsthal number", () => {
    expect(JacobsthalNumber.jacobsthalNumber(5)).toBe(11);
  });
});
