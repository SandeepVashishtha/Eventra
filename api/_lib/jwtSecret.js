/**
 * JWT Secret Validation Utility
 * 
 * Provides a single source of truth for JWT_SECRET retrieval and validation.
 * Enforces fail-closed security behavior - missing or invalid JWT_SECRET
 * will throw an error or return an error response.
 */

/**
 * Retrieves and validates the JWT_SECRET from environment variables.
 * 
 * @returns {string} The validated JWT_SECRET
 * @throws {Error} If JWT_SECRET is missing, empty, or whitespace-only
 * 
 * @example
 * try {
 *   const secret = getJwtSecret();
 *   // Use secret for JWT operations
 * } catch (error) {
 *   // Handle missing JWT_SECRET
 * }
 */
export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || !secret.trim()) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
}

/**
 * Creates a standardized HTTP 500 Response for JWT configuration errors.
 * 
 * @returns {Response} A Response object with status 500 and error message
 * 
 * @example
 * try {
 *   const secret = getJwtSecret();
 * } catch (error) {
 *   return createJwtConfigErrorResponse();
 * }
 */
export function createJwtConfigErrorResponse() {
  return new Response(
    JSON.stringify({
      error: "Server authentication misconfiguration"
    }),
    {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}

/**
 * Validates JWT_SECRET and throws an error with guidance if invalid.
 * This is useful for server startup validation (e.g., in sse-mock-server.js).
 * 
 * @returns {string} The validated JWT_SECRET
 * @throws {Error} If JWT_SECRET is missing, empty, or whitespace-only
 * 
 * @example
 * try {
 *   const secret = validateJwtSecretOrExit();
 *   // Server can start safely with secret
 * } catch (error) {
 *   console.error(error.message);
 *   process.exit(1);
 * }
 */
export function validateJwtSecretOrExit() {
  const secret = process.env.JWT_SECRET;

  if (!secret || !secret.trim()) {
    const error = new Error(
      "FATAL: JWT_SECRET environment variable is required and must not be empty or whitespace-only.\n" +
      "Generate a secure secret using: openssl rand -base64 32"
    );
    throw error;
  }

  return secret;
}
