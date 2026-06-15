import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("Storage Configuration Validation", () => {
  const originalEnv = process.env;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe("isPersistentStorageConfigured", () => {
    it("should return false when DATABASE_URL is missing", async () => {
      delete process.env.DATABASE_URL;
      const { isPersistentStorageConfigured } = await import("../../api/auth/storage-config.js");
      expect(isPersistentStorageConfigured()).toBe(false);
    });

    it("should return false when DATABASE_URL is empty", async () => {
      process.env.DATABASE_URL = "";
      const { isPersistentStorageConfigured } = await import("../../api/auth/storage-config.js");
      expect(isPersistentStorageConfigured()).toBe(false);
    });

    it("should return false when DATABASE_URL is whitespace-only", async () => {
      process.env.DATABASE_URL = "   ";
      const { isPersistentStorageConfigured } = await import("../../api/auth/storage-config.js");
      expect(isPersistentStorageConfigured()).toBe(false);
    });

    it("should return true when DATABASE_URL is present and non-empty", async () => {
      process.env.DATABASE_URL = "postgresql://user:password@host:5432/database";
      const { isPersistentStorageConfigured } = await import("../../api/auth/storage-config.js");
      expect(isPersistentStorageConfigured()).toBe(true);
    });
  });

  describe("assertPersistentStorageConfigured", () => {
    it("should throw error in production when DATABASE_URL is missing", async () => {
      process.env.NODE_ENV = "production";
      delete process.env.DATABASE_URL;
      const { assertPersistentStorageConfigured } = await import("../../api/auth/storage-config.js");
      expect(() => assertPersistentStorageConfigured()).toThrow(
        "DATABASE_URL is required in production. In-memory authentication storage is not permitted."
      );
    });

    it("should throw error in production when DATABASE_URL is empty", async () => {
      process.env.NODE_ENV = "production";
      process.env.DATABASE_URL = "";
      const { assertPersistentStorageConfigured } = await import("../../api/auth/storage-config.js");
      expect(() => assertPersistentStorageConfigured()).toThrow(
        "DATABASE_URL is required in production. In-memory authentication storage is not permitted."
      );
    });

    it("should throw error in production when DATABASE_URL is whitespace-only", async () => {
      process.env.NODE_ENV = "production";
      process.env.DATABASE_URL = "   ";
      const { assertPersistentStorageConfigured } = await import("../../api/auth/storage-config.js");
      expect(() => assertPersistentStorageConfigured()).toThrow(
        "DATABASE_URL is required in production. In-memory authentication storage is not permitted."
      );
    });

    it("should not throw error in production when DATABASE_URL is valid", async () => {
      process.env.NODE_ENV = "production";
      process.env.DATABASE_URL = "postgresql://user:password@host:5432/database";
      const { assertPersistentStorageConfigured } = await import("../../api/auth/storage-config.js");
      expect(() => assertPersistentStorageConfigured()).not.toThrow();
    });

    it("should not throw error in development when DATABASE_URL is missing", async () => {
      process.env.NODE_ENV = "development";
      delete process.env.DATABASE_URL;
      const { assertPersistentStorageConfigured } = await import("../../api/auth/storage-config.js");
      expect(() => assertPersistentStorageConfigured()).not.toThrow();
    });

    it("should not throw error in test when DATABASE_URL is missing", async () => {
      process.env.NODE_ENV = "test";
      delete process.env.DATABASE_URL;
      const { assertPersistentStorageConfigured } = await import("../../api/auth/storage-config.js");
      expect(() => assertPersistentStorageConfigured()).not.toThrow();
    });

    it("should not throw error when NODE_ENV is not set", async () => {
      delete process.env.NODE_ENV;
      delete process.env.DATABASE_URL;
      const { assertPersistentStorageConfigured } = await import("../../api/auth/storage-config.js");
      expect(() => assertPersistentStorageConfigured()).not.toThrow();
    });
  });

  describe("isInMemoryStorageAllowed", () => {
    it("should return true in development mode", async () => {
      process.env.NODE_ENV = "development";
      const { isInMemoryStorageAllowed } = await import("../../api/auth/storage-config.js");
      expect(isInMemoryStorageAllowed()).toBe(true);
    });

    it("should return true in test mode", async () => {
      process.env.NODE_ENV = "test";
      const { isInMemoryStorageAllowed } = await import("../../api/auth/storage-config.js");
      expect(isInMemoryStorageAllowed()).toBe(true);
    });

    it("should return false in production mode", async () => {
      process.env.NODE_ENV = "production";
      const { isInMemoryStorageAllowed } = await import("../../api/auth/storage-config.js");
      expect(isInMemoryStorageAllowed()).toBe(false);
    });

    it("should return true when NODE_ENV is not set", async () => {
      delete process.env.NODE_ENV;
      const { isInMemoryStorageAllowed } = await import("../../api/auth/storage-config.js");
      expect(isInMemoryStorageAllowed()).toBe(true);
    });
  });

  describe("Development workflow compatibility", () => {
    it("should allow in-memory storage in development without DATABASE_URL", async () => {
      process.env.NODE_ENV = "development";
      delete process.env.DATABASE_URL;
      
      const { isInMemoryStorageAllowed, isPersistentStorageConfigured } = await import("../../api/auth/storage-config.js");
      
      expect(isInMemoryStorageAllowed()).toBe(true);
      expect(isPersistentStorageConfigured()).toBe(false);
    });

    it("should allow in-memory storage in test mode without DATABASE_URL", async () => {
      process.env.NODE_ENV = "test";
      delete process.env.DATABASE_URL;
      
      const { isInMemoryStorageAllowed, isPersistentStorageConfigured } = await import("../../api/auth/storage-config.js");
      
      expect(isInMemoryStorageAllowed()).toBe(true);
      expect(isPersistentStorageConfigured()).toBe(false);
    });
  });
});
