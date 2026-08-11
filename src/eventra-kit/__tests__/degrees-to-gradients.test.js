import { describe, it, expect } from "vitest";
import * as DegreesToGradients from "../degrees-to-gradients.js";

describe("degrees-to-gradients", () => {
  it("exports a module", () => {
    expect(DegreesToGradients).toBeDefined();
  });

  it("converts 90 degrees to gradients", () => {
    expect(DegreesToGradients.degreesToGradients(90)).toBe(100);
  });

  it("converts 180 degrees to gradients", () => {
    expect(DegreesToGradients.degreesToGradients(180)).toBe(200);
  });

  it("returns 0 for invalid inputs", () => {
    expect(DegreesToGradients.degreesToGradients(NaN)).toBe(0);
  });
});
