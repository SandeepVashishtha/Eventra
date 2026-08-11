import { describe, it, expect } from "vitest";
import * as IsDisariumNumber from "../is-disarium-number.js";

describe("is-disarium-number", () => {
  it("returns true for 89", () => {
    expect(IsDisariumNumber.isDisariumNumber(89)).toBe(true);
  });
});
