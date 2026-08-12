import { describe, it, expect } from "vitest";
import * as IsPowerOfThree from "../is-power-of-three.js";

describe("is-power-of-three", () => {
  it("exports a module", () => {
    expect(IsPowerOfThree).toBeDefined();
  });

  it("returns true for 27", () => {
    expect(IsPowerOfThree.isPowerOfThree(27)).toBe(true);
  });

  it("returns false for 0", () => {
    expect(IsPowerOfThree.isPowerOfThree(0)).toBe(false);
  });

  it("returns false for 28", () => {
    expect(IsPowerOfThree.isPowerOfThree(28)).toBe(false);
  });
});
