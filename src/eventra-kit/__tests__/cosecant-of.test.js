import { describe, it, expect } from "vitest";
import * as CosecantOf from "../cosecant-of.js";

describe("cosecant-of", () => {
  it("exports a module", () => {
    expect(CosecantOf).toBeDefined();
  });

  it("computes cosecant of Math.PI / 2", () => {
    expect(CosecantOf.cosecantOf(Math.PI / 2)).toBe(1);
  });

  it("computes cosecant of Math.PI / 6", () => {
    expect(CosecantOf.cosecantOf(Math.PI / 6)).toBeCloseTo(2, 4);
  });

  it("returns 0 for boundary/invalid values", () => {
    expect(CosecantOf.cosecantOf(0)).toBe(0);
    expect(CosecantOf.cosecantOf(NaN)).toBe(0);
  });
});
