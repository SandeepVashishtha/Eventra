import { describe, it, expect } from "vitest";
import * as NaturalLog from "../natural-log.js";

describe("natural-log", () => {
  it("exports a module", () => {
    expect(NaturalLog).toBeDefined();
  });

  it("computes natural log of Math.E", () => {
    expect(NaturalLog.naturalLog(Math.E)).toBe(1);
  });

  it("returns 0 for invalid inputs", () => {
    expect(NaturalLog.naturalLog(0)).toBe(0);
  });
});
