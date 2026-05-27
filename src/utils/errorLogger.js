import * as Sentry from "@sentry/react";

const dsn = process.env.REACT_APP_SENTRY_DSN;
const isProduction = process.env.NODE_ENV === "production";

if (isProduction && dsn) {
  Sentry.init({
    dsn: dsn,
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
  });
}

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

    if (isProduction && dsn) {
      Sentry.withScope((scope) => {
        if (errorInfo && errorInfo.componentStack) {
          scope.setExtra("componentStack", errorInfo.componentStack);
        }
        Sentry.captureException(error);
      });
    }
  } catch (_) {
    console.warn("[ErrorLogger] Failed to log error to Sentry:", _);
  }
};