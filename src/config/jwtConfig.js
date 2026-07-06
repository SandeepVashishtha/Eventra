/**
 * JWT Configuration with security validation
 * Ensures JWT secret meets security requirements
 */

const JWT_MINIMUM_SECRET_LENGTH = 32; // 256-bit minimum for HS256

export class JWTConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = "JWTConfigError";
  }
}

/**
 * Validate JWT configuration on application startup
 */
export function validateJWTConfiguration() {
  const jwtSecret = process.env.REACT_APP_JWT_SECRET ||
                   process.env.VUE_APP_JWT_SECRET ||
                   process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new JWTConfigError(
      "JWT_SECRET environment variable is not set. " +
      "Generate a secure secret with: openssl rand -base64 64"
    );
  }

  if (jwtSecret.length < JWT_MINIMUM_SECRET_LENGTH) {
    throw new JWTConfigError(
      `JWT_SECRET must be at least ${JWT_MINIMUM_SECRET_LENGTH} characters. ` +
      `Current length: ${jwtSecret.length} characters. ` +
      "Generate a secure secret with: openssl rand -base64 64"
    );
  }

  // Warn if looks like default/weak value
  const weakDefaults = ["secret", "eventraSecret", "test", "demo", "password"];
  if (weakDefaults.includes(jwtSecret.toLowerCase())) {
    throw new JWTConfigError(
      "JWT_SECRET appears to be a default/weak value. " +
      "This is a security risk. Generate a random value with: " +
      "openssl rand -base64 64"
    );
  }

  return {
    isValid: true,
    secretLength: jwtSecret.length,
    message: "JWT configuration validated successfully",
  };
}

/**
 * JWT Configuration object
 */
export const jwtConfig = {
  secret: process.env.REACT_APP_JWT_SECRET ||
          process.env.VUE_APP_JWT_SECRET ||
          process.env.JWT_SECRET,
  algorithm: "HS256",
  expirationMs: parseInt(process.env.JWT_EXPIRATION_MS || "86400000", 10), // 24 hours
  refreshExpirationMs: parseInt(
    process.env.JWT_REFRESH_EXPIRATION_MS || "604800000",
    10
  ), // 7 days

  /**
   * Validate configuration
   */
  validate() {
    return validateJWTConfiguration();
  },

  /**
   * Check if token is expired
   */
  isTokenExpired(expiresAt) {
    if (!expiresAt) return true;
    return new Date(expiresAt) <= new Date();
  },

  /**
   * Get time until token expiration (in seconds)
   */
  getTimeUntilExpiration(expiresAt) {
    if (!expiresAt) return 0;
    const expirationTime = new Date(expiresAt).getTime();
    const currentTime = new Date().getTime();
    return Math.max(0, Math.floor((expirationTime - currentTime) / 1000));
  },
};

/**
 * Validate JWT configuration on module load
 * This runs on application startup
 */
if (typeof window !== "undefined" || typeof global !== "undefined") {
  try {
    validateJWTConfiguration();
    console.log("✓ JWT configuration validated");
  } catch (error) {
    console.error("✗ JWT Configuration Error:", error.message);
    if (process.env.NODE_ENV === "production") {
      throw error; // Fail fast in production
    }
  }
}

export default jwtConfig;
