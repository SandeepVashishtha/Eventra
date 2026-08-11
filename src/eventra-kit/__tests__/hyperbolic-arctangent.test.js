import { describe, it, expect } from "vitest";
import * as HyperbolicArctangent from "../hyperbolic-arctangent.js";

describe("hyperbolic-arctangent", () => {
  it("exports a module", () => {
    expect(HyperbolicArctangent).toBeDefined();
  });

  it("computes hyperbolic arctangent of 0", () => {
    expect(HyperbolicArctangent.hyperbolicArctangent(0)).toBe(0);
  });

  it("computes hyperbolic arctangent of 0.5", () => {
    expect(HyperbolicArctangent.hyperbolicArctangent(0.5)).toBeCloseTo(0.5493, 4);
  });

  it("returns 0 for boundary values", () => {
    expect(HyperbolicArctangent.hyperbolicArctangent(1)).toBe(0);
  });
});
