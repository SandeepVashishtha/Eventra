import { describe, it, expect } from "vitest";
import * as HyperbolicTangent from "../hyperbolic-tangent.js";

describe("hyperbolic-tangent", () => {
  it("exports a module", () => {
    expect(HyperbolicTangent).toBeDefined();
  });

  it("computes hyperbolic tangent of 0", () => {
    expect(HyperbolicTangent.hyperbolicTangent(0)).toBe(0);
  });

  it("computes hyperbolic tangent of 1", () => {
    expect(HyperbolicTangent.hyperbolicTangent(1)).toBeCloseTo(0.76159, 4);
  });

  it("returns 0 for invalid inputs", () => {
    expect(HyperbolicTangent.hyperbolicTangent(NaN)).toBe(0);
    expect(HyperbolicTangent.hyperbolicTangent(Infinity)).toBe(0);
  });
});
