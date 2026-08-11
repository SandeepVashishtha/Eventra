import { describe, it, expect } from "vitest";
import * as IsLucasNumber from "../is-lucas-number.js";

describe("is-lucas-number", () => {
  it("returns true for 7", () => {
    expect(IsLucasNumber.isLucasNumber(7)).toBe(true);
  });

  it("returns false for 8", () => {
    expect(IsLucasNumber.isLucasNumber(8)).toBe(false);
  });
});
