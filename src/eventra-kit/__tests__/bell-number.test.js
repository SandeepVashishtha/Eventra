import { describe, it, expect } from "vitest";
import * as BellNumber from "../bell-number.js";

describe("bell-number", () => {
  it("computes 4th Bell number", () => {
    expect(BellNumber.bellNumber(4)).toBe(15);
  });
});
