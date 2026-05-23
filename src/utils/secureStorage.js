/**
 * Secure storage utility with encryption for sensitive data.
 * Uses Web Crypto API for AES-GCM encryption to protect tokens and user data.
 */

const STORAGE_KEY_PREFIX = 'encrypted_';
const ENCRYPTION_KEY_KEY = 'enc_key';

// Generate or retrieve encryption key
const getEncryptionKey = async () => {
  try {
    // Try to get existing key from localStorage
    const storedKey = localStorage.getItem(ENCRYPTION_KEY_KEY);
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
    localStorage.setItem(ENCRYPTION_KEY_KEY, JSON.stringify(exportedKey));

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

// Secure storage interface
export const secureStorage = {
  setItem: async (key, value) => {
    const encrypted = await encrypt(value);
    if (encrypted) {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, encrypted);
      return true;
    }
    return false;
  },

  getItem: async (key) => {
    const encrypted = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!encrypted) return null;
    return await decrypt(encrypted);
  },

  removeItem: (key) => {
    localStorage.removeItem(STORAGE_KEY_PREFIX + key);
  },

  clear: () => {
    // Only remove encrypted keys
    Object.keys(localStorage)
      .filter(key => key.startsWith(STORAGE_KEY_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  }
};

// Synchronous wrapper for non-async contexts
// Falls back to base64 encoding if crypto is not available
export const syncSecureStorage = {
  setItem: (key, value) => {
    try {
      // Simple obfuscation using base64 + custom salt
      const salt = 'eventra_secure_salt_2024';
      const encoded = btoa(salt + value);
      localStorage.setItem(STORAGE_KEY_PREFIX + key, encoded);
      return true;
    } catch (error) {
      console.error('Sync encryption failed:', error);
      return false;
    }
  },

  getItem: (key) => {
    try {
      const encoded = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      if (!encoded) return null;
      const salt = 'eventra_secure_salt_2024';
      const decoded = atob(encoded);
      if (decoded.startsWith(salt)) {
        return decoded.slice(salt.length);
      }
      return null;
    } catch (error) {
      console.error('Sync decryption failed:', error);
      return null;
    }
  },

  removeItem: (key) => {
    localStorage.removeItem(STORAGE_KEY_PREFIX + key);
  },

  clear: () => {
    Object.keys(localStorage)
      .filter(key => key.startsWith(STORAGE_KEY_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  }
};
