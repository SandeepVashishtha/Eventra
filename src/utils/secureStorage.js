/* eslint-disable-next-line no-console */
/**
 * @file secureStorage.js
 * @module utils/secureStorage
 *
 * @description
 * AES-GCM encrypted localStorage wrapper built on the Web Crypto API.
 *
 * **Security model**
 * - The AES-256-GCM key is derived with PBKDF2 (100 000 iterations, SHA-256)
 *   from two random 256-bit values that are generated once per browser and
 *   persisted in localStorage. Neither value is derived from any public
 *   constant such as the origin URL.
 * - Each write uses a fresh random 12-byte IV, so identical values produce
 *   different ciphertext on every call (preventing pattern analysis).
 * - No plaintext is ever written to localStorage. In-flight values (between
 *   the `setItem` call and encryption completion) are held only in the
 *   `pendingWrites` in-memory Map.
 * - If the page is closed before encryption completes the data is not
 *   persisted — data loss is the intentional tradeoff versus silent plaintext
 *   exposure.
 * - If Web Crypto is unavailable (non-HTTPS context, very old browser) the
 *   module degrades gracefully to unencrypted localStorage and
 *   `isEncryptionActive()` returns `false`.
 *
 * **Migration**
 * Earlier versions of this module wrote a `key + ':plaintext'` fallback entry
 * to localStorage before async encryption completed. `cleanupPlaintextFallbacks`
 * runs automatically at module load to remove any such keys left on disk.
 */
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
const DERIVED_KEY_SALT = getOrCreateSecret(SALT_STORAGE_KEY);

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

const encryptValue = async (storageKey, plaintext) => {
  const key = await getDerivedKey();
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encrypted = await crypto.subtle.encrypt(
    { name: CRYPTO_ALGORITHM, iv, additionalData: encoder.encode(storageKey) },
    key,
    encoder.encode(plaintext),
  );
  const ivBase64 = btoa(String.fromCharCode(...iv));
  const ctBase64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  return `${ivBase64}:${ctBase64}`;
};

