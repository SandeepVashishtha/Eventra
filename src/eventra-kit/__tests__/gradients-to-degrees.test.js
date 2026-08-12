import { describe, it, expect } from "vitest";
import * as GradientsToDegrees from "../gradients-to-degrees.js";

describe("gradients-to-degrees", () => {
  it("exports a module", () => {
    expect(GradientsToDegrees).toBeDefined();
  });

  it("converts 100 gradients to degrees", () => {
    expect(GradientsToDegrees.gradientsToDegrees(100)).toBe(90);
  });

  it("converts 200 gradients to degrees", () => {
    expect(GradientsToDegrees.gradientsToDegrees(200)).toBe(180);
  });

  it("returns 0 for invalid inputs", () => {
    expect(GradientsToDegrees.gradientsToDegrees(NaN)).toBe(0);
  });
});
