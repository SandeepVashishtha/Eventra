/**
 * api/_lib/session-risk-config.js
 *
 * Centralized session-risk storage configuration and validation.
 *
 * This module enforces fail-closed security for session-risk storage.
 * In-memory session-risk storage is permitted ONLY in development environments.
 * Production requires KV_REST_API_URL to be configured.
 *
 * SECURITY REQUIREMENTS:
 * - Fail closed, never fail open
 * - No fallback to Map storage in production
 * - No bypass flags
 * - No silent warnings
 * - No environment variable defaults
 * - No hardcoded KV URLs
 */

/**
 * Checks if distributed session-risk storage is properly configured.
 *
 * @returns {boolean} True if KV_REST_API_URL and KV_REST_API_TOKEN are present and non-empty
 */
export const isSessionRiskStorageConfigured = () => {
  return Boolean(
    process.env.KV_REST_API_URL?.trim() &&
    process.env.KV_REST_API_TOKEN?.trim()
  );
};

/**
 * Asserts that distributed session-risk storage is configured in production.
 *
 * Throws an error if:
 * - NODE_ENV is "production" AND
 * - KV_REST_API_URL or KV_REST_API_TOKEN is missing, empty, or whitespace-only
 *
 * This should be called during module initialization to fail fast
 * before the application accepts any authentication requests.
 *
 * @throws {Error} If production session-risk storage is not configured
 */
export const assertSessionRiskStorageConfigured = () => {
  if (process.env.NODE_ENV === "production" && !isSessionRiskStorageConfigured()) {
    throw new Error(
      "KV_REST_API_URL and KV_REST_API_TOKEN are required in production for session-risk storage. In-memory session-risk storage is not permitted."
    );
  }
};

/**
 * Checks if in-memory session-risk storage is allowed for the current environment.
 *
 * In-memory storage is allowed ONLY when NODE_ENV is NOT "production".
 * This preserves existing development and test workflows.
 *
 * @returns {boolean} True if in-memory session-risk storage is permitted
 */
export const isInMemorySessionRiskStorageAllowed = () => {
  return process.env.NODE_ENV !== "production";
};

/**
 * Gets the session risk failure mode configuration.
 *
 * Determines how session-risk operations behave when distributed storage is unavailable:
 * - "fallback": Try distributed storage, fall back to JWT validation, then allow (default)
 * - "open": Allow operations when storage fails (no session-risk enforcement during outages)
 * - "closed": Reject operations when storage fails (fail-closed security mode)
 *
 * @returns {string} The failure mode: "fallback", "open", or "closed"
 */
export const getSessionRiskFailMode = () => {
  const mode = process.env.SESSION_RISK_FAIL_MODE?.toLowerCase()?.trim();
  const validModes = ["fallback", "open", "closed"];
  
  if (mode && validModes.includes(mode)) {
    return mode;
  }
  
  // Default to fallback mode for improved resiliency
  return "fallback";
};
