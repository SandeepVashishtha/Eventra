/**
 * src/validation.js
 *
 * Centralised validation helpers for all form fields.
 *
 * SECURITY: All regex patterns have been audited for ReDoS (Regular Expression
 * Denial of Service) vulnerability. Patterns use linear-time matching
 * without nested quantifiers or backtracking-prone constructs.
 *
 * References:
 *  - OWASP ReDoS: https://owasp.org/www-community/attacks/ReDoS
 *  - Safe email regex: anchored, no nested groups, bounded wildcards
 */

/**
 * Email validation using a simple, linear-time pattern.
 * Avoids catastrophic backtracking by using character-class negation
 * instead of nested quantifiers.
 *
 * Max input length is capped at 254 chars (RFC 5321 limit) before
 * regex evaluation to prevent long-string DoS attacks.
 */
const EMAIL_REGEX = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{1,63}$/;
const MAX_EMAIL_LENGTH = 254;

/**
 * Phone validation: optional leading '+', then digits/spaces/dashes/parens.
 * No nested quantifiers — runs in O(n) time.
 * Min 10 chars enforced via `.length` check rather than `{10,}` inside the regex.
 */
const PHONE_REGEX = /^\+?[\d\s\-()]+$/;

/**
 * URL validation: scheme + host only, no catastrophic backtracking.
 * Uses a simple prefix check rather than a complex nested pattern.
 */
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
   * Survey sanitizers & XSS guards
   * Capped to 150 characters for prompts, 80 for options.
   * Linear-time regex scrubs all HTML tags completely.
   */
  sanitizeSurveyPrompt: (val) => {
    if (typeof val !== "string") return "";
    let cleaned = val.replace(/<\/?[^>]+(>|$)/g, "");
    if (cleaned.length > 150) {
      cleaned = cleaned.substring(0, 150);
    }
    return cleaned;
  },

  sanitizeSurveyOption: (val) => {
    if (typeof val !== "string") return "";
    let cleaned = val.replace(/<\/?[^>]+(>|$)/g, "");
    if (cleaned.length > 80) {
      cleaned = cleaned.substring(0, 80);
    }
    return cleaned;
  },

  detectHTML: (val) => {
    if (typeof val !== "string") return false;
    return /<\/?[^>]+(>|$)/g.test(val);
  },
};