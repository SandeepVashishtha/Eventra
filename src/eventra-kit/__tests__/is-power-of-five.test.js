import { describe, it, expect } from "vitest";
import * as IsPowerOfFive from "../is-power-of-five.js";

describe("is-power-of-five", () => {
  it("exports a module", () => {
    expect(IsPowerOfFive).toBeDefined();
  });

  it("returns true for 125", () => {
    expect(IsPowerOfFive.isPowerOfFive(125)).toBe(true);
  });

  it("returns false for 24", () => {
    expect(IsPowerOfFive.isPowerOfFive(24)).toBe(false);
  });
});
