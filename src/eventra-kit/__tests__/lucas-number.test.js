import { describe, it, expect } from "vitest";
import * as LucasNumber from "../lucas-number.js";

describe("lucas-number", () => {
  it("computes 4th Lucas number", () => {
    expect(LucasNumber.lucasNumber(4)).toBe(7);
  });
});
