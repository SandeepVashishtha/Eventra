import { describe, it, expect } from "vitest";
import * as HyperbolicCosine from "../hyperbolic-cosine.js";

describe("hyperbolic-cosine", () => {
  it("exports a module", () => {
    expect(HyperbolicCosine).toBeDefined();
  });

  it("computes hyperbolic cosine of 0", () => {
    expect(HyperbolicCosine.hyperbolicCosine(0)).toBe(1);
  });

  it("computes hyperbolic cosine of 1", () => {
    expect(HyperbolicCosine.hyperbolicCosine(1)).toBeCloseTo(1.54308, 4);
  });

  it("returns 1 for invalid inputs", () => {
    expect(HyperbolicCosine.hyperbolicCosine(NaN)).toBe(1);
    expect(HyperbolicCosine.hyperbolicCosine(Infinity)).toBe(1);
  });
});
