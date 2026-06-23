/**
 * CSP and Security Headers Module
 *
 * This is the AUTHORITATIVE source for all Content Security Policy
 * and security header definitions used across Eventra deployments.
 *
 * To keep policies consistent, updates to this file should be
 * mirrored in the static configs:
 *   - vercel.json  (Vercel edge headers)
 *   - netlify.toml (Netlify header rules)
 *   - nginx.conf   (self-hosted nginx deployments)
 *
 * The CSP follows a defense-in-depth approach:
 *   - default-src 'self' restricts all resources to same origin
 *   - script-src allows Google Accounts (OAuth) and jsDelivr (CDN libs)
 *   - style-src allows Google Fonts with unsafe-inline for Framer Motion
 *   - connect-src includes BACKEND_URL / VITE_API_URL from env vars
 *   - frame-ancestors 'none' prevents clickjacking
 *   - upgrade-insecure-requests forces HTTPS
 */

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
    "script-src 'self' 'unsafe-inline' https://accounts.google.com https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "style-src-elem 'self' https://fonts.googleapis.com; " +
    "style-src-attr 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data: https://fonts.gstatic.com; " +
    "connect-src 'self' https://api.github.com https://accounts.google.com https://www.googleapis.com https://api.emailjs.com " + cspOrigins + "; " +
    "frame-src 'self' https://accounts.google.com; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "object-src 'none'; " +
    "upgrade-insecure-requests";

  return {
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=(), payment=(), usb=(), bluetooth=()",
    "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    "Cross-Origin-Resource-Policy": "same-site",
    "Content-Security-Policy": cspValue,
  };
};

export const addSecurityHeaders = (headers) => {
  const securityHeaders = createSecurityHeaders();
  for (const [key, value] of Object.entries(securityHeaders)) {
    headers.set(key, value);
  }
};
