/**
 * api/_lib/ticket-token-config.js
 *
 * Configuration module for ticket JWT expiration.
 * Provides configurable and event-aware expiration strategies.
 */

/**
 * Default expiration period for ticket JWTs when no configuration is provided.
 * Changed from 365d to 30d for better security - tokens should not outlive events.
 */
const DEFAULT_EXPIRY = "30d";

/**
 * Grace period after event end time (in hours) for event-aware expiration.
 * Allows attendees to check in shortly after event ends.
 */
const GRACE_PERIOD_HOURS = 24;

/**
 * Environment variable name for configuring ticket JWT expiration.
 */
const ENV_VAR_NAME = "TICKET_JWT_EXPIRY";

/**
 * Parses a time duration string into seconds.
 * Supports: s (seconds), m (minutes), h (hours), d (days)
 *
 * @param {string} duration - e.g., "30d", "7d", "24h", "60m"
 * @returns {number} Duration in seconds, or null if invalid
 */
function parseDurationToSeconds(duration) {
  if (!duration || typeof duration !== "string") {
    return null;
  }

  const match = duration.match(/^(\d+)([smhd])$/i);
  if (!match) {
    return null;
  }

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  if (value <= 0) {
    return null;
  }

  const multipliers = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 60 * 60 * 24,
  };

  const multiplier = multipliers[unit];
  if (!multiplier) {
    return null;
  }

  return value * multiplier;
}

/**
 * Validates if a duration string is safe and reasonable.
 * Rejects durations that are too long (e.g., > 365 days) or too short (e.g., < 1 hour).
 *
 * @param {string} duration - Duration string to validate
 * @returns {boolean} True if valid and safe
 */
function isValidDuration(duration) {
  const seconds = parseDurationToSeconds(duration);
  if (!seconds) {
    return false;
  }

  // Minimum: 1 hour (3600 seconds)
  // Maximum: 365 days (31536000 seconds)
  const MIN_SECONDS = 3600;
  const MAX_SECONDS = 365 * 24 * 60 * 60;

  return seconds >= MIN_SECONDS && seconds <= MAX_SECONDS;
}

/**
 * Gets the configured ticket JWT expiration from environment.
 * Falls back to DEFAULT_EXPIRY if not configured or invalid.
 *
 * @returns {string} Duration string (e.g., "30d", "7d")
 */
function getConfiguredExpiry() {
  const configured = process.env[ENV_VAR_NAME];

  if (!configured) {
    return DEFAULT_EXPIRY;
  }

  if (isValidDuration(configured)) {
    return configured;
  }

  // Log warning about invalid configuration
  console.warn(
    `[TICKET_TOKEN] Invalid ${ENV_VAR_NAME} value: "${configured}". Using default: ${DEFAULT_EXPIRY}`
  );

  return DEFAULT_EXPIRY;
}

/**
 * Calculates event-aware expiration based on event end time.
 * Returns a Unix timestamp (seconds) for the expiration time.
 *
 * @param {string|Date} eventEndTime - Event end time (ISO string or Date object)
 * @returns {number|null} Unix timestamp in seconds, or null if invalid
 */
function calculateEventAwareExpiry(eventEndTime) {
  if (!eventEndTime) {
    return null;
  }

  try {
    const endTime = new Date(eventEndTime);
    if (isNaN(endTime.getTime())) {
      return null;
    }

    // Add grace period
    const expiryTime = new Date(endTime.getTime() + GRACE_PERIOD_HOURS * 60 * 60 * 1000);

    // Convert to Unix timestamp (seconds)
    return Math.floor(expiryTime.getTime() / 1000);
  } catch {
    return null;
  }
}

/**
 * Gets the appropriate expiration strategy for a ticket JWT.
 * Priority:
 * 1. Event-aware expiration (if event end time provided and valid)
 * 2. Configured environment variable
 * 3. Default (30d)
 *
 * @param {Object} options
 * @param {string|Date} [options.eventEndTime] - Event end time for event-aware expiration
 * @returns {string|number} Either a duration string (e.g., "30d") or Unix timestamp (seconds)
 */
export function getTicketJwtExpiry({ eventEndTime = null } = {}) {
  // Try event-aware expiration first
  if (eventEndTime) {
    const eventAwareExpiry = calculateEventAwareExpiry(eventEndTime);
    if (eventAwareExpiry) {
      return eventAwareExpiry; // Returns Unix timestamp
    }
  }

  // Fall back to configured/default duration
  return getConfiguredExpiry(); // Returns duration string
}

/**
 * Gets the default expiry duration for documentation/testing purposes.
 *
 * @returns {string} Default duration string
 */
export function getDefaultExpiry() {
  return DEFAULT_EXPIRY;
}

/**
 * Validates an expiry configuration value.
 * Useful for testing or configuration validation.
 *
 * @param {string} duration - Duration string to validate
 * @returns {boolean} True if valid
 */
export function validateExpiryConfig(duration) {
  return isValidDuration(duration);
}

/**
 * Parses a duration string to seconds.
 * Useful for testing or calculations.
 *
 * @param {string} duration - Duration string to parse
 * @returns {number|null} Seconds or null if invalid
 */
export function parseDuration(duration) {
  return parseDurationToSeconds(duration);
}
