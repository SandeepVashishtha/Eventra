export const validateBackendOrigin = (urlStr) => {
  if (!urlStr || typeof urlStr !== "string") {
    return null;
  }

  const trimmed = urlStr.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      console.warn(
        `[CSP] Invalid backend origin protocol: ${url.protocol}. Only http and https are allowed.`
      );
      return null;
    }

    return url.origin;
  } catch (e) {
    console.warn(`[CSP] Invalid backend origin URL: ${trimmed}. Error: ${e.message}`);
    return null;
  }
};

export const getBackendOrigins = () => {
  const origins = new Set();

  const envVars = [
    process.env.BACKEND_URL,
    process.env.VITE_API_URL,
    process.env.REACT_APP_API_URL,
  ];

  for (const envVar of envVars) {
    if (envVar) {
      const origin = validateBackendOrigin(envVar);
      if (origin) {
        origins.add(origin);
      }
    }
  }

  if (origins.size === 0) {
    console.warn(
      "[CSP] No valid backend origins configured in BACKEND_URL, VITE_API_URL, or REACT_APP_API_URL. " +
      "CSP connect-src will not include backend origins. API calls may be blocked."
    );
  }

  return Array.from(origins);
};

export const createSecurityHeaders = () => {
  const cspOrigins = getBackendOrigins().join(" ");
  const cspValue =
    "default-src 'self'; " +
    "script-src 'self' https://accounts.google.com https://cdn.jsdelivr.net; " +
    "style-src 'self' https://fonts.googleapis.com; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "connect-src 'self' https://api.github.com " + cspOrigins + "; " +
    "frame-src 'self' https://accounts.google.com";

  return {
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), display-capture=()",
    "Content-Security-Policy": cspValue,
  };
};

export const addSecurityHeaders = (headers) => {
  const securityHeaders = createSecurityHeaders();
  for (const [key, value] of Object.entries(securityHeaders)) {
    headers.set(key, value);
  }
};
