import { describe, it, expect } from "vitest";
import * as IsAbundantNumber from "../is-abundant-number.js";

describe("is-abundant-number", () => {
  it("returns true for 12", () => {
    expect(IsAbundantNumber.isAbundantNumber(12)).toBe(true);
  });

  it("returns false for 11", () => {
    expect(IsAbundantNumber.isAbundantNumber(11)).toBe(false);
  });
});
