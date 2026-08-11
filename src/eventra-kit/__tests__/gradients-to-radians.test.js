import { describe, it, expect } from "vitest";
import * as GradientsToRadians from "../gradients-to-radians.js";

describe("gradients-to-radians", () => {
  it("exports a module", () => {
    expect(GradientsToRadians).toBeDefined();
  });

  it("converts 200 gradients to radians", () => {
    expect(GradientsToRadians.gradientsToRadians(200)).toBeCloseTo(Math.PI, 4);
  });

  it("converts 100 gradients to radians", () => {
    expect(GradientsToRadians.gradientsToRadians(100)).toBeCloseTo(Math.PI / 2, 4);
  });

  it("returns 0 for invalid inputs", () => {
    expect(GradientsToRadians.gradientsToRadians(NaN)).toBe(0);
  });
});
