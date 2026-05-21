export const logError = (
  error,
  errorInfo
) => {
  try {
    console.error(
      "[GlobalErrorBoundary]",
      error
    );

    console.error(
      "[ComponentStack]",
      errorInfo
    );

    // Future Monitoring Integration:
    // Sentry
    // LogRocket
    // Datadog
  } catch (_) {
    // silent fail
  }
};