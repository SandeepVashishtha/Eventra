/**
 * Configuration Validation Module
 * 
 * Validates backend configuration and provides actionable error messages.
 */

import { resolveBackendUrl } from "./envResolver.js";
import { isValidUrl } from "./urlUtils.js";
import { isProduction } from "./envDetector.js";

/**
 * Validates the backend configuration and provides actionable error messages.
 * 
 * @returns {Object} Validation result with isValid flag and error message if invalid
 */
export const validateBackendConfig = () => {
  const backendUrl = resolveBackendUrl();

  if (!backendUrl) {
    return {
      isValid: false,
      error:
        "Backend URL is not configured. " +
        "Set BACKEND_URL, VITE_API_URL, or REACT_APP_API_URL in your environment.",
    };
  }

  if (!isValidUrl(backendUrl)) {
    return {
      isValid: false,
      error: `Invalid backend URL format: "${backendUrl}". URL must start with http:// or https://`,
    };
  }

  return { isValid: true, error: null };
};

/**
 * Logs validation errors in production
 */
export const logValidationErrors = () => {
  const validation = validateBackendConfig();
  if (!validation.isValid && isProduction()) {
    console.error(`[BACKEND CONFIG ERROR] ${validation.error}`);
  }
};
