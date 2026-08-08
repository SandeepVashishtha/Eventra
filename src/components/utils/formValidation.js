/**
 * formValidation.js
 * Centralized form validation utilities to prevent invalid or malicious data submission.
 * Use these validators on ALL forms before submission.
 */

const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
  alphanumeric: /^[a-zA-Z0-9\s]+$/,
  noScript: /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  noHtml: /<[^>]*>/g,
  sqlInjection: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC)\b)/gi,
};

export const sanitizeString = (value) => {
  if (typeof value !== "string") return "";
  return value
    .replace(PATTERNS.noScript, "")
    .replace(PATTERNS.noHtml, "")
    .trim();
};

export const validateEmail = (email) => {
  if (!email || typeof email !== "string") return { valid: false, message: "Email is required" };
  const sanitized = sanitizeString(email);
  if (!PATTERNS.email.test(sanitized)) return { valid: false, message: "Invalid email format" };
  if (sanitized.length > 254) return { valid: false, message: "Email is too long" };
  return { valid: true, message: "" };
};

export const validatePassword = (password) => {
  if (!password) return { valid: false, message: "Password is required" };
  if (password.length < 8) return { valid: false, message: "Password must be at least 8 characters" };
  if (password.length > 128) return { valid: false, message: "Password is too long" };
  if (!/[A-Z]/.test(password)) return { valid: false, message: "Password must contain an uppercase letter" };
  if (!/[a-z]/.test(password)) return { valid: false, message: "Password must contain a lowercase letter" };
  if (!/[0-9]/.test(password)) return { valid: false, message: "Password must contain a number" };
  return { valid: true, message: "" };
};

export const validateText = (value, { min = 1, max = 500, fieldName = "Field" } = {}) => {
  if (!value || typeof value !== "string") return { valid: false, message: `${fieldName} is required` };
  const sanitized = sanitizeString(value);
  if (sanitized.length < min) return { valid: false, message: `${fieldName} must be at least ${min} characters` };
  if (sanitized.length > max) return { valid: false, message: `${fieldName} must be at most ${max} characters` };
  if (PATTERNS.sqlInjection.test(sanitized)) return { valid: false, message: `${fieldName} contains invalid characters` };
  return { valid: true, message: "", sanitized };
};

export const validateUrl = (url) => {
  if (!url) return { valid: true, message: "" };
  const sanitized = sanitizeString(url);
  if (!PATTERNS.url.test(sanitized)) return { valid: false, message: "Invalid URL format" };
  if (sanitized.length > 2048) return { valid: false, message: "URL is too long" };
  return { valid: true, message: "" };
};

export const validateForm = (fields) => {
  const errors = {};
  let isValid = true;

  for (const [key, result] of Object.entries(fields)) {
    if (!result.valid) {
      errors[key] = result.message;
      isValid = false;
    }
  }

  return { isValid, errors };
};