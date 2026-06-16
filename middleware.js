import middleware, { config, validateBackendOrigin, getBackendOrigins, createSecurityHeaders } from "./middleware/index.js";

export { middleware as default, config, validateBackendOrigin, getBackendOrigins };

export const SECURITY_HEADERS = createSecurityHeaders();
