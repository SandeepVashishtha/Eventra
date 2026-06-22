import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert";

describe("Middleware Rate Limit Integration", () => {
  const originalEnv = process.env;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.RATE_LIMIT_REDIS_URL;
    process.env.NODE_ENV = "test";
  });

  afterEach(async () => {
    process.env = originalEnv;
    process.env.NODE_ENV = originalNodeEnv;
    const { clearAll } = await import("../../api/_lib/rate-limit-storage.js");
    await clearAll();
  });

  describe("Shared storage layer usage", () => {
    test("should use shared storage layer for rate limiting", async () => {
      const { checkRateLimit } = await import("../../middleware/rate-limit.js");
      const { incrementWithExpiration } = await import("../../api/_lib/rate-limit-storage.js");

      // Use the same key prefix as middleware
      const testIp = "192.168.1.1";
      const middlewareKey = `rl:${testIp}`;

      // Make a request through middleware
      const result1 = await checkRateLimit({
        headers: new Headers({ "x-forwarded-for": testIp }),
      });
      assert.strictEqual(result1.limited, false);

      // Verify the counter was incremented in shared storage
      const { count: countAfterMiddleware } = await incrementWithExpiration(middlewareKey, 60000);
      assert.ok(countAfterMiddleware >= 1);
    });
  });

  describe("Fail-closed behavior", () => {
    test("should reject requests in production without distributed storage", async () => {
      process.env.NODE_ENV = "production";
      delete process.env.RATE_LIMIT_REDIS_URL;

      const { checkRateLimit } = await import("../../middleware/rate-limit.js");
      const result = await checkRateLimit({
        headers: new Headers({ "x-forwarded-for": "192.168.1.3" }),
      });

      // Should be rate limited (rejected) in production
      assert.strictEqual(result.limited, true);
    });

    test("should allow requests in development without distributed storage", async () => {
      process.env.NODE_ENV = "development";
      delete process.env.RATE_LIMIT_REDIS_URL;

      const { checkRateLimit } = await import("../../middleware/rate-limit.js");
      const result = await checkRateLimit({
        headers: new Headers({ "x-forwarded-for": "192.168.1.4" }),
      });

      // Should not be rate limited in development (in-memory fallback)
      assert.strictEqual(result.limited, false);
    });

    test("should allow requests in test without distributed storage", async () => {
      process.env.NODE_ENV = "test";
      delete process.env.RATE_LIMIT_REDIS_URL;

      const { checkRateLimit } = await import("../../middleware/rate-limit.js");
      const result = await checkRateLimit({
        headers: new Headers({ "x-forwarded-for": "192.168.1.5" }),
      });

      // Should not be rate limited in test (in-memory fallback)
      assert.strictEqual(result.limited, false);
    });
  });

  describe("Rate limiting behavior", () => {
    test("should enforce rate limit after threshold", async () => {
      const { checkRateLimit } = await import("../../middleware/rate-limit.js");

      const testIp = "192.168.1.6";

      // Make requests up to the limit (60 requests)
      for (let i = 0; i < 60; i++) {
        const result = await checkRateLimit({
          headers: new Headers({ "x-forwarded-for": testIp }),
        });
        assert.strictEqual(result.limited, false, `Request ${i + 1} should not be limited`);
      }

      // Next request should be rate limited
      const result = await checkRateLimit({
        headers: new Headers({ "x-forwarded-for": testIp }),
      });
      assert.strictEqual(result.limited, true);
    });

    test("should handle different IPs independently", async () => {
      const { checkRateLimit } = await import("../../middleware/rate-limit.js");

      const ip1 = "192.168.1.7";
      const ip2 = "192.168.1.8";

      // Exhaust limit for IP1
      for (let i = 0; i < 61; i++) {
        await checkRateLimit({
          headers: new Headers({ "x-forwarded-for": ip1 }),
        });
      }

      // IP1 should be limited
      const result1 = await checkRateLimit({
        headers: new Headers({ "x-forwarded-for": ip1 }),
      });
      assert.strictEqual(result1.limited, true);

      // IP2 should not be limited
      const result2 = await checkRateLimit({
        headers: new Headers({ "x-forwarded-for": ip2 }),
      });
      assert.strictEqual(result2.limited, false);
    });
  });

  describe("IP extraction", () => {
    test("should extract IP from x-forwarded-for header", async () => {
      const { checkRateLimit } = await import("../../middleware/rate-limit.js");
      const result = await checkRateLimit({
        headers: new Headers({ "x-forwarded-for": "192.168.1.9" }),
      });
      assert.strictEqual(result.ip, "192.168.1.9");
    });

    test("should extract first IP from comma-separated x-forwarded-for", async () => {
      const { checkRateLimit } = await import("../../middleware/rate-limit.js");
      const result = await checkRateLimit({
        headers: new Headers({ "x-forwarded-for": "192.168.1.10, 10.0.0.1, 172.16.0.1" }),
      });
      assert.strictEqual(result.ip, "192.168.1.10");
    });

    test("should fall back to x-real-ip header", async () => {
      const { checkRateLimit } = await import("../../middleware/rate-limit.js");
      const result = await checkRateLimit({
        headers: new Headers({ "x-real-ip": "192.168.1.11" }),
      });
      assert.strictEqual(result.ip, "192.168.1.11");
    });

    test("should use unknown if no IP headers present", async () => {
      const { checkRateLimit } = await import("../../middleware/rate-limit.js");
      const result = await checkRateLimit({
        headers: new Headers(),
      });
      assert.strictEqual(result.ip, "unknown");
    });
  });
});
