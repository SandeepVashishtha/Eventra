import { describe, it, expect } from "vitest";
import * as IsHarshadNumber from "../is-harshad-number.js";

describe("is-harshad-number", () => {
  it("returns true for 18", () => {
    expect(IsHarshadNumber.isHarshadNumber(18)).toBe(true);
  });

  it("returns false for 19", () => {
    expect(IsHarshadNumber.isHarshadNumber(19)).toBe(false);
  });
});
