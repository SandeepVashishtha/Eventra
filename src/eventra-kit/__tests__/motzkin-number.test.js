import { describe, it, expect } from "vitest";
import * as MotzkinNumber from "../motzkin-number.js";

describe("motzkin-number", () => {
  it("computes 4th Motzkin number", () => {
    expect(MotzkinNumber.motzkinNumber(4)).toBe(9);
  });
});
