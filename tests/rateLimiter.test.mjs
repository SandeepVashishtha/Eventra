import assert from "node:assert/strict";
import { createRateLimiter, withRateLimit } from "../src/utils/rateLimiter.js";

try {
  const limiter = createRateLimiter({ maxTokens: 2, refillRate: 10 });
  assert.equal(limiter.tryConsume(1), true);
  assert.equal(limiter.tryConsume(1), true);
  assert.equal(limiter.tryConsume(1), false);

  limiter.reset();
  assert.equal(limiter.getTokens(), 2);

  const fn = async (x) => x * 2;
  const limitedFn = withRateLimit(fn, { maxTokens: 1, refillRate: 1 });
  const res = await limitedFn(5);
  assert.equal(res, 10);

  console.log("rateLimiter tests passed ✓");
} catch (e) {
  console.error(e);
  process.exit(1);
}
