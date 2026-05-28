/**
 * oauthState.js
 *
 * Generates and validates the OAuth CSRF `state` parameter as required by
 * RFC 6749 §10.12. A new random state value is generated at the start of
 * every OAuth flow and stored in sessionStorage. On callback, the received
 * state is compared to the stored value. A mismatch indicates a CSRF attempt
 * (or a replayed callback URL) and the flow is aborted.
 *
 * One-time-use: the stored value is removed during validation regardless of
 * whether validation passes or fails, preventing replay attacks.
 */

const OAUTH_STATE_KEY = 'eventra:oauth_state';
const STATE_BYTE_LENGTH = 32;

/**
 * Generates a cryptographically random hex state value, stores it in
 * sessionStorage, and returns it so the caller can append it to the OAuth
 * authorization URL as `&state=<value>`.
 *
 * Uses `crypto.getRandomValues` (Web Crypto) for randomness. Falls back to
 * `Math.random` only when running outside a secure context (tests / CI).
 *
 * @returns {string} 64-character lowercase hex string
 */
export const generateOAuthState = () => {
  let hex;

  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(STATE_BYTE_LENGTH);
    crypto.getRandomValues(bytes);
    hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Fallback for non-secure contexts (should never reach production)
    hex = Array.from({ length: STATE_BYTE_LENGTH }, () =>
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('');
  }

  try {
    sessionStorage.setItem(OAUTH_STATE_KEY, hex);
  } catch {
    // sessionStorage unavailable (e.g. private browsing with strict settings)
    // The state will not be persisted; validateOAuthState will return false.
  }

  return hex;
};

/**
 * Compares `receivedState` to the value stored by `generateOAuthState`.
 *
 * Always removes the stored value after comparison — whether the check
 * passes or fails — so each generated state can only be used once.
 *
 * A constant-time comparison loop is used to prevent timing-based side
 * channels (timing attacks on string comparison).
 *
 * @param {string | null | undefined} receivedState - The `state` parameter
 *   read from the OAuth callback URL query string.
 * @returns {boolean} `true` if the state matches the stored value; `false`
 *   for any mismatch, missing state, or missing stored value.
 */
export const validateOAuthState = (receivedState) => {
  let storedState = null;

  try {
    storedState = sessionStorage.getItem(OAUTH_STATE_KEY);
    // Remove immediately regardless of outcome — one-time use
    sessionStorage.removeItem(OAUTH_STATE_KEY);
  } catch {
    return false;
  }

  if (!storedState || !receivedState) return false;
  if (storedState.length !== receivedState.length) return false;

  // Constant-time comparison to prevent timing side channels
  let mismatch = 0;
  for (let i = 0; i < storedState.length; i++) {
    mismatch |= storedState.charCodeAt(i) ^ receivedState.charCodeAt(i);
  }

  return mismatch === 0;
};

/**
 * Returns whether a pending OAuth state value is currently stored in
 * sessionStorage. Useful for detecting if a callback is arriving without
 * a corresponding flow initiation (e.g. a direct navigation to /oauth/callback).
 *
 * Does NOT remove the stored value.
 *
 * @returns {boolean}
 */
export const hasStoredOAuthState = () => {
  try {
    return sessionStorage.getItem(OAUTH_STATE_KEY) !== null;
  } catch {
    return false;
  }
};

/**
 * Clears any stored OAuth state. Call this if the user cancels the OAuth
 * flow mid-way (e.g. navigates away from the provider selection screen)
 * to prevent stale state values from blocking future flows.
 */
export const clearOAuthState = () => {
  try {
    sessionStorage.removeItem(OAUTH_STATE_KEY);
  } catch {}
};
