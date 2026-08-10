import { describe, it, expect } from "vitest";
import * as LogBase2 from "../log-base-2.js";

describe("log-base-2", () => {
  it("exports a module", () => {
    expect(LogBase2).toBeDefined();
  });

  it("computes log2 of 8", () => {
    expect(LogBase2.logBase2(8)).toBe(3);
  });

  it("returns 0 for invalid inputs", () => {
    expect(LogBase2.logBase2(0)).toBe(0);
  });
});
