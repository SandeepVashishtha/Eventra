import i18n from "../i18n/i18n";

const t = (key) => i18n.t(key);

/**
 * Centralised safe error messages for user-facing UI.
 *
 * Never forward raw backend error text to the UI — it may contain internal
 * stack traces, field names, or framework details useful to attackers.
 * Use getPublicErrorMessage() instead of err.message in all toast/form-error calls.
 */

const STATUS_MESSAGES = {
  400: t("error.badRequest"),
  401: t("error.unauthorized"),
  403: t("error.forbidden"),
  404: t("error.notFound"),
  409: t("error.conflict"),
  422: t("error.unprocessable"),
  429: t("error.tooManyRequests"),
  500: t("error.serverError"),
  502: t("error.serviceUnavailable"),
  503: t("error.serviceUnavailable"),
};

const KEYWORD_MESSAGES = {
  "email.*already.*exist|already.*registered|duplicate.*email": t("error.emailExists"),
  "invalid.*password|password.*incorrect|wrong.*password": t("error.invalidCredentials"),
  "invalid.*credential|credentials.*incorrect": t("error.invalidCredentials"),
  "account.*not.*found|user.*not.*found": t("error.accountNotFound"),
  "account.*locked|too.*many.*attempt": t("error.accountLocked"),
  "token.*expired|session.*expired|jwt.*expired": t("error.unauthorized"),
  "network|fetch|econnrefused|enotfound": t("error.networkError"),
};

/**
 * Returns a safe, user-friendly error message.
 * Logs the original error to the console in non-production environments.
 *
 * @param {Error|Response|unknown} err - The caught error object
 * @param {string} [fallback] - Message to show when no specific match is found
 * @returns {string} Safe message suitable for display in the UI
 */
export function getPublicErrorMessage(err, fallback = t("error.generic")) {
  if (process.env.NODE_ENV !== "production") {
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
