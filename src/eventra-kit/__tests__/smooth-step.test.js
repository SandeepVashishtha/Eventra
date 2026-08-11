import { describe, it, expect } from "vitest";
import * as SmoothStep from "../smooth-step.js";

describe("smooth-step", () => {
  it("interpolates correctly", () => {
    expect(SmoothStep.smoothStep(0, 10, 5)).toBe(0.5);
  });
});
