import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert";

describe("Session Validation Failure Modes", () => {
  const originalEnv = process.env;
  const originalNodeEnv = process.env.NODE_ENV;
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.NODE_ENV = "test";
    delete process.env.SESSION_VALIDATION_FAIL_MODE;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    delete process.env.RATE_LIMIT_REDIS_URL;
    delete process.env.JWT_SECRET;
    process.env.JWT_SECRET = "test-secret-key-for-testing";
  });

  afterEach(() => {
    process.env = originalEnv;
    process.env.NODE_ENV = originalNodeEnv;
    global.fetch = originalFetch;
  });

  describe("getSessionValidationFailMode", () => {
    test("should return 'fallback' when SESSION_VALIDATION_FAIL_MODE is not set", async () => {
      const { getSessionValidationFailMode } = await import("../../middleware/index.js");
      assert.strictEqual(getSessionValidationFailMode(), "fallback");
    });

    test("should return 'fallback' when SESSION_VALIDATION_FAIL_MODE is set to 'fallback'", async () => {
      process.env.SESSION_VALIDATION_FAIL_MODE = "fallback";
      const { getSessionValidationFailMode } = await import("../../middleware/index.js");
      assert.strictEqual(getSessionValidationFailMode(), "fallback");
    });

    test("should return 'open' when SESSION_VALIDATION_FAIL_MODE is set to 'open'", async () => {
      process.env.SESSION_VALIDATION_FAIL_MODE = "open";
      const { getSessionValidationFailMode } = await import("../../middleware/index.js");
      assert.strictEqual(getSessionValidationFailMode(), "open");
    });

    test("should return 'closed' when SESSION_VALIDATION_FAIL_MODE is set to 'closed'", async () => {
      process.env.SESSION_VALIDATION_FAIL_MODE = "closed";
      const { getSessionValidationFailMode } = await import("../../middleware/index.js");
      assert.strictEqual(getSessionValidationFailMode(), "closed");
    });

    test("should be case-insensitive and return 'open' for 'OPEN'", async () => {
      process.env.SESSION_VALIDATION_FAIL_MODE = "OPEN";
      const { getSessionValidationFailMode } = await import("../../middleware/index.js");
      assert.strictEqual(getSessionValidationFailMode(), "open");
    });

    test("should return 'fallback' for invalid values and log warning", async () => {
      process.env.SESSION_VALIDATION_FAIL_MODE = "invalid";
      const { getSessionValidationFailMode } = await import("../../middleware/index.js");
      assert.strictEqual(getSessionValidationFailMode(), "fallback");
    });

    test("should return 'fallback' for empty string", async () => {
      process.env.SESSION_VALIDATION_FAIL_MODE = "";
      const { getSessionValidationFailMode } = await import("../../middleware/index.js");
      assert.strictEqual(getSessionValidationFailMode(), "fallback");
    });
  });

  describe("performFallbackValidation", () => {
    test("should return true for valid JWT", async () => {
      const { performFallbackValidation } = await import("../../middleware/index.js");
      const { signJwt } = await import("../../middleware/jwt.js");

      const payload = { userId: "test-user", sessionId: "test-session" };
      const token = await signJwt(payload, process.env.JWT_SECRET);

      const result = await performFallbackValidation(token, process.env.JWT_SECRET);
      assert.strictEqual(result, true);
    });

    test("should return false for invalid JWT", async () => {
      const { performFallbackValidation } = await import("../../middleware/index.js");

      const result = await performFallbackValidation("invalid-token", process.env.JWT_SECRET);
      assert.strictEqual(result, false);
    });

    test("should return false for malformed JWT", async () => {
      const { performFallbackValidation } = await import("../../middleware/index.js");

      const result = await performFallbackValidation("not.a.valid.jwt", process.env.JWT_SECRET);
      assert.strictEqual(result, false);
    });

    test("should return false for JWT with wrong secret", async () => {
      const { performFallbackValidation } = await import("../../middleware/index.js");
      const { signJwt } = await import("../../middleware/jwt.js");

      const payload = { userId: "test-user", sessionId: "test-session" };
      const token = await signJwt(payload, "different-secret");

      const result = await performFallbackValidation(token, process.env.JWT_SECRET);
      assert.strictEqual(result, false);
    });
  });

  describe("getSessionRiskState - KV operational", () => {
    test("should return 'active' when KV is available and session is active", async () => {
      process.env.KV_REST_API_URL = "https://api.kv.example.com";
      process.env.KV_REST_API_TOKEN = "test-token";
      process.env.RATE_LIMIT_REDIS_URL = "redis://localhost:6379";

      global.fetch = async () => ({
        ok: true,
        json: async () => ({
          result: JSON.stringify({ status: "active", lastActive: Date.now() }),
        }),
      });

      const { getSessionRiskState } = await import("../../middleware/index.js");
      const { signJwt } = await import("../../middleware/jwt.js");

      const payload = { userId: "test-user", sessionId: "test-session" };
      const token = await signJwt(payload, process.env.JWT_SECRET);

      const result = await getSessionRiskState("test-session", token, process.env.JWT_SECRET);
      assert.strictEqual(result, "active");
    });

    test("should return 'invalidated' when KV shows session as invalidated", async () => {
      process.env.KV_REST_API_URL = "https://api.kv.example.com";
      process.env.KV_REST_API_TOKEN = "test-token";
      process.env.RATE_LIMIT_REDIS_URL = "redis://localhost:6379";

      global.fetch = async () => ({
        ok: true,
        json: async () => ({ result: null }),
      });

      const { getSessionRiskState } = await import("../../middleware/index.js");
      const { signJwt } = await import("../../middleware/jwt.js");

      const payload = { userId: "test-user", sessionId: "test-session" };
      const token = await signJwt(payload, process.env.JWT_SECRET);

      const result = await getSessionRiskState("test-session", token, process.env.JWT_SECRET);
      assert.strictEqual(result, "invalidated");
    });

    test("should return 'requires_reauth' when session inactivity exceeded", async () => {
      process.env.KV_REST_API_URL = "https://api.kv.example.com";
      process.env.KV_REST_API_TOKEN = "test-token";
      process.env.RATE_LIMIT_REDIS_URL = "redis://localhost:6379";

      const threeHoursAgo = Date.now() - 3 * 60 * 60 * 1000;
      global.fetch = async () => ({
        ok: true,
        json: async () => ({
          result: JSON.stringify({ status: "active", lastActive: threeHoursAgo }),
        }),
      });

      const { getSessionRiskState } = await import("../../middleware/index.js");
      const { signJwt } = await import("../../middleware/jwt.js");

      const payload = { userId: "test-user", sessionId: "test-session" };
      const token = await signJwt(payload, process.env.JWT_SECRET);

      const result = await getSessionRiskState("test-session", token, process.env.JWT_SECRET);
      assert.strictEqual(result, "requires_reauth");
    });
  });

  describe("getSessionRiskState - Missing KV configuration", () => {
    test("fallback mode: should accept valid JWT when KV config missing", async () => {
      process.env.NODE_ENV = "production";
      process.env.SESSION_VALIDATION_FAIL_MODE = "fallback";
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;
      process.env.RATE_LIMIT_REDIS_URL = "redis://localhost:6379";

      const { getSessionRiskState } = await import("../../middleware/index.js");
      const { signJwt } = await import("../../middleware/jwt.js");

      const payload = { userId: "test-user", sessionId: "test-session" };
      const token = await signJwt(payload, process.env.JWT_SECRET);

      const result = await getSessionRiskState("test-session", token, process.env.JWT_SECRET);
      assert.strictEqual(result, "fallback_active");
    });

    test("fallback mode: should reject invalid JWT when KV config missing", async () => {
      process.env.NODE_ENV = "production";
      process.env.SESSION_VALIDATION_FAIL_MODE = "fallback";
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;
      process.env.RATE_LIMIT_REDIS_URL = "redis://localhost:6379";

      const { getSessionRiskState } = await import("../../middleware/index.js");

      const result = await getSessionRiskState(
        "test-session",
        "invalid-token",
        process.env.JWT_SECRET
      );
      assert.strictEqual(result, "requires_reauth");
    });

    test("open mode: should accept valid JWT when KV config missing", async () => {
      process.env.NODE_ENV = "production";
      process.env.SESSION_VALIDATION_FAIL_MODE = "open";
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;
      process.env.RATE_LIMIT_REDIS_URL = "redis://localhost:6379";

      const { getSessionRiskState } = await import("../../middleware/index.js");
      const { signJwt } = await import("../../middleware/jwt.js");

      const payload = { userId: "test-user", sessionId: "test-session" };
      const token = await signJwt(payload, process.env.JWT_SECRET);

      const result = await getSessionRiskState("test-session", token, process.env.JWT_SECRET);
      assert.strictEqual(result, "fallback_active");
    });

    test("closed mode: should require reauth when KV config missing", async () => {
      process.env.NODE_ENV = "production";
      process.env.SESSION_VALIDATION_FAIL_MODE = "closed";
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;
      process.env.RATE_LIMIT_REDIS_URL = "redis://localhost:6379";

      const { getSessionRiskState } = await import("../../middleware/index.js");
      const { signJwt } = await import("../../middleware/jwt.js");

      const payload = { userId: "test-user", sessionId: "test-session" };
      const token = await signJwt(payload, process.env.JWT_SECRET);

      const result = await getSessionRiskState("test-session", token, process.env.JWT_SECRET);
      assert.strictEqual(result, "requires_reauth");
    });

    test("default mode (fallback): should accept valid JWT when KV config missing", async () => {
      process.env.NODE_ENV = "production";
      delete process.env.SESSION_VALIDATION_FAIL_MODE;
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;
      process.env.RATE_LIMIT_REDIS_URL = "redis://localhost:6379";

      const { getSessionRiskState } = await import("../../middleware/index.js");
      const { signJwt } = await import("../../middleware/jwt.js");

      const payload = { userId: "test-user", sessionId: "test-session" };
      const token = await signJwt(payload, process.env.JWT_SECRET);

      const result = await getSessionRiskState("test-session", token, process.env.JWT_SECRET);
      assert.strictEqual(result, "fallback_active");
    });
  });

  describe("getSessionRiskState - KV network failure", () => {
    test("fallback mode: should accept valid JWT on KV network failure", async () => {
      process.env.NODE_ENV = "production";
      process.env.SESSION_VALIDATION_FAIL_MODE = "fallback";
      process.env.KV_REST_API_URL = "https://api.kv.example.com";
      process.env.KV_REST_API_TOKEN = "test-token";
      process.env.RATE_LIMIT_REDIS_URL = "redis://localhost:6379";

      global.fetch = async () => ({
        ok: false,
        status: 503,
      });

      const { getSessionRiskState } = await import("../../middleware/index.js");
      const { signJwt } = await import("../../middleware/jwt.js");

      const payload = { userId: "test-user", sessionId: "test-session" };
      const token = await signJwt(payload, process.env.JWT_SECRET);

      const result = await getSessionRiskState("test-session", token, process.env.JWT_SECRET);
      assert.strictEqual(result, "fallback_active");
    });

    test("fallback mode: should reject invalid JWT on KV network failure", async () => {
      process.env.NODE_ENV = "production";
      process.env.SESSION_VALIDATION_FAIL_MODE = "fallback";
      process.env.KV_REST_API_URL = "https://api.kv.example.com";
      process.env.KV_REST_API_TOKEN = "test-token";
      process.env.RATE_LIMIT_REDIS_URL = "redis://localhost:6379";

      global.fetch = async () => ({
        ok: false,
        status: 503,
      });

      const { getSessionRiskState } = await import("../../middleware/index.js");

      const result = await getSessionRiskState(
        "test-session",
        "invalid-token",
        process.env.JWT_SECRET
      );
      assert.strictEqual(result, "requires_reauth");
    });

    test("open mode: should accept valid JWT on KV network failure", async () => {
      process.env.NODE_ENV = "production";
      process.env.SESSION_VALIDATION_FAIL_MODE = "open";
      process.env.KV_REST_API_URL = "https://api.kv.example.com";
      process.env.KV_REST_API_TOKEN = "test-token";
      process.env.RATE_LIMIT_REDIS_URL = "redis://localhost:6379";

      global.fetch = async () => ({
        ok: false,
        status: 503,
      });

      const { getSessionRiskState } = await import("../../middleware/index.js");
      const { signJwt } = await import("../../middleware/jwt.js");

      const payload = { userId: "test-user", sessionId: "test-session" };
      const token = await signJwt(payload, process.env.JWT_SECRET);

      const result = await getSessionRiskState("test-session", token, process.env.JWT_SECRET);
      assert.strictEqual(result, "fallback_active");
    });

    test("closed mode: should require reauth on KV network failure", async () => {
      process.env.NODE_ENV = "production";
      process.env.SESSION_VALIDATION_FAIL_MODE = "closed";
      process.env.KV_REST_API_URL = "https://api.kv.example.com";
      process.env.KV_REST_API_TOKEN = "test-token";
      process.env.RATE_LIMIT_REDIS_URL = "redis://localhost:6379";

      global.fetch = async () => ({
        ok: false,
        status: 503,
      });

      const { getSessionRiskState } = await import("../../middleware/index.js");
      const { signJwt } = await import("../../middleware/jwt.js");

      const payload = { userId: "test-user", sessionId: "test-session" };
      const token = await signJwt(payload, process.env.JWT_SECRET);

      const result = await getSessionRiskState("test-session", token, process.env.JWT_SECRET);
      assert.strictEqual(result, "requires_reauth");
    });
  });

  describe("getSessionRiskState - KV communication error", () => {
    test("fallback mode: should accept valid JWT on KV communication error", async () => {
      process.env.NODE_ENV = "production";
      process.env.SESSION_VALIDATION_FAIL_MODE = "fallback";
      process.env.KV_REST_API_URL = "https://api.kv.example.com";
      process.env.KV_REST_API_TOKEN = "test-token";
      process.env.RATE_LIMIT_REDIS_URL = "redis://localhost:6379";

      global.fetch = async () => {
        throw new Error("Network timeout");
      };

      const { getSessionRiskState } = await import("../../middleware/index.js");
      const { signJwt } = await import("../../middleware/jwt.js");

      const payload = { userId: "test-user", sessionId: "test-session" };
      const token = await signJwt(payload, process.env.JWT_SECRET);

      const result = await getSessionRiskState("test-session", token, process.env.JWT_SECRET);
      assert.strictEqual(result, "fallback_active");
    });

    test("fallback mode: should reject invalid JWT on KV communication error", async () => {
      process.env.NODE_ENV = "production";
      process.env.SESSION_VALIDATION_FAIL_MODE = "fallback";
      process.env.KV_REST_API_URL = "https://api.kv.example.com";
      process.env.KV_REST_API_TOKEN = "test-token";
      process.env.RATE_LIMIT_REDIS_URL = "redis://localhost:6379";

      global.fetch = async () => {
        throw new Error("Network timeout");
      };

      const { getSessionRiskState } = await import("../../middleware/index.js");

      const result = await getSessionRiskState(
        "test-session",
        "invalid-token",
        process.env.JWT_SECRET
      );
      assert.strictEqual(result, "requires_reauth");
    });

    test("open mode: should accept valid JWT on KV communication error", async () => {
      process.env.NODE_ENV = "production";
      process.env.SESSION_VALIDATION_FAIL_MODE = "open";
      process.env.KV_REST_API_URL = "https://api.kv.example.com";
      process.env.KV_REST_API_TOKEN = "test-token";
      process.env.RATE_LIMIT_REDIS_URL = "redis://localhost:6379";

      global.fetch = async () => {
        throw new Error("Network timeout");
      };

      const { getSessionRiskState } = await import("../../middleware/index.js");
      const { signJwt } = await import("../../middleware/jwt.js");

      const payload = { userId: "test-user", sessionId: "test-session" };
      const token = await signJwt(payload, process.env.JWT_SECRET);

      const result = await getSessionRiskState("test-session", token, process.env.JWT_SECRET);
      assert.strictEqual(result, "fallback_active");
    });

    test("closed mode: should require reauth on KV communication error", async () => {
      process.env.NODE_ENV = "production";
      process.env.SESSION_VALIDATION_FAIL_MODE = "closed";
      process.env.KV_REST_API_URL = "https://api.kv.example.com";
      process.env.KV_REST_API_TOKEN = "test-token";
      process.env.RATE_LIMIT_REDIS_URL = "redis://localhost:6379";

      global.fetch = async () => {
        throw new Error("Network timeout");
      };

      const { getSessionRiskState } = await import("../../middleware/index.js");
      const { signJwt } = await import("../../middleware/jwt.js");

      const payload = { userId: "test-user", sessionId: "test-session" };
      const token = await signJwt(payload, process.env.JWT_SECRET);

      const result = await getSessionRiskState("test-session", token, process.env.JWT_SECRET);
      assert.strictEqual(result, "requires_reauth");
    });
  });

  describe("getSessionRiskState - Development mode", () => {
    test("should return 'active' in development without KV config", async () => {
      process.env.NODE_ENV = "development";
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;
      delete process.env.RATE_LIMIT_REDIS_URL;

      const { getSessionRiskState } = await import("../../middleware/index.js");
      const { signJwt } = await import("../../middleware/jwt.js");

      const payload = { userId: "test-user", sessionId: "test-session" };
      const token = await signJwt(payload, process.env.JWT_SECRET);

      const result = await getSessionRiskState("test-session", token, process.env.JWT_SECRET);
      assert.strictEqual(result, "active");
    });

    test("should return 'active' in development on KV failure", async () => {
      process.env.NODE_ENV = "development";
      process.env.KV_REST_API_URL = "https://api.kv.example.com";
      process.env.KV_REST_API_TOKEN = "test-token";
      process.env.RATE_LIMIT_REDIS_URL = "redis://localhost:6379";

      global.fetch = async () => ({
        ok: false,
        status: 503,
      });

      const { getSessionRiskState } = await import("../../middleware/index.js");
      const { signJwt } = await import("../../middleware/jwt.js");

      const payload = { userId: "test-user", sessionId: "test-session" };
      const token = await signJwt(payload, process.env.JWT_SECRET);

      const result = await getSessionRiskState("test-session", token, process.env.JWT_SECRET);
      assert.strictEqual(result, "active");
    });
  });

  describe("Security - JWT verification never bypassed", () => {
    test("should never accept invalid JWT even in open mode", async () => {
      process.env.NODE_ENV = "production";
      process.env.SESSION_VALIDATION_FAIL_MODE = "open";
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;
      process.env.RATE_LIMIT_REDIS_URL = "redis://localhost:6379";

      const { getSessionRiskState } = await import("../../middleware/index.js");

      const result = await getSessionRiskState(
        "test-session",
        "completely-invalid-jwt",
        process.env.JWT_SECRET
      );
      // Even in open mode, invalid JWT should be rejected
      assert.strictEqual(result, "requires_reauth");
    });

    test("should never accept expired JWT", async () => {
      process.env.NODE_ENV = "production";
      process.env.SESSION_VALIDATION_FAIL_MODE = "open";
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;
      process.env.RATE_LIMIT_REDIS_URL = "redis://localhost:6379";

      const { getSessionRiskState } = await import("../../middleware/index.js");
      const { signJwt } = await import("../../middleware/jwt.js");

      // Create an expired JWT (expires in -1 hour)
      const payload = {
        userId: "test-user",
        sessionId: "test-session",
        exp: Math.floor(Date.now() / 1000) - 3600,
      };
      const token = await signJwt(payload, process.env.JWT_SECRET);

      const result = await getSessionRiskState("test-session", token, process.env.JWT_SECRET);
      assert.strictEqual(result, "requires_reauth");
    });
  });
});
