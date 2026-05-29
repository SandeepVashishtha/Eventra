import { ENV } from "../config/env.js";
const isProduction = process.env.NODE_ENV === "production";
const Sentry = {
  captureException: () => {},
};

export const initializeGlobalErrorHandling =
  () => {
    // Global JS Errors
    window.onerror = (
      message,
      source,
      lineno,
      colno,
      error
    ) => {
      console.error(
        "[GlobalError]",
        error
      );

      if (isProduction && dsn) {
        Sentry.captureException(error || new Error(message));
      }
    };

    // Unhandled Promise Rejections
    window.onunhandledrejection =
      (event) => {
        console.error(
          "[UnhandledPromiseRejection]",
          event.reason
        );

        if (isProduction && dsn) {
          Sentry.captureException(event.reason);
        }
      };
  };
