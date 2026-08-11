import { describe, it, expect } from "vitest";
import * as IsSemiprimeNumber from "../is-semiprime-number.js";

describe("is-semiprime-number", () => {
  it("exports a module", () => {
    expect(IsSemiprimeNumber).toBeDefined();
  });

  it("returns true for 9 (3*3)", () => {
    expect(IsSemiprimeNumber.isSemiprimeNumber(9)).toBe(true);
  });

  it("returns true for 6 (2*3)", () => {
    expect(IsSemiprimeNumber.isSemiprimeNumber(6)).toBe(true);
  });

  it("returns false for 12 (2*2*3)", () => {
    expect(IsSemiprimeNumber.isSemiprimeNumber(12)).toBe(false);
  });
});
