/**
 * Centralized Backend Configuration (Vite Optimized)
 */

import { resolveBackendUrl, DEV_FALLBACK_URL } from "./backendConfig/envResolver.js";
import { normalizeBackendUrl } from "./backendConfig/urlUtils.js";
import { validateBackendConfig, logValidationErrors } from "./backendConfig/validator.js";
import { isDevelopment, isProduction } from "./backendConfig/envDetector.js";

// Resolve and validate backend URL
const BACKEND_ORIGIN = normalizeBackendUrl(resolveBackendUrl());
const validation = validateBackendConfig();

// Log validation errors in production
logValidationErrors();

export const BACKEND_URL = BACKEND_ORIGIN;
export const API_BASE_URL = BACKEND_ORIGIN ? `${BACKEND_ORIGIN}/api` : "";
export const SSE_BASE_URL = BACKEND_ORIGIN;
export { validateBackendConfig };

export const CONFIG_METADATA = {
  backendOrigin: BACKEND_ORIGIN,
  isDevelopment: isDevelopment(),
  isProduction: isProduction(),
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
