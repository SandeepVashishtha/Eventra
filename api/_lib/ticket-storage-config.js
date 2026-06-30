/**
 * api/lib/ticket-storage-config.js
 *
 * Centralized ticket storage configuration and validation.
 *
 * This module enforces fail-closed security for ticket storage.
 * In-memory ticket storage is permitted ONLY in development environments.
 * Production requires TICKET_REDIS_URL to be configured.
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
 * Checks if distributed ticket storage is properly configured.
 *
 * @returns {boolean} True if TICKET_REDIS_URL is present and non-empty
 */
export const isDistributedTicketStorageConfigured = () => {
  return Boolean(
    process.env.TICKET_REDIS_URL?.trim()
  );
};

/**
 * Asserts that distributed ticket storage is configured in production.
 *
 * Throws an error if:
 * - NODE_ENV is "production" AND
 * - TICKET_REDIS_URL is missing, empty, or whitespace-only
 *
 * This should be called during module initialization to fail fast
 * before the application accepts any ticket operations.
 *
 * @throws {Error} If production ticket storage is not configured
 */
export const assertDistributedTicketStorageConfigured = () => {
  if (process.env.NODE_ENV === "production" && !isDistributedTicketStorageConfigured()) {
    throw new Error(
      "TICKET_REDIS_URL is required in production for persistent ticket storage. In-memory ticket storage is not permitted."
    );
  }
};

/**
 * Checks if in-memory ticket storage is allowed for the current environment.
 *
 * In-memory storage is allowed ONLY when NODE_ENV is NOT "production".
 * This preserves existing development and test workflows.
 *
 * @returns {boolean} True if in-memory ticket storage is permitted
 */
export const isInMemoryTicketStorageAllowed = () => {
  return process.env.NODE_ENV !== "production";
};
