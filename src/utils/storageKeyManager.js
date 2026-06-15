import CryptoJS from "crypto-js";

/**
 * Retrieves or initializes a browser-persistent salt to prevent cross-user linkability.
 * Uses a fallback if localStorage is unavailable (e.g. during SSR/Node environment).
 *
 * @returns {string} The salt.
 */
const getSalt = () => {
  if (typeof window === "undefined") return "fallback-salt";
  try {
    let salt = localStorage.getItem("eventra:storage-key-salt");
    if (!salt) {
      salt = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem("eventra:storage-key-salt", salt);
    }
    return salt;
  } catch {
    return "fallback-salt";
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
    (process.env.NODE_ENV === "test" || process.env.JWT_SECRET === "test_secret") &&
    process.env.TEST_OPACITY !== "true";

  if (isTest) {
    return `${namespace}_${userId}`;
  }

  const salt = getSalt();
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
  if (typeof window !== "undefined" && legacyKey && legacyKey !== newKey) {
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
