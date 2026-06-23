/**
 * Secure error handler for API responses.
 * 
 * Prevents exposure of internal exception messages to clients while
 * preserving detailed error information for server-side debugging.
 */

import { logger } from "../../src/utils/logger.js";

/**
 * Determines if the current environment is development.
 * Checks both Vite (import.meta.env) and Node (process.env) environments.
 */
function isDevelopment() {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    if (import.meta.env.DEV === true) return true;
    if (import.meta.env.PROD === true) return false;
  }
  if (
    typeof process !== "undefined" &&
    process &&
    process.env &&
    process.env.NODE_ENV
  ) {
    return process.env.NODE_ENV !== "production";
  }
  return true;
}

/**
 * Handles server errors securely.
 * Logs full error details server-side and returns a generic message to clients.
 * In development mode, includes the actual error message for debugging.
 * 
 * @param {Object} res - Express response object
 * @param {Error} err - Error object
 * @param {Object} context - Additional context for logging (optional)
 * @param {number} status - HTTP status code (default: 500)
 */
export function handleServerError(res, err, context = {}, status = 500) {
  // Log full error details server-side
  logger.error("Server error occurred", {
    message: err.message,
    stack: err.stack,
    ...context,
  });

  // In development, expose error message for debugging
  if (isDevelopment()) {
    return res.status(status).json({
      error: err.message,
      ...(context.devDetails || {})
    });
  }

  // In production, return generic error message
  return res.status(status).json({
    error: "Internal server error"
  });
}

/**
 * Handles async route errors with try-catch wrapper.
 * 
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware function
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      handleServerError(res, err, {
        method: req.method,
        path: req.path,
        body: req.body,
        query: req.query,
      });
    });
  };
}
