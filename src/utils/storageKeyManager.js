import CryptoJS from "crypto-js";

/**
 * Retrieves or initializes a browser-persistent salt scoped to a namespace.
 *
 * The salt is intentionally NOT a single global value shared by every
 * namespace. A global salt persisted in localStorage acted as a universal
 * oracle: anyone who could read localStorage could recompute
 * `SHA256(namespace:userId:salt)` for a guessed userId and reverse every
 * opaque key at once. Scoping the salt per namespace removes that global
 * linkability / reversibility while still keeping keys stable within a
 * namespace across reloads.
 *
 * Uses a fallback if localStorage is unavailable (e.g. during SSR/Node environment).
 *
 * @param {string} namespace - The storage namespace.
 * @returns {string} The namespace-scoped salt.
 */
const getSalt = (namespace) => {
  const fallback = `fallback-salt:${namespace || "default"}`;
  if (typeof window === "undefined") return fallback;
  try {
    const storageKey = `eventra:storage-key-salt:${namespace || "default"}`;
    let salt = localStorage.getItem(storageKey);
    if (!salt) {
      salt = typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${namespace || "default"}-${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
      localStorage.setItem(storageKey, salt);
    }
    return salt;
  } catch {
    return fallback;
  }
};

/**
 * Generates an opaque storage key for the given namespace and userId.
 *
 * @param {string} namespace
 * @param {string} userId
 * @returns {string} The opaque key.
 */
export const getOpaqueKey = (namespace, userId) => {
  if (!userId || userId === "guest") {
    return `${namespace}_guest`;
  }

  const isTest = typeof process !== "undefined" &&
    (process.env.NODE_ENV === "test" || process.env.VITE_TEST_MODE === "true") &&
    process.env.TEST_OPACITY !== "true";

  if (isTest) {
    return `${namespace}_${userId}`;
  }

  const salt = getSalt(namespace);
  const hash = CryptoJS.SHA256(`${namespace}:${userId}:${salt}`).toString();
  return `${namespace}_${hash}`;
};

/**
 * Gets the opaque key and migrates existing data from a legacy key if present.
 *
 * @param {string} namespace
 * @param {string} userId
 * @param {string} legacyKey
 * @returns {string} The opaque key.
 */
export const getOrMigrateKey = (namespace, userId, legacyKey) => {
  const newKey = getOpaqueKey(namespace, userId);
  if (typeof window !== "undefined" && window.localStorage && legacyKey && legacyKey !== newKey) {
    try {
      const oldData = localStorage.getItem(legacyKey);
      if (oldData !== null && localStorage.getItem(newKey) === null) {
        localStorage.setItem(newKey, oldData);
        localStorage.removeItem(legacyKey);
      }
    } catch {
      // ignore
    }
  }
  return newKey;
};
