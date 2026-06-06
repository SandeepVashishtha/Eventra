/**
 * Validates a given path against an allowlist of internal routes
 * to prevent open redirect vulnerabilities during authentication flows.
 */

const ALLOWED_REDIRECT_PREFIXES = [
  '/dashboard',
  '/profile',
  '/settings',
  '/events',
  '/hackathons',
  '/projects',
  '/admin',
  '/networking',
  '/sponsor',
  '/bookmarks',
  '/reminders',
  '/calendar',
  '/create-event',
  '/host-hackathon',
  '/community-event',
  '/leaderboard'
];

export const isValidRedirectPath = (path) => {
  if (!path || typeof path !== "string") return false;
  
  // Must be a relative path and not a protocol-relative URL
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) {
    return false;
  }
  
  try {
    // If it can be parsed as an absolute URL, reject it
    new URL(path);
    return false;
  } catch {
    // Expected to throw for relative paths
  }

  // Exact match for root
  if (path === "/") return true;
  
  // Prefix match against the allowlist
  return ALLOWED_REDIRECT_PREFIXES.some(prefix => path.startsWith(prefix));
};

export const getSafeRedirectPath = (rawPath, fallback = "/dashboard") => {
  if (isValidRedirectPath(rawPath)) {
    // Guard against infinite auth loops
    if (rawPath.match(/\/(login|register|signup|password-reset|unauthorized)/i)) {
      return fallback;
    }
    return rawPath;
  }
  return fallback;
};
