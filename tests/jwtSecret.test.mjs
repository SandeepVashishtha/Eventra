/**
 * Tests for JWT Secret Validation Utility
 * 
 * These tests verify that the jwtSecret utility enforces fail-closed security:
 * - getJwtSecret() throws when JWT_SECRET is missing
 * - getJwtSecret() throws when JWT_SECRET is empty
 * - getJwtSecret() throws when JWT_SECRET is whitespace-only
 * - getJwtSecret() returns the secret when valid
 * - createJwtConfigErrorResponse() returns correct error response
 * - validateJwtSecretOrExit() throws with guidance when invalid
 * - validateJwtSecretOrExit() returns secret when valid
 */

import { strict as assert } from "node:assert";
import { describe, it, before, after } from "node:test";
import { getJwtSecret, createJwtConfigErrorResponse, validateJwtSecretOrExit } from "../api/_lib/jwtSecret.js";

describe("JWT Secret Utility", () => {
  const originalJwtSecret = process.env.JWT_SECRET;

  after(() => {
    // Restore original JWT_SECRET after all tests
    if (originalJwtSecret !== undefined) {
      process.env.JWT_SECRET = originalJwtSecret;
    } else {
      delete process.env.JWT_SECRET;
    }
  });

  describe("getJwtSecret()", () => {
    it("throws error when JWT_SECRET is missing", () => {
      delete process.env.JWT_SECRET;
      
      assert.throws(
        () => getJwtSecret(),
        { message: "JWT_SECRET is not configured" }
      );
    });

    it("throws error when JWT_SECRET is empty string", () => {
      process.env.JWT_SECRET = "";
      
      assert.throws(
        () => getJwtSecret(),
        { message: "JWT_SECRET is not configured" }
      );
    });

    it("throws error when JWT_SECRET is whitespace-only", () => {
      process.env.JWT_SECRET = "   ";
      
      assert.throws(
        () => getJwtSecret(),
        { message: "JWT_SECRET is not configured" }
      );
    });

    it("throws error when JWT_SECRET is tabs-only", () => {
      process.env.JWT_SECRET = "\t\t";
      
      assert.throws(
        () => getJwtSecret(),
        { message: "JWT_SECRET is not configured" }
      );
    });

    it("throws error when JWT_SECRET is mixed whitespace", () => {
      process.env.JWT_SECRET = " \t \n ";
      
      assert.throws(
        () => getJwtSecret(),
        { message: "JWT_SECRET is not configured" }
      );
    });

    it("returns the secret when JWT_SECRET is valid", () => {
      process.env.JWT_SECRET = "valid-secret-key";
      
      const secret = getJwtSecret();
      assert.strictEqual(secret, "valid-secret-key");
    });

    it("returns the secret when JWT_SECRET has leading/trailing whitespace", () => {
      process.env.JWT_SECRET = "  valid-secret-key  ";
      
      const secret = getJwtSecret();
      assert.strictEqual(secret, "  valid-secret-key  ");
    });
  });

  describe("createJwtConfigErrorResponse()", () => {
    it("returns a Response with status 500", () => {
      const response = createJwtConfigErrorResponse();
      
      assert.strictEqual(response.status, 500);
    });

    it("returns a Response with correct error message", async () => {
      const response = createJwtConfigErrorResponse();
      const body = await response.json();
      
      assert.strictEqual(body.error, "Server authentication misconfiguration");
    });

    it("returns a Response with Content-Type application/json", () => {
      const response = createJwtConfigErrorResponse();
      
      assert.strictEqual(response.headers.get("Content-Type"), "application/json");
    });
  });

  describe("validateJwtSecretOrExit()", () => {
    it("throws error when JWT_SECRET is missing", () => {
      delete process.env.JWT_SECRET;
      
      assert.throws(
        () => validateJwtSecretOrExit(),
        /FATAL: JWT_SECRET environment variable is required/
      );
    });

    it("throws error with guidance when JWT_SECRET is missing", () => {
      delete process.env.JWT_SECRET;
      
      assert.throws(
        () => validateJwtSecretOrExit(),
        /Generate a secure secret using: openssl rand -base64 32/
      );
    });

    it("throws error when JWT_SECRET is empty string", () => {
      process.env.JWT_SECRET = "";
      
      assert.throws(
        () => validateJwtSecretOrExit(),
        /FATAL: JWT_SECRET environment variable is required/
      );
    });

    it("throws error when JWT_SECRET is whitespace-only", () => {
      process.env.JWT_SECRET = "   ";
      
      assert.throws(
        () => validateJwtSecretOrExit(),
        /FATAL: JWT_SECRET environment variable is required/
      );
    });

    it("returns the secret when JWT_SECRET is valid", () => {
      process.env.JWT_SECRET = "valid-secret-key";
      
      const secret = validateJwtSecretOrExit();
      assert.strictEqual(secret, "valid-secret-key");
    });
  });
});
