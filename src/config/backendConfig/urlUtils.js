/**
 * URL Utilities Module
 * 
 * Provides URL normalization and validation functions.
 */

/**
 * Normalizes a backend URL by removing trailing slashes and /api suffix.
 * Ensures consistent URL format across the application.
 * 
 * @param {string} value - The URL to normalize
 * @returns {string} Normalized URL without trailing slashes or /api suffix
 */
export const normalizeBackendUrl = (value = "") => {
  if (!value) {
    return "";
  }

  const trimmed = value.replace(/\/+$/, "").replace(/\/api$/, "");

  try {
    const parsed = new URL(trimmed);
    return `${parsed.origin}${parsed.pathname === "/" ? "" : parsed.pathname}`;
  } catch {
    return trimmed;
  }
};

/**
 * Validates that a URL string is properly formatted.
 * 
 * @param {string} value - The URL to validate
 * @returns {boolean} True if the URL is valid, false otherwise
 */
export const isValidUrl = (value) => {
  if (!value || typeof value !== "string") {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};
