import { describe, it, expect } from "vitest";
import * as CollatzSequence from "../collatz-sequence.js";

describe("collatz-sequence", () => {
  it("generates sequence for 6", () => {
    expect(CollatzSequence.collatzSequence(6)).toEqual([6, 3, 10, 5, 16, 8, 4, 2, 1]);
  });
});
