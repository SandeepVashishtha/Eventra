/**
 * api/auth/user-storage.js
 *
 * Storage abstraction layer for authentication user data.
 *
 * This module provides a unified interface for user storage operations,
 * with different backends for development (in-memory Maps) and production (Redis).
 *
 * SECURITY REQUIREMENTS:
 * - Fail closed: reject operations if storage is unavailable
 * - No fallback to Maps in production
 * - No silent failures
 * - Persistent storage required in production
 */

import Redis from "ioredis";
import { isPersistentStorageConfigured, isInMemoryStorageAllowed } from "./storage-config.js";

// ---------------------------------------------------------------------------
// Storage Backend Interface
// ---------------------------------------------------------------------------

/**
 * User storage backend interface.
 * All backends must implement these methods.
 */
class StorageBackend {
  /**
   * Initialize the storage backend.
   * @throws {Error} If initialization fails
   */
  async initialize() {
    throw new Error("initialize() must be implemented");
  }

  /**
   * Create a new user.
   * @param {Object} user - User object
   * @returns {Promise<Object>} Created user
   * @throws {Error} If user already exists or storage fails
   */
  async createUser(user) {
    throw new Error("createUser() must be implemented");
  }

  /**
   * Get user by email.
   * @param {string} email - User email (normalized)
   * @returns {Promise<Object|null>} User or null if not found
   */
  async getUserByEmail(email) {
    throw new Error("getUserByEmail() must be implemented");
  }

  /**
   * Get user by username.
   * @param {string} username - Username (normalized)
   * @returns {Promise<Object|null>} User or null if not found
   */
  async getUserByUsername(username) {
    throw new Error("getUserByUsername() must be implemented");
  }

  /**
   * Get user by ID.
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} User or null if not found
   */
  async getUserById(id) {
    throw new Error("getUserById() must be implemented");
  }

  /**
   * Update user.
   * @param {string} id - User ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated user
   * @throws {Error} If user not found or storage fails
   */
  async updateUser(id, updates) {
    throw new Error("updateUser() must be implemented");
  }

  /**
   * Delete user.
   * @param {string} id - User ID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteUser(id) {
    throw new Error("deleteUser() must be implemented");
  }

  /**
   * Check if storage is healthy.
   * @returns {Promise<boolean>} True if healthy
   */
  async healthCheck() {
    throw new Error("healthCheck() must be implemented");
  }

  /**
   * Close storage connection.
   */
  async close() {
    throw new Error("close() must be implemented");
  }
}

// ---------------------------------------------------------------------------
// In-Memory Map Backend (Development/Testing Only)
// ---------------------------------------------------------------------------

class InMemoryStorageBackend extends StorageBackend {
  constructor() {
    super();
    this.usersByEmail = new Map();
    this.usersById = new Map();
    this.usersByUsername = new Map();
    this.initialized = false;
  }

  async initialize() {
    this.initialized = true;
  }

  async createUser(user) {
    if (!this.initialized) {
      throw new Error("Storage not initialized");
    }

    const email = user.email.toLowerCase();
    const username = user.username?.toLowerCase();

    if (this.usersByEmail.has(email)) {
      throw new Error("User with this email already exists");
    }

    if (username && this.usersByUsername.has(username)) {
      throw new Error("User with this username already exists");
    }

    this.usersByEmail.set(email, user);
    this.usersById.set(user.id, user);
    if (username) {
      this.usersByUsername.set(username, user);
    }

    return user;
  }

  async getUserByEmail(email) {
    if (!this.initialized) {
      throw new Error("Storage not initialized");
    }
    return this.usersByEmail.get(email.toLowerCase()) || null;
  }

  async getUserByUsername(username) {
    if (!this.initialized) {
      throw new Error("Storage not initialized");
    }
    return this.usersByUsername.get(username.toLowerCase()) || null;
  }

  async getUserById(id) {
    if (!this.initialized) {
      throw new Error("Storage not initialized");
    }
    return this.usersById.get(id) || null;
  }

