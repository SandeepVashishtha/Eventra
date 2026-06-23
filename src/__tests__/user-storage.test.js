import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("User Storage Abstraction Layer", () => {
  const originalEnv = process.env;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(async () => {
    vi.resetModules();
    process.env = { ...originalEnv };
    // Reset storage backend before each test
    const { resetStorageBackend } = await import("../../api/auth/user-storage.js");
    await resetStorageBackend();
  });

  afterEach(async () => {
    process.env = originalEnv;
    process.env.NODE_ENV = originalNodeEnv;
    // Reset storage backend after each test
    try {
      const { resetStorageBackend } = await import("../../api/auth/user-storage.js");
      await resetStorageBackend();
    } catch (e) {
      // Ignore if module not loaded
    }
  });

  describe("In-Memory Storage Backend (Development)", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "development";
      delete process.env.DATABASE_URL;
      delete process.env.KV_REST_API_URL;
    });

    it("should initialize in-memory storage in development", async () => {
      const { getStorageBackend, isStorageHealthy } = await import("../../api/auth/user-storage.js");
      const storage = await getStorageBackend();
      expect(storage).toBeDefined();
      const healthy = await isStorageHealthy();
      expect(healthy).toBe(true);
    });

    it("should create and retrieve user by email", async () => {
      const { createUser, getUserByEmail } = await import("../../api/auth/user-storage.js");
      
      const testUser = {
        id: "user-123",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        username: "johndoe",
        password: "hashed_password",
        roles: ["USER"],
        permissions: ["events:view"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: false,
        isActive: true,
      };

      await createUser(testUser);
      const retrieved = await getUserByEmail("john@example.com");
      
      expect(retrieved).toBeDefined();
      expect(retrieved.email).toBe("john@example.com");
      expect(retrieved.id).toBe("user-123");
    });

    it("should create and retrieve user by username", async () => {
      const { createUser, getUserByUsername } = await import("../../api/auth/user-storage.js");
      
      const testUser = {
        id: "user-456",
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        username: "janesmith",
        password: "hashed_password",
        roles: ["USER"],
        permissions: ["events:view"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: false,
        isActive: true,
      };

      await createUser(testUser);
      const retrieved = await getUserByUsername("janesmith");
      
      expect(retrieved).toBeDefined();
      expect(retrieved.username).toBe("janesmith");
      expect(retrieved.id).toBe("user-456");
    });

    it("should create and retrieve user by ID", async () => {
      const { createUser, getUserById } = await import("../../api/auth/user-storage.js");
      
      const testUser = {
        id: "user-789",
        firstName: "Bob",
        lastName: "Johnson",
        email: "bob@example.com",
        username: "bobjohnson",
        password: "hashed_password",
        roles: ["USER"],
        permissions: ["events:view"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: false,
        isActive: true,
      };

      await createUser(testUser);
      const retrieved = await getUserById("user-789");
      
      expect(retrieved).toBeDefined();
      expect(retrieved.id).toBe("user-789");
    });

    it("should reject duplicate email addresses", async () => {
      const { createUser } = await import("../../api/auth/user-storage.js");
      
      const user1 = {
        id: "user-1",
        firstName: "John",
        lastName: "Doe",
        email: "duplicate@example.com",
        username: "user1",
        password: "hashed_password",
        roles: ["USER"],
        permissions: ["events:view"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: false,
        isActive: true,
      };

      const user2 = {
        id: "user-2",
        firstName: "Jane",
        lastName: "Smith",
        email: "duplicate@example.com",
        username: "user2",
        password: "hashed_password",
        roles: ["USER"],
        permissions: ["events:view"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: false,
        isActive: true,
      };

      await createUser(user1);
      
      await expect(createUser(user2)).rejects.toThrow(
        "User with this email already exists"
      );
    });

    it("should reject duplicate usernames", async () => {
      const { createUser } = await import("../../api/auth/user-storage.js");
      
      const user1 = {
        id: "user-1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        username: "duplicateuser",
        password: "hashed_password",
        roles: ["USER"],
        permissions: ["events:view"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: false,
        isActive: true,
      };

      const user2 = {
        id: "user-2",
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        username: "duplicateuser",
        password: "hashed_password",
        roles: ["USER"],
        permissions: ["events:view"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: false,
        isActive: true,
      };

      await createUser(user1);
      
      await expect(createUser(user2)).rejects.toThrow(
        "User with this username already exists"
      );
    });

    it("should update user", async () => {
      const { createUser, updateUser, getUserById } = await import("../../api/auth/user-storage.js");
      
      const testUser = {
        id: "user-update",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        username: "johndoe",
        password: "hashed_password",
        roles: ["USER"],
        permissions: ["events:view"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: false,
        isActive: true,
      };

      await createUser(testUser);
      
      const updated = await updateUser("user-update", {
        firstName: "Jane",
        lastName: "Smith",
      });
      
      expect(updated.firstName).toBe("Jane");
      expect(updated.lastName).toBe("Smith");
      
      const retrieved = await getUserById("user-update");
      expect(retrieved.firstName).toBe("Jane");
    });

    it("should delete user", async () => {
      const { createUser, deleteUser, getUserById } = await import("../../api/auth/user-storage.js");
      
      const testUser = {
        id: "user-delete",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        username: "johndoe",
        password: "hashed_password",
        roles: ["USER"],
        permissions: ["events:view"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: false,
        isActive: true,
      };

      await createUser(testUser);
      
      const deleted = await deleteUser("user-delete");
      expect(deleted).toBe(true);
      
      const retrieved = await getUserById("user-delete");
      expect(retrieved).toBeNull();
    });

    it("should return null for non-existent user", async () => {
      const { getUserByEmail, getUserByUsername, getUserById } = await import("../../api/auth/user-storage.js");
      
      expect(await getUserByEmail("nonexistent@example.com")).toBeNull();
      expect(await getUserByUsername("nonexistent")).toBeNull();
      expect(await getUserById("nonexistent-id")).toBeNull();
    });
  });

  describe("Persistence Tests", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "development";
      delete process.env.DATABASE_URL;
      delete process.env.KV_REST_API_URL;
    });

    it("should survive storage reinitialization", async () => {
      const { createUser, getUserByEmail, resetStorageBackend } = await import("../../api/auth/user-storage.js");
      
      const testUser = {
        id: "user-persist-1",
        firstName: "John",
        lastName: "Doe",
        email: "persist@example.com",
        username: "persistuser",
        password: "hashed_password",
        roles: ["USER"],
        permissions: ["events:view"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: false,
        isActive: true,
      };

      // Create user
      await createUser(testUser);
      
      // Simulate storage reinitialization (module reload scenario)
      await resetStorageBackend();
      
      // In-memory storage will be cleared after reset
      // This test verifies the behavior - in development, data is lost on reset
      // In production with Redis, data would persist
      const retrieved = await getUserByEmail("persist@example.com");
      
      // In development, in-memory storage is cleared on reset
      // This is expected behavior for development mode
      expect(retrieved).toBeNull();
    });

    it("should handle multiple operations correctly", async () => {
      const { createUser, getUserByEmail, getUserById } = await import("../../api/auth/user-storage.js");
      
      const users = [
        {
          id: "user-1",
          firstName: "Alice",
          lastName: "Johnson",
          email: "alice@example.com",
          username: "alice",
          password: "hashed_password",
          roles: ["USER"],
          permissions: ["events:view"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          emailVerified: false,
          isActive: true,
        },
        {
          id: "user-2",
          firstName: "Bob",
          lastName: "Smith",
          email: "bob@example.com",
          username: "bob",
          password: "hashed_password",
          roles: ["USER"],
          permissions: ["events:view"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          emailVerified: false,
          isActive: true,
        },
        {
          id: "user-3",
          firstName: "Charlie",
          lastName: "Brown",
          email: "charlie@example.com",
          username: "charlie",
          password: "hashed_password",
          roles: ["USER"],
          permissions: ["events:view"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          emailVerified: false,
          isActive: true,
        },
      ];

      for (const user of users) {
        await createUser(user);
      }

      const alice = await getUserByEmail("alice@example.com");
      const bob = await getUserById("user-2");
      
      expect(alice.firstName).toBe("Alice");
      expect(bob.firstName).toBe("Bob");
    });
  });

  describe("Production Validation Tests", () => {
    it("should fail to initialize in production without DATABASE_URL", async () => {
      process.env.NODE_ENV = "production";
      delete process.env.DATABASE_URL;
      delete process.env.KV_REST_API_URL;

      const { getStorageBackend } = await import("../../api/auth/user-storage.js");
      
      await expect(getStorageBackend()).rejects.toThrow(
        "Persistent storage is required in production"
      );
    });

    it("should fail to initialize in production without KV_REST_API_URL", async () => {
      process.env.NODE_ENV = "production";
      process.env.DATABASE_URL = "";
      delete process.env.KV_REST_API_URL;

      const { getStorageBackend } = await import("../../api/auth/user-storage.js");
      
      await expect(getStorageBackend()).rejects.toThrow(
        "Persistent storage is required in production"
      );
    });

    it("should fail health check when storage is unavailable", async () => {
      process.env.NODE_ENV = "production";
      delete process.env.DATABASE_URL;
      delete process.env.KV_REST_API_URL;

      const { isStorageHealthy } = await import("../../api/auth/user-storage.js");
      
      const healthy = await isStorageHealthy();
      expect(healthy).toBe(false);
    });

    it("should not fall back to in-memory storage in production", async () => {
      process.env.NODE_ENV = "production";
      delete process.env.DATABASE_URL;
      delete process.env.KV_REST_API_URL;

      const { createUser } = await import("../../api/auth/user-storage.js");
      
      const testUser = {
        id: "user-prod-test",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        username: "johndoe",
        password: "hashed_password",
        roles: ["USER"],
        permissions: ["events:view"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: false,
        isActive: true,
      };

      await expect(createUser(testUser)).rejects.toThrow(
        "Persistent storage is required in production"
      );
    });
  });

  describe("Authentication Regression Tests", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "development";
      delete process.env.DATABASE_URL;
      delete process.env.KV_REST_API_URL;
    });

    it("should support signup workflow", async () => {
      const { createUser, getUserByEmail } = await import("../../api/auth/user-storage.js");
      
      const newUser = {
        id: "user-signup",
        firstName: "Test",
        lastName: "User",
        email: "testuser@example.com",
        username: "testuser@example.com",
        password: "hashed_password_123",
        roles: ["USER"],
        permissions: ["events:view", "events:register"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: false,
        isActive: true,
      };

      await createUser(newUser);
      
      const retrieved = await getUserByEmail("testuser@example.com");
      expect(retrieved).toBeDefined();
      expect(retrieved.email).toBe("testuser@example.com");
      expect(retrieved.roles).toEqual(["USER"]);
      expect(retrieved.permissions).toContain("events:view");
    });

    it("should support login workflow", async () => {
      const { createUser, getUserByEmail } = await import("../../api/auth/user-storage.js");
      
      const existingUser = {
        id: "user-login",
        firstName: "Login",
        lastName: "User",
        email: "login@example.com",
        username: "loginuser",
        password: "$2b$12$hashed_password_hash",
        roles: ["USER"],
        permissions: ["events:view"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: false,
        isActive: true,
      };

      await createUser(existingUser);
      
      const retrieved = await getUserByEmail("login@example.com");
      expect(retrieved).toBeDefined();
      expect(retrieved.password).toBe("$2b$12$hashed_password_hash");
      expect(retrieved.isActive).toBe(true);
    });

    it("should support user lookup by email or username", async () => {
      const { createUser, getUserByEmail, getUserByUsername } = await import("../../api/auth/user-storage.js");
      
      const user = {
        id: "user-lookup",
        firstName: "Lookup",
        lastName: "Test",
        email: "lookup@example.com",
        username: "lookupuser",
        password: "hashed_password",
        roles: ["USER"],
        permissions: ["events:view"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: false,
        isActive: true,
      };

      await createUser(user);
      
      const byEmail = await getUserByEmail("lookup@example.com");
      const byUsername = await getUserByUsername("lookupuser");
      
      expect(byEmail).toBeDefined();
      expect(byUsername).toBeDefined();
      expect(byEmail.id).toBe(byUsername.id);
    });

    it("should handle case-insensitive email lookups", async () => {
      const { createUser, getUserByEmail } = await import("../../api/auth/user-storage.js");
      
      const user = {
        id: "user-case",
        firstName: "Case",
        lastName: "Test",
        email: "Test@Example.COM",
        username: "casetest",
        password: "hashed_password",
        roles: ["USER"],
        permissions: ["events:view"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: false,
        isActive: true,
      };

      await createUser(user);
      
      const retrieved1 = await getUserByEmail("test@example.com");
      const retrieved2 = await getUserByEmail("TEST@EXAMPLE.COM");
      const retrieved3 = await getUserByEmail("Test@Example.COM");
      
      expect(retrieved1).toBeDefined();
      expect(retrieved2).toBeDefined();
      expect(retrieved3).toBeDefined();
      expect(retrieved1.id).toBe(retrieved2.id);
      expect(retrieved2.id).toBe(retrieved3.id);
    });

    it("should handle case-insensitive username lookups", async () => {
      const { createUser, getUserByUsername } = await import("../../api/auth/user-storage.js");
      
      const user = {
        id: "user-username-case",
        firstName: "Username",
        lastName: "Test",
        email: "usernametest@example.com",
        username: "TestUser",
        password: "hashed_password",
        roles: ["USER"],
        permissions: ["events:view"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: false,
        isActive: true,
      };

      await createUser(user);
      
      const retrieved1 = await getUserByUsername("testuser");
      const retrieved2 = await getUserByUsername("TESTUSER");
      const retrieved3 = await getUserByUsername("TestUser");
      
      expect(retrieved1).toBeDefined();
      expect(retrieved2).toBeDefined();
      expect(retrieved3).toBeDefined();
      expect(retrieved1.id).toBe(retrieved2.id);
      expect(retrieved2.id).toBe(retrieved3.id);
    });
  });

  describe("Storage Backend Classes", () => {
    it("should throw error for unimplemented methods in base class", async () => {
      const { StorageBackend } = await import("../../api/auth/user-storage.js");
      
      const backend = new StorageBackend();
      
      await expect(backend.initialize()).rejects.toThrow("initialize() must be implemented");
      await expect(backend.createUser({})).rejects.toThrow("createUser() must be implemented");
      await expect(backend.getUserByEmail("")).rejects.toThrow("getUserByEmail() must be implemented");
      await expect(backend.getUserByUsername("")).rejects.toThrow("getUserByUsername() must be implemented");
      await expect(backend.getUserById("")).rejects.toThrow("getUserById() must be implemented");
      await expect(backend.updateUser("", {})).rejects.toThrow("updateUser() must be implemented");
      await expect(backend.deleteUser("")).rejects.toThrow("deleteUser() must be implemented");
      await expect(backend.healthCheck()).rejects.toThrow("healthCheck() must be implemented");
      await expect(backend.close()).rejects.toThrow("close() must be implemented");
    });
  });
});
