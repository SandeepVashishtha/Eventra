/**
 * Lightweight JWT token utilities.
 *
 * This module re-exports the canonical helpers from `./auth.js` so that
 * existing imports throughout the codebase (`from '../utils/tokenUtils'`)
 * continue to work without modification. All logic lives in auth.js to
 * avoid duplicate implementations.
 */

export function isTokenSkewValid(payload) {
  if (!payload || typeof payload !== "object") return false;
  const now = Math.floor(Date.now() / 1000);
  if (payload.nbf && payload.nbf > now + 30) {
    return false; // Token not yet active (nbf clock skew)
  }
  return true;
}

export {
  decodeJwtPayload as decodeTokenPayload,
  isTokenExpired,
  isTokenValid,
} from './auth.js';
