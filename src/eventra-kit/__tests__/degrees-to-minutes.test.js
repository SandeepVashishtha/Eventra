import { describe, it, expect } from "vitest";
import * as DegreesToMinutes from "../degrees-to-minutes.js";

describe("degrees-to-minutes", () => {
  it("converts degrees to minutes", () => {
    expect(DegreesToMinutes.degreesToMinutes(5)).toBe(300);
  });
});
