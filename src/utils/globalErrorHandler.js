import { logError } from "./errorLogger.js";

export const initializeGlobalErrorHandling = () => {
  if (typeof window === "undefined") return;

  window.onerror = (message, source, lineno, colno, error) => {
    console.error("[GlobalError]", error || message);
    if (error) {
      logError(error, null, { source, lineno, colno });
    }
  };

  window.onunhandledrejection = (event) => {
    const reason = event.reason;
    console.error("[UnhandledPromiseRejection]", reason);
    logError(reason instanceof Error ? reason : new Error(String(reason)), null, {
      type: "unhandled_promise_rejection",
    });
  };
};
