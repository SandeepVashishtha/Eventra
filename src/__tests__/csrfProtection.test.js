import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("CSRF Protection", () => {
  beforeEach(() => {
    vi.resetModules();
    delete global.document;
    global.document = {
      cookie: "",
      querySelector: vi.fn(),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getCSRFTokenFromMeta", () => {
    it("should return token from meta tag when present", async () => {
      const { getCSRFTokenFromMeta } = await import("../utils/csrfToken.js");
      global.document.querySelector.mockReturnValue({
        getAttribute: vi.fn(() => "test-token-123"),
      });

      const token = getCSRFTokenFromMeta();
      expect(token).toBe("test-token-123");
    });

    it("should return null when meta tag is absent", async () => {
      const { getCSRFTokenFromMeta } = await import("../utils/csrfToken.js");
      global.document.querySelector.mockReturnValue(null);

      const token = getCSRFTokenFromMeta();
      expect(token).toBeNull();
    });

    it("should return null when meta tag has no content attribute", async () => {
      const { getCSRFTokenFromMeta } = await import("../utils/csrfToken.js");
      global.document.querySelector.mockReturnValue({
        getAttribute: vi.fn(() => null),
      });

      const token = getCSRFTokenFromMeta();
      expect(token).toBeNull();
    });
  });

  describe("getCSRFTokenFromCookie", () => {
    it("should return token from cookie when present", async () => {
      const { getCSRFTokenFromCookie } = await import("../utils/csrfToken.js");
      global.document.cookie = "XSRF-TOKEN=cookie-token-456; other=value";

      const token = getCSRFTokenFromCookie();
      expect(token).toBe("cookie-token-456");
    });

    it("should decode URI encoded cookie values", async () => {
      const { getCSRFTokenFromCookie } = await import("../utils/csrfToken.js");
      global.document.cookie = "XSRF-TOKEN=encoded%20token%20value";

      const token = getCSRFTokenFromCookie();
      expect(token).toBe("encoded token value");
    });

    it("should return null when cookie is absent", async () => {
      const { getCSRFTokenFromCookie } = await import("../utils/csrfToken.js");
      global.document.cookie = "other=value";

      const token = getCSRFTokenFromCookie();
      expect(token).toBeNull();
    });

    it("should support custom cookie names", async () => {
      const { getCSRFTokenFromCookie } = await import("../utils/csrfToken.js");
      global.document.cookie = "CUSTOM_CSRF=custom-token; other=value";

      const token = getCSRFTokenFromCookie("CUSTOM_CSRF");
      expect(token).toBe("custom-token");
    });
  });

  describe("getCSRFToken", () => {
    it("should prefer meta tag over cookie", async () => {
      const { getCSRFToken } = await import("../utils/csrfToken.js");
      global.document.querySelector.mockReturnValue({
        getAttribute: vi.fn(() => "meta-token"),
      });
      global.document.cookie = "XSRF-TOKEN=cookie-token";

      const token = getCSRFToken();
      expect(token).toBe("meta-token");
    });

    it("should fall back to cookie when meta tag is absent", async () => {
      const { getCSRFToken } = await import("../utils/csrfToken.js");
      global.document.querySelector.mockReturnValue(null);
      global.document.cookie = "XSRF-TOKEN=cookie-token";

      const token = getCSRFToken();
      expect(token).toBe("cookie-token");
    });

    it("should return null when both sources are absent", async () => {
      const { getCSRFToken } = await import("../utils/csrfToken.js");
      global.document.querySelector.mockReturnValue(null);
      global.document.cookie = "";

      const token = getCSRFToken();
      expect(token).toBeNull();
    });
  });

  describe("requiresCSRF", () => {
    it("should return true for mutating methods", async () => {
      const { requiresCSRF } = await import("../utils/csrfToken.js");
      expect(requiresCSRF("POST")).toBe(true);
      expect(requiresCSRF("PUT")).toBe(true);
      expect(requiresCSRF("PATCH")).toBe(true);
      expect(requiresCSRF("DELETE")).toBe(true);
    });

    it("should return true for lowercase mutating methods", async () => {
      const { requiresCSRF } = await import("../utils/csrfToken.js");
      expect(requiresCSRF("post")).toBe(true);
      expect(requiresCSRF("put")).toBe(true);
      expect(requiresCSRF("patch")).toBe(true);
      expect(requiresCSRF("delete")).toBe(true);
    });

    it("should return false for non-mutating methods", async () => {
      const { requiresCSRF } = await import("../utils/csrfToken.js");
      expect(requiresCSRF("GET")).toBe(false);
      expect(requiresCSRF("HEAD")).toBe(false);
      expect(requiresCSRF("OPTIONS")).toBe(false);
      expect(requiresCSRF("TRACE")).toBe(false);
    });

    it("should return false for undefined method", async () => {
      const { requiresCSRF } = await import("../utils/csrfToken.js");
      expect(requiresCSRF(undefined)).toBe(false);
      expect(requiresCSRF(null)).toBe(false);
    });
  });

  describe("validateCSRFToken", () => {
    it("should return valid for non-mutating methods", async () => {
      const { validateCSRFToken } = await import("../utils/csrfToken.js");
      const result = validateCSRFToken("GET", "/api/data");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should return valid when token is present", async () => {
      const { validateCSRFToken } = await import("../utils/csrfToken.js");
      global.document.querySelector.mockReturnValue({
        getAttribute: vi.fn(() => "valid-token"),
      });

      const result = validateCSRFToken("POST", "/api/data");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should return valid with warning mode when token is missing", async () => {
      const { validateCSRFToken } = await import("../utils/csrfToken.js");
      global.document.querySelector.mockReturnValue(null);
      global.document.cookie = "";

      const result = validateCSRFToken("POST", "/api/data");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe("csrfFetch", () => {
    it("should attach token to mutating request when present", async () => {
      const { csrfFetch } = await import("../utils/csrfToken.js");
      global.document.querySelector.mockReturnValue({
        getAttribute: vi.fn(() => "test-token"),
      });

      const mockFetch = vi.fn(() => Promise.resolve(new Response()));
      global.fetch = mockFetch;

      await csrfFetch("/api/data", { method: "POST" });

      expect(mockFetch).toHaveBeenCalledWith("/api/data", {
        method: "POST",
        headers: {
          "X-CSRF-Token": "test-token",
        },
      });
    });

    it("should proceed with warning when token is missing in warning mode", async () => {
      const { csrfFetch } = await import("../utils/csrfToken.js");
      global.document.querySelector.mockReturnValue(null);
      global.document.cookie = "";

      const mockFetch = vi.fn(() => Promise.resolve(new Response()));
      global.fetch = mockFetch;

      await csrfFetch("/api/data", { method: "POST" });

      expect(mockFetch).toHaveBeenCalledWith("/api/data", {
        method: "POST",
      });
    });

    it("should not attach token to GET requests", async () => {
      const { csrfFetch } = await import("../utils/csrfToken.js");
      global.document.querySelector.mockReturnValue({
        getAttribute: vi.fn(() => "test-token"),
      });

      const mockFetch = vi.fn(() => Promise.resolve(new Response()));
      global.fetch = mockFetch;

      await csrfFetch("/api/data", { method: "GET" });

      expect(mockFetch).toHaveBeenCalledWith("/api/data", {
        method: "GET",
      });
    });

    it("should merge with existing headers", async () => {
      const { csrfFetch } = await import("../utils/csrfToken.js");
      global.document.querySelector.mockReturnValue({
        getAttribute: vi.fn(() => "test-token"),
      });

      const mockFetch = vi.fn(() => Promise.resolve(new Response()));
      global.fetch = mockFetch;

      await csrfFetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": "test-token",
        },
      });
    });
  });
});
