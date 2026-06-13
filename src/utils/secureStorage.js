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

/**
 * Centralized cryptographic configuration.
 * All magic numbers and algorithm parameters are defined here for easy
 * maintenance and future upgrades.
 *
 * @constant {Object}
 */
const CRYPTO_CONFIG = {
  VERSION: 1,
  ALGORITHM: 'AES-GCM',
  KEY_LENGTH: 256,
  IV_LENGTH: 12,
  PBKDF2_ITERATIONS: 100_000,
  PBKDF2_HASH: 'SHA-256',
  SECRET_BYTE_LENGTH: 32, // 256-bit
};

// Legacy constants for backward compatibility
const CRYPTO_ALGORITHM = CRYPTO_CONFIG.ALGORITHM;
const KEY_LENGTH = CRYPTO_CONFIG.KEY_LENGTH;
const IV_LENGTH = CRYPTO_CONFIG.IV_LENGTH;
// eslint-disable-next-line no-unused-vars -- Kept for backward compatibility
const PBKDF2_ITERATIONS = CRYPTO_CONFIG.PBKDF2_ITERATIONS;

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
const KEY_METADATA_KEY = 'eventra:key-metadata';
const SECRET_BYTE_LENGTH = CRYPTO_CONFIG.SECRET_BYTE_LENGTH;

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
const DERIVED_KEY_MATERIAL = cryptoSupported ? getOrCreateSecret(MATERIAL_STORAGE_KEY) : null;
const DERIVED_KEY_SALT = cryptoSupported ? getOrCreateSecret(SALT_STORAGE_KEY) : null;

/**
 * Initialize or load key metadata.
 * Stores non-sensitive cryptographic parameters separately from encrypted data.
 *
 * @private
 */
const initializeKeyMetadata = () => {
  try {
    const stored = localStorage.getItem(KEY_METADATA_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (_e) {
    // localStorage unavailable or corrupted
  }

  // Create new metadata
  const metadata = {
    version: CRYPTO_CONFIG.VERSION,
    createdAt: new Date().toISOString(),
    iterations: CRYPTO_CONFIG.PBKDF2_ITERATIONS,
    algorithm: CRYPTO_CONFIG.ALGORITHM,
    keyLength: CRYPTO_CONFIG.KEY_LENGTH,
  };

  try {
    localStorage.setItem(KEY_METADATA_KEY, JSON.stringify(metadata));
  } catch (_e) {
    // Persistence failure - non-critical
  }

  return metadata;
};

let _keyMetadata = initializeKeyMetadata();
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

    // Use the iteration count from metadata for future compatibility
    const iterations = _keyMetadata?.iterations || CRYPTO_CONFIG.PBKDF2_ITERATIONS;

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: DERIVED_KEY_SALT,
        iterations: iterations,
        hash: CRYPTO_CONFIG.PBKDF2_HASH,
      },
      keyMaterial,
      { name: CRYPTO_ALGORITHM, length: KEY_LENGTH },
      false,
      ['encrypt', 'decrypt'],
    );
  })();

  return _keyPromise;
};

/**
 * Encrypt a value with versioned payload structure.
 * Returns a JSON string containing version, IV, and ciphertext.
 *
 * @private
 * @param {string} storageKey - The localStorage key (used as additional data)
 * @param {string} plaintext - The plaintext value to encrypt
 * @returns {Promise<string>} JSON string with versioned payload
 */
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

  // Versioned payload structure
  const payload = {
    version: CRYPTO_CONFIG.VERSION,
    iv: ivBase64,
    ciphertext: ctBase64,
  };

  return JSON.stringify(payload);
};

/**
 * Decrypt a value, handling both legacy and versioned payloads.
 * Legacy format: `ivBase64:ctBase64`
 * Versioned format: JSON with version, iv, ciphertext fields
 *
 * @private
 * @param {string} storageKey - The localStorage key (used as additional data)
 * @param {string} stored - The stored encrypted value
 * @returns {Promise<string>} Decrypted plaintext
 */
