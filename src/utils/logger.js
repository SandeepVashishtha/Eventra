 
const isDevelopment = typeof import.meta.env !== "undefined" ? import.meta.env.DEV : process.env.NODE_ENV !== "production";

const formatMessage = (level, message) => {
  return `[${level.toUpperCase()}] ${message}`;
};

export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(formatMessage("log", args[0]), ...args.slice(1));
    }
  },

  info: (...args) => {
    if (isDevelopment) {
      console.info(formatMessage("info", args[0]), ...args.slice(1));
    }
  },

  warn: (...args) => {
    if (isDevelopment) {
      console.warn(formatMessage("warn", args[0]), ...args.slice(1));
    }
  },

  error: (...args) => {
    if (isDevelopment) {
      console.error(formatMessage("error", args[0]), ...args.slice(1));
    }
  },
};
// ... rest of your code
