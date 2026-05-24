/**
 * Secure storage utility with encryption for sensitive data.
 * Uses Web Crypto API for AES-GCM encryption to protect tokens and user data.
 *
 * Fail-safe design:
 *  - Probes localStorage availability on load (private browsing, disabled, quota).
 *  - Falls back to an in-memory Map so the app still works for the current page session.
 *  - Every write is verified with an immediate read-back.
 *  - Corrupted keys are removed automatically on read.
 */

const STORAGE_KEY_PREFIX = 'encrypted_';
const ENCRYPTION_KEY_KEY = 'enc_key';

// ── localStorage availability probe ─────────────────────────────────────────

let _storageAvailable = null;
const _memoryFallback = new Map();

/**
 * Returns true if localStorage is usable (write → read → delete cycle).
 * Result is cached after the first call.
 */
const isStorageAvailable = () => {
  if (_storageAvailable !== null) return _storageAvailable;
  try {
    const probe = '__eventra_storage_probe__';
    localStorage.setItem(probe, 'ok');
    const readBack = localStorage.getItem(probe);
    localStorage.removeItem(probe);
    _storageAvailable = readBack === 'ok';
  } catch {
    _storageAvailable = false;
  }
  if (!_storageAvailable) {
    console.warn(
      '[secureStorage] localStorage unavailable – using in-memory fallback. Data will not persist across reloads.'
    );
  }
  return _storageAvailable;
};

// ── Safe low-level wrappers ─────────────────────────────────────────────────

const safeGetItem = (key) => {
  if (!isStorageAvailable()) return _memoryFallback.get(key) ?? null;
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('[secureStorage] getItem failed:', error);
    return _memoryFallback.get(key) ?? null;
  }
};

const safeSetItem = (key, value) => {
  _memoryFallback.set(key, value);
  if (!isStorageAvailable()) return true;
  try {
    localStorage.setItem(key, value);
    // Round-trip verification — guards against silent quota-exceeded failures
    const readBack = localStorage.getItem(key);
    if (readBack !== value) {
      console.warn('[secureStorage] setItem round-trip mismatch for key:', key);
      return false;
    }
    return true;
  } catch (error) {
    console.error('[secureStorage] setItem failed:', error);
    return false;
  }
};

const safeRemoveItem = (key) => {
  _memoryFallback.delete(key);
  if (!isStorageAvailable()) return;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('[secureStorage] removeItem failed:', error);
  }
};

const safeKeys = () => {
  if (!isStorageAvailable()) return [..._memoryFallback.keys()];
  try {
    return Object.keys(localStorage);
  } catch (error) {
    console.error('[secureStorage] keys() failed:', error);
    return [..._memoryFallback.keys()];
  }
};

// ── Crypto helpers (AES-GCM, async) ─────────────────────────────────────────

// Generate or retrieve encryption key
const getEncryptionKey = async () => {
  try {
    // Try to get existing key from storage
    const storedKey = safeGetItem(ENCRYPTION_KEY_KEY);
    if (storedKey) {
      const keyData = JSON.parse(storedKey);
      return await crypto.subtle.importKey(
        'jwk',
        keyData,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
    }

    // Generate new key
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    // Export and store the key
    const exportedKey = await crypto.subtle.exportKey('jwk', key);
    safeSetItem(ENCRYPTION_KEY_KEY, JSON.stringify(exportedKey));

    return key;
  } catch (error) {
    console.error('Failed to get encryption key:', error);
    return null;
  }
};

// Encrypt data
const encrypt = async (data) => {
  try {
    const key = await getEncryptionKey();
    if (!key) return null;

    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Convert to base64 for storage
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption failed:', error);
    return null;
  }
};

// Decrypt data
const decrypt = async (encryptedData) => {
  try {
    const key = await getEncryptionKey();
    if (!key) return null;

    // Convert from base64
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

// ── Async secure storage interface ──────────────────────────────────────────

export const secureStorage = {
  setItem: async (key, value) => {
    const encrypted = await encrypt(value);
    if (encrypted) {
      return safeSetItem(STORAGE_KEY_PREFIX + key, encrypted);
    }
    return false;
  },

  getItem: async (key) => {
    const encrypted = safeGetItem(STORAGE_KEY_PREFIX + key);
    if (!encrypted) return null;
    const result = await decrypt(encrypted);
    if (result === null) {
      // Data is corrupted / undecryptable — clean it up
      safeRemoveItem(STORAGE_KEY_PREFIX + key);
    }
    return result;
  },

  removeItem: (key) => {
    safeRemoveItem(STORAGE_KEY_PREFIX + key);
  },

  clear: () => {
    safeKeys()
      .filter(key => key.startsWith(STORAGE_KEY_PREFIX))
      .forEach(key => safeRemoveItem(key));
  }
};

// ── Synchronous wrapper (base64 obfuscation fallback) ───────────────────────

// Falls back to base64 encoding if crypto is not available
export const syncSecureStorage = {
  setItem: (key, value) => {
    try {
      // Simple obfuscation using base64 + custom salt
      const salt = 'eventra_secure_salt_2024';
      const encoded = btoa(salt + value);
      return safeSetItem(STORAGE_KEY_PREFIX + key, encoded);
    } catch (error) {
      console.error('Sync encryption failed:', error);
      return false;
    }
  },

  getItem: (key) => {
    try {
      const encoded = safeGetItem(STORAGE_KEY_PREFIX + key);
      if (!encoded) return null;
      const salt = 'eventra_secure_salt_2024';
      const decoded = atob(encoded);
      if (decoded.startsWith(salt)) {
        return decoded.slice(salt.length);
      }
      // Stored value doesn't match expected format — corrupted or tampered
      console.warn('[syncSecureStorage] Corrupted data detected, removing key:', key);
      safeRemoveItem(STORAGE_KEY_PREFIX + key);
      return null;
    } catch (error) {
      // atob failed — value is not valid base64, remove the garbage
      console.error('Sync decryption failed:', error);
      safeRemoveItem(STORAGE_KEY_PREFIX + key);
      return null;
    }
  },

  removeItem: (key) => {
    safeRemoveItem(STORAGE_KEY_PREFIX + key);
  },

  clear: () => {
    safeKeys()
      .filter(key => key.startsWith(STORAGE_KEY_PREFIX))
      .forEach(key => safeRemoveItem(key));
  }
};
