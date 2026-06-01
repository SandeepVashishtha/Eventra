import { safeGetItem, safeSetItem, safeRemoveItem, safeClear } from "./safeStorage.js";
// ---------------------------------------------------------------------------
// AES-GCM Encryption Engine (Web Crypto API)
// ---------------------------------------------------------------------------

const CRYPTO_ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const PBKDF2_ITERATIONS = 100_000;

// ---------------------------------------------------------------------------
// Per-browser random salt — generated once on first use, persisted in
// localStorage under a dedicated key so it survives page reloads.
//
// WHY: A static, deterministic salt (e.g. derived from window.location.origin)
// allows any attacker who knows the origin to precompute the PBKDF2 output
// and therefore the AES-GCM key. Using a randomly-generated, per-browser salt
// means the derived key is unique to each user's browser instance and cannot
// be precomputed without access to the stored salt.
// ---------------------------------------------------------------------------
const SALT_STORAGE_KEY = 'eventra:key-salt';
const SALT_BYTE_LENGTH = 32; // 256-bit random salt

const getOrCreateSalt = () => {
  try {
    const stored = safeGetItem(SALT_STORAGE_KEY);
    if (stored) {
      // Restore the previously persisted salt
      return Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));
    }
  } catch {
    // localStorage may be unavailable — fall through to generate
  }

  // First run: generate a cryptographically random salt and persist it
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTE_LENGTH));
  try {
    safeSetItem(SALT_STORAGE_KEY, btoa(String.fromCharCode(...salt)));
  } catch {
    // If persistence fails, the salt will be regenerated on the next load.
    // This is a graceful degradation — encryption still works this session.
  }
  return salt;
};

// Initialise the salt eagerly so all calls to getDerivedKey() use the same value
const DERIVED_KEY_SALT = getOrCreateSalt();

let _keyPromise = null;

const getDerivedKey = () => {
  if (_keyPromise) return _keyPromise;

  _keyPromise = (async () => {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(window.location.origin),
      'PBKDF2',
      false,
      ['deriveKey'],
    );

    const salt = DERIVED_KEY_SALT;

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: CRYPTO_ALGORITHM, length: KEY_LENGTH },
      false,
      ['encrypt', 'decrypt'],
    );
  })();

  return _keyPromise;
};

const encryptValue = async (plaintext) => {
  const key = await getDerivedKey();
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encrypted = await crypto.subtle.encrypt(
    { name: CRYPTO_ALGORITHM, iv },
    key,
    encoder.encode(plaintext),
  );
  const ivBase64 = btoa(String.fromCharCode(...iv));
  const ctBase64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  return `${ivBase64}:${ctBase64}`;
};

const decryptValue = async (stored) => {
  const key = await getDerivedKey();
  const colonIdx = stored.indexOf(':');
  if (colonIdx === -1) throw new Error('Invalid ciphertext format');
  const ivBase64 = stored.slice(0, colonIdx);
  const ctBase64 = stored.slice(colonIdx + 1);
  const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(ctBase64), (c) => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt(
    { name: CRYPTO_ALGORITHM, iv },
    key,
    ciphertext,
  );
  return new TextDecoder().decode(decrypted);
};

const isCryptoAvailable = () => {
  try {
    return (
      typeof window !== 'undefined' &&
      typeof crypto !== 'undefined' &&
      typeof crypto.subtle !== 'undefined' &&
      typeof crypto.getRandomValues === 'function' &&
      window.isSecureContext !== false
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
 * produce different ciphertext every time, preventing pattern analysis.
 *
 * The encryption key is derived per-origin using PBKDF2 — no hardcoded
 * secrets exist in source code.
 *
 * Falls back to plain localStorage when Web Crypto is unavailable
 * (non-HTTPS contexts or very old browsers).
 */
export const syncSecureStorage = {
  /**
   * Stores a value encrypted under the given key.
   *
   * The value is written to localStorage immediately (plaintext) and then
   * replaced with AES-GCM ciphertext once the async encryption resolves.
   * Use getItemAsync() on the read path to guarantee the decrypted value.
   *
   * @param {string} key
   * @param {string} value
   * @returns {boolean} true on success, false on storage failure
   */
  setItem: (key, value) => {
    try {
      const stored = safeSetItem(key, value);
      if (!stored) return false;
      if (cryptoSupported) {
        encryptValue(value)
          .then((encrypted) => {
            safeSetItem(key, encrypted);
          })
          .catch((err) => {
            console.error('[secureStorage] Encryption failed, value stored as plaintext:', err);
          });
      }
      return true;
    } catch (error) {
      console.error('[secureStorage] setItem failed:', error);
      return false;
    }
  },

  /**
   * Returns the raw stored bytes for the key without decrypting.
   *
   * For actual values use getItemAsync().
   *
   * @param {string} key
   * @returns {string|null}
   */
  getItem: (key) => {
    try {
      return safeGetItem(key);
    } catch (error) {
      console.error('[secureStorage] getItem failed:', error);
      return null;
    }
  },

  /**
   * Retrieves and decrypts the value stored under the given key.
   *
   * Falls back to returning the raw value when decryption fails (handles
   * data written before encryption was enabled).
   *
   * @param {string} key
   * @returns {Promise<string|null>}
   */
  getItemAsync: async (key) => {
    try {
      const stored = safeGetItem(key);
      if (stored === null) return null;

      if (cryptoSupported) {
        try {
          return await decryptValue(stored);
        } catch {
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
   * Removes the encrypted blob stored under the given key.
   * @param {string} key
   */
  removeItem: (key) => {
    try {
      safeRemoveItem(key);
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
      safeClear();
      _keyPromise = null;
    } catch (error) {
      console.error('[secureStorage] clear failed:', error);
    }
  },

  /**
   * Returns whether AES-GCM encryption is active in the current context.
   *
   * @returns {boolean}
   */
  isEncryptionActive: () => cryptoSupported,
};
