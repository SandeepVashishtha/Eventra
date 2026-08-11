import { describe, it, expect } from "vitest";
import * as LerpArray from "../lerp-array.js";

describe("lerp-array", () => {
  it("interpolates arrays", () => {
    expect(LerpArray.lerpArray([0, 10], [10, 20], 0.5)).toEqual([5, 15]);
  });
});
