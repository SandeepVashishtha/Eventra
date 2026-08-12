import { describe, it, expect } from "vitest";
import * as IsPentagonalNumber from "../is-pentagonal-number.js";

describe("is-pentagonal-number", () => {
  it("exports a module", () => {
    expect(IsPentagonalNumber).toBeDefined();
  });

  it("returns true for 35", () => {
    expect(IsPentagonalNumber.isPentagonalNumber(35)).toBe(true);
  });

  it("returns false for 36", () => {
    expect(IsPentagonalNumber.isPentagonalNumber(36)).toBe(false);
  });
});
