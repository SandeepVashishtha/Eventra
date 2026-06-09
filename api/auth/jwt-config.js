// Centralized JWT configuration shared by all auth endpoints.
// JWT_SECRET is mandatory in every environment so Eventra never falls back to
// a predictable signing key that could be used to forge tokens.
const requireJwtSecret = () => {
  const secret = process.env.JWT_SECRET?.trim();

  if (secret) {
    return secret;
  }

  // Fallback to a test secret if in test environment
  if (process.env.NODE_ENV === "test") {
    return "test-secret-for-test-environments";
  }

  throw new Error(
    "Missing required environment variable: JWT_SECRET. Eventra cannot start without a JWT signing secret."
  );
};

export const getJwtSecret = () => requireJwtSecret();

export const JWT_SECRET = requireJwtSecret();

export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

export const JWT_COOKIE_MAX_AGE_SECONDS = (() => {
  const val = JWT_EXPIRES_IN;
  const match = val.match(/^(\d+)(m|h|d)$/);
  if (!match) return 3600;
  const n = parseInt(match[1], 10);
  const unit = match[2];
  return unit === 'm' ? n * 60 : unit === 'h' ? n * 3600 : n * 86400;
})();
