/**
 * Environment Variable Resolution Module
 * 
 * Handles resolution of backend URLs from environment variables.
 */

import { getRuntimeEnv, isDevelopment } from "./envDetector.js";

const DEV_FALLBACK_URL = "http://localhost:8080";

const BACKEND_URL_KEYS = ["BACKEND_URL", "VITE_API_URL", "REACT_APP_API_URL"];

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
    if (value) return value;
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
  const resolvedUrl = getFirstDefinedEnvValue(BACKEND_URL_KEYS);
  
  if (resolvedUrl) {
    return resolvedUrl;
  }

  if (isDevelopment()) {
    return DEV_FALLBACK_URL;
  }

  return "";
};

export { DEV_FALLBACK_URL };
