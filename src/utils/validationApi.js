import { apiUtils } from "../config/api";

const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_RETRIES = 1;
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

export const validationLoadingResponse = (message = "Validating...") => ({
  isValid: false,
  message,
  isLoading: true,
});

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

export const requestValidation = async (endpoint, options = {}) => {
  const {
    method = "GET",
    body,
    headers = {},
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,
    retryDelayMs = 300,
    invalidMessage = "Validation failed",
    networkMessage = "Unable to validate right now. Please try again.",
    validMessage = "",
    availabilityField = "available",
  } = options;

  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const config = { headers, signal: controller.signal };
      let response;
      const uppercaseMethod = method.toUpperCase();
      
      if (uppercaseMethod === "GET") {
        response = await apiUtils.get(endpoint, config);
      } else if (uppercaseMethod === "POST") {
        response = await apiUtils.post(endpoint, body, config);
      } else if (uppercaseMethod === "PUT") {
        response = await apiUtils.put(endpoint, body, config);
      } else if (uppercaseMethod === "PATCH") {
        response = await apiUtils.patch(endpoint, body, config);
      } else if (uppercaseMethod === "DELETE") {
        response = await apiUtils.delete(endpoint, config);
      } else {
        response = await apiUtils.get(endpoint, config);
      }

      clearTimeout(timeoutId);

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      return normalizeValidationApiResponse(data, {
        validMessage,
        invalidMessage,
        availabilityField,
      });
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;

      const status = error.status;
      const data = error.data;

      // If the API explicitly returned a validation failure (like 400, 409)
      if (status && !RETRYABLE_STATUS_CODES.includes(status) && status < 500) {
        return createValidationResponse(
          false,
          data?.message || invalidMessage,
          { status, data },
        );
      }

      // Retry on network errors, timeouts, or 5xx server errors
      if (attempt < retries) {
        await wait(retryDelayMs * (attempt + 1));
        continue;
      }
    }
  }

  const timedOut = lastError?.isTimeout || lastError?.name === "AbortError";
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

export const checkEmailAvailability = (email, options = {}) =>
  requestValidation(
    options.endpoint || `/api/validate/email/${encodeURIComponent(email)}`,
    {
      invalidMessage: "Email is already registered",
      validMessage: "",
      ...options,
    },
  );

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
