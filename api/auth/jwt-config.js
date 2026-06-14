/**
 * Returns the JWT signing secret from environment variables.
 * 
 * SECURITY: JWT_SECRET is mandatory. There is NO fallback secret.
 * This prevents token signing with publicly known secrets and ensures
 * fail-closed security behavior.
 * 
 * @throws {Error} If JWT_SECRET is missing, empty, or whitespace-only
 * @returns {string} The JWT signing secret
 */
export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret || !secret.trim()) {
    throw new Error(
      "JWT_SECRET environment variable is required. " +
      "Generate a secure secret using: openssl rand -base64 32"
    );
  }

  return secret;
};

export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
export const JWT_COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
