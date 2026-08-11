import { describe, it, expect } from "vitest";
import * as IsPowerOfFour from "../is-power-of-four.js";

describe("is-power-of-four", () => {
  it("exports a module", () => {
    expect(IsPowerOfFour).toBeDefined();
  });

  it("returns true for 16", () => {
    expect(IsPowerOfFour.isPowerOfFour(16)).toBe(true);
  });

  it("returns false for 8", () => {
    expect(IsPowerOfFour.isPowerOfFour(8)).toBe(false);
  });
});
