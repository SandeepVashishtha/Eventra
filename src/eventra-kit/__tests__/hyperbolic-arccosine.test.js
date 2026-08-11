import { describe, it, expect } from "vitest";
import * as HyperbolicArccosine from "../hyperbolic-arccosine.js";

describe("hyperbolic-arccosine", () => {
  it("exports a module", () => {
    expect(HyperbolicArccosine).toBeDefined();
  });

  it("computes hyperbolic arccosine of 1", () => {
    expect(HyperbolicArccosine.hyperbolicArccosine(1)).toBe(0);
  });

  it("computes hyperbolic arccosine of 2", () => {
    expect(HyperbolicArccosine.hyperbolicArccosine(2)).toBeCloseTo(1.31695, 4);
  });

  it("returns 0 for invalid inputs", () => {
    expect(HyperbolicArccosine.hyperbolicArccosine(0.5)).toBe(0);
  });
});
