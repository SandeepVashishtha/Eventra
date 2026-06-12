/**
 * @fileoverview errorMessages.js
 * @module utils/errorMessages
 *
 * Centralized localized utility mapping for translation, user-friendly
 * feedback generation, and error message sanitization across Eventra flows.
 *
 * Security Design Context:
 * Direct exposure of backend infrastructure stack traces, low-level database constraints,
 * or framework internal warnings (e.g. Postgres duplicate-key violations, Node call stacks)
 * poses a severe information disclosure vulnerability. Attackers utilize database or index names
 * to map target tables or trace SQL injectability vectors.
 *
 * To mitigate this risk, this module acts as a "Data Sanitization Gateway" and "Translation Mapper",
 * intercepting raw exceptions and map/normalize them into localized, safe UI strings.
 *
 * Strict ES Module (ESM) rules mandate relative imports to include the '.js' file extension.
 */

import i18n from "../i18n/i18n.js";

/**
 * Convenient short wrapper referencing the global i18n translation system.
 *
 * @param {string} key - The nested localization dictionary selector path (e.g. "error.generic").
 * @returns {string} The localized text corresponding to the language environment, or key if missing.
 */
const t = (key) => i18n.t(key);
const MAX_KEYWORD_GAP = "[\\s\\S]{0,200}?";

const KEYWORD_MESSAGES = [
  [
    new RegExp(
      `email${MAX_KEYWORD_GAP}already${MAX_KEYWORD_GAP}exist|already${MAX_KEYWORD_GAP}registered|duplicate${MAX_KEYWORD_GAP}email`,
      "i"
    ),
    t("error.emailExists"),
  ],
  [
    new RegExp(
      `invalid${MAX_KEYWORD_GAP}password|password${MAX_KEYWORD_GAP}incorrect|wrong${MAX_KEYWORD_GAP}password`,
      "i"
    ),
    t("error.invalidCredentials"),
  ],
  [
    new RegExp(
      `invalid${MAX_KEYWORD_GAP}credential|credentials${MAX_KEYWORD_GAP}incorrect`,
      "i"
    ),
    t("error.invalidCredentials"),
  ],
  [
    new RegExp(
      `account${MAX_KEYWORD_GAP}not${MAX_KEYWORD_GAP}found|user${MAX_KEYWORD_GAP}not${MAX_KEYWORD_GAP}found`,
      "i"
    ),
    t("error.accountNotFound"),
  ],
  [
    new RegExp(
      `account${MAX_KEYWORD_GAP}locked|too${MAX_KEYWORD_GAP}many${MAX_KEYWORD_GAP}attempt`,
      "i"
    ),
    t("error.accountLocked"),
  ],
  [
    new RegExp(
      `token${MAX_KEYWORD_GAP}expired|session${MAX_KEYWORD_GAP}expired|jwt${MAX_KEYWORD_GAP}expired`,
      "i"
    ),
    t("error.unauthorized"),
  ],
  [
    /network|fetch|econnrefused|enotfound/i,
    t("error.networkError"),
  ],
];

/**
 * Retrieves a safe, sanitized, user-facing error message suitable for displaying in the UI.
 * Inspects status codes first, and if unavailable, applies regex keyword matching on message headers.
 * Logs original error details to the developer console when executing in non-production modes.
 *
 * @param {Error|Response|object|unknown} err - The captured exception or response package.
 * @param {string} [fallback=t("error.generic")] - Optional customized fallback message if no match is found.
 * @returns {string} A safe, localized string ready for user presentation.
 */
export function getPublicErrorMessage(err, fallback = t("error.generic")) {
  // Non-production environment logger output
  // Helps developers debug the low-level causes while users see sanitized text.
  if (process.env.NODE_ENV !== "production") {
    console.error("[Eventra error details mapped for debugging]:", err);
  }

  // 1. HTTP Status Code Mapping Matrix
  // Explicitly mapping standardized client/server HTTP codes to clear localizable actions.
  const STATUS_MESSAGES = {
    400: t("error.badRequest"),          // Bad request (invalid parameter structure)
    401: t("error.unauthorized"),        // Token expired, missing headers, session invalid
    403: t("error.forbidden"),           // Insufficient user permissions or access role
    404: t("error.notFound"),            // Resource, entity, or page is unavailable
    409: t("error.conflict"),            // Duplicate records (e.g. email or username already taken)
    422: t("error.unprocessable"),       // Validation checks failed (e.g. bad format or invalid inputs)
    429: t("error.tooManyRequests"),     // Rate limiter thresholds tripped
    500: t("error.serverError"),         // Database exception or internal server crash
    502: t("error.serviceUnavailable"),   // Proxy/gateway timeout or server is starting up
    503: t("error.serviceUnavailable"),   // System overload or scheduled maintenance
  };

  // Safe Guard Clause: if the error argument itself is falsy, immediately yield the fallback
  if (!err) {
    return fallback;
  }

  // 3. Extract status code from various typical response/error structures
  // Handles:
  //   - Axios error responses: err.response.status
  //   - Standard HTTP response objects: err.status
  //   - Custom API payloads: err.statusCode
  const status =
    err?.response?.status ||
    err?.status ||
    (typeof err?.statusCode === "number" ? err.statusCode : null);

  // If a known status code is resolved, return its designated localization translation
  if (status && STATUS_MESSAGES[status]) {
    return STATUS_MESSAGES[status];
  }

  // 4. Extract raw message body for regex pattern parsing
  // Cascades from Axios responses to generic Error messages to prevent ReferenceError.
  const rawMessage = (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    ""
  ).toLowerCase();

  // Iterate over each precompiled regex rule in the keyword table.
  for (const [pattern, message] of KEYWORD_MESSAGES) {
    if (pattern.test(rawMessage)) {
      return message;
    }
  }

  // 5. Final fallback boundary: return standard generic error string
  return fallback;
}

/**
 * Pre-defined localized constant messages for authentication flow outcomes.
 * Provided as raw strings for simple validation forms.
 */
export const AUTH_ERRORS = {
  loginFailed: "Invalid email or password.",
  sessionExpired: "Your session has expired. Please sign in again.",
  accountLocked: "Too many failed attempts. Please wait before trying again.",
  registrationFailed: "Registration failed. Please check your details and try again.",
  emailTaken: "This email is already registered. Try signing in instead.",
  passwordWeak: "Your password does not meet the strength requirements.",
};

/**
 * Pre-defined localized constant messages for form processing outcomes.
 */
export const FORM_ERRORS = {
  submitFailed: "Submission failed. Please check your input and try again.",
  networkError: "Unable to reach the server. Please check your connection.",
  serverError: "Something went wrong on our end. Please try again shortly.",
  validationFailed: "Some fields contain invalid values. Please review them.",
};
