import { createDebouncedValidator } from "./utils/debounceUtils";
import {
  checkEmailAvailability,
  checkPhoneValidation,
  checkUsernameAvailability,
  createValidationResponse,
  normalizeValidationApiResponse,
  requestValidation,
} from "./utils/validationApi";

export const VALIDATION_MESSAGES = {
  required: "This field is required",
  invalidEmail: "Invalid email format",
  emailTaken: "Email is already registered",
  usernameTaken: "Username is already taken",
  weakPassword: "Password does not meet strength requirements",
  invalidPhone: "Phone number is invalid",
  validationUnavailable: "Unable to validate right now. Please try again.",
};

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phonePattern = /^\+?[\d\s-()]{10,}$/;

const EMAIL_REGEX = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{1,63}$/;
const MAX_EMAIL_LENGTH = 254;
const PHONE_REGEX = /^\+?[\d\s\-()]+$/;
const URL_REGEX = /^https?:\/\/[^\s]{1,2048}$/;

export const validate = {

  /**
   * Email: uses anchored, non-backtracking character classes.
   * Input is length-capped before regex to guard against long-string attacks.
   */
  email: (val) => {
    if (!val || val.length > MAX_EMAIL_LENGTH) return "Invalid email format";
    return EMAIL_REGEX.test(val) || "Invalid email format";
  },

  password: (val) => val.length >= 8 || "Password must be at least 8 characters",

  required: (val) => (val && val.trim() !== "") || "This field is required",

  usernameOrEmail: (val) => (val && val.trim() !== "") || "Email or username is required",

  firstName: (val) => {
    if (!val || !val.trim()) return "First name is required";
    if (val.length < 2) return "At least 2 characters";
    if (val.length > 50) return "Less than 50 characters";
    return true;
  },

  lastName: (val) => {
    if (!val || !val.trim()) return "Last name is required";
    if (val.length < 2) return "At least 2 characters";
    if (val.length > 50) return "Less than 50 characters";
    return true;
  },

  fullName: (val) => (val && val.trim() !== "") || "Full name is required",
  phone: (val) => phonePattern.test(val) || VALIDATION_MESSAGES.invalidPhone,

  /**
   * Phone: length check first (min 10), then linear-time regex.
   * Avoids `{10,}` quantifier inside the pattern itself.
   */
  phone: (val) => {
    if (!val || val.replace(/[\s\-()]/g, "").replace("+", "").length < 10) {
      return "Phone number is invalid";
    }
    return PHONE_REGEX.test(val) || "Phone number is invalid";
  },

  /**
   * URL: simple prefix + linear character class. No nested quantifiers.
   */
  url: (val) => {
    if (!val) return "URL is required";
    if (val.length > 2048) return "URL is too long";
    return URL_REGEX.test(val) || "Invalid URL format (must start with http:// or https://)";
  },

  confirmPassword: (val, allValues) => {
    if (!val || !val.trim()) return "Please confirm your password";
    if (val !== allValues.password) return "Passwords do not match";
    return true;
  },

  minLength: (min) => (val) => (val && val.length >= min) || `Minimum ${min} characters`,
  maxLength: (max) => (val) => (!val || val.length <= max) || `Maximum ${max} characters`,

  /**
   * Survey sanitizers & XSS guards.
   * Capped to 150 chars for prompts, 80 for options.
   */
  sanitizeSurveyPrompt: (val) => {
    if (typeof val !== "string") return "";
    let cleaned = val.replace(/<\/?[^>]+(>|$)/g, "");
    if (cleaned.length > 150) cleaned = cleaned.substring(0, 150);
    return cleaned;
  },

  sanitizeSurveyOption: (val) => {
    if (typeof val !== "string") return "";
    let cleaned = val.replace(/<\/?[^>]+(>|$)/g, "");
    if (cleaned.length > 80) cleaned = cleaned.substring(0, 80);
    return cleaned;
  },

  detectHTML: (val) => {
    if (typeof val !== "string") return false;
    return /<\/?[^>]+(>|$)/g.test(val);
  },
};


export const toHookValidationResult = (result) =>
  result?.isValid ? true : result?.message || VALIDATION_MESSAGES.validationUnavailable;

export const normalizeValidationResult = (result, fallbackMessage = "Validation failed") => {
  if (typeof result === "boolean") {
    return createValidationResponse(result, result ? "" : fallbackMessage);
  }

  if (typeof result === "string") {
    return createValidationResponse(false, result);
  }

  if (result && typeof result === "object") {
    if (typeof result.isValid === "boolean") {
      return createValidationResponse(result.isValid, result.message || fallbackMessage, result);
    }

    return normalizeValidationApiResponse(result, {
      invalidMessage: result.message || fallbackMessage,
    });
  }

  return createValidationResponse(false, fallbackMessage);
};

