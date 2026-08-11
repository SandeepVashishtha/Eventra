import { describe, it, expect } from "vitest";
import * as LinearInterpolate from "../linear-interpolate.js";

describe("linear-interpolate", () => {
  it("exports a module", () => {
    expect(LinearInterpolate).toBeDefined();
  });

  it("interpolates midpoint correctly", () => {
    expect(LinearInterpolate.linearInterpolate(10, 20, 0.5)).toBe(15);
  });

  it("interpolates boundaries correctly", () => {
    expect(LinearInterpolate.linearInterpolate(10, 20, 0)).toBe(10);
    expect(LinearInterpolate.linearInterpolate(10, 20, 1)).toBe(20);
  });
});
