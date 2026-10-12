import assert from "node:assert/strict";

import { createRateLimiter, withRateLimit } from "../src/utils/rateLimiter.js";

const limiter = createRateLimiter({ maxTokens: 1, refillRate: 1 });

assert.equal(limiter.tryConsume(), true, "first token should be available");
assert.equal(limiter.tryConsume(), false, "second token should be rate limited");
assert.ok(
  Number.isFinite(limiter.getRetryAfterMs()),
  "retry delay should stay finite for valid refill rates"
);

assert.throws(
  () => createRateLimiter({ maxTokens: 1, refillRate: 0 }),
  /refillRate must be a positive finite number/,
  "zero refill rates should be rejected before Infinity can be returned"
);

assert.throws(
  () => createRateLimiter({ maxTokens: 1, refillRate: -1 }),
  /refillRate must be a positive finite number/,
  "negative refill rates should be rejected"
);

assert.throws(
  () => createRateLimiter({ maxTokens: 1, refillRate: Number.POSITIVE_INFINITY }),
  /refillRate must be a positive finite number/,
  "non-finite refill rates should be rejected"
);

assert.throws(
  () => withRateLimit(async () => "ok", { maxTokens: 1, refillRate: 0 }),
  /refillRate must be a positive finite number/,
  "withRateLimit should propagate invalid limiter options"
);

console.log("rateLimiter tests passed");
