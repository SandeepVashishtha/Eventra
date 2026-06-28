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
    test("should return false when RATE_LIMIT_REDIS_URL is missing", async () => {
      delete process.env.RATE_LIMIT_REDIS_URL;
      const { isDistributedRateLimitStorageConfigured } = await import("../../api/_lib/rate-limit-config.js");
      assert.strictEqual(isDistributedRateLimitStorageConfigured(), false);
    });

    test("should return false when RATE_LIMIT_REDIS_URL is empty", async () => {
      process.env.RATE_LIMIT_REDIS_URL = "";
      const { isDistributedRateLimitStorageConfigured } = await import("../../api/_lib/rate-limit-config.js");
      assert.strictEqual(isDistributedRateLimitStorageConfigured(), false);
    });

    test("should return false when RATE_LIMIT_REDIS_URL is whitespace-only", async () => {
      process.env.RATE_LIMIT_REDIS_URL = "   ";
      const { isDistributedRateLimitStorageConfigured } = await import("../../api/_lib/rate-limit-config.js");
      assert.strictEqual(isDistributedRateLimitStorageConfigured(), false);
    });

    test("should return true when RATE_LIMIT_REDIS_URL is present and non-empty", async () => {
      process.env.RATE_LIMIT_REDIS_URL = "redis://user:password@localhost:6379";
      const { isDistributedRateLimitStorageConfigured } = await import("../../api/_lib/rate-limit-config.js");
      assert.strictEqual(isDistributedRateLimitStorageConfigured(), true);
    });

    test("should return true with rediss:// URL", async () => {
      process.env.RATE_LIMIT_REDIS_URL = "rediss://user:password@localhost:6379";
      const { isDistributedRateLimitStorageConfigured } = await import("../../api/_lib/rate-limit-config.js");
      assert.strictEqual(isDistributedRateLimitStorageConfigured(), true);
    });
  });

  describe("assertDistributedRateLimitStorageConfigured", () => {
    test("should throw error in production when RATE_LIMIT_REDIS_URL is missing", async () => {
      process.env.NODE_ENV = "production";
      delete process.env.RATE_LIMIT_REDIS_URL;
      const { assertDistributedRateLimitStorageConfigured } = await import("../../api/_lib/rate-limit-config.js");
      assert.throws(
        () => assertDistributedRateLimitStorageConfigured(),
        /RATE_LIMIT_REDIS_URL is required in production/
      );
    });

    test("should throw error in production when RATE_LIMIT_REDIS_URL is empty", async () => {
      process.env.NODE_ENV = "production";
      process.env.RATE_LIMIT_REDIS_URL = "";
      const { assertDistributedRateLimitStorageConfigured } = await import("../../api/_lib/rate-limit-config.js");
      assert.throws(
        () => assertDistributedRateLimitStorageConfigured(),
        /RATE_LIMIT_REDIS_URL is required in production/
      );
    });

    test("should not throw error in production when RATE_LIMIT_REDIS_URL is valid", async () => {
      process.env.NODE_ENV = "production";
      process.env.RATE_LIMIT_REDIS_URL = "redis://user:password@localhost:6379";
      const { assertDistributedRateLimitStorageConfigured } = await import("../../api/_lib/rate-limit-config.js");
      assert.doesNotThrow(() => assertDistributedRateLimitStorageConfigured());
    });

    test("should not throw error in development when RATE_LIMIT_REDIS_URL is missing", async () => {
      process.env.NODE_ENV = "development";
      delete process.env.RATE_LIMIT_REDIS_URL;
      const { assertDistributedRateLimitStorageConfigured } = await import("../../api/_lib/rate-limit-config.js");
      assert.doesNotThrow(() => assertDistributedRateLimitStorageConfigured());
    });

    test("should not throw error in test when RATE_LIMIT_REDIS_URL is missing", async () => {
      process.env.NODE_ENV = "test";
      delete process.env.RATE_LIMIT_REDIS_URL;
      const { assertDistributedRateLimitStorageConfigured } = await import("../../api/_lib/rate-limit-config.js");
      assert.doesNotThrow(() => assertDistributedRateLimitStorageConfigured());
    });

    test("should not throw error when NODE_ENV is not set", async () => {
      delete process.env.NODE_ENV;
      delete process.env.RATE_LIMIT_REDIS_URL;
      const { assertDistributedRateLimitStorageConfigured } = await import("../../api/_lib/rate-limit-config.js");
      assert.doesNotThrow(() => assertDistributedRateLimitStorageConfigured());
    });
  });

  describe("isInMemoryRateLimitStorageAllowed", () => {
    test("should return true in development mode", async () => {
      process.env.NODE_ENV = "development";
      const { isInMemoryRateLimitStorageAllowed } = await import("../../api/_lib/rate-limit-config.js");
      assert.strictEqual(isInMemoryRateLimitStorageAllowed(), true);
    });

    test("should return true in test mode", async () => {
      process.env.NODE_ENV = "test";
      const { isInMemoryRateLimitStorageAllowed } = await import("../../api/_lib/rate-limit-config.js");
      assert.strictEqual(isInMemoryRateLimitStorageAllowed(), true);
    });

    test("should return false in production mode", async () => {
      process.env.NODE_ENV = "production";
      const { isInMemoryRateLimitStorageAllowed } = await import("../../api/_lib/rate-limit-config.js");
      assert.strictEqual(isInMemoryRateLimitStorageAllowed(), false);
    });

    test("should return true when NODE_ENV is not set", async () => {
      delete process.env.NODE_ENV;
      const { isInMemoryRateLimitStorageAllowed } = await import("../../api/_lib/rate-limit-config.js");
      assert.strictEqual(isInMemoryRateLimitStorageAllowed(), true);
    });
  });

  describe("Development workflow compatibility", () => {
    test("should allow in-memory storage in development without RATE_LIMIT_REDIS_URL", async () => {
      process.env.NODE_ENV = "development";
      delete process.env.RATE_LIMIT_REDIS_URL;
      
      const { isInMemoryRateLimitStorageAllowed, isDistributedRateLimitStorageConfigured } = await import("../../api/_lib/rate-limit-config.js");
      
      assert.strictEqual(isInMemoryRateLimitStorageAllowed(), true);
      assert.strictEqual(isDistributedRateLimitStorageConfigured(), false);
    });

    test("should allow in-memory storage in test mode without RATE_LIMIT_REDIS_URL", async () => {
      process.env.NODE_ENV = "test";
      delete process.env.RATE_LIMIT_REDIS_URL;
      
      const { isInMemoryRateLimitStorageAllowed, isDistributedRateLimitStorageConfigured } = await import("../../api/_lib/rate-limit-config.js");
      
      assert.strictEqual(isInMemoryRateLimitStorageAllowed(), true);
      assert.strictEqual(isDistributedRateLimitStorageConfigured(), false);
    });
  });
});
