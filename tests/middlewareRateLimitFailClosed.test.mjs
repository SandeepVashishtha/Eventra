/**
 * Security tests for middleware rate limiting fail-closed behavior
 * 
 * These tests verify that middleware/rate-limit.js enforces fail-closed security:
 * - Missing KV configuration in production returns rate-limited (rejects requests)
 * - KV request failures in production return rate-limited (rejects requests)
 * - Network errors in production return rate-limited (rejects requests)
 * - Development environment allows requests with in-memory fallback
 * - Test environment allows requests with in-memory fallback
 * - Successful rate limiting works correctly
 * - Successful non-rate-limited requests work correctly
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

describe("Middleware Rate Limiting Fail-Closed Security", () => {
  after(() => {
    restoreEnv();
  });

  describe("Production: Missing KV Configuration", () => {
    it("should rate limit (reject) when KV_REST_API_URL is missing in production", async () => {
      setTestEnv({
        NODE_ENV: "production",
        KV_REST_API_TOKEN: "test-token",
      });
      delete process.env.KV_REST_API_URL;

      // Dynamic import to get fresh module state
      const rateLimitPath = pathToFileURL(
        path.resolve(__dirname, "../middleware/rate-limit.js")
      ).href;
      const { checkRateLimit } = await import(rateLimitPath);

      const mockRequest = {
        headers: new Headers({
          "x-forwarded-for": "192.168.1.1",
        }),
      };

      const result = await checkRateLimit(mockRequest);

      assert.strictEqual(
        result.limited,
        true,
        "Expected rate limit to be enforced (fail-closed) when KV_REST_API_URL is missing in production"
      );
      assert.strictEqual(
        result.ip,
        "192.168.1.1",
        "Expected IP to be preserved"
      );
    });

    it("should rate limit (reject) when KV_REST_API_TOKEN is missing in production", async () => {
      setTestEnv({
        NODE_ENV: "production",
        KV_REST_API_URL: "https://api.vercel-storage.com",
      });
      delete process.env.KV_REST_API_TOKEN;

      // Dynamic import to get fresh module state
      const rateLimitPath = pathToFileURL(
        path.resolve(__dirname, "../middleware/rate-limit.js")
      ).href;
      const { checkRateLimit } = await import(rateLimitPath);

      const mockRequest = {
        headers: new Headers({
          "x-forwarded-for": "192.168.1.2",
        }),
      };

      const result = await checkRateLimit(mockRequest);

      assert.strictEqual(
        result.limited,
        true,
        "Expected rate limit to be enforced (fail-closed) when KV_REST_API_TOKEN is missing in production"
      );
    });

    it("should rate limit (reject) when both KV variables are missing in production", async () => {
      setTestEnv({
        NODE_ENV: "production",
      });
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;

      // Dynamic import to get fresh module state
      const rateLimitPath = pathToFileURL(
        path.resolve(__dirname, "../middleware/rate-limit.js")
      ).href;
      const { checkRateLimit } = await import(rateLimitPath);

      const mockRequest = {
        headers: new Headers({
          "x-forwarded-for": "192.168.1.3",
        }),
      };

      const result = await checkRateLimit(mockRequest);

      assert.strictEqual(
        result.limited,
        true,
        "Expected rate limit to be enforced (fail-closed) when both KV variables are missing in production"
      );
    });
  });

  describe("Development: Missing KV Configuration", () => {
    it("should allow requests with in-memory fallback when KV is missing in development", async () => {
      setTestEnv({
        NODE_ENV: "development",
      });
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;

      // Dynamic import to get fresh module state
      const rateLimitPath = pathToFileURL(
        path.resolve(__dirname, "../middleware/rate-limit.js")
      ).href;
      const { checkRateLimit } = await import(rateLimitPath);

      const mockRequest = {
        headers: new Headers({
          "x-forwarded-for": "192.168.2.1",
        }),
      };

      const result = await checkRateLimit(mockRequest);

      assert.strictEqual(
        result.limited,
        false,
        "Expected requests to be allowed with in-memory fallback in development"
      );
    });
  });

  describe("Test: Missing KV Configuration", () => {
    it("should allow requests with in-memory fallback when KV is missing in test", async () => {
      setTestEnv({
        NODE_ENV: "test",
      });
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;

      // Dynamic import to get fresh module state
      const rateLimitPath = pathToFileURL(
        path.resolve(__dirname, "../middleware/rate-limit.js")
      ).href;
      const { checkRateLimit } = await import(rateLimitPath);

      const mockRequest = {
        headers: new Headers({
          "x-forwarded-for": "192.168.3.1",
        }),
      };

      const result = await checkRateLimit(mockRequest);

      assert.strictEqual(
        result.limited,
        false,
        "Expected requests to be allowed with in-memory fallback in test"
      );
    });
  });

  describe("Production: KV Request Failures", () => {
    it("should rate limit (reject) when KV request fails in production", async () => {
      setTestEnv({
        NODE_ENV: "production",
        KV_REST_API_URL: "https://api.vercel-storage.com",
        KV_REST_API_TOKEN: "test-token",
      });

      // Dynamic import to get fresh module state
      const rateLimitPath = pathToFileURL(
        path.resolve(__dirname, "../middleware/rate-limit.js")
      ).href;
      const { checkRateLimit } = await import(rateLimitPath);

      // Mock fetch to simulate KV failure
      const originalFetch = global.fetch;
      global.fetch = mock.fn(async () => ({
        ok: false,
        status: 500,
        json: async () => ({ result: 0 }),
      }));

      try {
        const mockRequest = {
          headers: new Headers({
            "x-forwarded-for": "192.168.4.1",
          }),
        };

        const result = await checkRateLimit(mockRequest);

        assert.strictEqual(
          result.limited,
          true,
          "Expected rate limit to be enforced (fail-closed) when KV request fails in production"
        );
      } finally {
        global.fetch = originalFetch;
      }
    });

    it("should rate limit (reject) on network errors in production", async () => {
      setTestEnv({
        NODE_ENV: "production",
        KV_REST_API_URL: "https://api.vercel-storage.com",
        KV_REST_API_TOKEN: "test-token",
      });

      // Dynamic import to get fresh module state
      const rateLimitPath = pathToFileURL(
        path.resolve(__dirname, "../middleware/rate-limit.js")
      ).href;
      const { checkRateLimit } = await import(rateLimitPath);

      // Mock fetch to simulate network error
      const originalFetch = global.fetch;
      global.fetch = mock.fn(async () => {
        throw new Error("Network error");
      });

      try {
        const mockRequest = {
          headers: new Headers({
            "x-forwarded-for": "192.168.5.1",
          }),
        };

        const result = await checkRateLimit(mockRequest);

        assert.strictEqual(
          result.limited,
          true,
          "Expected rate limit to be enforced (fail-closed) on network errors in production"
        );
      } finally {
        global.fetch = originalFetch;
      }
    });

    it("should rate limit (reject) on invalid JSON response in production", async () => {
      setTestEnv({
        NODE_ENV: "production",
        KV_REST_API_URL: "https://api.vercel-storage.com",
        KV_REST_API_TOKEN: "test-token",
      });

      // Dynamic import to get fresh module state
      const rateLimitPath = pathToFileURL(
        path.resolve(__dirname, "../middleware/rate-limit.js")
      ).href;
      const { checkRateLimit } = await import(rateLimitPath);

      // Mock fetch to simulate invalid JSON
      const originalFetch = global.fetch;
      global.fetch = mock.fn(async () => ({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      }));

      try {
        const mockRequest = {
          headers: new Headers({
            "x-forwarded-for": "192.168.6.1",
          }),
        };

        const result = await checkRateLimit(mockRequest);

        assert.strictEqual(
          result.limited,
          true,
          "Expected rate limit to be enforced (fail-closed) on invalid JSON in production"
        );
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  describe("Development: KV Request Failures", () => {
    it("should allow requests with in-memory fallback when KV fails in development", async () => {
      setTestEnv({
        NODE_ENV: "development",
        KV_REST_API_URL: "https://api.vercel-storage.com",
        KV_REST_API_TOKEN: "test-token",
      });

      // Dynamic import to get fresh module state
      const rateLimitPath = pathToFileURL(
        path.resolve(__dirname, "../middleware/rate-limit.js")
      ).href;
      const { checkRateLimit } = await import(rateLimitPath);

      // Mock fetch to simulate KV failure
      const originalFetch = global.fetch;
      global.fetch = mock.fn(async () => ({
        ok: false,
        status: 500,
        json: async () => ({ result: 0 }),
      }));

      try {
        const mockRequest = {
          headers: new Headers({
            "x-forwarded-for": "192.168.7.1",
          }),
        };

        const result = await checkRateLimit(mockRequest);

        assert.strictEqual(
          result.limited,
          false,
          "Expected requests to be allowed with in-memory fallback when KV fails in development"
        );
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  describe("Successful Rate Limiting with KV", () => {
    it("should allow requests under threshold with valid KV", async () => {
      setTestEnv({
        NODE_ENV: "production",
        KV_REST_API_URL: "https://api.vercel-storage.com",
        KV_REST_API_TOKEN: "test-token",
      });

      // Dynamic import to get fresh module state
      const rateLimitPath = pathToFileURL(
        path.resolve(__dirname, "../middleware/rate-limit.js")
      ).href;
      const { checkRateLimit } = await import(rateLimitPath);

      // Mock fetch to simulate successful KV response
      const originalFetch = global.fetch;
      let callCount = 0;
      global.fetch = mock.fn(async () => {
        callCount++;
        if (callCount === 1) {
          // First call: increment
          return {
            ok: true,
            json: async () => ({ result: 1 }),
          };
        } else {
          // Second call: expire
          return {
            ok: true,
            json: async () => ({ result: "OK" }),
          };
        }
      });

      try {
        const mockRequest = {
          headers: new Headers({
            "x-forwarded-for": "192.168.8.1",
          }),
        };

        const result = await checkRateLimit(mockRequest);

        assert.strictEqual(
          result.limited,
          false,
          "Expected requests to be allowed under threshold"
        );
      } finally {
        global.fetch = originalFetch;
      }
    });

    it("should rate limit requests over threshold with valid KV", async () => {
      setTestEnv({
        NODE_ENV: "production",
        KV_REST_API_URL: "https://api.vercel-storage.com",
        KV_REST_API_TOKEN: "test-token",
      });

      // Dynamic import to get fresh module state
      const rateLimitPath = pathToFileURL(
        path.resolve(__dirname, "../middleware/rate-limit.js")
      ).href;
      const { checkRateLimit } = await import(rateLimitPath);

      // Mock fetch to simulate rate limit exceeded
      const originalFetch = global.fetch;
      global.fetch = mock.fn(async () => ({
        ok: true,
        json: async () => ({ result: 61 }), // Over the 60 limit
      }));

      try {
        const mockRequest = {
          headers: new Headers({
            "x-forwarded-for": "192.168.9.1",
          }),
        };

        const result = await checkRateLimit(mockRequest);

        assert.strictEqual(
          result.limited,
          true,
          "Expected requests to be rate limited over threshold"
        );
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  describe("In-Memory Rate Limiting", () => {
    it("should enforce rate limits with in-memory storage", async () => {
      setTestEnv({
        NODE_ENV: "test",
      });
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;

      // Dynamic import to get fresh module state
      const rateLimitPath = pathToFileURL(
        path.resolve(__dirname, "../middleware/rate-limit.js")
      ).href;
      const { checkRateLimit, inMemoryRateLimitStore } = await import(rateLimitPath);

      // Clear store before test
      inMemoryRateLimitStore.clear();

      const mockRequest = {
        headers: new Headers({
          "x-forwarded-for": "192.168.10.1",
        }),
      };

      // Make 60 requests (should be allowed)
      for (let i = 0; i < 60; i++) {
        const result = await checkRateLimit(mockRequest);
        assert.strictEqual(
          result.limited,
          false,
          `Expected request ${i + 1} to be allowed under threshold`
        );
      }

      // 61st request should be rate limited
      const result = await checkRateLimit(mockRequest);
      assert.strictEqual(
        result.limited,
        true,
        "Expected 61st request to be rate limited"
      );
    });

    it("should reset in-memory counter after window expires", async () => {
      setTestEnv({
        NODE_ENV: "test",
      });
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;

      // Dynamic import to get fresh module state
      const rateLimitPath = pathToFileURL(
        path.resolve(__dirname, "../middleware/rate-limit.js")
      ).href;
      const { checkRateLimit, inMemoryRateLimitStore } = await import(rateLimitPath);

      const mockRequest = {
        headers: new Headers({
          "x-forwarded-for": "192.168.11.1",
        }),
      };

      // Exhaust the limit
      for (let i = 0; i < 61; i++) {
        await checkRateLimit(mockRequest);
      }

      // Manually clear the in-memory store to simulate window expiration
      // This is a test-specific workaround to avoid waiting 60 seconds
      inMemoryRateLimitStore.clear();

      // Should be allowed again
      const result = await checkRateLimit(mockRequest);
      assert.strictEqual(
        result.limited,
        false,
        "Expected requests to be allowed after window expires"
      );
    });
  });

  describe("IP Extraction", () => {
    it("should extract IP from x-forwarded-for header", async () => {
      setTestEnv({
        NODE_ENV: "test",
      });
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;

      // Dynamic import to get fresh module state
      const rateLimitPath = pathToFileURL(
        path.resolve(__dirname, "../middleware/rate-limit.js")
      ).href;
      const { checkRateLimit } = await import(rateLimitPath);

      const mockRequest = {
        headers: new Headers({
          "x-forwarded-for": "203.0.113.1, 198.51.100.1",
        }),
      };

      const result = await checkRateLimit(mockRequest);

      assert.strictEqual(result.ip, "203.0.113.1");
    });

    it("should extract IP from x-real-ip header when x-forwarded-for is missing", async () => {
      setTestEnv({
        NODE_ENV: "test",
      });
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;

      // Dynamic import to get fresh module state
      const rateLimitPath = pathToFileURL(
        path.resolve(__dirname, "../middleware/rate-limit.js")
      ).href;
      const { checkRateLimit } = await import(rateLimitPath);

      const mockRequest = {
        headers: new Headers({
          "x-real-ip": "203.0.113.2",
        }),
      };

      const result = await checkRateLimit(mockRequest);

      assert.strictEqual(result.ip, "203.0.113.2");
    });

    it("should use 'unknown' when no IP headers are present", async () => {
      setTestEnv({
        NODE_ENV: "test",
      });
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;

      // Dynamic import to get fresh module state
      const rateLimitPath = pathToFileURL(
        path.resolve(__dirname, "../middleware/rate-limit.js")
      ).href;
      const { checkRateLimit } = await import(rateLimitPath);

      const mockRequest = {
        headers: new Headers({}),
      };

      const result = await checkRateLimit(mockRequest);

      assert.strictEqual(result.ip, "unknown");
    });
  });

  describe("Different IPs Tracked Separately", () => {
    it("should track rate limits separately for different IPs", async () => {
      setTestEnv({
        NODE_ENV: "test",
      });
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;

      // Dynamic import to get fresh module state
      const rateLimitPath = pathToFileURL(
        path.resolve(__dirname, "../middleware/rate-limit.js")
      ).href;
      const { checkRateLimit } = await import(rateLimitPath);

      const mockRequest1 = {
        headers: new Headers({
          "x-forwarded-for": "192.168.12.1",
        }),
      };

      const mockRequest2 = {
        headers: new Headers({
          "x-forwarded-for": "192.168.12.2",
        }),
      };

      // Exhaust limit for IP1
      for (let i = 0; i < 61; i++) {
        await checkRateLimit(mockRequest1);
      }

      // IP1 should be rate limited
      const result1 = await checkRateLimit(mockRequest1);
      assert.strictEqual(result1.limited, true);

      // IP2 should still be allowed
      const result2 = await checkRateLimit(mockRequest2);
      assert.strictEqual(result2.limited, false);
    });
  });
});
