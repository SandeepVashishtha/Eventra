import { describe, it, expect } from "vitest";
import * as IsPerfectSquare from "../is-perfect-square.js";

describe("is-perfect-square", () => {
  it("exports a module", () => {
    expect(IsPerfectSquare).toBeDefined();
  });

  it("returns true for 16", () => {
    expect(IsPerfectSquare.isPerfectSquare(16)).toBe(true);
  });

  it("returns false for 15", () => {
    expect(IsPerfectSquare.isPerfectSquare(15)).toBe(false);
  });

  it("returns false for negative values", () => {
    expect(IsPerfectSquare.isPerfectSquare(-4)).toBe(false);
  });
});
