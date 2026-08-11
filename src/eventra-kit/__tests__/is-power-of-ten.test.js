import { describe, it, expect } from "vitest";
import * as IsPowerOfTen from "../is-power-of-ten.js";

describe("is-power-of-ten", () => {
  it("exports a module", () => {
    expect(IsPowerOfTen).toBeDefined();
  });

  it("returns true for 1000", () => {
    expect(IsPowerOfTen.isPowerOfTen(1000)).toBe(true);
  });

  it("returns false for 50", () => {
    expect(IsPowerOfTen.isPowerOfTen(50)).toBe(false);
  });
});
