import { resolveBackendUrl, DEV_FALLBACK_URL } from "./backendConfig/envResolver.js";
import { normalizeBackendUrl } from "./backendConfig/urlUtils.js";
import { validateBackendConfig, logValidationErrors } from "./backendConfig/validator.js";
import { isDevelopment, isProduction } from "./backendConfig/envDetector.js";

const BACKEND_ORIGIN = normalizeBackendUrl(resolveBackendUrl());
const validation = validateBackendConfig();

logValidationErrors();

export const BACKEND_URL = BACKEND_ORIGIN;

const isRelativePath = BACKEND_ORIGIN.startsWith("/");
const buildApiBase = () => {
  if (!BACKEND_ORIGIN) return "";
  if (isRelativePath) return BACKEND_ORIGIN;
  return `${BACKEND_ORIGIN}/api`;
};
export const API_BASE_URL = buildApiBase();

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
