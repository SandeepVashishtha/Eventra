import assert from "node:assert/strict";
import test from "node:test";
import { lastRedisInstance } from "ioredis";
import { incrementWithExpiration } from "../api/_lib/rate-limit-storage.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test("Redis Rate Limiter - TTL Renewal Bugfix", async (t) => {
  // Set up production environment and KV configurations so it attempts to use Redis/KV
  process.env.NODE_ENV = "production";
  process.env.KV_REST_API_URL = "redis://localhost:6379";
  process.env.KV_REST_API_TOKEN = "mock-token";

  await t.test("should only set TTL on the first request and NOT renew on subsequent requests", async () => {
    const key = "test-ip-rate-limit";
    const windowMs = 500;

    // First request: initializes key and sets TTL
    const res1 = await incrementWithExpiration(key, windowMs);
    assert.equal(res1.count, 1);
    
    assert.ok(lastRedisInstance, "Redis instance should be initialized");
    const initialTtlTime = lastRedisInstance.ttls.get(key);
    assert.ok(initialTtlTime, "TTL should be set");

    // Wait 100ms
    await delay(100);

    // Second request (e.g. client hits rate limit or makes another request within window)
    const res2 = await incrementWithExpiration(key, windowMs);
    assert.equal(res2.count, 2);

    const secondaryTtlTime = lastRedisInstance.ttls.get(key);
    
    // Assert that the TTL expiration timestamp is the same as the initial one (it did NOT get pushed forward by 100ms)
    assert.equal(secondaryTtlTime, initialTtlTime, "TTL expiration timestamp should NOT have changed");
  });
});
