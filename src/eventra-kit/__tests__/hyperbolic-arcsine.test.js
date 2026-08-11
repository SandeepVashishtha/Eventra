import { describe, it, expect } from "vitest";
import * as HyperbolicArcsine from "../hyperbolic-arcsine.js";

describe("hyperbolic-arcsine", () => {
  it("exports a module", () => {
    expect(HyperbolicArcsine).toBeDefined();
  });

  it("computes hyperbolic arcsine of 0", () => {
    expect(HyperbolicArcsine.hyperbolicArcsine(0)).toBe(0);
  });

  it("computes hyperbolic arcsine of 1", () => {
    expect(HyperbolicArcsine.hyperbolicArcsine(1)).toBeCloseTo(0.88137, 4);
  });
});
