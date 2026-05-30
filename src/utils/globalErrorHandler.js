import { ENV } from "../config/env";

const dsn = ENV.SENTRY_DSN;
const isProduction = process.env.NODE_ENV === "production";
const Sentry = {
  captureException: () => {},
};

let isInitialized = false;

export const initializeGlobalErrorHandling = () => {
  if (isInitialized) {
    return;
  }

  // Global JS Errors
  window.onerror = (message, source, lineno, colno, error) => {
    console.error("[GlobalError]", error);

    if (isProduction && dsn) {
      Sentry.captureException(error || new Error(message));
    }
  };

  // Unhandled Promise Rejections
  window.onunhandledrejection = (event) => {
    console.error("[UnhandledPromiseRejection]", event.reason);

    if (isProduction && dsn) {
      Sentry.captureException(event.reason);
    }
  };

  isInitialized = true;
};

export const resetGlobalErrorHandling = () => {
  if (typeof window !== "undefined") {
    window.onerror = null;
    window.onunhandledrejection = null;
  }
  isInitialized = false;
};
