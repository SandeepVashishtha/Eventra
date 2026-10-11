import { apiUtils } from "../config/api.js";

const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_RETRIES = 1;
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

// In-memory response cache for validation results
const validationCache = new Map();

export const clearValidationCache = () => {
  validationCache.clear();
};

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
    signal: externalSignal,
    useCache = true,
  } = options;

  // Cache Lookup Key
  const cacheKey = `${method}:${endpoint}:${JSON.stringify(body || {})}`;
  if (useCache && validationCache.has(cacheKey)) {
    return { ...validationCache.get(cacheKey) };
  }

  let lastError = null;

  let sanitizedBody = body;
  if (body && typeof body === "object") {
    // Sanitize request body by stripping HTML tags from string values.
    // This prevents XSS and ensures clean data is sent to the API.
    // Errors during sanitization are logged but do not block the request
    // to maintain backward compatibility. Common failures include circular
    // references or objects with throwing getters.
    try {
      sanitizedBody = JSON.parse(JSON.stringify(body), (key, value) => {
        if (typeof value === "string") {
          return value.replace(/<[^>]*>/g, ""); // Strip raw HTML tags
        }
        return value;
      });
    } catch (error) {
      console.error(
        "[validationApi] Failed to sanitize request payload",
        {
          endpoint,
          method: method.toUpperCase(),
          error: error.message,
          stack: error.stack,
        }
      );
      // Preserve original body if sanitization fails to maintain compatibility
      sanitizedBody = body;
    }
  }

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    // Link external signal for request cancellation
    if (externalSignal) {
      if (externalSignal.aborted) {
        clearTimeout(timeoutId);
        return createValidationResponse(false, "Validation cancelled", { isCancelled: true });
      }
      externalSignal.addEventListener("abort", () => controller.abort(), { once: true });
    }

    try {
      const config = { headers, signal: controller.signal };
      let response;
      const uppercaseMethod = method.toUpperCase();

      if (uppercaseMethod === "GET") {
        response = await apiUtils.get(endpoint, config);
      } else if (uppercaseMethod === "POST") {
        response = await apiUtils.post(endpoint, sanitizedBody, config);
      } else if (uppercaseMethod === "PUT") {
        response = await apiUtils.put(endpoint, sanitizedBody, config);
      } else if (uppercaseMethod === "PATCH") {
        response = await apiUtils.patch(endpoint, sanitizedBody, config);
      } else if (uppercaseMethod === "DELETE") {
        response = await apiUtils.delete(endpoint, config);
      } else {
        response = await apiUtils.get(endpoint, config);
      }

      clearTimeout(timeoutId);

      // Verify HTTP status code
      if (response && !response.ok) {
        const status = response.status;
        let errData = null;
        try {
          errData = await response.json();
        } catch {}

        if (!RETRYABLE_STATUS_CODES.includes(status) && status < 500) {
          const failureResponse = createValidationResponse(
            false,
            errData?.message || invalidMessage,
            { status, data: errData },
          );
          return failureResponse;
        }

        throw { status, data: errData, message: `HTTP Error ${status}` };
      }

      let data = null;
      // Parse JSON response. Errors are logged but do not fail the request
      // to maintain backward compatibility. Invalid JSON responses are treated
      // as null data, which normalizeValidationApiResponse handles gracefully.
      try {
        data = typeof response.json === "function" ? await response.json() : response;
      } catch {
        data = null;
      }

      const normalized = normalizeValidationApiResponse(data, {
        validMessage,
        invalidMessage,
        availabilityField,
      });

      if (useCache && normalized.isValid) {
        validationCache.set(cacheKey, normalized);
      }

      return normalized;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;

      const status = error?.status || error?.response?.status;
      const data = error?.data || error?.response?.data;

      if (status && !RETRYABLE_STATUS_CODES.includes(status) && status < 500) {
        const failureResponse = createValidationResponse(
          false,
          data?.message || networkMessage,
          { status, data }
        );
        return failureResponse;
      }

      if (attempt < retries) {
        await wait(retryDelayMs * (attempt + 1));
        continue;
      }
    }
  }

  // Fail closed: never treat unreachable validation as success (would allow
  // registration with already-taken email/username when the API is down).
  const timedOut = lastError?.isTimeout || lastError?.name === "AbortError";
  return createValidationResponse(
    false,
    networkMessage,
    {
      error: lastError,
      isTimeout: timedOut,
      isNetworkError: !timedOut,
      skippedDueToError: true,
    },
  );
};

export const checkEmailAvailability = (email, options = {}) => {
  if (!email || typeof email !== "string" || !email.trim()) {
    return Promise.resolve(createValidationResponse(false, "Email is required"));
  }
  return requestValidation(
    options.endpoint || `/api/validate/email/${encodeURIComponent(email)}`,
    {
      invalidMessage: "Email is already registered",
      validMessage: "",
      ...options,
    },
  );
};

export const checkUsernameAvailability = (username, options = {}) => {
  if (!username || typeof username !== "string" || !username.trim()) {
    return Promise.resolve(createValidationResponse(false, "Username is required"));
  }
  return requestValidation(
    options.endpoint ||
      `/api/validate/username/${encodeURIComponent(username)}`,
    {
      invalidMessage: "Username is already taken",
      validMessage: "",
      ...options,
    },
  );
};

export const checkPhoneValidation = (phone, options = {}) =>
  requestValidation(options.endpoint || "/api/validate/phone", {
    method: "POST",
    body: { phone },
    availabilityField: "valid",
    invalidMessage: "Phone number is invalid",
    validMessage: "",
    ...options,
  });

const validationApi = {
  checkEmailAvailability,
  checkUsernameAvailability,
  checkPhoneValidation,
  clearValidationCache,
  createValidationResponse,
  normalizeValidationApiResponse,
  requestValidation,
  validationLoadingResponse,
};

export default validationApi;