  async updateUser(id, updates) {
    if (!this.initialized) {
      throw new Error("Storage not initialized");
    }

    const user = this.usersById.get(id);
    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser = { ...user, ...updates, updatedAt: new Date().toISOString() };

    // Update all indexes
    this.usersById.set(id, updatedUser);
    this.usersByEmail.set(user.email.toLowerCase(), updatedUser);
    if (user.username) {
      this.usersByUsername.set(user.username.toLowerCase(), updatedUser);
    }

    return updatedUser;
  }

  async deleteUser(id) {
    if (!this.initialized) {
      throw new Error("Storage not initialized");
    }

    const user = this.usersById.get(id);
    if (!user) {
      return false;
    }

    this.usersById.delete(id);
    this.usersByEmail.delete(user.email.toLowerCase());
    if (user.username) {
      this.usersByUsername.delete(user.username.toLowerCase());
    }

    return true;
  }

  async healthCheck() {
    return this.initialized;
  }

  async close() {
    this.usersByEmail.clear();
    this.usersById.clear();
    this.usersByUsername.clear();
    this.initialized = false;
  }
}

// ---------------------------------------------------------------------------
// Redis Backend (Production)
// ---------------------------------------------------------------------------

class RedisStorageBackend extends StorageBackend {
  constructor(redisUrl) {
    super();
    this.redisUrl = redisUrl;
    this.redis = null;
    this.initialized = false;
    this.keyPrefix = "auth:user:";
  }

