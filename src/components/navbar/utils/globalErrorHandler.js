// Flag to ensure initialization only runs once (Idempotency Guard)
let isInitialized = false;

/**
 * Initializes global runtime error and unhandled promise rejection monitoring.
 * Safe to be called multiple times due to HMR or React StrictMode.
 */
export function initializeGlobalErrorHandling() {
  // If already initialized, exit early to prevent duplicate listeners
  if (isInitialized) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Error Monitoring] Already initialized. Skipping duplicate setup.');
    }
    return;
  }

  // Attach listeners to the global window object
  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);

  // Set flag to true
  isInitialized = true;

  if (process.env.NODE_ENV === 'development') {
    console.log('[Error Monitoring] Global error handlers initialized successfully.');
  }
}

// Named handler for standard runtime errors
function handleGlobalError(event) {
  // Prevent application crashing completely if desired, or just log it
  console.error('Captured Global Error:', {
    message: event.message,
    source: event.filename,
    line: event.lineno,
    col: event.colno,
    error: event.error,
  });

  // TODO: Add backend/analytics logging endpoint tracking here if needed
}

// Named handler for unhandled async promise rejections
function handleUnhandledRejection(event) {
  console.warn('Captured Unhandled Promise Rejection:', {
    reason: event.reason,
  });

  // TODO: Add backend/analytics logging endpoint tracking here if needed
}

/**
 * Clean up utility (mainly used for resetting state in unit tests)
 */
export function resetGlobalErrorHandling() {
  window.removeEventListener('error', handleGlobalError);
  window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  isInitialized = false;
}