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
      console.log(formatMessage("log", args[0]), ...args.slice(1));
    }
  },

  /**
   * Logs an informational message to the console.
   * @param {string} message - The message to log.
   * @param {...*} args - Additional arguments to pass to console.info.
   */
  info: (...args) => {
    if (isDevelopment) {
      console.info(formatMessage("info", args[0]), ...args.slice(1));
    }
  },

  /**
   * Logs a warning message to the console.
   * @param {string} message - The message to log.
   * @param {...*} args - Additional arguments to pass to console.warn.
   */
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(formatMessage("warn", args[0]), ...args.slice(1));
    }
  },

  /**
   * Logs an error message to the console.
   * @param {string} message - The message to log.
   * @param {...*} args - Additional arguments to pass to console.error.
   */
  error: (...args) => {
    if (isDevelopment) {
      console.error(formatMessage("error", args[0]), ...args.slice(1));
    }
  },
};
