/**
 * secureClientStorage.js
 * Ensures only necessary, non-sensitive data is stored on the client side.
 * Provides a safe wrapper around localStorage/sessionStorage.
 */

// Fields that should NEVER be stored client-side
const BLOCKED_KEYS = [
  "password",
  "creditCard",
  "cardNumber",
  "cvv",
  "ssn",
  "socialSecurity",
  "bankAccount",
  "privateKey",
  "secret",
  "accessToken",
  "refreshToken",
];

const isSensitiveKey = (key) => {
  const lowerKey = key.toLowerCase();
  return BLOCKED_KEYS.some((blocked) => lowerKey.includes(blocked.toLowerCase()));
};

const sanitizeValue = (value) => {
  if (typeof value === "object" && value !== null) {
    const sanitized = { ...value };
    BLOCKED_KEYS.forEach((key) => {
      delete sanitized[key];
      delete sanitized[key.toLowerCase()];
      delete sanitized[key.toUpperCase()];
    });
    return JSON.stringify(sanitized);
  }
  return typeof value === "string" ? value : JSON.stringify(value);
};

export const safeSet = (key, value, useSession = false) => {
  try {
    if (isSensitiveKey(key)) {
      console.warn(`[SecureStorage] Blocked storing sensitive key: "${key}"`);
      return false;
    }
    const storage = useSession ? sessionStorage : localStorage;
    storage.setItem(key, sanitizeValue(value));
    return true;
  } catch {
    return false;
  }
};

export const safeGet = (key, useSession = false) => {
  try {
    const storage = useSession ? sessionStorage : localStorage;
    const value = storage.getItem(key);
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch {
    return null;
  }
};

export const safeRemove = (key, useSession = false) => {
  try {
    const storage = useSession ? sessionStorage : localStorage;
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

export const auditStorage = () => {
  const issues = [];
  try {
    // Check localStorage
    Object.keys(localStorage).forEach((key) => {
      if (isSensitiveKey(key)) {
        issues.push({ storage: "localStorage", key, risk: "sensitive key name" });
      }
      const value = localStorage.getItem(key);
      BLOCKED_KEYS.forEach((blocked) => {
        if (value && value.toLowerCase().includes(`"${blocked.toLowerCase()}":`)) {
          issues.push({ storage: "localStorage", key, risk: `contains sensitive field: ${blocked}` });
        }
      });
    });

    // Check sessionStorage
    Object.keys(sessionStorage).forEach((key) => {
      if (isSensitiveKey(key)) {
        issues.push({ storage: "sessionStorage", key, risk: "sensitive key name" });
      }
    });
  } catch {}

  return issues;
};

export const cleanSensitiveData = () => {
  try {
    [...Object.keys(localStorage)].forEach((key) => {
      if (isSensitiveKey(key)) {
        localStorage.removeItem(key);
      }
    });
    [...Object.keys(sessionStorage)].forEach((key) => {
      if (isSensitiveKey(key)) {
        sessionStorage.removeItem(key);
      }
    });
    return true;
  } catch {
    return false;
  }
};