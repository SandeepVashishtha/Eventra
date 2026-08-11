import { describe, it, expect } from "vitest";
import * as IsHappyNumber from "../is-happy-number.js";

describe("is-happy-number", () => {
  it("returns true for 19", () => {
    expect(IsHappyNumber.isHappyNumber(19)).toBe(true);
  });

  it("returns false for 4", () => {
    expect(IsHappyNumber.isHappyNumber(4)).toBe(false);
  });
});
