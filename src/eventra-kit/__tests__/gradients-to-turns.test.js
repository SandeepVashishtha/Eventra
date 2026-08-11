import { describe, it, expect } from "vitest";
import * as GradientsToTurns from "../gradients-to-turns.js";

describe("gradients-to-turns", () => {
  it("exports a module", () => {
    expect(GradientsToTurns).toBeDefined();
  });

  it("converts 400 gradients to turns", () => {
    expect(GradientsToTurns.gradientsToTurns(400)).toBe(1);
  });

  it("returns 0 for invalid inputs", () => {
    expect(GradientsToTurns.gradientsToTurns(NaN)).toBe(0);
  });
});
