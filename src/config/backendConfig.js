/**
 * Centralized Backend Configuration
 * 
 * This module is the single source of truth for all backend endpoint configuration
 * across the Eventra application. It provides:
 * - Consistent environment variable resolution
 * - URL normalization and validation
 * - API and SSE base URLs
 * - Configuration validation with clear error messages
 * 
 * Environment Variable Resolution Order:
 * 1. BACKEND_URL (highest priority, used by dev proxy and can override others)
 * 2. VITE_API_URL (Vite builds - preferred)
 * 3. REACT_APP_API_URL (CRA compatibility)
 * 
 * Fallback Strategy:
 * - Development: http://localhost:8080
 * - Production: No fallback (configuration is required)
 * 
 * Deployed Backend:
 * - https://eventra-backend-springboot-eybhdvaubxcua7ha.centralindia-01.azurewebsites.net
 */

// ---------------------------------------------------------------------------
// Environment Detection
// ---------------------------------------------------------------------------

const runtimeEnv =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env
    : typeof process !== "undefined" && process.env
      ? process.env
      : {};

const currentMode = runtimeEnv.MODE || runtimeEnv.NODE_ENV || "development";
const isDevelopment = currentMode === "development";
const isProduction = currentMode === "production";

// ---------------------------------------------------------------------------
// Configuration Constants
// ---------------------------------------------------------------------------

const DEV_FALLBACK_URL = "http://localhost:8080";

// ---------------------------------------------------------------------------
// URL Normalization
// ---------------------------------------------------------------------------

/**
 * Normalizes a backend URL by removing trailing slashes and /api suffix.
 * Ensures consistent URL format across the application.
 * 
 * @param {string} value - The URL to normalize
 * @returns {string} Normalized URL without trailing slashes or /api suffix
 */
const normalizeBackendUrl = (value = "") => {
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
const isValidUrl = (value) => {
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

// ---------------------------------------------------------------------------
// Environment Variable Resolution
// ---------------------------------------------------------------------------

/**
 * Gets the first defined environment variable from a list of keys.
 * 
 * @param {string[]} keys - Array of environment variable names to check
 * @returns {string} The first non-empty value, or empty string if none found
 */
const getFirstDefinedEnvValue = (keys = []) => {
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
const resolveBackendUrl = () => {
  // Check BACKEND_URL first (used by dev proxy and can override)
  const backendUrl = getFirstDefinedEnvValue(["BACKEND_URL"]);
  if (backendUrl) {
    return normalizeBackendUrl(backendUrl);
  }

  // Check VITE_API_URL (Vite builds - preferred)
  const viteUrl = getFirstDefinedEnvValue(["VITE_API_URL"]);
  if (viteUrl) {
    return normalizeBackendUrl(viteUrl);
  }

  // Check REACT_APP_API_URL (CRA compatibility)
  const reactUrl = getFirstDefinedEnvValue(["REACT_APP_API_URL"]);
  if (reactUrl) {
    return normalizeBackendUrl(reactUrl);
  }

  // Apply fallbacks based on environment
  if (isDevelopment) {
    return DEV_FALLBACK_URL;
  }

  // Production: no automatic fallback to avoid configuration drift
  // Configuration must be explicitly set via environment variables
  return "";
};

// ---------------------------------------------------------------------------
// Configuration Validation
// ---------------------------------------------------------------------------

/**
 * Validates the backend configuration and provides actionable error messages.
 * 
 * @returns {Object} Validation result with isValid flag and error message if invalid
 */
const validateBackendConfig = () => {
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

// ---------------------------------------------------------------------------
// Exported Configuration
// ---------------------------------------------------------------------------

// Resolve and validate backend URL
const BACKEND_ORIGIN = resolveBackendUrl();
const validation = validateBackendConfig();

// Log validation errors in production
if (!validation.isValid && isProduction) {
  console.error(`[BACKEND CONFIG ERROR] ${validation.error}`);
}

// Export the normalized backend origin (without /api suffix)
export const BACKEND_URL = BACKEND_ORIGIN;

// Export API base URL (backend origin + /api prefix)
export const API_BASE_URL = BACKEND_ORIGIN ? `${BACKEND_ORIGIN}/api` : "";

// Export SSE base URL (uses same origin as API for consistency)
export const SSE_BASE_URL = BACKEND_ORIGIN;

// Export validation function for runtime checks
export { validateBackendConfig };

// Export configuration metadata
export const CONFIG_METADATA = {
  backendOrigin: BACKEND_ORIGIN,
  isDevelopment,
  isProduction,
  devFallbackUrl: DEV_FALLBACK_URL,
  validation,
};


export default {
  BACKEND_URL,
  API_BASE_URL,
  SSE_BASE_URL,
  validateBackendConfig,
  CONFIG_METADATA,
};
