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

import { resolveBackendUrl, DEV_FALLBACK_URL } from "./backendConfig/envResolver.js";
import { normalizeBackendUrl } from "./backendConfig/urlUtils.js";
import { validateBackendConfig, logValidationErrors } from "./backendConfig/validator.js";
import { isDevelopment, isProduction } from "./backendConfig/envDetector.js";

// Resolve and validate backend URL
const BACKEND_ORIGIN = normalizeBackendUrl(resolveBackendUrl());
const validation = validateBackendConfig();

// Log validation errors in production
logValidationErrors();

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