export const validateEmailAvailability = async (email, options = {}) => {
  const {
    messages = {},
    skipEmpty = true,
    apiOptions = {},
  } = options;

  if (!email && skipEmpty) {
    return createValidationResponse(true);
  }

  if (!emailPattern.test(email)) {
    return createValidationResponse(
      false,
      messages.invalidFormat || VALIDATION_MESSAGES.invalidEmail,
    );
  }

  const result = await checkEmailAvailability(email, {
    invalidMessage: messages.unavailable || VALIDATION_MESSAGES.emailTaken,
    networkMessage: messages.network || VALIDATION_MESSAGES.validationUnavailable,
    ...apiOptions,
  });

  return normalizeValidationResult(
    result,
    messages.unavailable || VALIDATION_MESSAGES.emailTaken,
  );
};

export const validateUsernameUnique = async (username, options = {}) => {
  const {
    minLength = 3,
    pattern = /^[a-zA-Z0-9_]+$/,
    messages = {},
    skipEmpty = true,
    apiOptions = {},
  } = options;

  if (!username && skipEmpty) {
    return createValidationResponse(true);
  }

  if (username.length < minLength) {
    return createValidationResponse(
      false,
      messages.tooShort || `Username must be at least ${minLength} characters`,
    );
  }

  if (!pattern.test(username)) {
    return createValidationResponse(
      false,
      messages.invalidFormat || "Username can only include letters, numbers, and underscores",
    );
  }

  const result = await checkUsernameAvailability(username, {
    invalidMessage: messages.unavailable || VALIDATION_MESSAGES.usernameTaken,
    networkMessage: messages.network || VALIDATION_MESSAGES.validationUnavailable,
    ...apiOptions,
  });

  return normalizeValidationResult(
    result,
    messages.unavailable || VALIDATION_MESSAGES.usernameTaken,
  );
};

export const validateUsernameAvailable = validateUsernameUnique;

export const validatePasswordStrength = async (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSpecial = true,
    messages = {},
  } = options;

  if (!password) {
    return createValidationResponse(
      false,
      messages.required || VALIDATION_MESSAGES.required,
    );
  }

  const checks = [
    [password.length >= minLength, messages.minLength || `Password must be at least ${minLength} characters`],
    [!requireUppercase || /[A-Z]/.test(password), messages.uppercase || "Password must include an uppercase letter"],
    [!requireLowercase || /[a-z]/.test(password), messages.lowercase || "Password must include a lowercase letter"],
    [!requireNumber || /\d/.test(password), messages.number || "Password must include a number"],
    [!requireSpecial || /[^A-Za-z0-9]/.test(password), messages.special || "Password must include a special character"],
  ];

  const failedCheck = checks.find(([passed]) => !passed);
  if (failedCheck) {
    return createValidationResponse(false, failedCheck[1]);
  }

  return createValidationResponse(true);
};

export const validatePhoneNumber = async (phone, options = {}) => {
  const {
    messages = {},
    skipEmpty = true,
    useApi = true,
    apiOptions = {},
  } = options;

  if (!phone && skipEmpty) {
    return createValidationResponse(true);
  }

  if (!phonePattern.test(phone)) {
    return createValidationResponse(
      false,
      messages.invalidFormat || VALIDATION_MESSAGES.invalidPhone,
    );
  }

  if (!useApi) {
    return createValidationResponse(true);
  }

  const result = await checkPhoneValidation(phone, {
    invalidMessage: messages.invalid || VALIDATION_MESSAGES.invalidPhone,
    networkMessage: messages.network || VALIDATION_MESSAGES.validationUnavailable,
    ...apiOptions,
  });

  return normalizeValidationResult(
    result,
    messages.invalid || VALIDATION_MESSAGES.invalidPhone,
  );
};

export const createCustomAsyncValidator = (validatorOrEndpoint, options = {}) => {
  const {
    message = "Validation failed",
    debounceMs,
    mapResult,
    toHookResult = false,
  } = options;

  const validator = async (value, allValues) => {
    const rawResult =
      typeof validatorOrEndpoint === "function"
        ? await validatorOrEndpoint(value, allValues)
        : await requestValidation(validatorOrEndpoint, {
            body: { value, allValues },
            method: "POST",
            invalidMessage: message,
            ...options.apiOptions,
          });

    const result = normalizeValidationResult(
      mapResult ? mapResult(rawResult) : rawResult,
      message,
    );

    return toHookResult ? toHookValidationResult(result) : result;
  };

  return debounceMs ? createDebouncedValidator(validator, debounceMs) : validator;
};

export const createHookValidator = (validator) => async (value, allValues) =>
  toHookValidationResult(await validator(value, allValues));

export {
  checkEmailAvailability,
  checkPhoneValidation,
  checkUsernameAvailability,
  createDebouncedValidator,
  createValidationResponse,
  requestValidation,
};

export default validate;

