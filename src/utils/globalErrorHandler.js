const isProduction = process.env.NODE_ENV === "production";

export const initializeGlobalErrorHandling = () => {
  // Global JS Errors
  window.onerror = (message, source, lineno, colno, error) => {
    console.error("[GlobalError]", error);

    if (!isProduction) return;
  };

  // Unhandled Promise Rejections
  window.onunhandledrejection = (event) => {
    console.error("[UnhandledPromiseRejection]", event.reason);

    if (!isProduction) return;
  };
};
