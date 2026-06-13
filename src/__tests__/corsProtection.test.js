import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("CORS Protection", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalAllowedOrigins = process.env.ALLOWED_ORIGINS;

  beforeEach(() => {
    vi.resetModules();
    process.env.NODE_ENV = originalNodeEnv;
    process.env.ALLOWED_ORIGINS = originalAllowedOrigins;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.ALLOWED_ORIGINS = originalAllowedOrigins;
    vi.restoreAllMocks();
  });

  describe("getAllowedOrigins", () => {
    it("should parse comma-separated origins correctly", async () => {
      process.env.ALLOWED_ORIGINS = "https://eventra.com,https://www.eventra.com";
      const { getAllowedOrigins } = await import("../../api/auth/cors.js");
      const origins = getAllowedOrigins();
      expect(origins).toEqual(["https://eventra.com", "https://www.eventra.com"]);
    });

    it("should trim whitespace from origins", async () => {
      process.env.ALLOWED_ORIGINS = " https://eventra.com , https://www.eventra.com ";
      const { getAllowedOrigins } = await import("../../api/auth/cors.js");
      const origins = getAllowedOrigins();
      expect(origins).toEqual(["https://eventra.com", "https://www.eventra.com"]);
    });

    it("should filter empty values", async () => {
      process.env.ALLOWED_ORIGINS = "https://eventra.com,,https://www.eventra.com,";
      const { getAllowedOrigins } = await import("../../api/auth/cors.js");
      const origins = getAllowedOrigins();
      expect(origins).toEqual(["https://eventra.com", "https://www.eventra.com"]);
    });

    it("should return empty array when ALLOWED_ORIGINS is not set", async () => {
      delete process.env.ALLOWED_ORIGINS;
      const { getAllowedOrigins } = await import("../../api/auth/cors.js");
      const origins = getAllowedOrigins();
      expect(origins).toEqual([]);
    });

    it("should return empty array when ALLOWED_ORIGINS is empty string", async () => {
      process.env.ALLOWED_ORIGINS = "";
      const { getAllowedOrigins } = await import("../../api/auth/cors.js");
      const origins = getAllowedOrigins();
      expect(origins).toEqual([]);
    });

    it("should handle malformed configuration safely", async () => {
      process.env.ALLOWED_ORIGINS = "   ";
      const { getAllowedOrigins } = await import("../../api/auth/cors.js");
      const origins = getAllowedOrigins();
      expect(origins).toEqual([]);
    });

    it("should handle single origin", async () => {
      process.env.ALLOWED_ORIGINS = "https://eventra.com";
      const { getAllowedOrigins } = await import("../../api/auth/cors.js");
      const origins = getAllowedOrigins();
      expect(origins).toEqual(["https://eventra.com"]);
    });
  });

  describe("isAllowedOrigin", () => {
    it("should allow origin in explicit allowlist", async () => {
      process.env.ALLOWED_ORIGINS = "https://eventra.com,https://www.eventra.com";
      const { isAllowedOrigin } = await import("../../api/auth/cors.js");
      expect(isAllowedOrigin("https://eventra.com")).toBe(true);
      expect(isAllowedOrigin("https://www.eventra.com")).toBe(true);
    });

    it("should reject origin not in allowlist", async () => {
      process.env.ALLOWED_ORIGINS = "https://eventra.com";
      const { isAllowedOrigin } = await import("../../api/auth/cors.js");
      expect(isAllowedOrigin("https://evil.com")).toBe(false);
    });

    it("should reject undefined origin", async () => {
      process.env.ALLOWED_ORIGINS = "https://eventra.com";
      const { isAllowedOrigin } = await import("../../api/auth/cors.js");
      expect(isAllowedOrigin(undefined)).toBe(false);
    });

    it("should reject null origin", async () => {
      process.env.ALLOWED_ORIGINS = "https://eventra.com";
      const { isAllowedOrigin } = await import("../../api/auth/cors.js");
      expect(isAllowedOrigin(null)).toBe(false);
    });

    it("should reject empty string origin", async () => {
      process.env.ALLOWED_ORIGINS = "https://eventra.com";
      const { isAllowedOrigin } = await import("../../api/auth/cors.js");
      expect(isAllowedOrigin("")).toBe(false);
    });

    it("should allow localhost:3000 in development", async () => {
      process.env.NODE_ENV = "development";
      process.env.ALLOWED_ORIGINS = "";
      const { isAllowedOrigin } = await import("../../api/auth/cors.js");
      expect(isAllowedOrigin("http://localhost:3000")).toBe(true);
    });

    it("should allow localhost:5173 in development", async () => {
      process.env.NODE_ENV = "development";
      process.env.ALLOWED_ORIGINS = "";
      const { isAllowedOrigin } = await import("../../api/auth/cors.js");
      expect(isAllowedOrigin("http://localhost:5173")).toBe(true);
    });

    it("should allow 127.0.0.1:3000 in development", async () => {
      process.env.NODE_ENV = "development";
      process.env.ALLOWED_ORIGINS = "";
      const { isAllowedOrigin } = await import("../../api/auth/cors.js");
      expect(isAllowedOrigin("http://127.0.0.1:3000")).toBe(true);
    });

    it("should allow 127.0.0.1:5173 in development", async () => {
      process.env.NODE_ENV = "development";
      process.env.ALLOWED_ORIGINS = "";
      const { isAllowedOrigin } = await import("../../api/auth/cors.js");
      expect(isAllowedOrigin("http://127.0.0.1:5173")).toBe(true);
    });

    it("should block localhost origins in production", async () => {
      process.env.NODE_ENV = "production";
      process.env.ALLOWED_ORIGINS = "https://eventra.com";
      const { isAllowedOrigin } = await import("../../api/auth/cors.js");
      expect(isAllowedOrigin("http://localhost:3000")).toBe(false);
      expect(isAllowedOrigin("http://localhost:5173")).toBe(false);
      expect(isAllowedOrigin("http://127.0.0.1:3000")).toBe(false);
      expect(isAllowedOrigin("http://127.0.0.1:5173")).toBe(false);
    });

    it("should block untrusted origin in production with empty allowlist", async () => {
      process.env.NODE_ENV = "production";
      process.env.ALLOWED_ORIGINS = "";
      const { isAllowedOrigin } = await import("../../api/auth/cors.js");
      expect(isAllowedOrigin("https://evil.com")).toBe(false);
    });

    it("should allow explicit localhost in allowlist even in production", async () => {
      process.env.NODE_ENV = "production";
      process.env.ALLOWED_ORIGINS = "http://localhost:3000";
      const { isAllowedOrigin } = await import("../../api/auth/cors.js");
      expect(isAllowedOrigin("http://localhost:3000")).toBe(true);
    });

    it("should use exact string matching (no regex)", async () => {
      process.env.ALLOWED_ORIGINS = "https://eventra.com";
      const { isAllowedOrigin } = await import("../../api/auth/cors.js");
      expect(isAllowedOrigin("https://eventra.com")).toBe(true);
      expect(isAllowedOrigin("https://eventra.com/")).toBe(false);
      expect(isAllowedOrigin("https://sub.eventra.com")).toBe(false);
      expect(isAllowedOrigin("http://eventra.com")).toBe(false);
    });
  });

  describe("buildCorsHeaders", () => {
    it("should return ACAO for trusted origin", async () => {
      process.env.ALLOWED_ORIGINS = "https://eventra.com";
      const { buildCorsHeaders } = await import("../../api/auth/cors.js");
      const req = { headers: { origin: "https://eventra.com" } };
      const headers = buildCorsHeaders(req);
      expect(headers["Access-Control-Allow-Origin"]).toBe("https://eventra.com");
    });

    it("should not return ACAO for untrusted origin", async () => {
      process.env.ALLOWED_ORIGINS = "https://eventra.com";
      const { buildCorsHeaders } = await import("../../api/auth/cors.js");
      const req = { headers: { origin: "https://evil.com" } };
      const headers = buildCorsHeaders(req);
      expect(headers["Access-Control-Allow-Origin"]).toBeUndefined();
    });

    it("should not return ACAO when origin header is missing", async () => {
      process.env.ALLOWED_ORIGINS = "https://eventra.com";
      const { buildCorsHeaders } = await import("../../api/auth/cors.js");
      const req = { headers: {} };
      const headers = buildCorsHeaders(req);
      expect(headers["Access-Control-Allow-Origin"]).toBeUndefined();
    });

    it("should not return ACAO when headers object is missing", async () => {
      process.env.ALLOWED_ORIGINS = "https://eventra.com";
      const { buildCorsHeaders } = await import("../../api/auth/cors.js");
      const req = {};
      const headers = buildCorsHeaders(req);
      expect(headers["Access-Control-Allow-Origin"]).toBeUndefined();
    });

    it("should always return Vary: Origin", async () => {
      process.env.ALLOWED_ORIGINS = "https://eventra.com";
      const { buildCorsHeaders } = await import("../../api/auth/cors.js");
      const req = { headers: { origin: "https://eventra.com" } };
      const headers = buildCorsHeaders(req);
      expect(headers["Vary"]).toBe("Origin");
    });

    it("should always return allowed methods and headers", async () => {
      process.env.ALLOWED_ORIGINS = "https://eventra.com";
      const { buildCorsHeaders } = await import("../../api/auth/cors.js");
      const req = { headers: { origin: "https://evil.com" } };
      const headers = buildCorsHeaders(req);
      expect(headers["Access-Control-Allow-Methods"]).toBe("GET, POST, PUT, DELETE, OPTIONS");
      expect(headers["Access-Control-Allow-Headers"]).toBe("Content-Type, Authorization");
    });

    it("should allow localhost in development", async () => {
      process.env.NODE_ENV = "development";
      process.env.ALLOWED_ORIGINS = "";
      const { buildCorsHeaders } = await import("../../api/auth/cors.js");
      const req = { headers: { origin: "http://localhost:3000" } };
      const headers = buildCorsHeaders(req);
      expect(headers["Access-Control-Allow-Origin"]).toBe("http://localhost:3000");
    });

    it("should block localhost in production", async () => {
      process.env.NODE_ENV = "production";
      process.env.ALLOWED_ORIGINS = "https://eventra.com";
      const { buildCorsHeaders } = await import("../../api/auth/cors.js");
      const req = { headers: { origin: "http://localhost:3000" } };
      const headers = buildCorsHeaders(req);
      expect(headers["Access-Control-Allow-Origin"]).toBeUndefined();
    });

    it("should handle multiple allowed origins", async () => {
      process.env.ALLOWED_ORIGINS = "https://eventra.com,https://www.eventra.com,https://api.eventra.com";
      const { buildCorsHeaders } = await import("../../api/auth/cors.js");
      
      const req1 = { headers: { origin: "https://eventra.com" } };
      const headers1 = buildCorsHeaders(req1);
      expect(headers1["Access-Control-Allow-Origin"]).toBe("https://eventra.com");

      const req2 = { headers: { origin: "https://www.eventra.com" } };
      const headers2 = buildCorsHeaders(req2);
      expect(headers2["Access-Control-Allow-Origin"]).toBe("https://www.eventra.com");

      const req3 = { headers: { origin: "https://api.eventra.com" } };
      const headers3 = buildCorsHeaders(req3);
      expect(headers3["Access-Control-Allow-Origin"]).toBe("https://api.eventra.com");
    });

    it("should never return wildcard origin", async () => {
      process.env.ALLOWED_ORIGINS = "";
      const { buildCorsHeaders } = await import("../../api/auth/cors.js");
      const req = { headers: { origin: "https://evil.com" } };
      const headers = buildCorsHeaders(req);
      expect(headers["Access-Control-Allow-Origin"]).not.toBe("*");
      expect(headers["Access-Control-Allow-Origin"]).toBeUndefined();
    });

    it("should fail closed with empty ALLOWED_ORIGINS in production", async () => {
      process.env.NODE_ENV = "production";
      process.env.ALLOWED_ORIGINS = "";
      const { buildCorsHeaders } = await import("../../api/auth/cors.js");
      const req = { headers: { origin: "https://any-origin.com" } };
      const headers = buildCorsHeaders(req);
      expect(headers["Access-Control-Allow-Origin"]).toBeUndefined();
    });
  });

  describe("corsResponse", () => {
    it("should set CORS headers and send response", async () => {
      process.env.ALLOWED_ORIGINS = "https://eventra.com";
      const { corsResponse } = await import("../../api/auth/cors.js");
      const req = { headers: { origin: "https://eventra.com" } };
      const res = {
        setHeader: vi.fn(),
        status: vi.fn(() => ({ json: vi.fn() })),
      };
      
      corsResponse(req, res, 200, { success: true });
      
      expect(res.setHeader).toHaveBeenCalledWith("Access-Control-Allow-Origin", "https://eventra.com");
      expect(res.setHeader).toHaveBeenCalledWith("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      expect(res.setHeader).toHaveBeenCalledWith("Access-Control-Allow-Headers", "Content-Type, Authorization");
      expect(res.setHeader).toHaveBeenCalledWith("Vary", "Origin");
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
