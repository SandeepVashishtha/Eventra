import { describe, it, expect } from "vitest";
import * as TurnsToDegrees from "../turns-to-degrees.js";

describe("turns-to-degrees", () => {
  it("exports a module", () => {
    expect(TurnsToDegrees).toBeDefined();
  });

  it("converts 1 turn to degrees", () => {
    expect(TurnsToDegrees.turnsToDegrees(1)).toBe(360);
  });

  it("returns 0 for invalid inputs", () => {
    expect(TurnsToDegrees.turnsToDegrees(NaN)).toBe(0);
  });
});
