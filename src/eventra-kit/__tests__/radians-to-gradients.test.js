import { describe, it, expect } from "vitest";
import * as RadiansToGradients from "../radians-to-gradients.js";

describe("radians-to-gradients", () => {
  it("exports a module", () => {
    expect(RadiansToGradients).toBeDefined();
  });

  it("converts Math.PI radians to gradients", () => {
    expect(RadiansToGradients.radiansToGradients(Math.PI)).toBe(200);
  });

  it("converts Math.PI / 2 radians to gradients", () => {
    expect(RadiansToGradients.radiansToGradients(Math.PI / 2)).toBe(100);
  });

  it("returns 0 for invalid inputs", () => {
    expect(RadiansToGradients.radiansToGradients(NaN)).toBe(0);
  });
});
