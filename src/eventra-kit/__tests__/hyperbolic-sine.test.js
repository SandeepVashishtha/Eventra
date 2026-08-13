import { describe, it, expect } from "vitest";
import * as HyperbolicSine from "../hyperbolic-sine.js";

describe("hyperbolic-sine", () => {
  it("exports a module", () => {
    expect(HyperbolicSine).toBeDefined();
  });

  it("computes hyperbolic sine of 0", () => {
    expect(HyperbolicSine.hyperbolicSine(0)).toBe(0);
  });

  it("computes hyperbolic sine of 1", () => {
    expect(HyperbolicSine.hyperbolicSine(1)).toBeCloseTo(1.1752, 4);
  });

  it("returns 0 for invalid inputs", () => {
    expect(HyperbolicSine.hyperbolicSine(NaN)).toBe(0);
    expect(HyperbolicSine.hyperbolicSine(Infinity)).toBe(0);
  });
});
