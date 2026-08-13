import { redactSensitiveData } from "./security/redactSensitiveData.js";

// Cross-environment development check (Vite, Webpack, Node.js)
export const isDevelopment = (() => {
  if (typeof import.meta !== "undefined" && import.meta?.env) {
    return import.meta.env.DEV ?? import.meta.env.MODE !== "production";
  }
  if (typeof process !== "undefined" && process?.env) {
    return process.env.NODE_ENV !== "production";
  }
  return false;
})();

/**
  Formats log level into a standard bracketed prefix.
  Passing this as an independent console argument prevents 
  string coercion of non-string primary arguments (objects/errors).
 */
const getPrefix = (level) => `[${level.toUpperCase()}]`;

const redactLogArgs = (args) => args.map((arg) => redactSensitiveData(arg));

/**
 * A logger utility that wraps console methods.
 * Only logs messages when in a development environment.
 */
export const logger = {
  /**
   * Logs a standard message to the console.
   * @param {string} message - The message to log.
   * @param {...*} args - Additional arguments to pass to console.log.
   */
  log: (...args) => {
    if (isDevelopment) {
      console.log(getPrefix("log"), ...redactLogArgs(args));
    }
  },

  /**
   * Logs an informational message to the console.
   * @param {string} message - The message to log.
   * @param {...*} args - Additional arguments to pass to console.info.
   */
  info: (...args) => {
    if (isDevelopment) {
      console.info(getPrefix("info"), ...redactLogArgs(args));
    }
  },

  /**
   * Logs a warning message to the console.
   * @param {string} message - The message to log.
   * @param {...*} args - Additional arguments to pass to console.warn.
   */
  warn: (...args) => {
    console.warn(getPrefix("warn"), ...redactLogArgs(args));
  },

  /**
   * Logs an error message to the console.
   * @param {string} message - The message to log.
   * @param {...*} args - Additional arguments to pass to console.error.
   */
  error: (...args) => {
    console.error(getPrefix("error"), ...redactLogArgs(args));
  },

  /**
   * Logs a security event with redacted metadata.
   * @param {string} event - Machine-readable security event name.
   * @param {Object} [data] - Event metadata; sensitive fields are redacted.
   */
  security: (event, data = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = redactSensitiveData({ timestamp, event, ...data });

    if (isDevelopment) {
      console.warn(getPrefix("security"), redactSensitiveData(data));
    } else {
      console.warn(JSON.stringify(logEntry));
    }
  },
};
