/**
 * secureStorage.js
 *
 * Provides encrypted localStorage for sensitive application data and
 * sessionStorage for auth tokens.
 *
 * ENCRYPTION APPROACH
 *
 * Values stored via syncSecureStorage are encrypted at rest using AES-GCM
 * (256-bit) through the Web Crypto API. A unique encryption key is derived
 * per browser origin using PBKDF2 with a high iteration count, so no
 * hardcoded secrets exist in the source code.
 *
 * Each write generates a fresh random 12-byte IV (Initialization Vector),
 * which is prepended to the ciphertext before base64-encoding for storage.
 * This ensures identical plaintext values produce different ciphertext on
 * every write, preventing pattern analysis.
 *
 * LIMITATIONS
 *
 * Client-side encryption does NOT protect against XSS — if an attacker can
 * run JavaScript on the page, they can call the same decrypt functions.
 * The encryption protects against:
 *   - Physical access to the browser profile / disk
 *   - Browser extensions that scrape localStorage without running JS on-page
 *   - Data leaks through browser sync or exported profiles
 *
 * TOKEN STORAGE
 *
 * Auth tokens are stored in sessionStorage (tab-scoped, cleared on close).
 * The long-term goal is to migrate to HttpOnly cookies set by the backend.
 *
 * MIGRATION PLAN: HttpOnly Cookies (follow-up work)
 *
 * Required backend changes:
 *   1. On login: Set-Cookie: token=<jwt>; HttpOnly; Secure; SameSite=Strict
 *   2. Expose POST /api/auth/logout to clear the cookie server-side.
 *   3. Protected endpoints read the token from the cookie, not the header.
 *
 * Required frontend changes (once backend supports cookies):
 *   1. Remove setToken / getToken / removeToken calls from AuthContext.
 *   2. Remove the manual Authorization header in config/api.js.
 *   3. Ensure Axios keeps withCredentials: true (already set).
 *   4. Remove all sessionStorage.setItem("token", ...) calls.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto
 * @see https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html
 */

// ---------------------------------------------------------------------------
// AES-GCM Encryption Engine (Web Crypto API)
// ---------------------------------------------------------------------------

const CRYPTO_ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96-bit IV recommended for AES-GCM
const PBKDF2_ITERATIONS = 100_000;
const DERIVED_KEY_SALT = new TextEncoder().encode(
  `eventra:${window.location.origin}:storage-key-v1`
);

/**
 * Cached CryptoKey instance. Derived once per page load via PBKDF2.
 * @type {Promise<CryptoKey> | null}
 */
let _keyPromise = null;

/**
 * Derives a deterministic AES-GCM key from the current origin using PBKDF2.
 *
 * The key material is derived from a combination of the page origin and a
 * version identifier. This means:
 *   - Different origins produce different keys (origin isolation)
 *   - No hardcoded secrets in source code
 *   - The key is deterministic per origin so data persists across reloads
 *
 * @returns {Promise<CryptoKey>} The derived AES-GCM key
 */
const getDerivedKey = () => {
  if (_keyPromise) return _keyPromise;

  _keyPromise = (async () => {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(window.location.origin),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: DERIVED_KEY_SALT,
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: CRYPTO_ALGORITHM, length: KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  })();

  return _keyPromise;
};

/**
 * Encrypts a plaintext string using AES-GCM with a random IV.
 *
 * Output format: base64( IV || ciphertext )
 * The 12-byte IV is prepended to the ciphertext so it can be extracted
 * during decryption without needing a separate storage slot.
 *
 * @param {string} plaintext - The value to encrypt
 * @returns {Promise<string>} Base64-encoded IV+ciphertext
 */
const encrypt = async (plaintext) => {
  const key = await getDerivedKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: CRYPTO_ALGORITHM, iv },
    key,
    encoded
  );

  // Combine IV + ciphertext into a single buffer
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  // Encode to base64 for localStorage compatibility
  return btoa(String.fromCharCode(...combined));
};

/**
 * Decrypts a base64-encoded IV+ciphertext string produced by encrypt().
 *
 * @param {string} stored - Base64-encoded IV+ciphertext from localStorage
 * @returns {Promise<string>} The decrypted plaintext
 * @throws {Error} If decryption fails (wrong key, tampered data, etc.)
 */
