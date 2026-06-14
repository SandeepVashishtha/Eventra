/**
 * Centralized Backend Configuration (Vite Optimized)
 */

// ---------------------------------------------------------------------------
// Environment Detection
// ---------------------------------------------------------------------------

const currentMode =
  typeof import.meta !== "undefined" && import.meta.env ? import.meta.env.MODE : "development";

const isDevelopment = currentMode === "development";
const isProduction = currentMode === "production";

// ---------------------------------------------------------------------------
// Configuration Constants
// ---------------------------------------------------------------------------

const DEV_FALLBACK_URL = "http://localhost:8080";

// ---------------------------------------------------------------------------
// URL Normalization
// ---------------------------------------------------------------------------

const normalizeBackendUrl = (value = "") => {
  if (!value) return "";
  const trimmed = value.replace(/\/+$/, "").replace(/\/api$/, "");
  try {
    const parsed = new URL(trimmed);
    return `${parsed.origin}${parsed.pathname === "/" ? "" : parsed.pathname}`;
  } catch {
    return trimmed;
  }
};

const isValidUrl = (value) => {
  if (!value || typeof value !== "string") return false;
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

const resolveBackendUrl = () => {
  // Vite requires explicit dot-notation for statically replacing variables
  if (typeof import.meta !== "undefined" && import.meta.env) {
    if (import.meta.env.VITE_API_URL) {
      return normalizeBackendUrl(import.meta.env.VITE_API_URL);
    }
  }

  // Development fallback
  if (isDevelopment) {
    return DEV_FALLBACK_URL;
  }

  return "";
};

// ---------------------------------------------------------------------------
// Configuration Validation
// ---------------------------------------------------------------------------

const validateBackendConfig = () => {
  const backendUrl = resolveBackendUrl();

  if (!backendUrl) {
    return {
      isValid: false,
      error: "Backend URL is not configured. Set VITE_API_URL in your .env file.",
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

const BACKEND_ORIGIN = resolveBackendUrl();
const validation = validateBackendConfig();

if (!validation.isValid && isProduction) {
  console.error(`[BACKEND CONFIG ERROR] ${validation.error}`);
}

export const BACKEND_URL = BACKEND_ORIGIN;
export const API_BASE_URL = BACKEND_ORIGIN ? `${BACKEND_ORIGIN}/api` : "";
export const SSE_BASE_URL = BACKEND_ORIGIN;
export { validateBackendConfig };

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
