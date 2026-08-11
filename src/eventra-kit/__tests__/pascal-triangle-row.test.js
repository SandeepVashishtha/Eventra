import { describe, it, expect } from "vitest";
import * as PascalTriangleRow from "../pascal-triangle-row.js";

describe("pascal-triangle-row", () => {
  it("generates row 4", () => {
    expect(PascalTriangleRow.pascalTriangleRow(4)).toEqual([1, 4, 6, 4, 1]);
  });
});
