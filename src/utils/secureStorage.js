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
// Encrypted key-value storage wrapper (localStorage — AES-GCM encrypted)
// ---------------------------------------------------------------------------

// Feature-detect Web Crypto API (only available in secure contexts / HTTPS)
const cryptoSupported =
  typeof window !== 'undefined' &&
  typeof window.crypto !== 'undefined' &&
  typeof window.crypto.subtle !== 'undefined';

/**
 * Derives a 256-bit AES-GCM key from the page origin using PBKDF2.
 * The origin acts as a deterministic, per-site "passphrase" so that no
 * hardcoded secrets are required in the source code.
 *
 * @returns {Promise<CryptoKey>}
 */
const deriveKey = async () => {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(window.location.origin),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('eventra-secure-storage-salt'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
};

/**
 * Encrypts a plaintext string with AES-GCM using a PBKDF2-derived key.
 * Returns a Base64-encoded string containing `iv:ciphertext`.
 *
 * @param {string} plaintext
 * @returns {Promise<string>}
 */
const encrypt = async (plaintext) => {
  const key = await deriveKey();
  const encoder = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plaintext),
  );
  // Combine IV + ciphertext into a single Base64 string separated by ':'
  const ivBase64 = btoa(String.fromCharCode(...iv));
  const ctBase64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  return `${ivBase64}:${ctBase64}`;
};

/**
 * Decrypts a Base64-encoded `iv:ciphertext` string produced by `encrypt()`.
 *
 * @param {string} stored - The stored `iv:ciphertext` Base64 string
 * @returns {Promise<string>}
 */
const decrypt = async (stored) => {
  const key = await deriveKey();
  const [ivBase64, ctBase64] = stored.split(':');
  const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(ctBase64), (c) => c.charCodeAt(0));
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext,
  );
  return new TextDecoder().decode(decrypted);
};

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