  async initialize() {
    try {
      this.redis = new Redis(this.redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) {
            return null; // Stop retrying after 3 attempts
          }
          return Math.min(times * 100, 3000); // Exponential backoff
        },
      });

      // Test connection
      await this.redis.ping();
      this.initialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize Redis storage: ${error.message}`);
    }
  }

  _userKey(id) {
    return `${this.keyPrefix}${id}`;
  }

  _emailKey(email) {
    return `${this.keyPrefix}email:${email.toLowerCase()}`;
  }

  _usernameKey(username) {
    return `${this.keyPrefix}username:${username.toLowerCase()}`;
  }

  async createUser(user) {
    if (!this.initialized) {
      throw new Error("Storage not initialized");
    }

    const email = user.email.toLowerCase();
    const username = user.username?.toLowerCase();

    // Check for existing user by email
    const existingEmailId = await this.redis.get(this._emailKey(email));
    if (existingEmailId) {
      throw new Error("User with this email already exists");
    }

    // Check for existing user by username
    if (username) {
      const existingUsernameId = await this.redis.get(this._usernameKey(username));
      if (existingUsernameId) {
        throw new Error("User with this username already exists");
      }
    }

    // Store user data
    await this.redis.set(this._userKey(user.id), JSON.stringify(user));

    // Create indexes
    await this.redis.set(this._emailKey(email), user.id);
    if (username) {
      await this.redis.set(this._usernameKey(username), user.id);
    }

    return user;
  }

  async getUserByEmail(email) {
    if (!this.initialized) {
      throw new Error("Storage not initialized");
    }

    const userId = await this.redis.get(this._emailKey(email.toLowerCase()));
    if (!userId) {
      return null;
    }

    const userData = await this.redis.get(this._userKey(userId));
    if (!userData) {
      return null;
    }

    return JSON.parse(userData);
  }

  async getUserByUsername(username) {
    if (!this.initialized) {
      throw new Error("Storage not initialized");
    }

    const userId = await this.redis.get(this._usernameKey(username.toLowerCase()));
    if (!userId) {
      return null;
    }

    const userData = await this.redis.get(this._userKey(userId));
    if (!userData) {
      return null;
    }

    return JSON.parse(userData);
  }

  async getUserById(id) {
    if (!this.initialized) {
      throw new Error("Storage not initialized");
    }

    const userData = await this.redis.get(this._userKey(id));
    if (!userData) {
      return null;
    }

    return JSON.parse(userData);
  }

  async updateUser(id, updates) {
    if (!this.initialized) {
      throw new Error("Storage not initialized");
    }

    const userData = await this.redis.get(this._userKey(id));
    if (!userData) {
      throw new Error("User not found");
    }

    const user = JSON.parse(userData);
    const updatedUser = { ...user, ...updates, updatedAt: new Date().toISOString() };

    // Update user data
    await this.redis.set(this._userKey(id), JSON.stringify(updatedUser));

    // Update indexes if email or username changed
    if (updates.email && updates.email !== user.email) {
      await this.redis.del(this._emailKey(user.email.toLowerCase()));
      await this.redis.set(this._emailKey(updates.email.toLowerCase()), id);
    }

    if (updates.username && updates.username !== user.username) {
      if (user.username) {
        await this.redis.del(this._usernameKey(user.username.toLowerCase()));
      }
      await this.redis.set(this._usernameKey(updates.username.toLowerCase()), id);
    }

    return updatedUser;
  }

  async deleteUser(id) {
    if (!this.initialized) {
      throw new Error("Storage not initialized");
    }

    const userData = await this.redis.get(this._userKey(id));
    if (!userData) {
      return false;
    }

    const user = JSON.parse(userData);

    // Delete user data
    await this.redis.del(this._userKey(id));

    // Delete indexes
    await this.redis.del(this._emailKey(user.email.toLowerCase()));
    if (user.username) {
      await this.redis.del(this._usernameKey(user.username.toLowerCase()));
    }

    return true;
  }

  async healthCheck() {
    if (!this.initialized || !this.redis) {
      return false;
    }
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  async close() {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
    }
    this.initialized = false;
  }
}

// ---------------------------------------------------------------------------
// Storage Factory
// ---------------------------------------------------------------------------

let storageBackend = null;

/**
 * Get the appropriate storage backend based on environment.
 * @returns {StorageBackend} Storage backend instance
 * @throws {Error} If storage cannot be initialized
 */
export async function getStorageBackend() {
  if (storageBackend) {
    return storageBackend;
  }

  // Development/Testing: Use in-memory Maps
  if (isInMemoryStorageAllowed()) {
    storageBackend = new InMemoryStorageBackend();
    await storageBackend.initialize();
    return storageBackend;
  }

  // Production: Use persistent storage (Redis)
  if (isPersistentStorageConfigured()) {
    const databaseUrl = process.env.DATABASE_URL || process.env.KV_REST_API_URL;
    if (!databaseUrl) {
      throw new Error(
        "DATABASE_URL or KV_REST_API_URL is required in production. " +
        "Authentication storage cannot be initialized."
      );
    }

    storageBackend = new RedisStorageBackend(databaseUrl);
    await storageBackend.initialize();
    return storageBackend;
  }

  // Production without persistent storage: Fail closed
  throw new Error(
    "Persistent storage is required in production. " +
    "Set DATABASE_URL or KV_REST_API_URL to enable authentication."
  );
}

/**
 * Reset the storage backend (for testing only).
 */
export async function resetStorageBackend() {
  if (storageBackend) {
    await storageBackend.close();
    storageBackend = null;
  }
}

// ---------------------------------------------------------------------------
// Storage Abstraction API
// ---------------------------------------------------------------------------

/**
 * Create a new user.
 * @param {Object} user - User object
 * @returns {Promise<Object>} Created user
 */
export async function createUser(user) {
  const storage = await getStorageBackend();
  return storage.createUser(user);
}

/**
 * Get user by email.
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User or null if not found
 */
export async function getUserByEmail(email) {
  const storage = await getStorageBackend();
  return storage.getUserByEmail(email);
}

/**
 * Get user by username.
 * @param {string} username - Username
 * @returns {Promise<Object|null>} User or null if not found
 */
export async function getUserByUsername(username) {
  const storage = await getStorageBackend();
  return storage.getUserByUsername(username);
}

/**
 * Get user by ID.
 * @param {string} id - User ID
 * @returns {Promise<Object|null>} User or null if not found
 */
export async function getUserById(id) {
  const storage = await getStorageBackend();
  return storage.getUserById(id);
}

/**
 * Update user.
 * @param {string} id - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated user
 */
export async function updateUser(id, updates) {
  const storage = await getStorageBackend();
  return storage.updateUser(id, updates);
}

/**
 * Delete user.
 * @param {string} id - User ID
 * @returns {Promise<boolean>} True if deleted
 */
export async function deleteUser(id) {
  const storage = await getStorageBackend();
  return storage.deleteUser(id);
}

/**
 * Check if storage is healthy.
 * @returns {Promise<boolean>} True if healthy
 */
export async function isStorageHealthy() {
  try {
    const storage = await getStorageBackend();
    return storage.healthCheck();
  } catch (error) {
    return false;
  }
}