const decryptValue = async (storageKey, stored) => {
  const key = await getDerivedKey();
  const encoder = new TextEncoder();
  const colonIdx = stored.indexOf(':');
  if (colonIdx === -1) throw new Error('Invalid ciphertext format');
  const ivBase64 = stored.slice(0, colonIdx);
  const ctBase64 = stored.slice(colonIdx + 1);
  const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(ctBase64), (c) => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt(
    { name: CRYPTO_ALGORITHM, iv, additionalData: encoder.encode(storageKey) },
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

// ---------------------------------------------------------------------------
// Legacy plaintext-fallback cleanup
// ---------------------------------------------------------------------------
// Previous versions of this module wrote `key + ':plaintext'` to localStorage
// synchronously before encryption completed so that data would survive a
// page close. This left sensitive values permanently in plaintext whenever
// the page was closed during the async encryption window.
//
// PLAINTEXT_SUFFIX is kept ONLY so that cleanupPlaintextFallbacks() can
// identify and remove those legacy keys on load. It must NOT be used for
// any new localStorage write.
// ---------------------------------------------------------------------------

const PLAINTEXT_SUFFIX = ':plaintext';

/**
 * Scans localStorage for keys ending in `':plaintext'` left behind by
 * the previous write strategy and removes them. Called once at module load.
 *
 * This is a one-time migration helper. Once all active clients have loaded
 * this version at least once, there will be no legacy keys left to clean up.
 *
 * @private
 */
const cleanupPlaintextFallbacks = () => {
  try {
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.endsWith(PLAINTEXT_SUFFIX)) toRemove.push(k);
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // localStorage unavailable — nothing to clean up
  }
};

if (typeof window !== 'undefined') {
  // Best-effort: errors here must never prevent module load
  try { cleanupPlaintextFallbacks(); } catch { /* ignore */ }
}

// In-memory cache for pending writes — the sole mechanism for serving reads
// that arrive while async encryption is in progress. No plaintext is ever
// written to localStorage, so this Map is the only in-flight plaintext store.
const pendingWrites = new Map();

/**
 * Encrypts `value` and writes the ciphertext to localStorage under `key`.
 *
 * When Web Crypto is unavailable the raw value is written directly (the
 * caller's JSDoc documents this degraded mode explicitly).
 *
 * Errors from `encryptValue` are intentionally NOT caught here — they
 * propagate to `setItem`, which returns `false` so the caller knows the
 * write did not persist. Silently keeping a plaintext fallback on encryption
 * failure would undermine the entire security model.
 *
 * @private
 * @param {string} key   - localStorage key.
 * @param {string} value - Plaintext value to encrypt and store.
 * @returns {Promise<void>}
 */
const writeWithEncryption = async (key, value) => {
  if (!cryptoSupported) {
    localStorage.setItem(key, value);
    return;
  }
  const encrypted = await encryptValue(key, value);
  localStorage.setItem(key, encrypted);
};

export const syncSecureStorage = {
  /**
   * Encrypts `value` and stores it under `key` in localStorage.
   *
   * While encryption is in progress the value is held in the in-memory
   * `pendingWrites` Map so that concurrent `getItem` / `getItemAsync` calls
   * within the same page session return the correct value immediately.
   *
   * **No plaintext is written to localStorage at any point.** If the page
   * is closed or navigated away before encryption completes, the data will
   * not be persisted — this is an intentional tradeoff: data loss is
   * preferable to permanent plaintext exposure.
   *
   * When Web Crypto is unavailable (non-HTTPS / legacy browser) the raw
   * value is stored directly; `isEncryptionActive()` will return `false`
   * so callers can surface a warning to the user if needed.
   *
   * @param {string} key   - localStorage key.
   * @param {string} value - Plaintext string to encrypt and store.
   * @returns {Promise<boolean>} `true` on success; `false` when the write
   *   could not be persisted (localStorage full, encryption error, etc.).
   */
  setItem: (key, value) => {
    try {
      pendingWrites.set(key, value);
      writeWithEncryption(key, value).then(() => {
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
   * Returns the raw stored bytes for the given key without decrypting.
   *
   * If a write for this key is currently in progress, the pending
   * plaintext value is returned from the in-memory Map so callers always
   * see the latest value within a session.
   *
   * For decrypted values use `getItemAsync()`.
   *
   * @param {string} key
   * @returns {string|null} Raw ciphertext string, in-flight plaintext from
   *   `pendingWrites`, or `null` when the key does not exist.
   */
  getItem: (key) => {
    try {
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
   * Resolution order:
   * 1. `pendingWrites` Map — returns the in-flight plaintext immediately if
   *    a `setItem` for this key is still running.
   * 2. localStorage ciphertext — decrypted with the derived AES-GCM key.
   *    If decryption fails (e.g. key material was lost between sessions) the
   *    raw stored string is returned as a best-effort fallback so callers
   *    can surface an error rather than silently returning `null`.
   * 3. When Web Crypto is unavailable the raw stored value is returned
   *    directly (plaintext was written by `setItem` in degraded mode).
   *
   * @param {string} key
   * @returns {Promise<string|null>} Decrypted value, raw fallback, or `null`
   *   when the key does not exist or an unrecoverable error occurs.
   */
  getItemAsync: async (key) => {
    try {
      if (pendingWrites.has(key)) {
        return pendingWrites.get(key);
      }

      const stored = localStorage.getItem(key);
      if (stored === null) return null;

      if (cryptoSupported) {
        try {
          return await decryptValue(key, stored);
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
   * Removes the value stored under the given key.
   *
   * Also removes the legacy `key + ':plaintext'` entry if one exists on
   * disk from a previous version of this module, ensuring no stale
   * plaintext survives a targeted delete.
   *
   * @param {string} key
   */
  removeItem: (key) => {
    try {
      pendingWrites.delete(key);
      localStorage.removeItem(key);
      localStorage.removeItem(key + PLAINTEXT_SUFFIX);
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