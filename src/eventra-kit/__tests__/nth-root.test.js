import { describe, it, expect } from "vitest";
import * as NthRoot from "../nth-root.js";

describe("nth-root", () => {
  it("exports a module", () => {
    expect(NthRoot).toBeDefined();
  });

  it("computes cube root of 27", () => {
    expect(NthRoot.nthRoot(27, 3)).toBeCloseTo(3, 4);
  });

  it("returns 0 for imaginary roots", () => {
    expect(NthRoot.nthRoot(-4, 2)).toBe(0);
  });
});
