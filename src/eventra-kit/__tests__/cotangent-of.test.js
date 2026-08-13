import { describe, it, expect } from "vitest";
import * as CotangentOf from "../cotangent-of.js";

describe("cotangent-of", () => {
  it("exports a module", () => {
    expect(CotangentOf).toBeDefined();
  });

  it("computes cotangent of Math.PI / 4", () => {
    expect(CotangentOf.cotangentOf(Math.PI / 4)).toBeCloseTo(1, 4);
  });

  it("returns 0 for boundary/invalid values", () => {
    expect(CotangentOf.cotangentOf(0)).toBe(0);
    expect(CotangentOf.cotangentOf(Math.PI / 2)).toBe(0);
    expect(CotangentOf.cotangentOf(NaN)).toBe(0);
  });
});
