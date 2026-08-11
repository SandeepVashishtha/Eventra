import { describe, it, expect } from "vitest";
import * as IsCompositeNumber from "../is-composite-number.js";

describe("is-composite-number", () => {
  it("exports a module", () => {
    expect(IsCompositeNumber).toBeDefined();
  });

  it("returns true for 4", () => {
    expect(IsCompositeNumber.isCompositeNumber(4)).toBe(true);
  });

  it("returns false for prime 5", () => {
    expect(IsCompositeNumber.isCompositeNumber(5)).toBe(false);
  });
});
