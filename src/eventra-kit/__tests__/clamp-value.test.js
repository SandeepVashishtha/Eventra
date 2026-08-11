import { describe, it, expect } from "vitest";
import * as ClampValue from "../clamp-value.js";

describe("clamp-value", () => {
  it("clamps value in range", () => {
    expect(ClampValue.clampValue(5, 0, 10)).toBe(5);
  });
});
