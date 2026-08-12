import { describe, it, expect } from "vitest";
import * as IsPerfectCube from "../is-perfect-cube.js";

describe("is-perfect-cube", () => {
  it("exports a module", () => {
    expect(IsPerfectCube).toBeDefined();
  });

  it("returns true for 27", () => {
    expect(IsPerfectCube.isPerfectCube(27)).toBe(true);
  });

  it("returns true for -8", () => {
    expect(IsPerfectCube.isPerfectCube(-8)).toBe(true);
  });

  it("returns false for 9", () => {
    expect(IsPerfectCube.isPerfectCube(9)).toBe(false);
  });
});
