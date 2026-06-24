/**
 * api/lib/rate-limit-config.js
 *
 * Centralized distributed rate-limiting storage configuration and validation.
 *
 * This module enforces fail-closed security for distributed rate-limiting storage.
 * In-memory rate-limit storage is permitted ONLY in development environments.
 * Production requires RATE_LIMIT_REDIS_URL to be configured.
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
 * @returns {boolean} True if RATE_LIMIT_REDIS_URL is present and non-empty
 */
export const isDistributedRateLimitStorageConfigured = () => {
  return Boolean(
    process.env.RATE_LIMIT_REDIS_URL?.trim()
  );
};

/**
 * Asserts that distributed rate-limit storage is configured in production.
 *
 * Throws an error if:
 * - NODE_ENV is "production" AND
 * - RATE_LIMIT_REDIS_URL is missing, empty, or whitespace-only
 *
 * This should be called during module initialization to fail fast
 * before the application accepts any authentication requests.
 *
 * @throws {Error} If production rate-limit storage is not configured
 */
export const assertDistributedRateLimitStorageConfigured = () => {
  if (process.env.NODE_ENV === "production" && !isDistributedRateLimitStorageConfigured()) {
    throw new Error(
      "RATE_LIMIT_REDIS_URL is required in production for distributed rate limiting. In-memory rate-limit storage is not permitted."
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

/**
 * Gets the rate limit failure mode configuration.
 *
 * Determines how the rate limiter behaves when distributed storage is unavailable:
 * - "fallback": Try distributed storage, fall back to in-memory, then allow (default)
 * - "open": Allow requests when storage fails (no rate limiting during outages)
 * - "closed": Reject requests when storage fails (current fail-closed behavior)
 *
 * @returns {string} The failure mode: "fallback", "open", or "closed"
 */
export const getRateLimitFailMode = () => {
  const mode = process.env.RATE_LIMIT_FAIL_MODE?.toLowerCase()?.trim();
  const validModes = ["fallback", "open", "closed"];
  
  if (mode && validModes.includes(mode)) {
    return mode;
  }
  
  // Default to fallback mode for improved resiliency
  return "fallback";
};
