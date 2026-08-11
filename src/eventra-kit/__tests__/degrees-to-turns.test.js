import { describe, it, expect } from "vitest";
import * as DegreesToTurns from "../degrees-to-turns.js";

describe("degrees-to-turns", () => {
  it("exports a module", () => {
    expect(DegreesToTurns).toBeDefined();
  });

  it("converts 360 degrees to turns", () => {
    expect(DegreesToTurns.degreesToTurns(360)).toBe(1);
  });

  it("converts 180 degrees to turns", () => {
    expect(DegreesToTurns.degreesToTurns(180)).toBe(0.5);
  });

  it("returns 0 for invalid inputs", () => {
    expect(DegreesToTurns.degreesToTurns(NaN)).toBe(0);
  });
});
