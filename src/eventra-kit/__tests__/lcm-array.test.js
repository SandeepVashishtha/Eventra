import { describe, it, expect } from "vitest";
import * as LcmArray from "../lcm-array.js";

describe("lcm-array", () => {
  it("computes LCM", () => {
    expect(LcmArray.lcmArray([4, 6, 8])).toBe(24);
  });
});
