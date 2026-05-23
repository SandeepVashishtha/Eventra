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
    };

    // Unhandled Promise Rejections
    window.onunhandledrejection =
      (event) => {
        console.error(
          "[UnhandledPromiseRejection]",
          event.reason
        );
      };
  };