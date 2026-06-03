/**
 * Centralised safe error messages for user-facing UI.
 *
 * Never forward raw backend error text to the UI — it may contain internal
 * stack traces, field names, or framework details useful to attackers.
 * Use getPublicErrorMessage() instead of err.message in all toast/form-error calls.
 */

const STATUS_MESSAGES = {
  400: "The request could not be understood. Please check your input and try again.",
  401: "Your credentials are incorrect or your session has expired. Please sign in again.",
  403: "You don't have permission to perform this action.",
  404: "The requested resource was not found.",
  409: "This information is already in use. Please try a different value.",
  422: "Some fields contain invalid values. Please review and correct them.",
  429: "Too many requests. Please wait a moment before trying again.",
  500: "Something went wrong on our end. Please try again shortly.",
  502: "The service is temporarily unavailable. Please try again shortly.",
  503: "The service is temporarily unavailable. Please try again shortly.",
};

const KEYWORD_MESSAGES = {
  "email.*already.*exist|already.*registered|duplicate.*email": "This email is already registered. Try signing in instead.",
  "invalid.*password|password.*incorrect|wrong.*password": "Invalid email or password.",
  "invalid.*credential|credentials.*incorrect": "Invalid email or password.",
  "account.*not.*found|user.*not.*found": "No account found with those details.",
  "account.*locked|too.*many.*attempt": "Your account has been temporarily locked. Please try again later.",
  "token.*expired|session.*expired|jwt.*expired": "Your session has expired. Please sign in again.",
  "network|fetch|econnrefused|enotfound": "Unable to reach the server. Please check your connection.",
};

/**
 * Returns a safe, user-friendly error message.
 * Logs the original error to the console in non-production environments.
 *
 * @param {Error|Response|unknown} err - The caught error object
 * @param {string} [fallback] - Message to show when no specific match is found
 * @returns {string} Safe message suitable for display in the UI
 */
export function getPublicErrorMessage(err, fallback = "An unexpected error occurred. Please try again.") {
  if (import.meta.env.MODE !== "production") {
    console.error("[Eventra error]", err);
  }

  if (!err) return fallback;

  const status =
    err?.response?.status ||
    err?.status ||
    (typeof err?.statusCode === "number" ? err.statusCode : null);

  if (status && STATUS_MESSAGES[status]) {
    return STATUS_MESSAGES[status];
  }

  const rawMessage = (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    ""
  ).toLowerCase();

  for (const [pattern, message] of Object.entries(KEYWORD_MESSAGES)) {
    if (new RegExp(pattern, "i").test(rawMessage)) {
      return message;
    }
  }

  return fallback;
}

/**
 * Specific safe messages for authentication flows.
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
 * Specific safe messages for form submission flows.
 */
export const FORM_ERRORS = {
  submitFailed: "Submission failed. Please check your input and try again.",
  networkError: "Unable to reach the server. Please check your connection.",
  serverError: "Something went wrong on our end. Please try again shortly.",
  validationFailed: "Some fields contain invalid values. Please review them.",
};
