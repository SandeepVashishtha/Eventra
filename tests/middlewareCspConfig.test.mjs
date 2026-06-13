/**
 * tests/middlewareCspConfig.test.mjs
 *
 * Unit tests for CSP backend origin configuration in middleware.js.
 * Tests the validateBackendOrigin and getBackendOrigins functions.
 *
 * Run: node tests/middlewareCspConfig.test.mjs
 */

import { strict as assert } from "node:assert";
import { describe, it, before, after } from "node:test";

// Save original environment variables
const originalBackendUrl = process.env.BACKEND_URL;
const originalViteApiUrl = process.env.VITE_API_URL;
const originalReactAppApiUrl = process.env.REACT_APP_API_URL;

// Helper function to dynamically import middleware with fresh module state
async function importMiddleware() {
  const middlewarePath = new URL("../middleware.js", import.meta.url).href;
  const middlewareUrl = new URL(middlewarePath);
  middlewareUrl.searchParams.set("cacheBust", `${Date.now()}-${Math.random()}`);
  return await import(middlewareUrl.href);
}

describe("CSP Backend Origin Configuration", () => {
  after(() => {
    // Restore original environment variables
    if (originalBackendUrl === undefined) {
      delete process.env.BACKEND_URL;
    } else {
      process.env.BACKEND_URL = originalBackendUrl;
    }
    if (originalViteApiUrl === undefined) {
      delete process.env.VITE_API_URL;
    } else {
      process.env.VITE_API_URL = originalViteApiUrl;
    }
    if (originalReactAppApiUrl === undefined) {
      delete process.env.REACT_APP_API_URL;
    } else {
      process.env.REACT_APP_API_URL = originalReactAppApiUrl;
    }
  });

  describe("validateBackendOrigin", () => {
    it("validates a correct HTTPS URL", async () => {
      delete process.env.BACKEND_URL;
      delete process.env.VITE_API_URL;
      delete process.env.REACT_APP_API_URL;
      
      const { validateBackendOrigin } = await importMiddleware();
      const result = validateBackendOrigin("https://api.example.com");
      
      assert.strictEqual(result, "https://api.example.com");
    });

    it("validates a correct HTTP URL", async () => {
      delete process.env.BACKEND_URL;
      delete process.env.VITE_API_URL;
      delete process.env.REACT_APP_API_URL;
      
      const { validateBackendOrigin } = await importMiddleware();
      const result = validateBackendOrigin("http://localhost:8080");
      
      assert.strictEqual(result, "http://localhost:8080");
    });

    it("extracts origin from full URL with path", async () => {
      delete process.env.BACKEND_URL;
      delete process.env.VITE_API_URL;
      delete process.env.REACT_APP_API_URL;
      
      const { validateBackendOrigin } = await importMiddleware();
      const result = validateBackendOrigin("https://api.example.com/v1/endpoint");
      
      assert.strictEqual(result, "https://api.example.com");
    });

    it("extracts origin from URL with port", async () => {
      delete process.env.BACKEND_URL;
      delete process.env.VITE_API_URL;
      delete process.env.REACT_APP_API_URL;
      
      const { validateBackendOrigin } = await importMiddleware();
      const result = validateBackendOrigin("https://api.example.com:8443");
      
      assert.strictEqual(result, "https://api.example.com:8443");
    });

    it("rejects invalid protocol (ftp)", async () => {
      delete process.env.BACKEND_URL;
      delete process.env.VITE_API_URL;
      delete process.env.REACT_APP_API_URL;
      
      const { validateBackendOrigin } = await importMiddleware();
      const result = validateBackendOrigin("ftp://api.example.com");
      
      assert.strictEqual(result, null);
    });

    it("rejects invalid protocol (ws)", async () => {
      delete process.env.BACKEND_URL;
      delete process.env.VITE_API_URL;
      delete process.env.REACT_APP_API_URL;
      
      const { validateBackendOrigin } = await importMiddleware();
      const result = validateBackendOrigin("ws://api.example.com");
      
      assert.strictEqual(result, null);
    });

    it("rejects malformed URL", async () => {
      delete process.env.BACKEND_URL;
      delete process.env.VITE_API_URL;
      delete process.env.REACT_APP_API_URL;
      
      const { validateBackendOrigin } = await importMiddleware();
      const result = validateBackendOrigin("not-a-valid-url");
      
      assert.strictEqual(result, null);
    });

    it("rejects empty string", async () => {
      delete process.env.BACKEND_URL;
      delete process.env.VITE_API_URL;
      delete process.env.REACT_APP_API_URL;
      
      const { validateBackendOrigin } = await importMiddleware();
      const result = validateBackendOrigin("");
      
      assert.strictEqual(result, null);
    });

    it("rejects null", async () => {
      delete process.env.BACKEND_URL;
      delete process.env.VITE_API_URL;
      delete process.env.REACT_APP_API_URL;
      
      const { validateBackendOrigin } = await importMiddleware();
      const result = validateBackendOrigin(null);
      
      assert.strictEqual(result, null);
    });

    it("rejects undefined", async () => {
      delete process.env.BACKEND_URL;
      delete process.env.VITE_API_URL;
      delete process.env.REACT_APP_API_URL;
      
      const { validateBackendOrigin } = await importMiddleware();
      const result = validateBackendOrigin(undefined);
      
      assert.strictEqual(result, null);
    });

    it("trims whitespace", async () => {
      delete process.env.BACKEND_URL;
      delete process.env.VITE_API_URL;
      delete process.env.REACT_APP_API_URL;
      
      const { validateBackendOrigin } = await importMiddleware();
      const result = validateBackendOrigin("  https://api.example.com  ");
      
      assert.strictEqual(result, "https://api.example.com");
    });
  });

  describe("getBackendOrigins", () => {
    it("returns empty array when no backend URLs configured", async () => {
      delete process.env.BACKEND_URL;
      delete process.env.VITE_API_URL;
      delete process.env.REACT_APP_API_URL;
      
      const { getBackendOrigins } = await importMiddleware();
      const result = getBackendOrigins();
      
      assert.deepStrictEqual(result, []);
    });

    it("reads BACKEND_URL", async () => {
      process.env.BACKEND_URL = "https://api.example.com";
      delete process.env.VITE_API_URL;
      delete process.env.REACT_APP_API_URL;
      
      const { getBackendOrigins } = await importMiddleware();
      const result = getBackendOrigins();
      
      assert.deepStrictEqual(result, ["https://api.example.com"]);
    });

    it("reads VITE_API_URL", async () => {
      delete process.env.BACKEND_URL;
      process.env.VITE_API_URL = "https://api.example.com";
      delete process.env.REACT_APP_API_URL;
      
      const { getBackendOrigins } = await importMiddleware();
      const result = getBackendOrigins();
      
      assert.deepStrictEqual(result, ["https://api.example.com"]);
    });

    it("reads REACT_APP_API_URL", async () => {
      delete process.env.BACKEND_URL;
      delete process.env.VITE_API_URL;
      process.env.REACT_APP_API_URL = "https://api.example.com";
      
      const { getBackendOrigins } = await importMiddleware();
      const result = getBackendOrigins();
      
      assert.deepStrictEqual(result, ["https://api.example.com"]);
    });

    it("deduplicates origins", async () => {
      process.env.BACKEND_URL = "https://api.example.com";
      process.env.VITE_API_URL = "https://api.example.com";
      process.env.REACT_APP_API_URL = "https://api.example.com";
      
      const { getBackendOrigins } = await importMiddleware();
      const result = getBackendOrigins();
      
      assert.deepStrictEqual(result, ["https://api.example.com"]);
    });

    it("collects multiple valid origins", async () => {
      process.env.BACKEND_URL = "https://api-primary.example.com";
      process.env.VITE_API_URL = "https://api-secondary.example.com";
      process.env.REACT_APP_API_URL = "https://api-tertiary.example.com";
      
      const { getBackendOrigins } = await importMiddleware();
      const result = getBackendOrigins();
      
      assert.strictEqual(result.length, 3);
      assert.ok(result.includes("https://api-primary.example.com"));
      assert.ok(result.includes("https://api-secondary.example.com"));
      assert.ok(result.includes("https://api-tertiary.example.com"));
    });

    it("filters invalid origins", async () => {
      process.env.BACKEND_URL = "https://api.example.com";
      process.env.VITE_API_URL = "not-a-valid-url";
      process.env.REACT_APP_API_URL = "ftp://invalid-protocol.com";
      
      const { getBackendOrigins } = await importMiddleware();
      const result = getBackendOrigins();
      
      assert.deepStrictEqual(result, ["https://api.example.com"]);
    });

    it("handles development configuration", async () => {
      process.env.BACKEND_URL = "http://localhost:8080";
      process.env.VITE_API_URL = "http://localhost:8080";
      delete process.env.REACT_APP_API_URL;
      
      const { getBackendOrigins } = await importMiddleware();
      const result = getBackendOrigins();
      
      assert.deepStrictEqual(result, ["http://localhost:8080"]);
    });

    it("handles production configuration", async () => {
      process.env.BACKEND_URL = "https://api.example.com";
      process.env.VITE_API_URL = "https://api.example.com";
      delete process.env.REACT_APP_API_URL;
      
      const { getBackendOrigins } = await importMiddleware();
      const result = getBackendOrigins();
      
      assert.deepStrictEqual(result, ["https://api.example.com"]);
    });

    it("extracts origin from URLs with paths", async () => {
      process.env.BACKEND_URL = "https://api.example.com/api/v1";
      process.env.VITE_API_URL = "http://localhost:8080/api";
      delete process.env.REACT_APP_API_URL;
      
      const { getBackendOrigins } = await importMiddleware();
      const result = getBackendOrigins();
      
      assert.strictEqual(result.length, 2);
      assert.ok(result.includes("https://api.example.com"));
      assert.ok(result.includes("http://localhost:8080"));
    });
  });

  describe("CSP Generation", () => {
    it("includes configured backend origins in CSP", async () => {
      process.env.BACKEND_URL = "https://api.example.com";
      delete process.env.VITE_API_URL;
      delete process.env.REACT_APP_API_URL;
      
      const { SECURITY_HEADERS } = await importMiddleware();
      const csp = SECURITY_HEADERS["Content-Security-Policy"];
      
      assert.ok(csp.includes("connect-src"));
      assert.ok(csp.includes("https://api.example.com"));
    });

    it("includes multiple backend origins in CSP", async () => {
      process.env.BACKEND_URL = "https://api-primary.example.com";
      process.env.VITE_API_URL = "https://api-secondary.example.com";
      delete process.env.REACT_APP_API_URL;
      
      const { SECURITY_HEADERS } = await importMiddleware();
      const csp = SECURITY_HEADERS["Content-Security-Policy"];
      
      assert.ok(csp.includes("connect-src"));
      assert.ok(csp.includes("https://api-primary.example.com"));
      assert.ok(csp.includes("https://api-secondary.example.com"));
    });

    it("preserves existing CSP directives", async () => {
      process.env.BACKEND_URL = "https://api.example.com";
      delete process.env.VITE_API_URL;
      delete process.env.REACT_APP_API_URL;
      
      const { SECURITY_HEADERS } = await importMiddleware();
      const csp = SECURITY_HEADERS["Content-Security-Policy"];
      
      assert.ok(csp.includes("default-src 'self'"));
      assert.ok(csp.includes("script-src 'self'"));
      assert.ok(csp.includes("style-src 'self'"));
      assert.ok(csp.includes("img-src 'self'"));
      assert.ok(csp.includes("font-src 'self'"));
      assert.ok(csp.includes("frame-src 'self'"));
    });

    it("includes trusted GitHub API origin", async () => {
      process.env.BACKEND_URL = "https://api.example.com";
      delete process.env.VITE_API_URL;
      delete process.env.REACT_APP_API_URL;
      
      const { SECURITY_HEADERS } = await importMiddleware();
      const csp = SECURITY_HEADERS["Content-Security-Policy"];
      
      assert.ok(csp.includes("https://api.github.com"));
    });

    it("does not use wildcard in connect-src", async () => {
      process.env.BACKEND_URL = "https://api.example.com";
      delete process.env.VITE_API_URL;
      delete process.env.REACT_APP_API_URL;
      
      const { SECURITY_HEADERS } = await importMiddleware();
      const csp = SECURITY_HEADERS["Content-Security-Policy"];
      
      // Extract connect-src directive
      const connectSrcMatch = csp.match(/connect-src[^;]+/);
      assert.ok(connectSrcMatch);
      const connectSrc = connectSrcMatch[0];
      
      assert.ok(!connectSrc.includes("*"));
    });

    it("does not use unsafe-inline in connect-src", async () => {
      process.env.BACKEND_URL = "https://api.example.com";
      delete process.env.VITE_API_URL;
      delete process.env.REACT_APP_API_URL;
      
      const { SECURITY_HEADERS } = await importMiddleware();
      const csp = SECURITY_HEADERS["Content-Security-Policy"];
      
      // Extract connect-src directive
      const connectSrcMatch = csp.match(/connect-src[^;]+/);
      assert.ok(connectSrcMatch);
      const connectSrc = connectSrcMatch[0];
      
      assert.ok(!connectSrc.includes("unsafe-inline"));
    });

    it("does not use unsafe-eval in connect-src", async () => {
      process.env.BACKEND_URL = "https://api.example.com";
      delete process.env.VITE_API_URL;
      delete process.env.REACT_APP_API_URL;
      
      const { SECURITY_HEADERS } = await importMiddleware();
      const csp = SECURITY_HEADERS["Content-Security-Policy"];
      
      // Extract connect-src directive
      const connectSrcMatch = csp.match(/connect-src[^;]+/);
      assert.ok(connectSrcMatch);
      const connectSrc = connectSrcMatch[0];
      
      assert.ok(!connectSrc.includes("unsafe-eval"));
    });

    it("generates valid CSP when no backend origin configured", async () => {
      delete process.env.BACKEND_URL;
      delete process.env.VITE_API_URL;
      delete process.env.REACT_APP_API_URL;
      
      const { SECURITY_HEADERS } = await importMiddleware();
      const csp = SECURITY_HEADERS["Content-Security-Policy"];
      
      assert.ok(csp.includes("connect-src"));
      assert.ok(csp.includes("https://api.github.com"));
      assert.ok(csp.includes("'self'"));
    });
  });

  describe("Backward Compatibility", () => {
    it("works with existing BACKEND_URL configuration", async () => {
      process.env.BACKEND_URL = "https://api.example.com";
      delete process.env.VITE_API_URL;
      delete process.env.REACT_APP_API_URL;
      
      const { getBackendOrigins } = await importMiddleware();
      const result = getBackendOrigins();
      
      assert.deepStrictEqual(result, ["https://api.example.com"]);
    });

    it("works with existing VITE_API_URL configuration", async () => {
      delete process.env.BACKEND_URL;
      process.env.VITE_API_URL = "https://api.example.com";
      delete process.env.REACT_APP_API_URL;
      
      const { getBackendOrigins } = await importMiddleware();
      const result = getBackendOrigins();
      
      assert.deepStrictEqual(result, ["https://api.example.com"]);
    });

    it("works with existing REACT_APP_API_URL configuration", async () => {
      delete process.env.BACKEND_URL;
      delete process.env.VITE_API_URL;
      process.env.REACT_APP_API_URL = "https://api.example.com";
      
      const { getBackendOrigins } = await importMiddleware();
      const result = getBackendOrigins();
      
      assert.deepStrictEqual(result, ["https://api.example.com"]);
    });
  });
});

console.log("CSP Backend Origin Configuration tests passed ✓");
