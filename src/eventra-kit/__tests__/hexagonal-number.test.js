import { describe, it, expect } from "vitest";
import * as HexagonalNumber from "../hexagonal-number.js";

describe("hexagonal-number", () => {
  it("exports a module", () => {
    expect(HexagonalNumber).toBeDefined();
  });

  it("computes 5th hexagonal number", () => {
    expect(HexagonalNumber.hexagonalNumber(5)).toBe(45);
  });

  it("returns 0 for negative index", () => {
    expect(HexagonalNumber.hexagonalNumber(-1)).toBe(0);
  });
});
