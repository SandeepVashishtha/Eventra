/**
 * api/lib/rate-limit-config.js
 *
 * Centralized distributed rate-limiting storage configuration and validation.
 *
 * This module enforces fail-closed security for distributed rate-limiting storage.
 * In-memory rate-limit storage is permitted ONLY in development environments.
 * Production requires KV_REST_API_URL and KV_REST_API_TOKEN to be configured.
 *
 * SECURITY REQUIREMENTS:
 * - Fail closed, never fail open
 * - No fallback to Map storage in production
 * - No bypass flags
 * - No silent warnings
 * - No environment variable defaults
 * - No hardcoded Redis/KV URLs
 */

/**
 * Checks if distributed rate-limit storage is properly configured.
 *
 * @returns {boolean} True if KV_REST_API_URL and KV_REST_API_TOKEN are present and non-empty
 */
export const isDistributedRateLimitStorageConfigured = () => {
  return Boolean(
    process.env.KV_REST_API_URL?.trim() &&
    process.env.KV_REST_API_TOKEN?.trim()
  );
};

/**
 * Asserts that distributed rate-limit storage is configured in production.
 *
 * Throws an error if:
 * - NODE_ENV is "production" AND
 * - KV_REST_API_URL or KV_REST_API_TOKEN is missing, empty, or whitespace-only
 *
 * This should be called during module initialization to fail fast
 * before the application accepts any authentication requests.
 *
 * @throws {Error} If production rate-limit storage is not configured
 */
export const assertDistributedRateLimitStorageConfigured = () => {
  if (process.env.NODE_ENV === "production" && !isDistributedRateLimitStorageConfigured()) {
    throw new Error(
      "KV_REST_API_URL and KV_REST_API_TOKEN are required in production for distributed rate limiting. In-memory rate-limit storage is not permitted."
    );
  }
};

/**
 * Checks if in-memory rate-limit storage is allowed for the current environment.
 *
 * In-memory storage is allowed ONLY when NODE_ENV is NOT "production".
 * This preserves existing development and test workflows.
 *
 * @returns {boolean} True if in-memory rate-limit storage is permitted
 */
export const isInMemoryRateLimitStorageAllowed = () => {
  return process.env.NODE_ENV !== "production";
};
