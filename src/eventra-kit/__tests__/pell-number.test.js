import { describe, it, expect } from "vitest";
import * as PellNumber from "../pell-number.js";

describe("pell-number", () => {
  it("computes 4th Pell number", () => {
    expect(PellNumber.pellNumber(4)).toBe(12);
  });
});
