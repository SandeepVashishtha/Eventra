import { describe, it, expect } from "vitest";
import * as IsSmithNumber from "../is-smith-number.js";

describe("is-smith-number", () => {
  it("exports a module", () => {
    expect(IsSmithNumber).toBeDefined();
  });

  it("returns true for 493", () => {
    expect(IsSmithNumber.isSmithNumber(493)).toBe(true);
  });

  it("returns false for prime 13", () => {
    expect(IsSmithNumber.isSmithNumber(13)).toBe(false);
  });
});
