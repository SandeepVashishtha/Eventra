const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_RETRIES = 1;
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Builds the standard validation response object used across async validators.
 *
 * @param {boolean} isValid - Whether the value passed validation.
 * @param {string} [message=""] - Message shown when validation fails.
 * @param {Object} [extra={}] - Extra metadata such as API data, status, or error details.
 * @returns {{isValid: boolean, message: string, isLoading: boolean}} Normalized response.
 */
export const createValidationResponse = (
  isValid,
  message = "",
  extra = {},
) => ({
  isValid: Boolean(isValid),
  message: isValid ? "" : message,
  isLoading: false,
  ...extra,
});

/**
 * Builds a temporary response for UI states while an async validator is running.
 *
 * @param {string} [message="Validating..."] - Loading message shown to users.
 * @returns {{isValid: boolean, message: string, isLoading: boolean}}
 */
export const validationLoadingResponse = (message = "Validating...") => ({
  isValid: false,
  message,
  isLoading: true,
});

/**
 * Converts common validation API payloads into the standard response shape.
 *
 * Supported payload examples include booleans, `{ isValid: true }`,
 * `{ valid: false }`, and availability checks like `{ available: true }`.
 *
 * @param {boolean|Object} data - Raw API response data.
 * @param {Object} [options]
 * @param {string} [options.validMessage=""] - Message used for valid results.
 * @param {string} [options.invalidMessage="Validation failed"] - Message used for invalid results.
 * @param {string} [options.availabilityField="available"] - Field name to read for availability APIs.
 * @returns {{isValid: boolean, message: string, isLoading: boolean, data: *}}
 */
export const normalizeValidationApiResponse = (
  data,
  {
    validMessage = "",
    invalidMessage = "Validation failed",
    availabilityField = "available",
  } = {},
) => {
  if (typeof data === "boolean") {
    return createValidationResponse(data, data ? validMessage : invalidMessage, {
      data,
    });
  }

  const hasIsValid = typeof data?.isValid === "boolean";
  const hasValid = typeof data?.valid === "boolean";
  const hasAvailable = typeof data?.[availabilityField] === "boolean";
  const isValid = hasIsValid
    ? data.isValid
    : hasValid
      ? data.valid
      : hasAvailable
        ? data[availabilityField]
        : false;

  return createValidationResponse(
    isValid,
    data?.message || (isValid ? validMessage : invalidMessage),
    { data },
  );
};

/**
 * Sends a validation request with timeout, retry, JSON parsing, and fallback errors.
 *
 * Retryable HTTP status codes are retried with a small increasing delay. Timeout,
 * missing `fetch`, network failures, and invalid responses are converted into
 * user-safe validation responses instead of throwing.
 *
 * @param {string} endpoint - URL or path to request.
 * @param {Object} [options]
 * @param {string} [options.method="GET"] - HTTP method.
 * @param {Object} [options.body] - JSON body sent with the request.
 * @param {Object} [options.headers={}] - Extra request headers.
 * @param {number} [options.timeoutMs=8000] - Abort timeout in milliseconds.
 * @param {number} [options.retries=1] - Number of retry attempts for retryable failures.
 * @param {number} [options.retryDelayMs=300] - Base retry delay in milliseconds.
 * @param {Function} [options.fetchImpl=globalThis.fetch] - Fetch implementation, useful for tests.
 * @param {string} [options.invalidMessage="Validation failed"] - Fallback invalid message.
 * @param {string} [options.networkMessage] - Fallback network error message.
 * @param {string} [options.validMessage=""] - Message used for valid responses.
 * @param {string} [options.availabilityField="available"] - Availability field in API payloads.
 * @returns {Promise<{isValid: boolean, message: string, isLoading: boolean}>}
 */
export const requestValidation = async (endpoint, options = {}) => {
  const {
    method = "GET",
    body,
    headers = {},
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,
    retryDelayMs = 300,
    fetchImpl = globalThis.fetch,
    invalidMessage = "Validation failed",
    networkMessage = "Unable to validate right now. Please try again.",
    validMessage = "",
    availabilityField = "available",
  } = options;

  if (typeof fetchImpl !== "function") {
    return createValidationResponse(false, networkMessage, {
      error: new Error("Fetch API is not available"),
    });
  }

  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchImpl(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        const shouldRetry =
          RETRYABLE_STATUS_CODES.includes(response.status) && attempt < retries;

        if (shouldRetry) {
          await wait(retryDelayMs * (attempt + 1));
          continue;
        }

        return createValidationResponse(
          false,
          data?.message || invalidMessage,
          { status: response.status, data },
        );
      }

      return normalizeValidationApiResponse(data, {
        validMessage,
        invalidMessage,
        availabilityField,
      });
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;

      if (attempt < retries) {
        await wait(retryDelayMs * (attempt + 1));
        continue;
      }
    }
  }

  const timedOut = lastError?.name === "AbortError";
  return createValidationResponse(
    false,
    timedOut ? "Validation request timed out. Please try again." : networkMessage,
    {
      error: lastError,
      isTimeout: timedOut,
      isNetworkError: !timedOut,
    },
  );
};

/**
 * Checks whether an email is available using the configured API endpoint.
 *
 * @param {string} email - Email address to check.
 * @param {Object} [options] - `requestValidation` options plus optional `endpoint`.
 * @returns {Promise<{isValid: boolean, message: string, isLoading: boolean}>}
 */
export const checkEmailAvailability = (email, options = {}) =>
  requestValidation(
    options.endpoint || `/api/validate/email/${encodeURIComponent(email)}`,
    {
      invalidMessage: "Email is already registered",
      validMessage: "",
      ...options,
    },
  );

/**
 * Checks whether a username is available using the configured API endpoint.
 *
 * @param {string} username - Username to check.
 * @param {Object} [options] - `requestValidation` options plus optional `endpoint`.
 * @returns {Promise<{isValid: boolean, message: string, isLoading: boolean}>}
 */
export const checkUsernameAvailability = (username, options = {}) =>
  requestValidation(
    options.endpoint ||
      `/api/validate/username/${encodeURIComponent(username)}`,
    {
      invalidMessage: "Username is already taken",
      validMessage: "",
      ...options,
    },
  );

/**
 * Validates a phone number through the configured API endpoint.
 *
 * The default endpoint expects a POST body of `{ phone }` and reads the `valid`
 * response field.
 *
 * @param {string} phone - Phone number to validate.
 * @param {Object} [options] - `requestValidation` options plus optional `endpoint`.
 * @returns {Promise<{isValid: boolean, message: string, isLoading: boolean}>}
 */
export const checkPhoneValidation = (phone, options = {}) =>
  requestValidation(options.endpoint || "/api/validate/phone", {
    method: "POST",
    body: { phone },
    availabilityField: "valid",
    invalidMessage: "Phone number is invalid",
    validMessage: "",
    ...options,
  });

export default {
  checkEmailAvailability,
  checkUsernameAvailability,
  checkPhoneValidation,
  createValidationResponse,
  normalizeValidationApiResponse,
  requestValidation,
  validationLoadingResponse,
};
