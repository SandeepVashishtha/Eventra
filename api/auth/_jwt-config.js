/**
 * JWT Configuration Utilities
 *
 * Centralizes JWT secret resolution and token configuration.
 * Separates secrets by purpose for better security.
 */

const JWT_SECRET_MIN_LENGTH = 64;

/**
 * Gets the JWT secret from environment.
 * Validates minimum length for security.
 * @returns {string} JWT secret
 * @throws {Error} If secret is missing or too short
 */
export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required but not set');
  }
  if (secret.length < JWT_SECRET_MIN_LENGTH) {
    throw new Error(
      `JWT_SECRET must be at least ${JWT_SECRET_MIN_LENGTH} characters (current: ${secret.length})`
    );
  }
  return secret;
}

/**
 * Gets the ticket signing secret.
 * Falls back to main JWT secret but warns about separation.
 * @returns {string} Ticket signing secret
 */
export function getTicketSecret() {
  // Prefer dedicated ticket secret for separation of concerns
  const ticketSecret = process.env.JWT_TICKET_SECRET;
  if (ticketSecret) {
    return ticketSecret;
  }
  // Fallback to main secret (with warning in non-production)
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[JWT Config] Using main JWT_SECRET for ticket tokens. Set JWT_TICKET_SECRET for better separation.');
  }
  return getJwtSecret();
}

/**
 * Gets the refresh token secret.
 * Falls back to main JWT secret but warns about separation.
 * @returns {string} Refresh token secret
 */
export function getRefreshSecret() {
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  if (refreshSecret) {
    return refreshSecret;
  }
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[JWT Config] Using main JWT_SECRET for refresh tokens. Set JWT_REFRESH_SECRET for better separation.');
  }
  return getJwtSecret();
}

/**
 * Standard JWT signing options.
 * @param {string} [subject] - Token subject (e.g., 'auth', 'ticket', 'refresh')
 * @param {string} [expiresIn] - Expiration time (e.g., '24h', '7d', '365d')
 * @returns {object} JWT sign options
 */
export function getSignOptions(subject, expiresIn) {
  const options = {
    algorithm: 'HS256',
  };
  if (subject) options.subject = subject;
  if (expiresIn) options.expiresIn = expiresIn;
  return options;
}

/**
 * Validates JWT configuration at startup.
 * Logs warnings for misconfigurations.
 * @returns {object} Validation result
 */
export function validateJwtConfig() {
  const warnings = [];
  const errors = [];

  // Check main secret
  try {
    const secret = getJwtSecret();
    if (secret === 'mock-jwt-secret-for-ci-build-verification-only') {
      warnings.push('Using mock JWT secret - not suitable for production');
    }
  } catch (e) {
    errors.push(e.message);
  }

  // Check secret separation
  if (!process.env.JWT_TICKET_SECRET) {
    warnings.push('JWT_TICKET_SECRET not set - ticket tokens use main secret');
  }
  if (!process.env.JWT_REFRESH_SECRET) {
    warnings.push('JWT_REFRESH_SECRET not set - refresh tokens use main secret');
  }

  // Log warnings
  warnings.forEach((w) => console.warn(`[JWT Config] ${w}`));

  return { valid: errors.length === 0, errors, warnings };
}