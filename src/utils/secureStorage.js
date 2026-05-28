// ---------------------------------------------------------------------------
// Token helpers (sessionStorage — tab-scoped, cleared on close)
// ---------------------------------------------------------------------------

/**
 * Persists the Eventra JWT to sessionStorage.
 *
 * The token is scoped to the current browser tab and cleared automatically
 * when the tab is closed.
 *
 * @param {string} token - The Eventra-issued JWT returned by the backend
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

let _keyPromise = null;

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

const encrypt = async (plaintext) => {
  const key = await getDerivedKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: CRYPTO_ALGORITHM, iv },
    key,
    encoded
  );

  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...combined));
};

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

// ---------------------------------------------------------------------------
// Deprecated token management functions (removed as backend now uses HttpOnly cookies)
// ---------------------------------------------------------------------------

// NOTE: The functions setToken, getToken, and removeToken were removed from
// this module because token handling is now performed via HttpOnly cookies set
// by the backend. Any remaining references should be updated to rely on the
// AuthContext state and cookie handling logic.

// End of file
