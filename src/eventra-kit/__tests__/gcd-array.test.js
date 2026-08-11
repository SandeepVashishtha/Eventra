import { describe, it, expect } from "vitest";
import * as GcdArray from "../gcd-array.js";

describe("gcd-array", () => {
  it("computes GCD", () => {
    expect(GcdArray.gcdArray([12, 18, 24])).toBe(6);
  });
});
