/* eslint-disable-next-line no-console */

// Cross-environment development check (Vite, Webpack, Node.js)
const isDevelopment = (() => {
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

export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(getPrefix("log"), ...args);
    }
  },

  info: (...args) => {
    if (isDevelopment) {
      console.info(getPrefix("info"), ...args);
    }
  },

  warn: (...args) => {
    if (isDevelopment) {
      console.warn(getPrefix("warn"), ...args);
    }
  },

  error: (...args) => {
    console.error(getPrefix("error"), ...args);
  },
};