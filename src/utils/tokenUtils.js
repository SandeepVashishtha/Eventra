/**
 * Lightweight JWT token utilities.
 *
 * This module re-exports the canonical helpers from `./auth.js` so that
 * existing imports throughout the codebase (`from '../utils/tokenUtils'`)
 * continue to work without modification. All logic lives in auth.js to
 * avoid duplicate implementations.
 */

export function isTokenSkewValid(payload, maxSkewSeconds = 30) {
  if (!payload || typeof payload !== "object") return false;
  const now = Math.floor(Date.now() / 1000);

  if (payload.nbf && typeof payload.nbf === "number") {
    if (payload.nbf > now + maxSkewSeconds) {
      return false;
    }
  }

  if (payload.iat && typeof payload.iat === "number") {
    if (payload.iat > now + maxSkewSeconds) {
      return false;
    }
  }

  if (payload.exp && typeof payload.exp === "number") {
    if (payload.exp < now - maxSkewSeconds) {
      return false;
    }
  }

  return true;
}

export {
  decodeJwtPayload as decodeTokenPayload,
  isTokenExpired,
  isTokenValid,
  isAuthSessionValid,
} from './auth.js';
