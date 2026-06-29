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

// When BACKEND_ORIGIN is a relative path (e.g. "/api"), it already includes
// the /api prefix (Vercel proxy mode), so use it directly.
// When it's a full URL (e.g. "http://localhost:8080"), append /api.
const isRelativePath = BACKEND_ORIGIN.startsWith("/");
const buildApiBase = () => {
  if (!BACKEND_ORIGIN) return "";
  if (isRelativePath) return BACKEND_ORIGIN;
  return `${BACKEND_ORIGIN}/api`;
};
export const API_BASE_URL = buildApiBase();

// SSE endpoint sits at /stream on the backend, outside the /api prefix.
// For relative paths we strip the /api suffix to point at the root.
export const SSE_BASE_URL = isRelativePath
  ? BACKEND_ORIGIN.replace(/\/api\/?$/, "") || "/"
  : BACKEND_ORIGIN;
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