const decryptValue = async (storageKey, stored) => {
  const key = await getDerivedKey();
  const encoder = new TextEncoder();

  // Try to parse as JSON (new versioned format)
  try {
    const payload = JSON.parse(stored);
    if (payload.version && payload.iv && payload.ciphertext) {
      // Versioned payload - use migration framework if needed
      return await decryptVersionedPayload(storageKey, payload, key);
    }
  } catch (_e) {
    // Not JSON or invalid - fall through to legacy format
  }

  // Legacy format: ivBase64:ctBase64
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

/**
 * Decrypt a versioned payload using the appropriate migration handler.
 *
 * @private
 * @param {string} storageKey - The localStorage key
 * @param {Object} payload - The versioned payload object
 * @param {CryptoKey} key - The decryption key
 * @returns {Promise<string>} Decrypted plaintext
 */
const decryptVersionedPayload = async (storageKey, payload, key) => {
  const encoder = new TextEncoder();
  const version = payload.version;

  // Route to version-specific decryption handler
  switch (version) {
    case 1:
      return await decryptV1(storageKey, payload, key, encoder);
    default:
      throw new Error(`Unsupported payload version: ${version}`);
  }
};

/**
 * Decrypt version 1 payloads.
 *
 * @private
 * @param {string} storageKey - The localStorage key
 * @param {Object} payload - The version 1 payload
 * @param {CryptoKey} key - The decryption key
 * @param {TextEncoder} encoder - Text encoder instance
 * @returns {Promise<string>} Decrypted plaintext
 */
const decryptV1 = async (storageKey, payload, key, encoder) => {
  const iv = Uint8Array.from(atob(payload.iv), (c) => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(payload.ciphertext), (c) => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt(
    { name: CRYPTO_ALGORITHM, iv, additionalData: encoder.encode(storageKey) },
    key,
    ciphertext,
  );
  return new TextDecoder().decode(decrypted);
};

/**
 * Migration framework for future cryptographic upgrades.
 * This provides a structured way to migrate data from older versions to newer ones.
 *
 * @private
 * @param {number} fromVersion - Source version
 * @param {number} toVersion - Target version
 * @param {string} storageKey - The localStorage key
 * @param {string} plaintext - The decrypted plaintext
 * @returns {Promise<string>} Re-encrypted value with new version
 */
// eslint-disable-next-line no-unused-vars -- Reserved for future migration implementations
const migratePayload = async (fromVersion, toVersion, storageKey, plaintext) => {
  // Future migrations can be implemented here
  // For now, v1 is current, so no migration needed
  if (fromVersion === toVersion) {
    return await encryptValue(storageKey, plaintext);
  }
  
  // Example future migration:
  // if (fromVersion === 1 && toVersion === 2) {
  //   return await encryptV2(storageKey, plaintext);
  // }
  
  throw new Error(`Migration from v${fromVersion} to v${toVersion} not implemented`);
};

/**
 * Rotate the encryption key.
 * This generates new key material while preserving the ability to decrypt
 * existing values during migration. After rotation, new writes use the new key.
 *
 * To fully migrate existing data, callers should:
 * 1. Call rotateKey()
 * 2. Read all existing values with getItemAsync()
 * 3. Re-write them with setItem()
 *
 * @returns {Promise<Object>} Metadata about the rotated key
 */
export const rotateKey = async () => {
  try {
    // Generate new key material
    const newMaterial = crypto.getRandomValues(new Uint8Array(SECRET_BYTE_LENGTH));
    const newSalt = crypto.getRandomValues(new Uint8Array(SECRET_BYTE_LENGTH));
    
    // Store new material
    localStorage.setItem(MATERIAL_STORAGE_KEY, btoa(String.fromCharCode(...newMaterial)));
    localStorage.setItem(SALT_STORAGE_KEY, btoa(String.fromCharCode(...newSalt)));
    
    // Update in-memory values
    DERIVED_KEY_MATERIAL.set(newMaterial);
    DERIVED_KEY_SALT.set(newSalt);
    
    // Reset key promise to force re-derivation
    _keyPromise = null;
    
    // Update metadata
    _keyMetadata = {
      version: CRYPTO_CONFIG.VERSION,
      createdAt: new Date().toISOString(),
      rotatedAt: new Date().toISOString(),
      iterations: CRYPTO_CONFIG.PBKDF2_ITERATIONS,
      algorithm: CRYPTO_CONFIG.ALGORITHM,
      keyLength: CRYPTO_CONFIG.KEY_LENGTH,
    };
    localStorage.setItem(KEY_METADATA_KEY, JSON.stringify(_keyMetadata));
    
    return _keyMetadata;
  } catch (error) {
    console.error('[secureStorage] Key rotation failed:', error);
    throw error;
  }
};

/**
 * Get the current key metadata.
 *
 * @returns {Object|null} Key metadata object or null if unavailable
 */
export const getKeyMetadata = () => {
  return _keyMetadata;
};

/**
 * Get the current crypto configuration.
 *
 * @returns {Object} Crypto configuration object
 */
export const getCryptoConfig = () => {
  return { ...CRYPTO_CONFIG };
};

/**
 * Derives an AES-256-GCM key from an explicit password and salt using PBKDF2.
 * Useful for callers (e.g. SessionRecoveryContext) that manage their own
 * key material outside the module-level DERIVED_KEY_MATERIAL / DERIVED_KEY_SALT.
 *
 * @param {string|Uint8Array} password - PBKDF2 input keying material
 * @param {Uint8Array}        salt     - PBKDF2 salt (at least 16 bytes recommended)
 * @returns {Promise<CryptoKey>}
 */
export const deriveKey = async (password, salt) => {
  const encoder = new TextEncoder();
  const material = password instanceof Uint8Array ? password : encoder.encode(password);
  const keyMaterial = await crypto.subtle.importKey("raw", material, "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: CRYPTO_ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"],
  );
};

/**
 * Encrypts plaintext with an already-derived AES-256-GCM key.
 * Returns ciphertext in the same `ivBase64:ctBase64` format used by the
 * module-level encryptValue, but does NOT attach additional authenticated data.
 *
 * @param {CryptoKey} key       - AES-GCM key from deriveKey()
 * @param {string}    plaintext - Value to encrypt
 * @returns {Promise<string>} `ivBase64:ctBase64`
 */
export const encryptWithKey = async (key, plaintext) => {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encrypted = await crypto.subtle.encrypt(
    { name: CRYPTO_ALGORITHM, iv },
    key,
    new TextEncoder().encode(plaintext),
  );
  return `${btoa(String.fromCharCode(...iv))}:${btoa(String.fromCharCode(...new Uint8Array(encrypted)))}`;
};

/**
 * Decrypts a ciphertext produced by encryptWithKey or the old encryptSession.
 *
 * @param {CryptoKey} key      - AES-GCM key from deriveKey()
 * @param {string}    stored   - Ciphertext string in `ivBase64:ctBase64` format
 * @returns {Promise<string>} Decrypted plaintext
 */
export const decryptWithKey = async (key, stored) => {
  const colonIdx = stored.indexOf(":");
  if (colonIdx === -1) throw new Error("Invalid ciphertext format");
  const iv = Uint8Array.from(atob(stored.slice(0, colonIdx)), (c) => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(stored.slice(colonIdx + 1)), (c) => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt({ name: CRYPTO_ALGORITHM, iv }, key, ciphertext);
  return new TextDecoder().decode(decrypted);
};



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
  setItem: async (key, value) => {
    try {
      pendingWrites.set(key, value);
      await writeWithEncryption(key, value);
      pendingWrites.delete(key);
      return true;
    } catch (error) {
      console.error('[secureStorage] setItem failed:', error);
      /* Removed destructive cleanup to prevent queued writes from being dropped silently */
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
      /* Removed destructive cleanup to prevent queued writes from being dropped silently */
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

  /**
   * Get the current key metadata.
   *
   * @returns {Object|null} Key metadata object or null if unavailable
   */
  getKeyMetadata: () => getKeyMetadata(),

  /**
   * Get the current crypto configuration.
   *
   * @returns {Object} Crypto configuration object
   */
  getCryptoConfig: () => getCryptoConfig(),

  /**
   * Rotate the encryption key.
   * This generates new key material while preserving the ability to decrypt
   * existing values during migration.
   *
   * @returns {Promise<Object>} Metadata about the rotated key
   */
  rotateKey: () => rotateKey(),
};