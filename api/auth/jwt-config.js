// Centralized JWT configuration shared by all auth endpoints.
// Production must fail closed if the signing secret is missing; otherwise a
// predictable fallback would let attackers forge valid Eventra tokens.
const DEVELOPMENT_JWT_SECRET = "eventra-local-development-jwt-secret";

export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (secret && secret.trim()) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be configured in production");
  }

  return DEVELOPMENT_JWT_SECRET;
};

export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
