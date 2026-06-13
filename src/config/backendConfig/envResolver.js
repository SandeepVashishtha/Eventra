/**
 * Environment Variable Resolution Module
 * 
 * Handles resolution of backend URLs from environment variables.
 */

import { getRuntimeEnv, isDevelopment } from "./envDetector.js";

const DEV_FALLBACK_URL = "http://localhost:8080";

/**
 * Gets the first defined environment variable from a list of keys.
 * 
 * @param {string[]} keys - Array of environment variable names to check
 * @returns {string} The first non-empty value, or empty string if none found
 */
export const getFirstDefinedEnvValue = (keys = []) => {
  const runtimeEnv = getRuntimeEnv();
  
  for (const key of keys) {
    const value = runtimeEnv[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return "";
};

/**
 * Resolves the backend URL from environment variables with appropriate fallbacks.
 * 
 * Resolution order:
 * 1. BACKEND_URL (highest priority)
 * 2. VITE_API_URL (Vite builds)
 * 3. REACT_APP_API_URL (CRA compatibility)
 * 4. Development fallback: http://localhost:8080
 * 5. Production: no fallback (configuration required)
 * 
 * @returns {string} The resolved backend URL
 */
export const resolveBackendUrl = () => {
  // Check BACKEND_URL first (used by dev proxy and can override)
  const backendUrl = getFirstDefinedEnvValue(["BACKEND_URL"]);
  if (backendUrl) {
    return backendUrl;
  }

  // Check VITE_API_URL (Vite builds - preferred)
  const viteUrl = getFirstDefinedEnvValue(["VITE_API_URL"]);
  if (viteUrl) {
    return viteUrl;
  }

  // Check REACT_APP_API_URL (CRA compatibility)
  const reactUrl = getFirstDefinedEnvValue(["REACT_APP_API_URL"]);
  if (reactUrl) {
    return reactUrl;
  }

  // Apply fallbacks based on environment
  if (isDevelopment()) {
    return DEV_FALLBACK_URL;
  }

  // Production: no automatic fallback to avoid configuration drift
  return "";
};

export { DEV_FALLBACK_URL };
