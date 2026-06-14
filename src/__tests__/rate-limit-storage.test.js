import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert";

describe("Rate-Limit Storage (In-Memory)", () => {
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

  describe("incrementWithExpiration", () => {
    test("should increment counter for new key", async () => {
      const { incrementWithExpiration } = await import("../../api/lib/rate-limit-storage.js");
      const result = await incrementWithExpiration("test-key", 60000);
      assert.strictEqual(result.count, 1);
      assert.ok(result.ttl > 0);
    });

    test("should increment counter for existing key within window", async () => {
      const { incrementWithExpiration } = await import("../../api/lib/rate-limit-storage.js");
      await incrementWithExpiration("test-key", 60000);
      const result = await incrementWithExpiration("test-key", 60000);
      assert.strictEqual(result.count, 2);
    });

    test("should reset counter after window expires", async () => {
      const { incrementWithExpiration } = await import("../../api/lib/rate-limit-storage.js");
      await incrementWithExpiration("test-key", 100); // 100ms window
      await new Promise(resolve => setTimeout(resolve, 150)); // Wait for expiration
      const result = await incrementWithExpiration("test-key", 100);
      assert.strictEqual(result.count, 1);
    });

    test("should handle multiple keys independently", async () => {
      const { incrementWithExpiration } = await import("../../api/lib/rate-limit-storage.js");
      const result1 = await incrementWithExpiration("key1", 60000);
      const result2 = await incrementWithExpiration("key2", 60000);
      assert.strictEqual(result1.count, 1);
      assert.strictEqual(result2.count, 1);
    });

    test("should return remaining TTL", async () => {
      const { incrementWithExpiration } = await import("../../api/lib/rate-limit-storage.js");
      const windowMs = 60000;
      const result = await incrementWithExpiration("test-key", windowMs);
      assert.ok(result.ttl > 0);
      assert.ok(result.ttl <= windowMs);
    });
  });

  describe("resetKey", () => {
    test("should reset a specific key", async () => {
      const { incrementWithExpiration, resetKey } = await import("../../api/lib/rate-limit-storage.js");
      await incrementWithExpiration("test-key", 60000);
      await incrementWithExpiration("test-key", 60000);
      await resetKey("test-key");
      const result = await incrementWithExpiration("test-key", 60000);
      assert.strictEqual(result.count, 1);
    });

    test("should handle resetting non-existent key", async () => {
      const { resetKey, incrementWithExpiration } = await import("../../api/lib/rate-limit-storage.js");
      await assert.doesNotReject(resetKey("non-existent-key"));
      const result = await incrementWithExpiration("non-existent-key", 60000);
      assert.strictEqual(result.count, 1);
    });
  });

  describe("clearAll", () => {
    test("should clear all keys", async () => {
      const { incrementWithExpiration, clearAll } = await import("../../api/lib/rate-limit-storage.js");
      await incrementWithExpiration("key1", 60000);
      await incrementWithExpiration("key2", 60000);
      await incrementWithExpiration("key3", 60000);
      await clearAll();
      const result1 = await incrementWithExpiration("key1", 60000);
      const result2 = await incrementWithExpiration("key2", 60000);
      const result3 = await incrementWithExpiration("key3", 60000);
      assert.strictEqual(result1.count, 1);
      assert.strictEqual(result2.count, 1);
      assert.strictEqual(result3.count, 1);
    });
  });

  describe("Concurrent requests", () => {
    test("should handle concurrent increments correctly", async () => {
      const { incrementWithExpiration, resetKey } = await import("../../api/lib/rate-limit-storage.js");
      const key = "concurrent-key";
      
      // Make 10 concurrent requests
      const promises = Array(10).fill(null).map(() => incrementWithExpiration(key, 60000));
      const results = await Promise.all(promises);
      
      // All should succeed with counts 1-10
      const counts = results.map(r => r.count);
      assert.ok(counts.includes(1));
      assert.ok(counts.includes(2));
      assert.ok(counts.includes(3));
      assert.ok(counts.includes(4));
      assert.ok(counts.includes(5));
      assert.ok(counts.includes(6));
      assert.ok(counts.includes(7));
      assert.ok(counts.includes(8));
      assert.ok(counts.includes(9));
      assert.ok(counts.includes(10));
      
      await resetKey(key);
    });
  });
});

describe("Rate-Limit Storage (Production Fail-Closed)", () => {
  const originalEnv = process.env;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
  });

  afterEach(() => {
    process.env = originalEnv;
    process.env.NODE_ENV = originalNodeEnv;
  });

  test("should throw error in production without distributed storage", async () => {
    process.env.NODE_ENV = "production";
    const { incrementWithExpiration } = await import("../../api/lib/rate-limit-storage.js");
    await assert.rejects(
      incrementWithExpiration("test-key", 60000),
      /Distributed rate-limit storage is required in production/
    );
  });

  test("should allow in-memory storage in development without distributed storage", async () => {
    process.env.NODE_ENV = "development";
    const { incrementWithExpiration } = await import("../../api/lib/rate-limit-storage.js");
    const result = await incrementWithExpiration("test-key", 60000);
    assert.strictEqual(result.count, 1);
  });

  test("should allow in-memory storage in test without distributed storage", async () => {
    process.env.NODE_ENV = "test";
    const { incrementWithExpiration, clearAll } = await import("../../api/lib/rate-limit-storage.js");
    await clearAll(); // Clear any existing state
    const result = await incrementWithExpiration("test-key", 60000);
    assert.strictEqual(result.count, 1);
  });
});
