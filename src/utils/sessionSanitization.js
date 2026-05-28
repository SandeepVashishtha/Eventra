/**
 * Recursively sanitizes any session state object to strip out sensitive
 * authentication parameters or credentials before caching.
 */
const SENSITIVE_KEYS = new Set([
  "token",
  "accesstoken",
  "jwt",
  "password",
  "secret",
  "mnemonic",
  "privatekey",
  "backupkey",
  "sessiontoken",
  "auth",
  "authorization",
]);

// Base64URL-encoded JWT regex format (header.payload.signature)
const JWT_REGEX = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

export const sanitizeSessionValue = (val) => {
  if (typeof val === "string") {
    if (JWT_REGEX.test(val)) {
      return "[REDACTED_JWT]";
    }
  }
  return val;
};

export const sanitizeSessionState = (state) => {
  if (state === null || state === undefined) {
    return state;
  }

  // Handle arrays
  if (Array.isArray(state)) {
    return state.map((item) => sanitizeSessionState(item));
  }

  // Handle plain objects
  if (typeof state === "object") {
    // If it's not a plain object (e.g. Date, RegExp, etc.), just return it
    if (state.constructor !== Object) {
      return state;
    }

    const sanitized = {};
    for (const key of Object.keys(state)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.has(lowerKey)) {
        sanitized[key] = "[REDACTED]";
      } else {
        const val = state[key];
        if (typeof val === "object") {
          sanitized[key] = sanitizeSessionState(val);
        } else {
          sanitized[key] = sanitizeSessionValue(val);
        }
      }
    }
    return sanitized;
  }

  return sanitizeSessionValue(state);
};
