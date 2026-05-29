// Centralized JWT configuration shared by all auth endpoints.
// JWT_SECRET must be configured in every environment. Falling back to a
// predictable signing key would allow token forgery.
const requireJwtSecret = () => {
  const secret = process.env.JWT_SECRET?.trim();

  if (secret) {
    return secret;
  }

  throw new Error(
    "Missing required environment variable: JWT_SECRET. Eventra cannot start without a JWT signing secret."
  );
};

export const getJwtSecret = () => requireJwtSecret();

export const JWT_SECRET = requireJwtSecret();

export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
