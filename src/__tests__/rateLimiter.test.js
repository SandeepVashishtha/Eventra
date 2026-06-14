import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert";

describe("Distributed Rate Limiter", () => {
  const originalEnv = process.env;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    process.env.NODE_ENV = "test";
  });

  afterEach(async () => {
    process.env = originalEnv;
    process.env.NODE_ENV = originalNodeEnv;
    const { clearAll } = await import("../../api/lib/rate-limit-storage.js");
    await clearAll();
  });

  describe("createRateLimiter", () => {
    test("should create a rate limiter with check method", async () => {
      const { createRateLimiter } = await import("../../api/lib/rateLimiter.js");
      const limiter = createRateLimiter(60000, 10);
      assert.ok(limiter.check);
      assert.strictEqual(typeof limiter.check, "function");
    });

    test("should allow requests under threshold", async () => {
      const { createRateLimiter } = await import("../../api/lib/rateLimiter.js");
      const limiter = createRateLimiter(60000, 5);
      const result = await limiter.check("test-key");
      assert.strictEqual(result.allowed, true);
      assert.strictEqual(result.count, 1);
      assert.strictEqual(result.remaining, 4);
    });

    test("should block requests over threshold", async () => {
      const { createRateLimiter } = await import("../../api/lib/rateLimiter.js");
      const limiter = createRateLimiter(60000, 3);
      
      // Make 3 allowed requests
      await limiter.check("test-key");
      await limiter.check("test-key");
      await limiter.check("test-key");
      
      // 4th request should be blocked
      const result = await limiter.check("test-key");
      assert.strictEqual(result.allowed, false);
      assert.strictEqual(result.count, 4);
      assert.strictEqual(result.remaining, 0);
    });

    test("should reset counter after window expires", async () => {
      const { createRateLimiter } = await import("../../api/lib/rateLimiter.js");
      const limiter = createRateLimiter(100, 3); // 100ms window
      
      // Exhaust the limit
      await limiter.check("test-key");
      await limiter.check("test-key");
      await limiter.check("test-key");
      
      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Should be allowed again
      const result = await limiter.check("test-key");
      assert.strictEqual(result.allowed, true);
      assert.strictEqual(result.count, 1);
    });

    test("should handle multiple keys independently", async () => {
      const { createRateLimiter } = await import("../../api/lib/rateLimiter.js");
      const limiter = createRateLimiter(60000, 2);
      
      const result1 = await limiter.check("key1");
      const result2 = await limiter.check("key2");
      
      assert.strictEqual(result1.allowed, true);
      assert.strictEqual(result2.allowed, true);
      assert.strictEqual(result1.count, 1);
      assert.strictEqual(result2.count, 1);
    });

    test("should return remaining requests", async () => {
      const { createRateLimiter } = await import("../../api/lib/rateLimiter.js");
      const limiter = createRateLimiter(60000, 5);
      
      const result1 = await limiter.check("test-key");
      assert.strictEqual(result1.remaining, 4);
      
      const result2 = await limiter.check("test-key");
      assert.strictEqual(result2.remaining, 3);
    });

    test("should return resetAfter time", async () => {
      const { createRateLimiter } = await import("../../api/lib/rateLimiter.js");
      const windowMs = 60000;
      const limiter = createRateLimiter(windowMs, 5);
      
      const result = await limiter.check("test-key");
      assert.ok(result.resetAfter > 0);
      assert.ok(result.resetAfter <= windowMs);
    });
  });

  describe("enforceRateLimit", () => {
    test("should not throw when under threshold", async () => {
      const { createRateLimiter, enforceRateLimit } = await import("../../api/lib/rateLimiter.js");
      const limiter = createRateLimiter(60000, 5);
      
      await assert.doesNotReject(enforceRateLimit(limiter, "test-key"));
    });

    test("should throw error when over threshold", async () => {
      const { createRateLimiter, enforceRateLimit } = await import("../../api/lib/rateLimiter.js");
      const limiter = createRateLimiter(60000, 2);
      
      await enforceRateLimit(limiter, "test-key");
      await enforceRateLimit(limiter, "test-key");
      
      await assert.rejects(
        enforceRateLimit(limiter, "test-key"),
        /Too many requests/
      );
    });

    test("should throw error with status 429", async () => {
      const { createRateLimiter, enforceRateLimit } = await import("../../api/lib/rateLimiter.js");
      const limiter = createRateLimiter(60000, 1);
      
      await enforceRateLimit(limiter, "test-key");
      
      try {
        await enforceRateLimit(limiter, "test-key");
        assert.fail("Should have thrown");
      } catch (err) {
        assert.strictEqual(err.status, 429);
      }
    });
  });

  describe("loginRateLimiter", () => {
    test("should be configured with correct limits", async () => {
      const { loginRateLimiter } = await import("../../api/lib/rateLimiter.js");
      assert.ok(loginRateLimiter.check);
      
      // Test that it allows 10 requests
      for (let i = 0; i < 10; i++) {
        const result = await loginRateLimiter.check("test-ip");
        assert.strictEqual(result.allowed, true);
      }
      
      // 11th request should be blocked
      const result = await loginRateLimiter.check("test-ip");
      assert.strictEqual(result.allowed, false);
    });
  });

  describe("Concurrent requests", () => {
    test("should handle concurrent requests correctly", async () => {
      const { createRateLimiter } = await import("../../api/lib/rateLimiter.js");
      const limiter = createRateLimiter(60000, 10);
      
      // Make 10 concurrent requests
      const promises = Array(10).fill(null).map(() => limiter.check("concurrent-key"));
      const results = await Promise.all(promises);
      
      // All should be allowed
      results.forEach(result => {
        assert.strictEqual(result.allowed, true);
      });
      
      // 11th concurrent request should be blocked
      const result11 = await limiter.check("concurrent-key");
      assert.strictEqual(result11.allowed, false);
    });
  });

  describe("Storage failure handling", () => {
    test("should fail closed in production on storage error", async () => {
      process.env.NODE_ENV = "production";
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;
      
      const { createRateLimiter } = await import("../../api/lib/rateLimiter.js");
      const limiter = createRateLimiter(60000, 5);
      
      const result = await limiter.check("test-key");
      assert.strictEqual(result.allowed, false);
      assert.strictEqual(result.error, "Rate-limit storage unavailable");
    });

    test("should allow requests in development on storage error", async () => {
      process.env.NODE_ENV = "development";
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;
      
      const { createRateLimiter } = await import("../../api/lib/rateLimiter.js");
      const limiter = createRateLimiter(60000, 5);
      
      const result = await limiter.check("test-key");
      assert.strictEqual(result.allowed, true);
      // In development, in-memory fallback is used without error
      assert.strictEqual(result.error, undefined);
    });
  });

  describe("Window expiration edge cases", () => {
    test("should handle very short windows", async () => {
      const { createRateLimiter } = await import("../../api/lib/rateLimiter.js");
      const limiter = createRateLimiter(50, 2); // 50ms window
      
      await limiter.check("test-key");
      await limiter.check("test-key");
      
      // Wait just past window
      await new Promise(resolve => setTimeout(resolve, 60));
      
      const result = await limiter.check("test-key");
      assert.strictEqual(result.allowed, true);
    });

    test("should handle very long windows", async () => {
      const { createRateLimiter } = await import("../../api/lib/rateLimiter.js");
      const limiter = createRateLimiter(3600000, 5); // 1 hour window
      
      const result = await limiter.check("test-key");
      assert.strictEqual(result.allowed, true);
      assert.ok(result.resetAfter > 0);
    });
  });
});
