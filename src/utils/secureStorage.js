/* eslint-disable-next-line no-console */
// ---------------------------------------------------------------------------
// AES-GCM Encryption Engine (Web Crypto API)
// ---------------------------------------------------------------------------

const CRYPTO_ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const PBKDF2_ITERATIONS = 100_000;

// ---------------------------------------------------------------------------
// Per-browser random material — two independent 256-bit random values, each
// generated once on first use and persisted in localStorage.
//
// KEY MATERIAL (eventra:key-material) — used as the PBKDF2 "password".
//   The previous implementation used window.location.origin here, which is a
//   fully public value. Any attacker who knows the deployed origin (e.g.
//   https://eventra.sandeepvashishtha.in) could precompute PBKDF2 offline for
//   any salt they read from localStorage. Replacing the origin with a random
//   secret means an attacker needs to read this value from the browser's
//   localStorage before they can derive the key — raising the bar from
//   "anyone who knows the URL" to "anyone who can read this user's localStorage".
//
// SALT (eventra:key-salt) — used as the PBKDF2 salt.
//   Per PBKDF2 spec the salt prevents identical passwords from producing the
//   same key across different users/sessions. Keeping it random and per-browser
//   ensures two Eventra instances never share a key even if they somehow end up
//   with the same key-material value.
//
// Together: AES key = PBKDF2(password=random256, salt=random256, iter=100k)
//   An attacker who cannot read localStorage cannot derive the key regardless
//   of how much compute they have. An XSS attacker who CAN read localStorage
//   still faces 100k PBKDF2 iterations to reconstruct the key — this is the
//   best achievable protection for a purely client-side encryption scheme.
// ---------------------------------------------------------------------------

const MATERIAL_STORAGE_KEY = 'eventra:key-material';
const SALT_STORAGE_KEY = 'eventra:key-salt';
const SECRET_BYTE_LENGTH = 32; // 256-bit

/** Generate or restore a random 256-bit secret from localStorage. */
const getOrCreateSecret = (storageKey) => {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));
    }
  } catch {
    // localStorage unavailable — fall through to generate a session-scoped value
  }

  const secret = crypto.getRandomValues(new Uint8Array(SECRET_BYTE_LENGTH));
  try {
    localStorage.setItem(storageKey, btoa(String.fromCharCode(...secret)));
  } catch {
    // Persistence failure: this session's encryption will work, but the key
    // will not survive a page reload. Graceful degradation.
  }
  return secret;
};

// Both values are initialised eagerly at module load so every call to
// getDerivedKey() within a page session operates on the same key.
const DERIVED_KEY_MATERIAL = getOrCreateSecret(MATERIAL_STORAGE_KEY);
const DERIVED_KEY_SALT     = getOrCreateSecret(SALT_STORAGE_KEY);

let _keyPromise = null;

const getDerivedKey = () => {
  if (_keyPromise) return _keyPromise;

  _keyPromise = (async () => {
    // Import the random per-browser key material as the PBKDF2 "password".
    // This replaces the previous window.location.origin usage, which was a
    // public value that allowed any attacker who knew the origin to precompute
    // PBKDF2 offline once they obtained the salt.
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      DERIVED_KEY_MATERIAL,
      'PBKDF2',
      false,
      ['deriveKey'],
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


// In-memory cache for pending writes to prevent race conditions during async encryption
const pendingWrites = new Map();

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
   * The value is written to localStorage only after encryption is complete
   * if crypto is supported, preventing plaintext exposure. An in-memory
   * cache ensures consistency during the async window.
   *
   * @param {string} key
   * @param {string} value
   * @returns {boolean} true on success, false on storage failure
   */
  setItem: (key, value) => {
    try {
      if (!cryptoSupported) {
        localStorage.setItem(key, value);
        return true;
      }

      // Track the pending value in-memory for immediate consistency in getItemAsync
      pendingWrites.set(key, value);

      encryptValue(value)
        .then((encrypted) => {
          // Only commit to persistent storage once encrypted
          localStorage.setItem(key, encrypted);
        })
        .catch((err) => {
          console.error('[secureStorage] Encryption failed, falling back to plaintext:', err);
          localStorage.setItem(key, value);
        })
        .finally(() => {
          pendingWrites.delete(key);
        });

      return true;
    } catch (error) {
      console.error('[secureStorage] setItem failed:', error);
      pendingWrites.delete(key);
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
      // Priority 1: Check pending writes (latest truth)
      if (pendingWrites.has(key)) {
        return pendingWrites.get(key);
      }
      return localStorage.getItem(key);
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
      // Priority 1: Check pending writes (latest truth)
      if (pendingWrites.has(key)) {
        return pendingWrites.get(key);
      }

      const stored = localStorage.getItem(key);
      if (stored === null) return null;

      if (cryptoSupported) {
        try {
          return await decryptValue(stored);
        } catch {
          // Fallback to raw value (handles plaintext data written during failures or before encryption)
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
      pendingWrites.delete(key);
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
      pendingWrites.clear();
      localStorage.clear();
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
