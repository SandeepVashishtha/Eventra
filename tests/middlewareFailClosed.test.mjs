/**
 * Security tests for middleware fail-closed behavior
 * 
 * These tests verify that middleware enforces fail-closed security:
 * - Missing JWT_SECRET returns HTTP 500
 * - RBAC is NOT bypassed
 * - Protected routes remain protected
 */

import { strict as assert } from "node:assert";
import { describe, it, before, after } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("Middleware Fail-Closed Security", () => {
  const originalJwtSecret = process.env.JWT_SECRET;

  after(() => {
    // Restore original JWT_SECRET after all tests
    if (originalJwtSecret !== undefined) {
      process.env.JWT_SECRET = originalJwtSecret;
    } else {
      delete process.env.JWT_SECRET;
    }
  });

  describe("Ticket route RBAC with missing JWT_SECRET", () => {
    it("returns HTTP 500 when JWT_SECRET is missing for ticket routes", async () => {
      delete process.env.JWT_SECRET;
      
      // Dynamic import to get fresh module state
      const middlewarePath = pathToFileURL(path.resolve(__dirname, "../middleware.js")).href;
      const { default: middleware } = await import(middlewarePath);
      
      // Create a mock request for a ticket route
      const mockRequest = {
        url: "https://example.com/api/tickets/123",
        method: "GET",
        headers: new Headers({
          "cookie": "token=valid-token"
        }),
        geo: { country: "US" }
      };
      
      const response = await middleware(mockRequest);
      
      assert.ok(
        response,
        "Expected middleware to return a response when JWT_SECRET is missing"
      );
      
      assert.strictEqual(
        response.status,
        500,
        "Expected HTTP 500 status when JWT_SECRET is missing"
      );
      
      const body = await response.json();
      assert.ok(
        body.error === "Server configuration error",
        "Expected error message to indicate configuration error"
      );
    });

    it("returns HTTP 500 when JWT_SECRET is empty string for ticket routes", async () => {
      process.env.JWT_SECRET = "";
      
      // Dynamic import to get fresh module state
      const middlewarePath = pathToFileURL(path.resolve(__dirname, "../middleware.js")).href;
      const { default: middleware } = await import(middlewarePath);
      
      // Create a mock request for a ticket route
      const mockRequest = {
        url: "https://example.com/api/tickets/123",
        method: "GET",
        headers: new Headers({
          "cookie": "token=valid-token"
        }),
        geo: { country: "US" }
      };
      
      const response = await middleware(mockRequest);
      
      assert.strictEqual(
        response.status,
        500,
        "Expected HTTP 500 status when JWT_SECRET is empty"
      );
    });

    it("does NOT bypass RBAC when JWT_SECRET is missing", async () => {
      delete process.env.JWT_SECRET;
      
      // Dynamic import to get fresh module state
      const middlewarePath = pathToFileURL(path.resolve(__dirname, "../middleware.js")).href;
      const { default: middleware } = await import(middlewarePath);
      
      // Create a mock request for a ticket route with a token
      const mockRequest = {
        url: "https://example.com/api/tickets/123",
        method: "GET",
        headers: new Headers({
          "cookie": "token=some-token"
        }),
        geo: { country: "US" }
      };
      
      const response = await middleware(mockRequest);
      
      // Should return 500, not allow the request through
      assert.strictEqual(
        response.status,
        500,
        "Expected HTTP 500 (fail-closed), not request bypass"
      );
      
      // Should NOT return undefined (which would allow request to proceed)
      assert.ok(
        response !== undefined,
        "Expected response to be returned, not undefined (which would bypass RBAC)"
      );
    });
  });

  describe("Ticket route RBAC with valid JWT_SECRET", () => {
    it("allows request processing when JWT_SECRET is valid", async () => {
      process.env.JWT_SECRET = "test-secret-key-for-middleware-testing";
      
      // Dynamic import to get fresh module state
      const middlewarePath = pathToFileURL(path.resolve(__dirname, "../middleware.js")).href;
      const { default: middleware } = await import(middlewarePath);
      
      // Create a mock request for a ticket route
      const mockRequest = {
        url: "https://example.com/api/tickets/123",
        method: "GET",
        headers: new Headers({
          "cookie": "token=some-token"
        }),
        geo: { country: "US" }
      };
      
      const response = await middleware(mockRequest);
      
      // With valid JWT_SECRET, middleware should process the request
      // It may return undefined (allow request to proceed) or a 403 (if token invalid)
      // But it should NOT return 500 (configuration error)
      if (response) {
        assert.notStrictEqual(
          response.status,
          500,
          "Expected not to return 500 when JWT_SECRET is valid"
        );
      }
    });
  });

  describe("Non-ticket routes with missing JWT_SECRET", () => {
    it("does not affect non-ticket routes when JWT_SECRET is missing", async () => {
      delete process.env.JWT_SECRET;
      
      // Dynamic import to get fresh module state
      const middlewarePath = pathToFileURL(path.resolve(__dirname, "../middleware.js")).href;
      const { default: middleware } = await import(middlewarePath);
      
      // Create a mock request for a non-ticket route
      const mockRequest = {
        url: "https://example.com/api/events",
        method: "GET",
        headers: new Headers(),
        geo: { country: "US" }
      };
      
      const response = await middleware(mockRequest);
      
      // Non-ticket routes should not be affected by JWT_SECRET
      // They should return undefined (allow request to proceed)
      assert.strictEqual(
        response,
        undefined,
        "Expected non-ticket routes to proceed normally when JWT_SECRET is missing"
      );
    });
  });

  describe("Error response format", () => {
    it("returns JSON error response with correct content type", async () => {
      delete process.env.JWT_SECRET;
      
      // Dynamic import to get fresh module state
      const middlewarePath = pathToFileURL(path.resolve(__dirname, "../middleware.js")).href;
      const { default: middleware } = await import(middlewarePath);
      
      const mockRequest = {
        url: "https://example.com/api/tickets/123",
        method: "GET",
        headers: new Headers({
          "cookie": "token=valid-token"
        }),
        geo: { country: "US" }
      };
      
      const response = await middleware(mockRequest);
      
      assert.strictEqual(
        response.headers.get("Content-Type"),
        "application/json",
        "Expected Content-Type to be application/json"
      );
      
      const body = await response.json();
      assert.ok(
        body.error,
        "Expected response body to have an error field"
      );
    });
  });
});
