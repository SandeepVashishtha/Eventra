/**
 * Unit tests for cookieUtils.js
 *
 * Tests cover:
 * - cookie creation
 * - cookie deletion
 * - secure flag behavior
 * - SameSite handling
 * - maxAge handling
 * - path handling
 * - HTTPS vs HTTP behavior
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  buildCookieString,
  setCookie,
  deleteCookie,
  deleteAllCookies,
  getCookie,
  hasCookie,
} from "../utils/cookieUtils.js";

describe("cookieUtils", () => {
  let originalDocument;
  let originalWindowLocation;

  beforeEach(() => {
    // Store original values
    originalDocument = global.document;
    originalWindowLocation = global.window?.location;

    // Mock document.cookie
    global.document = {
      cookie: "",
    };

    // Mock window.location.protocol
    global.window = {
      location: {
        protocol: "https:",
        hostname: "localhost",
      },
    };
  });

  afterEach(() => {
    // Restore original values
    global.document = originalDocument;
    if (originalWindowLocation) {
      global.window.location = originalWindowLocation;
    }
  });

  describe("buildCookieString", () => {
    it("should build a basic cookie string", () => {
      const result = buildCookieString("test", "value");
      expect(result).toBe("test=value; path=/; SameSite=Strict");
    });

    it("should URI encode the value", () => {
      const result = buildCookieString("test", "value with spaces");
      expect(result).toBe("test=value%20with%20spaces; path=/; SameSite=Strict");
    });

    it("should include path when specified", () => {
      const result = buildCookieString("test", "value", { path: "/api" });
      expect(result).toBe("test=value; path=/api; SameSite=Strict");
    });

    it("should include maxAge when specified", () => {
      const result = buildCookieString("test", "value", { maxAge: 3600 });
      expect(result).toBe("test=value; path=/; Max-Age=3600; SameSite=Strict");
    });

    it("should include expires when specified as Date", () => {
      const date = new Date("2025-01-01");
      const result = buildCookieString("test", "value", { expires: date });
      expect(result).toContain("expires=");
      expect(result).toContain("path=/");
      expect(result).toContain("SameSite=Strict");
    });

    it("should include expires when specified as string", () => {
      const result = buildCookieString("test", "value", {
        expires: "Thu, 01 Jan 2025 00:00:00 GMT",
      });
      expect(result).toBe(
        "test=value; path=/; expires=Thu, 01 Jan 2025 00:00:00 GMT; SameSite=Strict"
      );
    });

    it("should include Secure flag when secure is true", () => {
      const result = buildCookieString("test", "value", { secure: true });
      expect(result).toBe("test=value; path=/; Secure; SameSite=Strict");
    });

    it("should not include Secure flag when secure is false", () => {
      const result = buildCookieString("test", "value", { secure: false });
      expect(result).toBe("test=value; path=/; SameSite=Strict");
    });

    it("should include SameSite when specified", () => {
      const result = buildCookieString("test", "value", { sameSite: "Lax" });
      expect(result).toBe("test=value; path=/; SameSite=Lax");
    });

    it("should include domain when specified", () => {
      const result = buildCookieString("test", "value", { domain: ".example.com" });
      expect(result).toBe("test=value; path=/; SameSite=Strict; domain=.example.com");
    });

    it("should handle all options together", () => {
      const date = new Date("2025-01-01");
      const result = buildCookieString("test", "value", {
        path: "/api",
        maxAge: 3600,
        expires: date,
        secure: true,
        sameSite: "Lax",
        domain: ".example.com",
      });
      expect(result).toContain("test=value");
      expect(result).toContain("path=/api");
      expect(result).toContain("Max-Age=3600");
      expect(result).toContain("expires=");
      expect(result).toContain("Secure");
      expect(result).toContain("SameSite=Lax");
      expect(result).toContain("domain=.example.com");
    });
  });

  describe("setCookie", () => {
    it("should set a cookie with default options", () => {
      setCookie("test", "value");
      expect(document.cookie).toContain("test=value");
    });

    it("should auto-detect secure flag from HTTPS protocol", () => {
      window.location.protocol = "https:";
      setCookie("test", "value");
      expect(document.cookie).toContain("Secure");
    });

    it("should not set secure flag on HTTP protocol", () => {
      window.location.protocol = "http:";
      setCookie("test", "value");
      expect(document.cookie).not.toContain("Secure");
    });

    it("should respect explicit secure flag override", () => {
      window.location.protocol = "http:";
      setCookie("test", "value", { secure: true });
      expect(document.cookie).toContain("Secure");
    });

    it("should set cookie with custom path", () => {
      setCookie("test", "value", { path: "/api" });
      expect(document.cookie).toContain("path=/api");
    });

    it("should set cookie with maxAge", () => {
      setCookie("test", "value", { maxAge: 3600 });
      expect(document.cookie).toContain("Max-Age=3600");
    });

    it("should set cookie with expires", () => {
      const date = new Date("2025-01-01");
      setCookie("test", "value", { expires: date });
      expect(document.cookie).toContain("expires=");
    });

    it("should set cookie with custom SameSite", () => {
      setCookie("test", "value", { sameSite: "Lax" });
      expect(document.cookie).toContain("SameSite=Lax");
    });

    it("should set cookie with domain", () => {
      setCookie("test", "value", { domain: ".example.com" });
      expect(document.cookie).toContain("domain=.example.com");
    });

    it("should URI encode the value", () => {
      setCookie("test", "value with spaces");
      expect(document.cookie).toContain("test=value%20with%20spaces");
    });

    it("should return true on success", () => {
      const result = setCookie("test", "value");
      expect(result).toBe(true);
    });

    it("should handle errors gracefully", () => {
      // Save current document
      const savedDocument = global.document;
      // Mock document to be undefined
      global.document = undefined;

      const result = setCookie("test", "value");
      expect(result).toBe(false);

      // Restore document
      global.document = savedDocument;
    });
  });

  describe("deleteCookie", () => {
    beforeEach(() => {
      // Set a test cookie first
      document.cookie = "test=value; path=/; SameSite=Strict";
    });

    it("should delete a cookie with default options", () => {
      deleteCookie("test");
      expect(document.cookie).toContain("test=");
      expect(document.cookie).toContain("Max-Age=0");
    });

    it("should delete cookie with custom path", () => {
      deleteCookie("test", { path: "/api" });
      expect(document.cookie).toContain("path=/api");
    });

    it("should delete both Secure and non-Secure variants when secureVariants is true", () => {
      deleteCookie("test", { secureVariants: true });
      const cookieParts = document.cookie.split("; ");
      expect(cookieParts.some((part) => part.includes("Secure"))).toBe(true);
      expect(cookieParts.some((part) => !part.includes("Secure"))).toBe(true);
    });

    it("should delete with domain variant when domainVariants is true", () => {
      deleteCookie("test", { domainVariants: true });
      expect(document.cookie).toContain("domain=localhost");
    });

    it("should delete both Secure and domain variants when both options are true", () => {
      deleteCookie("test", { secureVariants: true, domainVariants: true });
      expect(document.cookie).toContain("Secure");
      expect(document.cookie).toContain("domain=localhost");
    });

    it("should return true on success", () => {
      const result = deleteCookie("test");
      expect(result).toBe(true);
    });

    it("should handle errors gracefully", () => {
      // Save current document
      const savedDocument = global.document;
      // Mock document to be undefined
      global.document = undefined;

      const result = deleteCookie("test");
      expect(result).toBe(false);

      // Restore document
      global.document = savedDocument;
    });
  });

  describe("deleteAllCookies", () => {
    beforeEach(() => {
      // Set multiple test cookies
      document.cookie = "cookie1=value1; path=/";
      document.cookie = "cookie2=value2; path=/";
      document.cookie = "cookie3=value3; path=/";
    });

    it("should delete all cookies", () => {
      deleteAllCookies();
      // Check that deletion attempts were made (cookies set with Max-Age=0)
      expect(document.cookie).toContain("Max-Age=0");
      expect(document.cookie).toContain("expires=Thu, 01 Jan 1970");
    });

    it("should return true on success", () => {
      const result = deleteAllCookies();
      expect(result).toBe(true);
    });

    it("should handle errors gracefully", () => {
      // Save current document
      const savedDocument = global.document;
      // Mock document to be undefined
      global.document = undefined;

      const result = deleteAllCookies();
      expect(result).toBe(false);

      // Restore document
      global.document = savedDocument;
    });
  });

  describe("getCookie", () => {
    beforeEach(() => {
      document.cookie = "test1=value1; test2=value2; test3=value3";
    });

    it("should get a cookie by name", () => {
      const result = getCookie("test1");
      expect(result).toBe("value1");
    });

    it("should return null for non-existent cookie", () => {
      const result = getCookie("nonexistent");
      expect(result).toBeNull();
    });

    it("should decode URI encoded values", () => {
      document.cookie = "test=value%20with%20spaces";
      const result = getCookie("test");
      expect(result).toBe("value with spaces");
    });

    it("should handle cookies with special characters", () => {
      document.cookie = "test=value%2Bwith%2Bplus";
      const result = getCookie("test");
      expect(result).toBe("value+with+plus");
    });

    it("should handle errors gracefully", () => {
      // Save current document
      const savedDocument = global.document;
      // Mock document to be undefined
      global.document = undefined;

      const result = getCookie("test");
      expect(result).toBeNull();

      // Restore document
      global.document = savedDocument;
    });
  });

  describe("hasCookie", () => {
    beforeEach(() => {
      document.cookie = "test1=value1; test2=value2";
    });

    it("should return true for existing cookie", () => {
      const result = hasCookie("test1");
      expect(result).toBe(true);
    });

    it("should return false for non-existent cookie", () => {
      const result = hasCookie("nonexistent");
      expect(result).toBe(false);
    });

    it("should return false when getCookie returns null", () => {
      const result = hasCookie("nonexistent");
      expect(result).toBe(false);
    });
  });

  describe("Integration tests - Auth token behavior", () => {
    it("should set auth token with conditional secure flag on HTTPS", () => {
      window.location.protocol = "https:";
      setCookie("token", "session-token-123", {
        path: "/",
        secure: window.location.protocol === "https:",
        sameSite: "Strict",
      });
      expect(document.cookie).toContain("token=session-token-123");
      expect(document.cookie).toContain("Secure");
      expect(document.cookie).toContain("SameSite=Strict");
    });

    it("should set auth token without secure flag on HTTP", () => {
      window.location.protocol = "http:";
      setCookie("token", "session-token-123", {
        path: "/",
        secure: window.location.protocol === "https:",
        sameSite: "Strict",
      });
      expect(document.cookie).toContain("token=session-token-123");
      expect(document.cookie).not.toContain("Secure");
      expect(document.cookie).toContain("SameSite=Strict");
    });

    it("should delete auth token with secureVariants", () => {
      deleteCookie("auth_token", {
        path: "/",
        secure: true,
        sameSite: "Strict",
      });
      expect(document.cookie).toContain("auth_token=");
      expect(document.cookie).toContain("Max-Age=0");
    });
  });

  describe("Integration tests - CSRF token behavior", () => {
    it("should set CSRF token with secure flag", () => {
      setCookie("XSRF-TOKEN", "csrf-token-456", {
        path: "/",
        secure: true,
        sameSite: "Strict",
      });
      expect(document.cookie).toContain("XSRF-TOKEN=csrf-token-456");
      expect(document.cookie).toContain("Secure");
      expect(document.cookie).toContain("SameSite=Strict");
    });

    it("should URI encode CSRF token value", () => {
      setCookie("XSRF-TOKEN", "token with spaces", {
        path: "/",
        secure: true,
        sameSite: "Strict",
      });
      expect(document.cookie).toContain("XSRF-TOKEN=token%20with%20spaces");
    });
  });
});
