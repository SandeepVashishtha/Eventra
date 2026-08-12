import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { isClientRequestAllowed, clearClientRequestLogs } from "../src/utils/rateLimit/clientRateLimitHandler.js";

describe("Sliding Window Rate Limiter Tests", () => {
  beforeEach(() => {
    clearClientRequestLogs();
  });

  it("should permit client requests within rate limit boundaries", () => {
    // Max login limit: 5 requests
    for (let i = 0; i < 5; i++) {
      const res = isClientRequestAllowed("login");
      assert.equal(res.allowed, true);
    }

    const blockedRes = isClientRequestAllowed("login");
    assert.equal(blockedRes.allowed, false);
    assert.ok(blockedRes.retryAfterSeconds > 0);
  });
});
