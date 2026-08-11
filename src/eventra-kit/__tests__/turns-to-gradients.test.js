import { describe, it, expect } from "vitest";
import * as TurnsToGradients from "../turns-to-gradients.js";

describe("turns-to-gradients", () => {
  it("exports a module", () => {
    expect(TurnsToGradients).toBeDefined();
  });

  it("converts 1 turn to gradients", () => {
    expect(TurnsToGradients.turnsToGradients(1)).toBe(400);
  });

  it("returns 0 for invalid inputs", () => {
    expect(TurnsToGradients.turnsToGradients(NaN)).toBe(0);
  });
});
