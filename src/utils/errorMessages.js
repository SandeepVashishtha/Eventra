/**
 * Centralized User-Facing Error Sanitization & Translation Engine
 *
 * Prevents raw backend stack traces, SQL queries, database column names, internal
 * IP addresses, and framework metadata from leaking into client-side UI toasts
 * and form notifications.
 */

// ============================================================================
// 1. HTTP Status Code Mapping Table
// ============================================================================

export const STATUS_MESSAGES = {
  400: "The request could not be understood. Please check your input and try again.",
  401: "Your credentials are incorrect or your session has expired. Please sign in again.",
  403: "You don't have permission to perform this action.",
  404: "The requested resource was not found or may have been moved.",
  405: "This operation is not supported for the requested resource.",
  408: "The request timed out. Please check your connection and try again.",
  409: "This information is already in use. Please try a different value.",
  413: "The uploaded file or payload exceeds the maximum allowed size.",
  415: "The provided media or file format is not supported.",
  422: "Some fields contain invalid values. Please review and correct them.",
  429: "Too many requests. Please wait a moment before trying again.",
  500: "Something went wrong on our end. Please try again shortly.",
  502: "The service is temporarily unavailable. Please try again shortly.",
  503: "The service is currently undergoing maintenance. Please try again shortly.",
  504: "The upstream server failed to respond in time. Please try again.",
};

// ============================================================================
// 2. Keyword & Regex Pattern Matchers
// ============================================================================

const KEYWORD_MESSAGES = [
  // Authentication & Credentials
  {
    pattern: /email.*already.*exist|already.*registered|duplicate.*email/i,
    message: "This email is already registered. Try signing in instead.",
    category: "auth",
  },
  {
    pattern: /invalid.*password|password.*incorrect|wrong.*password/i,
    message: "Invalid email or password.",
    category: "auth",
  },
  {
    pattern: /invalid.*credential|credentials.*incorrect|auth.*failed/i,
    message: "Invalid email or password.",
    category: "auth",
  },
  {
    pattern: /account.*not.*found|user.*not.*found|no.*user/i,
    message: "No account found with those details.",
    category: "auth",
  },
  {
    pattern: /account.*locked|too.*many.*attempt|brute.*force/i,
    message: "Your account has been temporarily locked due to failed attempts. Please try again later.",
    category: "auth",
  },
  {
    pattern: /token.*expired|session.*expired|jwt.*expired|invalid.*token/i,
    message: "Your session has expired. Please sign in again.",
    category: "auth",
  },

  // Payment & Billing
  {
    pattern: /card.*declined|insufficient.*fund|payment.*failed/i,
    message: "Your payment method was declined. Please verify your card details.",
    category: "billing",
  },
  {
    pattern: /expired.*card|card.*expired/i,
    message: "Your payment card has expired. Please update your billing information.",
    category: "billing",
  },
  {
    pattern: /stripe.*error|gateway.*error|charge.*failed/i,
    message: "Payment processing failed. Please try again or use a different payment method.",
    category: "billing",
  },

  // File Upload & Storage
  {
    pattern: /file.*too.*large|max.*file.*size|size.*exceeded/i,
    message: "File size exceeds the maximum limit. Please choose a smaller file.",
    category: "upload",
  },
  {
    pattern: /invalid.*file.*type|unsupported.*media|mime.*type/i,
    message: "File format is not supported. Please upload a valid document or image.",
    category: "upload",
  },

  // Network & Connectivity
  {
    pattern: /network.*error|fetch.*failed|econnrefused|enotfound|net::err/i,
    message: "Unable to reach the server. Please check your internet connection.",
    category: "network",
  },

  // Database & Internal Leaks (Sanitize & Catch)
  {
    pattern: /postgres|mysql|mongodb|sqlite|typeorm|prisma|sequelize|knex|syntax.*error/i,
    message: "A database error occurred on our end. Please try again shortly.",
    category: "system",
  },
];

// ============================================================================
// 3. Domain Fallback Dictionaries
// ============================================================================

export const CATEGORY_FALLBACKS = {
  auth: "Authentication failed. Please check your credentials.",
  billing: "Payment processing error. Please try again.",
  upload: "File upload failed. Please verify the file and try again.",
  network: "Network error. Please check your connection.",
  form: "Submission failed. Please check your input and try again.",
  system: "An internal server error occurred. Please try again shortly.",
  general: "An unexpected error occurred. Please try again.",
};

export const AUTH_ERRORS = {
  loginFailed: "Invalid email or password.",
  sessionExpired: "Your session has expired. Please sign in again.",
  accountLocked: "Too many failed attempts. Please wait before trying again.",
  registrationFailed: "Registration failed. Please check your details and try again.",
  emailTaken: "This email is already registered. Try signing in instead.",
  passwordWeak: "Your password does not meet the security requirements.",
};

export const FORM_ERRORS = {
  submitFailed: "Submission failed. Please check your input and try again.",
  networkError: "Unable to reach the server. Please check your connection.",
  serverError: "Something went wrong on our end. Please try again shortly.",
  validationFailed: "Some fields contain invalid values. Please review them.",
};

export const BILLING_ERRORS = {
  cardDeclined: "Your card was declined. Please try a different card.",
  processingError: "Unable to process payment right now. Please try again.",
  subscriptionFailed: "Failed to update subscription. Please contact support.",
};

// ============================================================================
// 4. Extraction & Sanitization Helpers
// ============================================================================

