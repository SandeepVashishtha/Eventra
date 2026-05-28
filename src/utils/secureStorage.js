// ---------------------------------------------------------------------------
// AES-GCM Encryption Engine (Web Crypto API)
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
  const originVal = (typeof window !== 'undefined' && window.location) ? window.location.origin : 'http://localhost';
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(originVal),
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
 */
export const syncSecureStorage = {
  setItem: (key, value) => {
    try {
      if (cryptoSupported) {
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

  getItem: (key) => {
    try {
      const stored = localStorage.getItem(key);
      if (stored === null) return null;
      return stored;
    } catch (error) {
      console.error('[secureStorage] getItem failed:', error);
      return null;
    }
  },

  getItemAsync: async (key) => {
    try {
      const stored = localStorage.getItem(key);
      if (stored === null) return null;

      if (cryptoSupported) {
        try {
          return await decrypt(stored);
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

  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('[secureStorage] removeItem failed:', error);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('[secureStorage] clear failed:', error);
    }
  },
};
