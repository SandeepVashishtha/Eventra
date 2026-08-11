import { describe, it, expect } from "vitest";
import * as LogBase10 from "../log-base-10.js";

describe("log-base-10", () => {
  it("exports a module", () => {
    expect(LogBase10).toBeDefined();
  });

  it("computes log10 of 100", () => {
    expect(LogBase10.logBase10(100)).toBe(2);
  });

  it("returns 0 for negative/zero values", () => {
    expect(LogBase10.logBase10(0)).toBe(0);
    expect(LogBase10.logBase10(-1)).toBe(0);
  });
});
