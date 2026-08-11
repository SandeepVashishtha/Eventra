import { describe, it, expect } from "vitest";
import * as TurnsToRadians from "../turns-to-radians.js";

describe("turns-to-radians", () => {
  it("exports a module", () => {
    expect(TurnsToRadians).toBeDefined();
  });

  it("converts 1 turn to radians", () => {
    expect(TurnsToRadians.turnsToRadians(1)).toBeCloseTo(2 * Math.PI, 4);
  });

  it("returns 0 for invalid inputs", () => {
    expect(TurnsToRadians.turnsToRadians(NaN)).toBe(0);
  });
});
