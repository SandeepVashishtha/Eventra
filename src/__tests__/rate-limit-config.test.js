import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert";

describe("Rate-Limit Configuration Validation", () => {
  const originalEnv = process.env;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe("isDistributedRateLimitStorageConfigured", () => {
    test("should return false when KV_REST_API_URL is missing", async () => {
      delete process.env.KV_REST_API_URL;
      process.env.KV_REST_API_TOKEN = "token";
      const { isDistributedRateLimitStorageConfigured } = await import("../../api/lib/rate-limit-config.js");
      assert.strictEqual(isDistributedRateLimitStorageConfigured(), false);
    });

    test("should return false when KV_REST_API_TOKEN is missing", async () => {
      process.env.KV_REST_API_URL = "https://redis.example.com";
      delete process.env.KV_REST_API_TOKEN;
      const { isDistributedRateLimitStorageConfigured } = await import("../../api/lib/rate-limit-config.js");
      assert.strictEqual(isDistributedRateLimitStorageConfigured(), false);
    });

    test("should return false when both are missing", async () => {
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;
      const { isDistributedRateLimitStorageConfigured } = await import("../../api/lib/rate-limit-config.js");
      assert.strictEqual(isDistributedRateLimitStorageConfigured(), false);
    });

    test("should return false when KV_REST_API_URL is empty", async () => {
      process.env.KV_REST_API_URL = "";
      process.env.KV_REST_API_TOKEN = "token";
      const { isDistributedRateLimitStorageConfigured } = await import("../../api/lib/rate-limit-config.js");
      assert.strictEqual(isDistributedRateLimitStorageConfigured(), false);
    });

    test("should return false when KV_REST_API_TOKEN is empty", async () => {
      process.env.KV_REST_API_URL = "https://redis.example.com";
      process.env.KV_REST_API_TOKEN = "";
      const { isDistributedRateLimitStorageConfigured } = await import("../../api/lib/rate-limit-config.js");
      assert.strictEqual(isDistributedRateLimitStorageConfigured(), false);
    });

    test("should return false when KV_REST_API_URL is whitespace-only", async () => {
      process.env.KV_REST_API_URL = "   ";
      process.env.KV_REST_API_TOKEN = "token";
      const { isDistributedRateLimitStorageConfigured } = await import("../../api/lib/rate-limit-config.js");
      assert.strictEqual(isDistributedRateLimitStorageConfigured(), false);
    });

    test("should return false when KV_REST_API_TOKEN is whitespace-only", async () => {
      process.env.KV_REST_API_URL = "https://redis.example.com";
      process.env.KV_REST_API_TOKEN = "   ";
      const { isDistributedRateLimitStorageConfigured } = await import("../../api/lib/rate-limit-config.js");
      assert.strictEqual(isDistributedRateLimitStorageConfigured(), false);
    });

    test("should return true when both are present and non-empty", async () => {
      process.env.KV_REST_API_URL = "https://redis.example.com";
      process.env.KV_REST_API_TOKEN = "secret-token";
      const { isDistributedRateLimitStorageConfigured } = await import("../../api/lib/rate-limit-config.js");
      assert.strictEqual(isDistributedRateLimitStorageConfigured(), true);
    });
  });

  describe("assertDistributedRateLimitStorageConfigured", () => {
    test("should throw error in production when KV_REST_API_URL is missing", async () => {
      process.env.NODE_ENV = "production";
      delete process.env.KV_REST_API_URL;
      process.env.KV_REST_API_TOKEN = "token";
      const { assertDistributedRateLimitStorageConfigured } = await import("../../api/lib/rate-limit-config.js");
      assert.throws(
        () => assertDistributedRateLimitStorageConfigured(),
        /KV_REST_API_URL and KV_REST_API_TOKEN are required in production/
      );
    });

    test("should throw error in production when KV_REST_API_TOKEN is missing", async () => {
      process.env.NODE_ENV = "production";
      process.env.KV_REST_API_URL = "https://redis.example.com";
      delete process.env.KV_REST_API_TOKEN;
      const { assertDistributedRateLimitStorageConfigured } = await import("../../api/lib/rate-limit-config.js");
      assert.throws(
        () => assertDistributedRateLimitStorageConfigured(),
        /KV_REST_API_URL and KV_REST_API_TOKEN are required in production/
      );
    });

    test("should throw error in production when both are missing", async () => {
      process.env.NODE_ENV = "production";
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;
      const { assertDistributedRateLimitStorageConfigured } = await import("../../api/lib/rate-limit-config.js");
      assert.throws(
        () => assertDistributedRateLimitStorageConfigured(),
        /KV_REST_API_URL and KV_REST_API_TOKEN are required in production/
      );
    });

    test("should not throw error in production when both are valid", async () => {
      process.env.NODE_ENV = "production";
      process.env.KV_REST_API_URL = "https://redis.example.com";
      process.env.KV_REST_API_TOKEN = "secret-token";
      const { assertDistributedRateLimitStorageConfigured } = await import("../../api/lib/rate-limit-config.js");
      assert.doesNotThrow(() => assertDistributedRateLimitStorageConfigured());
    });

    test("should not throw error in development when both are missing", async () => {
      process.env.NODE_ENV = "development";
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;
      const { assertDistributedRateLimitStorageConfigured } = await import("../../api/lib/rate-limit-config.js");
      assert.doesNotThrow(() => assertDistributedRateLimitStorageConfigured());
    });

    test("should not throw error in test when both are missing", async () => {
      process.env.NODE_ENV = "test";
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;
      const { assertDistributedRateLimitStorageConfigured } = await import("../../api/lib/rate-limit-config.js");
      assert.doesNotThrow(() => assertDistributedRateLimitStorageConfigured());
    });

    test("should not throw error when NODE_ENV is not set", async () => {
      delete process.env.NODE_ENV;
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;
      const { assertDistributedRateLimitStorageConfigured } = await import("../../api/lib/rate-limit-config.js");
      assert.doesNotThrow(() => assertDistributedRateLimitStorageConfigured());
    });
  });

  describe("isInMemoryRateLimitStorageAllowed", () => {
    test("should return true in development mode", async () => {
      process.env.NODE_ENV = "development";
      const { isInMemoryRateLimitStorageAllowed } = await import("../../api/lib/rate-limit-config.js");
      assert.strictEqual(isInMemoryRateLimitStorageAllowed(), true);
    });

    test("should return true in test mode", async () => {
      process.env.NODE_ENV = "test";
      const { isInMemoryRateLimitStorageAllowed } = await import("../../api/lib/rate-limit-config.js");
      assert.strictEqual(isInMemoryRateLimitStorageAllowed(), true);
    });

    test("should return false in production mode", async () => {
      process.env.NODE_ENV = "production";
      const { isInMemoryRateLimitStorageAllowed } = await import("../../api/lib/rate-limit-config.js");
      assert.strictEqual(isInMemoryRateLimitStorageAllowed(), false);
    });

    test("should return true when NODE_ENV is not set", async () => {
      delete process.env.NODE_ENV;
      const { isInMemoryRateLimitStorageAllowed } = await import("../../api/lib/rate-limit-config.js");
      assert.strictEqual(isInMemoryRateLimitStorageAllowed(), true);
    });
  });

  describe("Development workflow compatibility", () => {
    test("should allow in-memory storage in development without KV credentials", async () => {
      process.env.NODE_ENV = "development";
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;
      
      const { isInMemoryRateLimitStorageAllowed, isDistributedRateLimitStorageConfigured } = await import("../../api/lib/rate-limit-config.js");
      
      assert.strictEqual(isInMemoryRateLimitStorageAllowed(), true);
      assert.strictEqual(isDistributedRateLimitStorageConfigured(), false);
    });

    test("should allow in-memory storage in test mode without KV credentials", async () => {
      process.env.NODE_ENV = "test";
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;
      
      const { isInMemoryRateLimitStorageAllowed, isDistributedRateLimitStorageConfigured } = await import("../../api/lib/rate-limit-config.js");
      
      assert.strictEqual(isInMemoryRateLimitStorageAllowed(), true);
      assert.strictEqual(isDistributedRateLimitStorageConfigured(), false);
    });
  });
});
