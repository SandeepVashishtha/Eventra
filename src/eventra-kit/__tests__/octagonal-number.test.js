import { describe, it, expect } from "vitest";
import * as OctagonalNumber from "../octagonal-number.js";

describe("octagonal-number", () => {
  it("exports a module", () => {
    expect(OctagonalNumber).toBeDefined();
  });

  it("computes 5th octagonal number", () => {
    expect(OctagonalNumber.octagonalNumber(5)).toBe(65);
  });

  it("returns 0 for invalid inputs", () => {
    expect(OctagonalNumber.octagonalNumber(-1)).toBe(0);
  });
});
