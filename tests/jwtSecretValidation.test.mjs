/**
 * Security tests for JWT secret validation in api/auth/jwt-config.js
 * 
 * These tests verify that getJwtSecret() enforces fail-closed security:
 * - Missing JWT_SECRET throws error
 * - Empty JWT_SECRET throws error
 * - Whitespace-only JWT_SECRET throws error
 * - Valid JWT_SECRET works
 */

import { strict as assert } from "node:assert";
import { describe, it, before, after } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("JWT Secret Validation - Fail-Closed Security", () => {
  const originalJwtSecret = process.env.JWT_SECRET;

  after(() => {
    // Restore original JWT_SECRET after all tests
    if (originalJwtSecret !== undefined) {
      process.env.JWT_SECRET = originalJwtSecret;
    } else {
      delete process.env.JWT_SECRET;
    }
  });

  describe("getJwtSecret() rejects invalid configurations", () => {
    it("throws error when JWT_SECRET is missing", async () => {
      delete process.env.JWT_SECRET;
      
      // Dynamic import to get fresh module state
      const jwtConfigPath = pathToFileURL(path.resolve(__dirname, "../api/auth/jwt-config.js")).href;
      const { getJwtSecret } = await import(jwtConfigPath);
      
      assert.throws(
        () => getJwtSecret(),
        {
          message: /JWT_SECRET environment variable is required/
        },
        "Expected getJwtSecret to throw when JWT_SECRET is missing"
      );
    });

    it("throws error when JWT_SECRET is empty string", async () => {
      process.env.JWT_SECRET = "";
      
      // Dynamic import to get fresh module state
      const jwtConfigPath = pathToFileURL(path.resolve(__dirname, "../api/auth/jwt-config.js")).href;
      const { getJwtSecret } = await import(jwtConfigPath);
      
      assert.throws(
        () => getJwtSecret(),
        {
          message: /JWT_SECRET environment variable is required/
        },
        "Expected getJwtSecret to throw when JWT_SECRET is empty"
      );
    });

    it("throws error when JWT_SECRET is whitespace-only", async () => {
      process.env.JWT_SECRET = "   ";
      
      // Dynamic import to get fresh module state
      const jwtConfigPath = pathToFileURL(path.resolve(__dirname, "../api/auth/jwt-config.js")).href;
      const { getJwtSecret } = await import(jwtConfigPath);
      
      assert.throws(
        () => getJwtSecret(),
        {
          message: /JWT_SECRET environment variable is required/
        },
        "Expected getJwtSecret to throw when JWT_SECRET is whitespace-only"
      );
    });

    it("throws error when JWT_SECRET is tabs-only", async () => {
      process.env.JWT_SECRET = "\t\t";
      
      // Dynamic import to get fresh module state
      const jwtConfigPath = pathToFileURL(path.resolve(__dirname, "../api/auth/jwt-config.js")).href;
      const { getJwtSecret } = await import(jwtConfigPath);
      
      assert.throws(
        () => getJwtSecret(),
        {
          message: /JWT_SECRET environment variable is required/
        },
        "Expected getJwtSecret to throw when JWT_SECRET is tabs-only"
      );
    });
  });

  describe("getJwtSecret() accepts valid configurations", () => {
    it("returns secret when JWT_SECRET is valid", async () => {
      const testSecret = "test-secret-key-12345";
      process.env.JWT_SECRET = testSecret;
      
      // Dynamic import to get fresh module state
      const jwtConfigPath = pathToFileURL(path.resolve(__dirname, "../api/auth/jwt-config.js")).href;
      const { getJwtSecret } = await import(jwtConfigPath);
      
      const result = getJwtSecret();
      assert.strictEqual(
        result,
        testSecret,
        "Expected getJwtSecret to return the valid JWT_SECRET"
      );
    });

    it("returns secret as-is when JWT_SECRET has surrounding whitespace (validation only)", async () => {
      const testSecret = "test-secret-key-12345";
      process.env.JWT_SECRET = `  ${testSecret}  `;
      
      // Dynamic import to get fresh module state
      const jwtConfigPath = pathToFileURL(path.resolve(__dirname, "../api/auth/jwt-config.js")).href;
      const { getJwtSecret } = await import(jwtConfigPath);
      
      const result = getJwtSecret();
      // The implementation validates but doesn't trim - returns the value as-is
      assert.strictEqual(
        result,
        `  ${testSecret}  `,
        "Expected getJwtSecret to return JWT_SECRET as-is (validation only, no trimming)"
      );
    });

    it("returns secret when JWT_SECRET is a long secure string", async () => {
      // Simulate a real secure secret (32 bytes base64 encoded)
      const testSecret = "a".repeat(43) + "=="; // 32 bytes base64
      process.env.JWT_SECRET = testSecret;
      
      // Dynamic import to get fresh module state
      const jwtConfigPath = pathToFileURL(path.resolve(__dirname, "../api/auth/jwt-config.js")).href;
      const { getJwtSecret } = await import(jwtConfigPath);
      
      const result = getJwtSecret();
      assert.strictEqual(
        result,
        testSecret,
        "Expected getJwtSecret to return long secure JWT_SECRET"
      );
    });
  });

  describe("Error message includes guidance", () => {
    it("error message includes openssl command for generating secrets", async () => {
      delete process.env.JWT_SECRET;
      
      // Dynamic import to get fresh module state
      const jwtConfigPath = pathToFileURL(path.resolve(__dirname, "../api/auth/jwt-config.js")).href;
      const { getJwtSecret } = await import(jwtConfigPath);
      
      try {
        getJwtSecret();
        assert.fail("Expected getJwtSecret to throw an error");
      } catch (error) {
        assert.ok(
          error.message.includes("openssl rand -base64 32"),
          "Expected error message to include openssl generation command"
        );
      }
    });
  });
});
