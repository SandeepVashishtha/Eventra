/**
 * Centralised safe error messages and error extraction utility for user-facing UI.
 * Prevents raw internal stack traces and sensitive database errors from leaking to users.
 */

import i18n from "../i18n/i18n.js";

const KEYWORD_MESSAGES = [
  { pattern: /email.*already.*exist|already.*registered|duplicate.*email/i, message: "This email is already registered. Try signing in instead.", action: "SIGN_IN" },
  { pattern: /invalid.*password|password.*incorrect|wrong.*password|invalid.*credential|credentials.*incorrect/i, message: "Invalid email or password.", action: "RETRY" },
  { pattern: /account.*locked|too.*many.*attempt/i, message: "Your account has been temporarily locked. Please try again later.", action: "LOCKOUT" },
  { pattern: /token.*expired|session.*expired|jwt.*expired/i, message: "Your session has expired. Please sign in again.", action: "REAUTH" },
  { pattern: /network|fetch|econnrefused|enotfound/i, message: "Unable to reach the server. Please check your connection.", action: "OFFLINE" },
];

/**
 * Generates a short correlation ID for error tracking in production.
 */
function generateCorrelationId() {
  return `ERR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

/**
 * Extracts raw message string, handling arrays, objects, and strings safely.
 */
function extractRawMessage(err) {
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message;

  if (Array.isArray(msg)) return msg.join("; ");
  if (typeof msg === "string") return msg;
  if (typeof msg === "object" && msg !== null) return JSON.stringify(msg);
  return "";
}

/**
 * Higher-Order Factory for i18n & custom telemetry.
 */
export function createErrorFormatter(options = {}) {
  const { translate = (key, fallback) => fallback, onErrorLog } = options;

  return {
    getPublicErrorMessage: (err, fallback) =>
      getPublicErrorMessage(err, fallback, { translate, onErrorLog }),
    getPublicErrorDetails: (err, fallback) =>
      getPublicErrorDetails(err, fallback, { translate, onErrorLog }),
    getPublicFieldErrorMap: (err) =>
      getPublicFieldErrorMap(err, { translate }),
  };
}

/**
 * Returns a detailed error object with metadata, retry intervals, and action hints.
 */
export function getPublicErrorDetails(err, fallback = "An unexpected error occurred.", config = {}) {
  const { translate = (k, f) => f, onErrorLog } = config;

  if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.error("[Eventra Error Log]:", err);
  }

  const correlationId = generateCorrelationId();
  if (onErrorLog && typeof onErrorLog === "function") {
    onErrorLog(err, { correlationId });
  }

  if (!err) {
    return { message: translate("error.default", fallback), category: "UNKNOWN", action: "NONE", correlationId: null };
  }

  // Extract HTTP status
  const status =
    err?.response?.status ||
    err?.status ||
    (typeof err?.statusCode === "number" ? err.statusCode : null);

  // Extract Retry-After header for 429 Rate Limits
  let retryAfterSeconds = null;
  const retryHeader = err?.response?.headers?.["retry-after"];
  if (retryHeader) {
    retryAfterSeconds = parseInt(retryHeader, 10) || null;
  }

  const rawMsg = extractRawMessage(err);

  // Check keyword matches first
  for (const item of KEYWORD_MESSAGES) {
    if (item.pattern.test(rawMsg)) {
      return {
        message: translate(`error.keyword.${item.action.toLowerCase()}`, item.message),
        status,
        category: "DOMAIN_ERROR",
        action: item.action,
        retryAfterSeconds,
        correlationId,
      };
    }
  }

  // Fallback to HTTP Status code map
  if (status && STATUS_MESSAGES[status]) {
    return {
      message: translate(`error.status.${status}`, STATUS_MESSAGES[status]),
      status,
      category: status >= 500 ? "SERVER_ERROR" : "CLIENT_ERROR",
      action: status === 401 ? "REAUTH" : "RETRY",
      retryAfterSeconds,
      correlationId,
    };
  }

  // Fallback for unhandled internal exceptions
  return {
    message: `${translate("error.fallback", fallback)} (${correlationId})`,
    status: status || 500,
    category: "UNHANDLED",
    action: "CONTACT_SUPPORT",
    retryAfterSeconds: null,
    correlationId,
  };
}

/**
 * Returns a simple safe string (Maintains full backward compatibility).
 */
export function getPublicErrorMessage(err, fallback, config) {
  return getPublicErrorDetails(err, fallback, config).message;
}

/**
 * Extracts and sanitizes backend validation field errors for form integrations.
 * Supports NestJS, Express-Validator, Zod, and standard { field: message } structures.
 */
export function getPublicFieldErrorMap(err) {
  const fieldMap = {};
  const data = err?.response?.data;

  if (!data) return fieldMap;

  // Pattern A: { errors: { email: "Invalid", password: "Too short" } }
  if (data.errors && typeof data.errors === "object" && !Array.isArray(data.errors)) {
    Object.entries(data.errors).forEach(([field, msg]) => {
      fieldMap[field] = Array.isArray(msg) ? msg[0] : String(msg);
    });
    return fieldMap;
  }

  // Pattern B: { errors: [{ field: "email", message: "Invalid" }] } or NestJS [{ property: "email", constraints: {...} }]
  if (Array.isArray(data.errors) || Array.isArray(data.message)) {
    const list = data.errors || data.message;
    list.forEach((item) => {
      if (item?.field && item?.message) {
        fieldMap[item.field] = item.message;
      } else if (item?.property && item?.constraints) {
        fieldMap[item.property] = Object.values(item.constraints)[0];
      }
    });
  }

  return fieldMap;
}

export const AUTH_ERRORS = {
  loginFailed: "Invalid email or password.",
  sessionExpired: "Your session has expired. Please sign in again.",
  accountLocked: "Too many failed attempts. Please wait before trying again.",
  registrationFailed: "Registration failed. Please check your details and try again.",
  emailTaken: "This email is already registered. Try signing in instead.",
  passwordWeak: "Your password does not meet the strength requirements.",
};

export const FORM_ERRORS = {
  submitFailed: "Submission failed. Please check your input and try again.",
  networkError: "Unable to reach the server. Please check your connection.",
  serverError: "Something went wrong on our end. Please try again shortly.",
  validationFailed: "Some fields contain invalid values. Please review them.",
};