import { describe, it, expect } from "vitest";
import * as CatalanNumber from "../catalan-number.js";

describe("catalan-number", () => {
  it("computes 4th Catalan number", () => {
    expect(CatalanNumber.catalanNumber(4)).toBe(14);
  });
});
