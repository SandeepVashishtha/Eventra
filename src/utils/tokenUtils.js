/**
 * Lightweight JWT token utilities.
 *
 * This module re-exports the canonical helpers from `./auth.js` so that
 * existing imports throughout the codebase (`from '../utils/tokenUtils'`)
 * continue to work without modification. All logic lives in auth.js to
 * avoid duplicate implementations.
 */

export {
  decodeJwtPayload as decodeTokenPayload,
  isTokenExpired,
  isTokenValid,
  getTokenTTL,
} from './auth.js';
