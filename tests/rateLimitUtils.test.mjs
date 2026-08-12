import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateJitteredBackoff, isRateLimitError } from "../src/utils/rateLimitUtils.js";

describe("Rate Limit Jitter & Error Handling Tests", () => {
  it("should calculate jittered backoff delay within cap bounds", () => {
    const delay0 = calculateJitteredBackoff(0);
    const delay3 = calculateJitteredBackoff(3);

    assert.ok(delay0 >= 0 && delay0 <= 1000);
    assert.ok(delay3 >= 0 && delay3 <= 8000);
  });

  it("should identify HTTP 429 rate limit errors", () => {
    assert.equal(isRateLimitError({ status: 429 }), true);
    assert.equal(isRateLimitError({ status: 200 }), false);
  });
});