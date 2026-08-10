import { describe, it, expect } from "vitest";
import * as PentagonalNumber from "../pentagonal-number.js";

describe("pentagonal-number", () => {
  it("exports a module", () => {
    expect(PentagonalNumber).toBeDefined();
  });

  it("computes 5th pentagonal number", () => {
    expect(PentagonalNumber.pentagonalNumber(5)).toBe(35);
  });

  it("returns 0 for negative index", () => {
    expect(PentagonalNumber.pentagonalNumber(-1)).toBe(0);
  });
});
