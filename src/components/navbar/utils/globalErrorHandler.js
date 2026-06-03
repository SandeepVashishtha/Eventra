// Flag to ensure initialization only runs once (Idempotency Guard)
let isInitialized = false;
let appLogger = null; // 🟢 Add this line

/**
 * Initializes global runtime error and unhandled promise rejection monitoring.
 * Safe to be called multiple times due to HMR or React StrictMode.
 */
export function initializeGlobalErrorHandling(logger) { // 🟢 Updated this line
  appLogger = logger || { log: console.error };
  // If already initialized, exit early to prevent duplicate listeners
  if (isInitialized) {
    return;
  }

  // Attach listeners to the global window object
  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);

  // Set flag to true
  isInitialized = true;

}

// Named handler for standard runtime errors
function handleGlobalError(event) {
  // 🟢 Guard to prevent double-reporting errors already caught by React
  if (event.error && event.error.__isReactHandled) return;

  // 🟢 Standardized payload structure
  const payload = {
    event: 'app_crash',
    level: 'error',
    source: 'window.onerror',
    message: event.message || 'Unknown runtime error',
    metadata: {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack || null,
    }
  };

  appLogger.log(payload); 
}

// Named handler for unhandled async promise rejections
function handleUnhandledRejection(event) {
  // 🟢 Standardized payload structure for unhandled promises
  const payload = {
    event: 'app_crash',
    level: 'error',
    source: 'window.unhandledrejection',
    message: event.reason?.message || 'Unhandled Promise Rejection',
    metadata: {
      stack: event.reason?.stack || null,
      reason: typeof event.reason === 'object' ? JSON.stringify(event.reason) : event.reason
    }
  };

  appLogger.log(payload);
}

/**
 * Clean up utility (mainly used for resetting state in unit tests)
 */
export function resetGlobalErrorHandling() {
  window.removeEventListener('error', handleGlobalError);
  window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  isInitialized = false;
  appLogger = null;
}
