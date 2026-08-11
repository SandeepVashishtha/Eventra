import { describe, it, expect } from "vitest";
import * as IsAutomorphicNumber from "../is-automorphic-number.js";

describe("is-automorphic-number", () => {
  it("returns true for 25", () => {
    expect(IsAutomorphicNumber.isAutomorphicNumber(25)).toBe(true);
  });

  it("returns false for 26", () => {
    expect(IsAutomorphicNumber.isAutomorphicNumber(26)).toBe(false);
  });
});
