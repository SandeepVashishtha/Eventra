import { describe, it, expect } from "vitest";
import * as SecantOf from "../secant-of.js";

describe("secant-of", () => {
  it("exports a module", () => {
    expect(SecantOf).toBeDefined();
  });

  it("computes secant of 0", () => {
    expect(SecantOf.secantOf(0)).toBe(1);
  });

  it("computes secant of Math.PI / 3", () => {
    expect(SecantOf.secantOf(Math.PI / 3)).toBeCloseTo(2, 4);
  });

  it("returns 0 for boundary/invalid values", () => {
    expect(SecantOf.secantOf(Math.PI / 2)).toBe(0);
    expect(SecantOf.secantOf(NaN)).toBe(0);
  });
});
