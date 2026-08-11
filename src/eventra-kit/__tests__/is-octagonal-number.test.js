import { describe, it, expect } from "vitest";
import * as IsOctagonalNumber from "../is-octagonal-number.js";

describe("is-octagonal-number", () => {
  it("exports a module", () => {
    expect(IsOctagonalNumber).toBeDefined();
  });

  it("returns true for 65", () => {
    expect(IsOctagonalNumber.isOctagonalNumber(65)).toBe(true);
  });

  it("returns false for 66", () => {
    expect(IsOctagonalNumber.isOctagonalNumber(66)).toBe(false);
  });
});
