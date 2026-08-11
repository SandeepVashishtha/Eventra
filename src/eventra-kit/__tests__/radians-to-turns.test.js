import { describe, it, expect } from "vitest";
import * as RadiansToTurns from "../radians-to-turns.js";

describe("radians-to-turns", () => {
  it("exports a module", () => {
    expect(RadiansToTurns).toBeDefined();
  });

  it("converts 2*Math.PI radians to turns", () => {
    expect(RadiansToTurns.radiansToTurns(2 * Math.PI)).toBe(1);
  });

  it("returns 0 for invalid inputs", () => {
    expect(RadiansToTurns.radiansToTurns(NaN)).toBe(0);
  });
});
