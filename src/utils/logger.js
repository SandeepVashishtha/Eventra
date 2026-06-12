/**
 * Determines if the current environment is for development.
 */
const isDevelopment = typeof import.meta.env !== "undefined"
  ? import.meta.env.DEV
  : process.env.NODE_ENV !== "production";

/**
 * Sensitive field names that must never appear in logs.
 */
const SENSITIVE_FIELDS = new Set([
  "token", "accessToken", "refreshToken", "access_token", "refresh_token",
  "password", "secret", "credential", "credentials",
  "authorization", "Authorization",
  "jwt", "id_token", "idToken",
  "ssn", "cvv", "cardNumber", "card_number",
  "cookie", "sessionId", "session_id",
]);

/**
 * Recursively strips sensitive fields from an object before logging.
 * Handles nested objects and arrays. Non-object values pass through unchanged.
 *
 * @param {*} value - The value to sanitize.
 * @param {number} [depth=0] - Current recursion depth (max 5).
 * @returns {*} A sanitized copy safe for logging.
 */
export const sanitizeForLogging = (value, depth = 0) => {
  if (depth > 5) return "[深度截断]";
  if (value === null || value === undefined) return value;
  if (typeof value !== "object") return value;
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForLogging(item, depth + 1));
  }

  const sanitized = {};
  for (const [key, val] of Object.entries(value)) {
    if (SENSITIVE_FIELDS.has(key)) {
      sanitized[key] = "[REDACTED]";
    } else {
      sanitized[key] = sanitizeForLogging(val, depth + 1);
    }
  }
  return sanitized;
};

/**
 * Sanitizes an arguments list, redacting any sensitive objects.
 */
const sanitizeArgs = (args) =>
  args.map((arg) =>
    arg && typeof arg === "object" ? sanitizeForLogging(arg) : arg
  );

/**
 * Formats a log message with the specified level.
 */
const formatMessage = (level, message) => {
  return `[${level.toUpperCase()}] ${message}`;
};

/**
 * A logger utility that wraps console methods.
 * - In development: logs to console with sensitive fields redacted.
 * - In production: all logs are silenced except security events.
 */
export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(formatMessage("log", args[0]), ...sanitizeArgs(args.slice(1)));
    }
  },

  info: (...args) => {
    if (isDevelopment) {
      console.info(formatMessage("info", args[0]), ...sanitizeArgs(args.slice(1)));
    }
  },

  warn: (...args) => {
    if (isDevelopment) {
      console.warn(formatMessage("warn", args[0]), ...sanitizeArgs(args.slice(1)));
    }
  },

  error: (...args) => {
    if (isDevelopment) {
      console.error(formatMessage("error", args[0]), ...sanitizeArgs(args.slice(1)));
    }
  },

  /**
   * Logs a security event. Always fires (dev + prod) but sensitive fields
   * are always redacted. In production the entry is JSON-serialized so that
   * log-aggregation pipelines can ingest it without exposing raw objects.
   */
  security: (event, data = {}) => {
    const sanitizedData = sanitizeForLogging(data);
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, event, ...sanitizedData };

    if (isDevelopment) {
      console.warn(formatMessage("security", event), sanitizedData);
    } else {
      console.warn(JSON.stringify(logEntry));
    }
  },
};
