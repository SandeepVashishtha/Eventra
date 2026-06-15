/**
 * api/auth/storage-config.js
 *
 * Centralized authentication storage configuration and validation.
 *
 * This module enforces fail-closed security for persistent authentication storage.
 * In-memory user storage is permitted ONLY in development environments.
 * Production requires DATABASE_URL to be configured.
 *
 * SECURITY REQUIREMENTS:
 * - Fail closed, never fail open
 * - No fallback to Map storage in production
 * - No bypass flags
 * - No silent warnings
 * - No environment variable defaults
 * - No hardcoded database URLs
 */

/**
 * Checks if persistent storage is properly configured.
 *
 * @returns {boolean} True if DATABASE_URL is present and non-empty
 */
export const isPersistentStorageConfigured = () => {
  return Boolean(process.env.DATABASE_URL?.trim());
};

/**
 * Asserts that persistent storage is configured in production.
 *
 * Throws an error if:
 * - NODE_ENV is "production" AND
 * - DATABASE_URL is missing, empty, or whitespace-only
 *
 * This should be called during module initialization to fail fast
 * before the application accepts any authentication requests.
 *
 * @throws {Error} If production storage is not configured
 */
export const assertPersistentStorageConfigured = () => {
  if (process.env.NODE_ENV === "production" && !isPersistentStorageConfigured()) {
    throw new Error(
      "DATABASE_URL is required in production. In-memory authentication storage is not permitted."
    );
  }
};

/**
 * Checks if in-memory storage is allowed for the current environment.
 *
 * In-memory storage is allowed ONLY when NODE_ENV is NOT "production".
 * This preserves existing development and test workflows.
 *
 * @returns {boolean} True if in-memory storage is permitted
 */
export const isInMemoryStorageAllowed = () => {
  return process.env.NODE_ENV !== "production";
};
