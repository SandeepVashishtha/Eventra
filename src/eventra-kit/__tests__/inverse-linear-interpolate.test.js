import { describe, it, expect } from "vitest";
import * as InverseLinearInterpolate from "../inverse-linear-interpolate.js";

describe("inverse-linear-interpolate", () => {
  it("exports a module", () => {
    expect(InverseLinearInterpolate).toBeDefined();
  });

  it("computes factor for midpoint", () => {
    expect(InverseLinearInterpolate.inverseLinearInterpolate(10, 20, 15)).toBe(0.5);
  });

  it("returns 0 if start and end values are equal", () => {
    expect(InverseLinearInterpolate.inverseLinearInterpolate(10, 10, 15)).toBe(0);
  });
});
