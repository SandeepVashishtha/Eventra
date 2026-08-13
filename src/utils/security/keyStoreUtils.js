/**
 * Client-Side KeyStore Utility for E2EE Key Persistence
 */

const KEY_PAIR_STORAGE_KEY = "eventra_e2ee_keypair";

export function storeKeyPairLocally(keyPair) {
  try {
    localStorage.setItem(KEY_PAIR_STORAGE_KEY, JSON.stringify(keyPair));
  } catch (err) {
    console.warn("[KeyStore] Failed to store keypair:", err);
  }
}

export function getStoredKeyPairLocally() {
  try {
    const raw = localStorage.getItem(KEY_PAIR_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

export function clearStoredKeyPairLocally() {
  try {
    localStorage.removeItem(KEY_PAIR_STORAGE_KEY);
  } catch {}
}
