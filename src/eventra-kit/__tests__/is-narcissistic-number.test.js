import { describe, it, expect } from "vitest";
import * as IsNarcissisticNumber from "../is-narcissistic-number.js";

describe("is-narcissistic-number", () => {
  it("exports a module", () => {
    expect(IsNarcissisticNumber).toBeDefined();
  });

  it("returns true for 153", () => {
    expect(IsNarcissisticNumber.isNarcissisticNumber(153)).toBe(true);
  });

  it("returns false for 154", () => {
    expect(IsNarcissisticNumber.isNarcissisticNumber(154)).toBe(false);
  });
});
