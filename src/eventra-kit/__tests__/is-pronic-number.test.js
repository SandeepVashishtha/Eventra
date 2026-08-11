import { describe, it, expect } from "vitest";
import * as IsPronicNumber from "../is-pronic-number.js";

describe("is-pronic-number", () => {
  it("returns true for 12", () => {
    expect(IsPronicNumber.isPronicNumber(12)).toBe(true);
  });
});
