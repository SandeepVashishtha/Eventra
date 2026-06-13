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

// 🔥 FIX: Pre-compile each keyword regex pattern ONCE at module load.
// Previously every call to getPublicErrorMessage recompiled the patterns
// inside the for-loop. Now the patterns are built once, and only the
// per-call message lookup is done in the loop.
//
// Patterns are intentionally written with bounded [\\s\\S]{0,200}? quantifiers
// instead of unbounded .* to prevent catastrophic backtracking (ReDoS) on
// attacker-controlled long error strings.
const KEYWORD_PATTERNS = [
  /(?:email[\s\S]{0,200}?already[\s\S]{0,200}?exist)|(?:already[\s\S]{0,200}?registered)|(?:duplicate[\s\S]{0,200}?email)/i,
  /(?:invalid[\s\S]{0,200}?password)|(?:password[\s\S]{0,200}?incorrect)|(?:wrong[\s\S]{0,200}?password)/i,
  /(?:invalid[\s\S]{0,200}?credential)|(?:credentials[\s\S]{0,200}?incorrect)/i,
  /(?:account[\s\S]{0,200}?not[\s\S]{0,200}?found)|(?:user[\s\S]{0,200}?not[\s\S]{0,200}?found)/i,
  /(?:account[\s\S]{0,200}?locked)|(?:too[\s\S]{0,200}?many[\s\S]{0,200}?attempt)/i,
  /(?:token[\s\S]{0,200}?expired)|(?:session[\s\S]{0,200}?expired)|(?:jwt[\s\S]{0,200}?expired)/i,
  /(?:network)|(?:fetch)|(?:econnrefused)|(?:enotfound)/i,
];

// Translation keys mapped 1:1 to KEYWORD_PATTERNS. We resolve the message
// at call time (not at module load) so i18n is fully initialised.
const KEYWORD_KEYS = [
  "error.emailExists",
  "error.invalidCredentials",
  "error.invalidCredentials",
  "error.accountNotFound",
  "error.accountLocked",
  "error.unauthorized",
  "error.networkError",
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

  // 2. Regular Expression (Regex) Keyword Recognition Matrix
  // When an HTTP code is unavailable, we parse raw message strings to discover matching patterns.
  // Using case-insensitive patterns to resolve common relational database or microservice issues.
  // (Keyword regex patterns are pre-built at module load — see top of file.)

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

  // Iterate over each pre-compiled regex rule in the keyword table.
  // Pattern is built once at module load; the translation key is resolved
  // at call time so i18n is fully initialised.
  for (let i = 0; i < KEYWORD_PATTERNS.length; i++) {
    if (KEYWORD_PATTERNS[i].test(rawMessage)) {
      return t(KEYWORD_KEYS[i]);
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