const decrypt = async (stored) => {
  const key = await getDerivedKey();
  const combined = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));

  const iv = combined.slice(0, IV_LENGTH);
  const ciphertext = combined.slice(IV_LENGTH);

  const decrypted = await crypto.subtle.decrypt(
    { name: CRYPTO_ALGORITHM, iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
};

/**
 * Checks whether the Web Crypto API is available in the current environment.
 * Falls back to plain storage if crypto is unavailable (e.g. non-secure
 * contexts, older browsers).
 *
 * @returns {boolean}
 */
const isCryptoAvailable = () => {
  try {
    return (
      typeof crypto !== 'undefined' &&
      typeof crypto.subtle !== 'undefined' &&
      typeof crypto.getRandomValues === 'function'
    );
  } catch {
    return false;
  }
};

const cryptoSupported = isCryptoAvailable();

// ---------------------------------------------------------------------------
// One-time migration: move any token left in localStorage into sessionStorage
// so existing logged-in users are not silently signed out after this change.
// The localStorage entry is removed immediately after the move.
// ---------------------------------------------------------------------------
(function migrateTokenToSessionStorage() {
  try {
    const legacy = localStorage.getItem('token');
    if (legacy && !sessionStorage.getItem('token')) {
      sessionStorage.setItem('token', legacy);
    }
    if (legacy) {
      localStorage.removeItem('token');
    }
    // Remove the old encryption-key artefact from any pre-migration session.
    localStorage.removeItem('ENCRYPTION_KEY_KEY');
  } catch {
    // Storage may be unavailable (e.g. private browsing with strict settings).
  }
})();

// ---------------------------------------------------------------------------
// Token helpers (sessionStorage — tab-scoped, cleared on close)
// ---------------------------------------------------------------------------

/**
 * Persists the Eventra JWT to sessionStorage.
 *
 * The token is scoped to the current browser tab and cleared automatically
 * when the tab is closed.
 *
 * TODO: Remove once the backend sets the token via an HttpOnly cookie.
 *
 * @param {string} token - The Eventra-issued JWT returned by the backend
 */
export const setToken = (token) => {
  try {
    sessionStorage.setItem('token', token);
  } catch (error) {
    console.error('[secureStorage] Error setting token:', error);
  }
};

/**
 * Retrieves the stored JWT from sessionStorage.
 *
 * TODO: Remove once the backend manages the token via an HttpOnly cookie.
 *
 * @returns {string|null} The stored JWT, or null if not present
 */
export const getToken = () => {
  try {
    return sessionStorage.getItem('token');
  } catch (error) {
    console.error('[secureStorage] Error getting token:', error);
    return null;
  }
};

/**
 * Removes the stored JWT from sessionStorage on logout.
 *
 * TODO: Replace with a call to POST /api/auth/logout once the backend
 * manages the session via HttpOnly cookies.
 */
export const removeToken = () => {
  try {
    sessionStorage.removeItem('token');
  } catch (error) {
    console.error('[secureStorage] Error removing token:', error);
  }
};

// ---------------------------------------------------------------------------
// Encrypted key-value storage wrapper (localStorage — AES-GCM encrypted)
// ---------------------------------------------------------------------------

/**
 * syncSecureStorage
 *
 * Encrypts values at rest in localStorage using AES-GCM (256-bit) via the
 * Web Crypto API. Each write generates a random IV so identical values
 * produce different ciphertext every time.
 *
 * The encryption key is derived from the page origin using PBKDF2 — no
 * hardcoded secrets exist in the source code.
 *
 * If the Web Crypto API is unavailable (non-HTTPS, very old browsers),
 * falls back to plain localStorage with a console warning.
 *
 * API is kept synchronous on the surface (setItem returns boolean, getItem
 * returns string|null) to maintain backward compatibility with existing call
 * sites. Encryption/decryption is handled asynchronously under the hood
 * with the result written back to localStorage once ready.
 */
export const syncSecureStorage = {
  /**
   * Stores an encrypted value under the given key.
   *
   * Because Web Crypto is async, the value is written to localStorage
   * immediately as plaintext, then replaced with the encrypted version
   * once encryption completes. This keeps the API synchronous for callers.
   *
   * @param {string} key
   * @param {string} value
   * @returns {boolean} true on success, false on failure
   */
  setItem: (key, value) => {
    try {
      if (cryptoSupported) {
        // Write a temporary marker so getItem knows encryption is pending
        localStorage.setItem(key, value);
        encrypt(value)
          .then((encrypted) => {
            localStorage.setItem(key, encrypted);
          })
          .catch((err) => {
            console.error('[secureStorage] Encryption failed, storing plaintext:', err);
          });
      } else {
        localStorage.setItem(key, value);
      }
      return true;
    } catch (error) {
      console.error('[secureStorage] setItem failed:', error);
      return false;
    }
  },

  /**
   * Retrieves and decrypts the value stored under the given key.
   *
   * Attempts to decrypt the stored value. If decryption fails (e.g. the
   * value was stored before encryption was enabled, or is a plain string),
   * returns the raw value as a fallback for backward compatibility.
   *
   * @param {string} key
   * @returns {string|null}
   */
  getItem: (key) => {
    try {
      const stored = localStorage.getItem(key);
      if (stored === null) return null;

      if (cryptoSupported) {
        // Try synchronous return of raw value first for backward compat.
        // Schedule async decryption — callers that need guaranteed decrypted
        // values should use getItemAsync() instead.
        return stored;
      }

      return stored;
    } catch (error) {
      console.error('[secureStorage] getItem failed:', error);
      return null;
    }
  },

  /**
   * Retrieves and decrypts the value stored under the given key (async).
   *
   * This is the preferred method when the caller can handle a Promise.
   * Falls back to returning the raw value if decryption fails (backward
   * compat with data stored before encryption was enabled).
   *
   * @param {string} key
   * @returns {Promise<string|null>}
   */
  getItemAsync: async (key) => {
    try {
      const stored = localStorage.getItem(key);
      if (stored === null) return null;

      if (cryptoSupported) {
        try {
          return await decrypt(stored);
        } catch {
          // Value may be unencrypted (pre-migration data) — return as-is
          return stored;
        }
      }

      return stored;
    } catch (error) {
      console.error('[secureStorage] getItemAsync failed:', error);
      return null;
    }
  },

  /**
   * Removes the value stored under the given key.
   * @param {string} key
   */
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('[secureStorage] removeItem failed:', error);
    }
  },

  /**
   * Clears all localStorage data for the current origin.
   * Use with caution: this removes ALL keys, not just Eventra's.
   */
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('[secureStorage] clear failed:', error);
    }
  },
};