/**
 * Recursively extracts raw error message text from diverse response shapes
 * (Axios, Fetch Response, GraphQL errors array, or custom API wrappers).
 *
 * @param {Error|Object|unknown} err - Caught error object.
 * @returns {string} Extracted raw message string.
 */
export function extractRawErrorText(err) {
  if (!err) return "";

  if (typeof err === "string") return err;

  // GraphQL errors array handling
  if (Array.isArray(err?.graphQLErrors) && err.graphQLErrors.length > 0) {
    return err.graphQLErrors.map((e) => e.message).join(" ");
  }

  // Axios or standard REST API error shapes
  const apiMessage =
    err?.response?.data?.message ||
    err?.response?.data?.error?.message ||
    err?.response?.data?.error ||
    err?.data?.message ||
    err?.message;

  if (typeof apiMessage === "string") return apiMessage;

  // Handles nested field validation errors object { errors: { email: "taken" } }
  if (typeof err?.response?.data?.errors === "object") {
    try {
      return JSON.stringify(err.response.data.errors);
    } catch {
      return "";
    }
  }

  return "";
}

/**
 * Resolves HTTP status code across multiple API response formats.
 *
 * @param {Error|Object|unknown} err - Error instance.
 * @returns {number|null} HTTP status code or null.
 */
export function extractStatusCode(err) {
  if (!err) return null;

  // Extract HTTP status
  const status =
    err?.response?.status ||
    err?.status ||
    err?.statusCode ||
    err?.response?.data?.statusCode;

  return typeof status === "number" ? status : null;
}

/**
 * Checks if a raw error message contains sensitive leak vectors
 * (e.g., file paths, stack traces, database terms).
 *
 * @param {string} text - Raw error text.
 * @returns {boolean} True if sensitive data detected.
 */
function containsSensitiveData(text) {
  const sensitivePatterns = [
    /at\s+[\w\d_.]+\s+\(/i, // Stack trace line
    /SELECT\s+.*\s+FROM/i,   // SQL query
    /INSERT\s+INTO/i,        // SQL query
    /mongoerror/i,          // Mongo detail
    /\/node_modules\//i,     // Server file path
    /C:\\\\/i,              // Windows file path
  ];

  return sensitivePatterns.some((pattern) => pattern.test(text));
}

// ============================================================================
// 5. Primary Public API
// ============================================================================

/**
 * Returns a safe, user-friendly error message for display in UI toasts and alerts.
 * Logs original error details to dev console in non-production environments.
 *
 * @param {Error|Object|unknown} err - Caught error instance.
 * @param {Object|string} [options] - Configuration options or fallback string.
 * @param {string} [options.fallback] - Custom fallback message.
 * @param {string} [options.category] - Target domain fallback category.
 * @param {boolean} [options.log=true] - Enable non-production console logging.
 * @returns {string} Safe displayable message string.
 */
export function getPublicErrorMessage(err, options = {}) {
  const fallback = typeof options === "string" 
    ? options 
    : options.fallback || CATEGORY_FALLBACKS[options.category] || CATEGORY_FALLBACKS.general;

  const shouldLog = typeof options === "object" && options.log !== undefined ? options.log : true;

  if (process.env.NODE_ENV !== "production" && shouldLog) {
    console.error("[Eventra Error Sanitizer]", err);
  }

  if (!err) return fallback;

  // 1. Match HTTP Status Code
  const statusCode = extractStatusCode(err);
  if (statusCode && STATUS_MESSAGES[statusCode]) {
    return STATUS_MESSAGES[statusCode];
  }

  // 2. Extract and Inspect Raw Message
  const rawText = extractRawErrorText(err);

  if (!rawText) return fallback;

  // Reject sensitive leaks directly to fallback
  if (containsSensitiveData(rawText)) {
    return fallback;
  }

  // 3. Regex Match against Keyword Table
  for (const item of KEYWORD_MESSAGES) {
    if (item.pattern.test(rawText)) {
      return item.message;
    }
  }

  // Fallback for unhandled internal exceptions
  return fallback;
}

/**
 * Parses raw error into a structured payload for analytical UI components.
 *
 * @param {Error|Object|unknown} err - Raw error object.
 * @returns {Object} Structured error details payload.
 */
export function parseApiError(err) {
  const statusCode = extractStatusCode(err);
  const rawMessage = extractRawErrorText(err);
  const safeMessage = getPublicErrorMessage(err, { log: false });

  let matchedCategory = "general";
  for (const item of KEYWORD_MESSAGES) {
    if (item.pattern.test(rawMessage)) {
      matchedCategory = item.category;
      break;
    }
  }

  return {
    statusCode,
    safeMessage,
    category: matchedCategory,
    isNetworkError: matchedCategory === "network" || statusCode === 0,
    isAuthError: matchedCategory === "auth" || statusCode === 401 || statusCode === 403,
    isValidationError: statusCode === 422 || statusCode === 400,
  };
}

/**
 * Creates a domain-customized error mapper function.
 *
 * @param {Array<{pattern: RegExp, message: string}>} customRules - Additional domain rules.
 * @returns {Function} Custom error mapper.
 */
export function createErrorMapper(customRules = []) {
  return function customErrorMapper(err, fallback) {
    const rawText = extractRawErrorText(err);

    for (const rule of customRules) {
      if (rule.pattern.test(rawText)) {
        return rule.message;
      }
    }

    return getPublicErrorMessage(err, fallback);
  };
}

export default getPublicErrorMessage;
