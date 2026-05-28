/**
 * OAuth CSRF state parameter utilities.
 *
 * RFC 6749 §10.12 requires that OAuth flows include a `state` parameter to
 * prevent login CSRF attacks (account fixation). The flow is:
 *
 *  1. Before redirecting to the OAuth provider, generate a cryptographically
 *     random nonce and store it in sessionStorage.
 *  2. Include the nonce in the `state` query parameter of the authorization URL.
 *  3. When the provider redirects back to /oauth/callback, read `?state=` from
 *     the URL and compare it to the stored nonce.
 *  4. Reject the callback if the values do not match.
 *  5. Clear the stored nonce after validation (one-time use).
 *
 * Attack prevented: An attacker who initiates their own OAuth flow can capture
 * the callback URL that contains their token. Without state validation, they
 * can trick a victim into navigating to that URL and the victim's browser
 * would establish a session as the attacker's account (account fixation /
 * login CSRF). With state validation, the forged callback URL carries the
 * attacker's nonce, which does not match the victim's stored nonce, so the
 * callback is rejected.
 */

const STORAGE_KEY = 'eventra:oauth:state';
const STATE_BYTE_LENGTH = 32;

/**
 * Generates a cryptographically random OAuth state nonce, stores it in
 * sessionStorage, and returns it so the caller can append it to the
 * authorization URL as `?state=<nonce>`.
 *
 * Uses Web Crypto API when available (secure contexts); falls back to a
 * Math.random hex string for non-HTTPS development environments.
 *
 * @returns {string} The generated nonce (URL-safe base64 or hex string).
 */
export function generateOAuthState() {
  let nonce;

  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.getRandomValues === 'function'
  ) {
    const bytes = new Uint8Array(STATE_BYTE_LENGTH);
    crypto.getRandomValues(bytes);
    // URL-safe base64 encoding
    nonce = btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } else {
    // Fallback for non-secure contexts (development only)
    nonce = Array.from({ length: STATE_BYTE_LENGTH }, () =>
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0'),
    ).join('');
  }

  try {
    sessionStorage.setItem(STORAGE_KEY, nonce);
  } catch {
    // sessionStorage unavailable — state validation will reject the callback
    // since no stored nonce will be found. Log only in development.
    if (process.env.NODE_ENV === 'development') {
      console.warn('[oauthState] Could not write state to sessionStorage');
    }
  }

  return nonce;
}

/**
 * Validates an OAuth callback `state` parameter against the stored nonce.
 *
 * Must be called exactly once per callback — the stored nonce is cleared
 * regardless of whether validation succeeds or fails (one-time use).
 *
 * @param {string|null} receivedState - The `state` value from the callback URL.
 * @returns {{ valid: boolean, reason: string }}
 *   `valid` is true only when the received state matches the stored nonce
 *   and neither value is empty. `reason` describes the failure when invalid.
 */
export function validateOAuthState(receivedState) {
  let storedState = null;

  try {
    storedState = sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return { valid: false, reason: 'sessionStorage unavailable — cannot validate state' };
  } finally {
    // Always clear after reading — nonce must not be reusable
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore removal failure — the nonce is already consumed
    }
  }

  if (!storedState) {
    return {
      valid: false,
      reason: 'No OAuth state found in session. The login flow may not have originated from this tab.',
    };
  }

  if (!receivedState) {
    return {
      valid: false,
      reason: 'OAuth callback is missing the required state parameter.',
    };
  }

  if (receivedState !== storedState) {
    return {
      valid: false,
      reason: 'OAuth state mismatch. This callback may be a CSRF attack attempt.',
    };
  }

  return { valid: true, reason: '' };
}

/**
 * Clears any stored OAuth state nonce without validating it.
 * Call this when the user cancels an OAuth flow or navigates away mid-flow
 * so that stale nonces do not accumulate.
 */
export function clearOAuthState() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Best-effort
  }
}

/**
 * Returns true if a state nonce is currently stored (i.e. an OAuth flow
 * has been initiated from this tab but not yet completed).
 *
 * @returns {boolean}
 */
export function hasStoredOAuthState() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}
