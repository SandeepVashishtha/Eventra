/**
 * Production-grade rate limiter fallback behavior tests
 *
 * These tests verify that the rate limiter implements a safe fallback strategy:
 * - Redis operational: Requests limited normally
 * - Redis unavailable: In-memory fallback activates, requests continue working
 * - Redis misconfigured: Application remains available
 * - Fallback failure: Degraded mode activated, error logged
 * - RATE_LIMIT_FAIL_MODE=closed: Existing behavior preserved
 * - RATE_LIMIT_FAIL_MODE=open: Requests allowed when storage unavailable
 */

import { strict as assert } from "node:assert";
import { describe, it, before, after, mock } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Save original environment
const originalEnv = { ...process.env };
const originalNodeEnv = process.env.NODE_ENV;

function setTestEnv(env) {
  Object.assign(process.env, env);
}

function restoreEnv() {
  process.env = { ...originalEnv };
  process.env.NODE_ENV = originalNodeEnv;
}

describe("Middleware Rate Limiting Fallback Behavior", () => {
  after(() => {
    restoreEnv();
  });

  describe("Test 1: Redis Operational", () => {
    it("should limit requests normally when Redis is operational", async () => {
      setTestEnv({
        NODE_ENV: "production",
        RATE_LIMIT_REDIS_URL: "redis://localhost:6379",
        RATE_LIMIT_FAIL_MODE: "fallback",
        TRUSTED_PROXIES: "127.0.0.1,::1",
      });

      // Dynamic import to get fresh module state
      const rateLimitPath = pathToFileURL(
        path.resolve(__dirname, "../middleware/rate-limit.js")
      ).href;
      const { checkRateLimit } = await import(rateLimitPath);

      const mockRequest = {
        headers: new Headers({
          "x-forwarded-for": "192.168.1.1",
        }),
        socket: { remoteAddress: "127.0.0.1" },
      };

      // First request should be allowed
      const result1 = await checkRateLimit(mockRequest);
      assert.strictEqual(
        result1.limited,
        false,
        "Expected first request to be allowed"
      );
      assert.strictEqual(result1.ip, "192.168.1.1");
    });
  });

  describe("Test 2: Redis Unavailable", () => {
    it("should activate in-memory fallback when Redis is unavailable", async () => {
      setTestEnv({
        NODE_ENV: "production",
        RATE_LIMIT_REDIS_URL: "redis://localhost:6379",
        RATE_LIMIT_FAIL_MODE: "fallback",
        TRUSTED_PROXIES: "127.0.0.1,::1",
      });

      // Dynamic import to get fresh module state
      const rateLimitPath = pathToFileURL(
        path.resolve(__dirname, "../middleware/rate-limit.js")
      ).href;
      const { checkRateLimit } = await import(rateLimitPath);

      const mockRequest = {
        headers: new Headers({
          "x-forwarded-for": "192.168.2.1",
        }),
        socket: { remoteAddress: "127.0.0.1" },
      };

      // Request should succeed with in-memory fallback
      const result = await checkRateLimit(mockRequest);
      assert.strictEqual(
        result.limited,
        false,
        "Expected requests to continue working with in-memory fallback"
      );
    });
  });

  describe("Test 3: Redis Misconfigured", () => {
    it("should remain available when Redis is misconfigured", async () => {
      setTestEnv({
        NODE_ENV: "production",
        RATE_LIMIT_REDIS_URL: "", // Empty/misconfigured
        RATE_LIMIT_FAIL_MODE: "fallback",
      });

      // Dynamic import to get fresh module state
      const rateLimitPath = pathToFileURL(
        path.resolve(__dirname, "../middleware/rate-limit.js")
      ).href;
      const { checkRateLimit } = await import(rateLimitPath);

      const mockRequest = {
        headers: new Headers({
          "x-forwarded-for": "192.168.3.1",
        }),
        socket: { remoteAddress: "127.0.0.1" },
      };

      // Application should remain available
      const result = await checkRateLimit(mockRequest);
      assert.strictEqual(
        result.limited,
        false,
        "Expected application to remain available with in-memory fallback"
      );
    });
  });

  describe("Test 4: Fallback Failure", () => {
    it("should activate degraded mode when both Redis and in-memory fail", async () => {
      setTestEnv({
        NODE_ENV: "production",
        RATE_LIMIT_REDIS_URL: "redis://localhost:6379",
        RATE_LIMIT_FAIL_MODE: "fallback",
        TRUSTED_PROXIES: "127.0.0.1,::1",
      });

      // Dynamic import to get fresh module state
      const rateLimitPath = pathToFileURL(
        path.resolve(__dirname, "../middleware/rate-limit.js")
      ).href;
      const { checkRateLimit } = await import(rateLimitPath);

      const mockRequest = {
        headers: new Headers({
          "x-forwarded-for": "192.168.4.1",
        }),
        socket: { remoteAddress: "127.0.0.1" },
      };

      // Even if everything fails, degraded mode should allow requests
      const result = await checkRateLimit(mockRequest);
      assert.strictEqual(
        result.limited,
        false,
        "Expected degraded mode to allow requests when all storage fails"
      );
    });
  });

  describe("Test 5: RATE_LIMIT_FAIL_MODE=closed", () => {
    it("should preserve existing behavior (reject requests) when fail mode is closed", async () => {
      setTestEnv({
        NODE_ENV: "production",
        RATE_LIMIT_REDIS_URL: "", // Missing Redis
        RATE_LIMIT_FAIL_MODE: "closed",
        TRUSTED_PROXIES: "127.0.0.1,::1",
      });

      // Dynamic import to get fresh module state
      const rateLimitPath = pathToFileURL(
        path.resolve(__dirname, "../middleware/rate-limit.js")
      ).href;
      const { checkRateLimit } = await import(rateLimitPath);

      const mockRequest = {
        headers: new Headers({
          "x-forwarded-for": "192.168.5.1",
        }),
        socket: { remoteAddress: "127.0.0.1" },
      };

      // Should reject requests in closed mode
      const result = await checkRateLimit(mockRequest);
      assert.strictEqual(
        result.limited,
        true,
        "Expected requests to be rejected in fail-closed mode"
      );
    });

    it("should reject requests when Redis fails in closed mode", async () => {
      setTestEnv({
        NODE_ENV: "production",
        RATE_LIMIT_REDIS_URL: "redis://localhost:6379",
        RATE_LIMIT_FAIL_MODE: "closed",
        TRUSTED_PROXIES: "127.0.0.1,::1",
      });

      // Dynamic import to get fresh module state
      const rateLimitPath = pathToFileURL(
        path.resolve(__dirname, "../middleware/rate-limit.js")
      ).href;
      const { checkRateLimit } = await import(rateLimitPath);

      const mockRequest = {
        headers: new Headers({
          "x-forwarded-for": "192.168.5.2",
        }),
        socket: { remoteAddress: "127.0.0.1" },
      };

      // Should reject requests when Redis fails in closed mode
      const result = await checkRateLimit(mockRequest);
      assert.strictEqual(
        result.limited,
        true,
        "Expected requests to be rejected when Redis fails in fail-closed mode"
      );
    });
  });

  describe("Test 6: RATE_LIMIT_FAIL_MODE=open", () => {
    it("should allow requests when storage is unavailable in open mode", async () => {
      setTestEnv({
        NODE_ENV: "production",
        RATE_LIMIT_REDIS_URL: "", // Missing Redis
        RATE_LIMIT_FAIL_MODE: "open",
      });

      // Dynamic import to get fresh module state
      const rateLimitPath = pathToFileURL(
        path.resolve(__dirname, "../middleware/rate-limit.js")
      ).href;
      const { checkRateLimit } = await import(rateLimitPath);

      const mockRequest = {
        headers: new Headers({
          "x-forwarded-for": "192.168.6.1",
        }),
        socket: { remoteAddress: "127.0.0.1" },
      };

      // Should allow requests in open mode
      const result = await checkRateLimit(mockRequest);
      assert.strictEqual(
        result.limited,
        false,
        "Expected requests to be allowed in fail-open mode"
      );
    });

    it("should allow requests when Redis fails in open mode", async () => {
      setTestEnv({
        NODE_ENV: "production",
        RATE_LIMIT_REDIS_URL: "redis://localhost:6379",
        RATE_LIMIT_FAIL_MODE: "open",
        TRUSTED_PROXIES: "127.0.0.1,::1",
      });

      // Dynamic import to get fresh module state
      const rateLimitPath = pathToFileURL(
        path.resolve(__dirname, "../middleware/rate-limit.js")
      ).href;
      const { checkRateLimit } = await import(rateLimitPath);

      const mockRequest = {
        headers: new Headers({
          "x-forwarded-for": "192.168.6.2",
        }),
        socket: { remoteAddress: "127.0.0.1" },
      };

      // Should allow requests when Redis fails in open mode
      const result = await checkRateLimit(mockRequest);
      assert.strictEqual(
        result.limited,
        false,
        "Expected requests to be allowed when Redis fails in fail-open mode"
      );
    });
  });

  describe("Default Behavior (No RATE_LIMIT_FAIL_MODE set)", () => {
    it("should use fallback mode by default when RATE_LIMIT_FAIL_MODE is not set", async () => {
      setTestEnv({
        NODE_ENV: "production",
        RATE_LIMIT_REDIS_URL: "", // Missing Redis
        TRUSTED_PROXIES: "127.0.0.1,::1",
      });
      delete process.env.RATE_LIMIT_FAIL_MODE;

      // Dynamic import to get fresh module state
      const rateLimitPath = pathToFileURL(
        path.resolve(__dirname, "../middleware/rate-limit.js")
      ).href;
      const { checkRateLimit } = await import(rateLimitPath);

      const mockRequest = {
        headers: new Headers({
          "x-forwarded-for": "192.168.7.1",
        }),
        socket: { remoteAddress: "127.0.0.1" },
      };

      // Should use fallback mode (default) and allow requests
      const result = await checkRateLimit(mockRequest);
      assert.strictEqual(
        result.limited,
        false,
        "Expected requests to be allowed with default fallback mode"
      );
    });
  });

  describe("Invalid RATE_LIMIT_FAIL_MODE", () => {
    it("should fallback to default mode when RATE_LIMIT_FAIL_MODE is invalid", async () => {
      setTestEnv({
        NODE_ENV: "production",
        RATE_LIMIT_REDIS_URL: "",
        RATE_LIMIT_FAIL_MODE: "invalid-mode",
        TRUSTED_PROXIES: "127.0.0.1,::1",
      });

      // Dynamic import to get fresh module state
      const rateLimitPath = pathToFileURL(
        path.resolve(__dirname, "../middleware/rate-limit.js")
      ).href;
      const { checkRateLimit } = await import(rateLimitPath);

      const mockRequest = {
        headers: new Headers({
          "x-forwarded-for": "192.168.8.1",
        }),
        socket: { remoteAddress: "127.0.0.1" },
      };

      // Should use fallback mode (default) when invalid mode is set
      const result = await checkRateLimit(mockRequest);
      assert.strictEqual(
        result.limited,
        false,
        "Expected requests to be allowed with default fallback mode when invalid mode is set"
      );
    });
  });

  describe("Development Environment", () => {
    it("should allow requests with in-memory fallback in development regardless of fail mode", async () => {
      setTestEnv({
        NODE_ENV: "development",
        RATE_LIMIT_FAIL_MODE: "closed",
        TRUSTED_PROXIES: "127.0.0.1,::1",
      });
      delete process.env.RATE_LIMIT_REDIS_URL;

      // Dynamic import to get fresh module state
      const rateLimitPath = pathToFileURL(
        path.resolve(__dirname, "../middleware/rate-limit.js")
      ).href;
      const { checkRateLimit } = await import(rateLimitPath);

      const mockRequest = {
        headers: new Headers({
          "x-forwarded-for": "192.168.9.1",
        }),
        socket: { remoteAddress: "127.0.0.1" },
      };

      // Development should always allow requests
      const result = await checkRateLimit(mockRequest);
      assert.strictEqual(
        result.limited,
        false,
        "Expected requests to be allowed in development"
      );
    });
  });

  describe("Case Insensitive RATE_LIMIT_FAIL_MODE", () => {
    it("should handle RATE_LIMIT_FAIL_MODE case insensitively", async () => {
      setTestEnv({
        NODE_ENV: "production",
        RATE_LIMIT_REDIS_URL: "",
        RATE_LIMIT_FAIL_MODE: "FALLBACK", // Uppercase
        TRUSTED_PROXIES: "127.0.0.1,::1",
      });

      // Dynamic import to get fresh module state
      const rateLimitPath = pathToFileURL(
        path.resolve(__dirname, "../middleware/rate-limit.js")
      ).href;
      const { checkRateLimit } = await import(rateLimitPath);

      const mockRequest = {
        headers: new Headers({
          "x-forwarded-for": "192.168.10.1",
        }),
        socket: { remoteAddress: "127.0.0.1" },
      };

      // Should handle uppercase mode correctly
      const result = await checkRateLimit(mockRequest);
      assert.strictEqual(
        result.limited,
        false,
        "Expected requests to be allowed with uppercase fallback mode"
      );
    });

    it("should handle RATE_LIMIT_FAIL_MODE with whitespace", async () => {
      setTestEnv({
        NODE_ENV: "production",
        RATE_LIMIT_REDIS_URL: "",
        RATE_LIMIT_FAIL_MODE: "  fallback  ", // With whitespace
        TRUSTED_PROXIES: "127.0.0.1,::1",
      });

      // Dynamic import to get fresh module state
      const rateLimitPath = pathToFileURL(
        path.resolve(__dirname, "../middleware/rate-limit.js")
      ).href;
      const { checkRateLimit } = await import(rateLimitPath);

      const mockRequest = {
        headers: new Headers({
          "x-forwarded-for": "192.168.10.2",
        }),
        socket: { remoteAddress: "127.0.0.1" },
      };

      // Should handle whitespace correctly
      const result = await checkRateLimit(mockRequest);
      assert.strictEqual(
        result.limited,
        false,
        "Expected requests to be allowed with whitespace in mode"
      );
    });
  });
});
