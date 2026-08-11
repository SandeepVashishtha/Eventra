import { describe, it, expect } from "vitest";
import * as IsPellNumber from "../is-pell-number.js";

describe("is-pell-number", () => {
  it("returns true for 12", () => {
    expect(IsPellNumber.isPellNumber(12)).toBe(true);
  });

  it("returns false for 13", () => {
    expect(IsPellNumber.isPellNumber(13)).toBe(false);
  });
});
