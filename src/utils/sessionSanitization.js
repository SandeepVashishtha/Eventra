/* eslint-disable no-console */

/**
 * Enterprise Session State Sanitizer & Security Redaction Engine
 *
 * Recursively sanitizes session state objects to strip or mask sensitive credentials,
 * tokens, PII, and financial data prior to client caching, logging, or storage persistence.
 */

// ============================================================================
// 1. Sensitive Field Names & Key Patterns
// ============================================================================

export const SENSITIVE_KEYS = new Set([
  // Standard token fields
  "token",
  "accesstoken",
  "refreshtoken",
  "idtoken",
  "jwt",
  "bearertoken",
  "sessiontoken",
  "csrf_token",
  "xsrf_token",

  // Credential / secret fields
  "credential",
  "credentials",
  "apikey",
  "api_key",
  "clientsecret",
  "client_secret",
  "password",
  "passwd",
  "secret",
  "secretkey",
  "secret_key",
  "privatekey",
  "private_key",

  // Auth header & session aliases
  "auth",
  "authorization",
  "session",
  "cookie",
  "x-access-token",

  // Crypto / wallet fields
  "mnemonic",
  "seedphrase",
  "seed_phrase",
  "backupkey",
  "backup_key",
  "signingkey",
  "signing_key",
  "passphrase",

  // Financial & PII fields
  "ssn",
  "socialsecurity",
  "creditcard",
  "cardnumber",
  "cvv",
  "cvc",
  "pin",
  "accountnumber",
]);

/**
 * Dynamic RegExp patterns matching key names that imply sensitivity
 * even if not explicitly listed in SENSITIVE_KEYS.
 */
export const SENSITIVE_KEY_PATTERNS = [
  /.*password.*/i,
  /.*secret.*/i,
  /.*token.*/i,
  /.*private.*key.*/i,
  /.*auth.*/i,
  /.*bearer.*/i,
  /.*credential.*/i,
];

// ============================================================================
// 2. Sensitive Value Content Detection (Regex & Algorithmic)
// ============================================================================

// Base64URL-encoded JWT regex format (header.payload.signature)
export const JWT_REGEX = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

// Structural value signatures for known secrets and cloud credentials
export const SENSITIVE_VALUE_PATTERNS = [
  { name: "JWT", regex: JWT_REGEX, replacement: "[REDACTED_JWT]" },
  { name: "AWS_ACCESS_KEY", regex: /\b(AKIA|ASIA)[0-9A-Z]{16}\b/, replacement: "[REDACTED_AWS_KEY]" },
  { name: "STRIPE_SECRET_KEY", regex: /\b(sk_live|rk_live)_[0-9a-zA-Z]{24,}\b/, replacement: "[REDACTED_STRIPE_KEY]" },
  { name: "GITHUB_PAT", regex: /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36}\b/, replacement: "[REDACTED_GITHUB_TOKEN]" },
  { name: "PEM_PRIVATE_KEY", regex: /-----BEGIN (RSA|EC|OPENSSH|PRIVATE) KEY-----[\s\S]*?-----END \1 KEY-----/, replacement: "[REDACTED_PRIVATE_KEY]" },
  { name: "DATABASE_URI", regex: /\b(mongodb(\+srv)?|postgres|postgresql|mysql|redis):\/\/[^\s"']+\b/i, replacement: "[REDACTED_CONNECTION_STRING]" },
  { name: "BEARER_HEADER", regex: /^Bearer\s+[A-Za-z0-9-_=.]+/i, replacement: "[REDACTED_BEARER_TOKEN]" },
];

/**
 * Luhn Algorithm validator to detect valid credit card numbers in raw strings.
 * @param {string} str - Candidate number string.
 * @returns {boolean}
 */
export const isLuhnValidCreditCard = (str) => {
  const sanitized = str.replace(/[\s-]/g, "");
  if (!/^\d{13,19}$/.test(sanitized)) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
};

// ============================================================================
// 3. Default Configuration & Options
// ============================================================================

export const DEFAULT_SANITIZATION_OPTIONS = {
  redactionText: "[REDACTED]",
  maskPII: false,
  checkValuePatterns: true,
  checkLuhnCreditCards: true,
  maxDepth: 10,
  customSensitiveKeys: [],
  whitelistedKeys: [],
  preserveTypes: false, // If true, replaces string with "" or number with 0 instead of "[REDACTED]"
};

// ============================================================================
// 4. Value & Primitive Sanitizer Functions
// ============================================================================

/**
 * Evaluates primitive values (strings) against standard secrets patterns.
 * @param {any} val - Input primitive.
 * @param {Object} [options] - Configuration overrides.
 * @returns {any} Sanitized output value.
 */
export const sanitizeSessionValue = (val, options = DEFAULT_SANITIZATION_OPTIONS) => {
  if (typeof val !== "string") {
    return val;
  }

  const opts = { ...DEFAULT_SANITIZATION_OPTIONS, ...options };

  // 1. Content Pattern Checks
  if (opts.checkValuePatterns) {
    for (const pattern of SENSITIVE_VALUE_PATTERNS) {
      if (pattern.regex.test(val)) {
        return pattern.replacement;
      }
    }
  }

  // 2. Financial Credit Card Check
  if (opts.checkLuhnCreditCards && isLuhnValidCreditCard(val)) {
    return "[REDACTED_CREDIT_CARD]";
  }

  return val;
};

// ============================================================================
// 5. Core Recursive Sanitizer Algorithm
// ============================================================================

/**
 * Internal recursive handler with circular reference detection and depth guards.
 */
const sanitizeInternal = (state, opts, visitedMap = new WeakMap(), depth = 0) => {
  if (state === null || state === undefined) {
    return state;
  }

  // Guard against deep nesting / infinite stack overflow
  if (depth > opts.maxDepth) {
    return "[MAX_DEPTH_REACHED]";
  }

  // Handle primitives directly
  if (typeof state !== "object") {
    return sanitizeSessionValue(state, opts);
  }

  // Handle circular references
  if (visitedMap.has(state)) {
    return visitedMap.get(state);
  }

  // Handle Arrays
  if (Array.isArray(state)) {
    const sanitizedArray = [];
    visitedMap.set(state, sanitizedArray);

    for (let i = 0; i < state.length; i++) {
      sanitizedArray[i] = sanitizeInternal(state[i], opts, visitedMap, depth + 1);
    }
    return sanitizedArray;
  }

  // Handle non-plain objects (Date, RegExp, Blob, Set, Map)
  if (state.constructor && state.constructor !== Object) {
    if (state instanceof Date) return new Date(state.getTime());
    if (state instanceof RegExp) return new RegExp(state.source, state.flags);
    return state; // Pass through safely
  }

  // Handle Plain Objects
  const sanitizedObject = {};
  visitedMap.set(state, sanitizedObject);

  const customKeysSet = new Set(opts.customSensitiveKeys.map((k) => k.toLowerCase()));
  const whitelistSet = new Set(opts.whitelistedKeys.map((k) => k.toLowerCase()));

  for (const key of Object.keys(state)) {
    const lowerKey = key.toLowerCase();

    // Check Whitelist first
    if (whitelistSet.has(lowerKey)) {
      sanitizedObject[key] = state[key];
      continue;
    }

    // Check Explicit Set + Custom Keys
    const isExplicitlySensitive = SENSITIVE_KEYS.has(lowerKey) || customKeysSet.has(lowerKey);

    // Check Regex Key Patterns
    const isPatternSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));

    if (isExplicitlySensitive || isPatternSensitive) {
      if (opts.preserveTypes) {
        const valType = typeof state[key];
        sanitizedObject[key] = valType === "number" ? 0 : valType === "boolean" ? false : "";
      } else {
        sanitizedObject[key] = opts.redactionText;
      }
    } else {
      const val = state[key];
      if (typeof val === "object" && val !== null) {
        sanitizedObject[key] = sanitizeInternal(val, opts, visitedMap, depth + 1);
      } else {
        sanitizedObject[key] = sanitizeSessionValue(val, opts);
      }
    }
  }

  return sanitizedObject;
};

/**
 * Public entry point for recursively sanitizing session state.
 * @param {any} state - Session state object, array, or string.
 * @param {Object} [options] - Custom sanitization configuration options.
 * @returns {any} Sanitized session state copy.
 */
export const sanitizeSessionState = (state, options = {}) => {
  const mergedOptions = { ...DEFAULT_SANITIZATION_OPTIONS, ...options };
  return sanitizeInternal(state, mergedOptions);
};

// ============================================================================
// 6. Audit & Analytics Wrapper
// ============================================================================

/**
 * Sanitizes session state while capturing audit metrics (count of redacted fields).
 * @param {any} state 
 * @param {Object} [options] 
 * @returns {{ sanitizedState: any, auditReport: { redactedKeysCount: number, redactedKeysList: string[] } }}
 */
export const sanitizeSessionStateWithAudit = (state, options = {}) => {
  const redactedKeysList = [];
  
  const trackingOptions = {
    ...options,
    redactionText: options.redactionText || "[REDACTED]",
  };

  const trackingSanitizer = (val, opts, visited = new WeakMap(), depth = 0) => {
    if (val !== null && typeof val === "object" && !Array.isArray(val) && val.constructor === Object) {
      const result = {};
      visited.set(val, result);

      for (const key of Object.keys(val)) {
        const lowerKey = key.toLowerCase();
        if (SENSITIVE_KEYS.has(lowerKey) || SENSITIVE_KEY_PATTERNS.some((p) => p.test(key))) {
          redactedKeysList.push(key);
          result[key] = trackingOptions.redactionText;
        } else {
          result[key] = trackingSanitizer(val[key], opts, visited, depth + 1);
        }
      }
      return result;
    }
    return sanitizeInternal(val, opts, visited, depth);
  };

  const sanitizedState = trackingSanitizer(state, trackingOptions);

  return {
    sanitizedState,
    auditReport: {
      redactedKeysCount: redactedKeysList.length,
      redactedKeysList,
      timestamp: new Date().toISOString(),
    },
  };
};

// ============================================================================
// 7. Data Masking Utility Helpers
// ============================================================================

/**
 * Partially masks an email address for privacy (e.g., "j***n@domain.com").
 * @param {string} email 
 * @returns {string}
 */
export const maskEmail = (email) => {
  if (typeof email !== "string" || !email.includes("@")) return "[INVALID_EMAIL]";
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local.charAt(0)}*@${domain}`;
  return `${local.charAt(0)}${"*".repeat(local.length - 2)}${local.slice(-1)}@${domain}`;
};

/**
 * Partially masks an API key or Token keeping visible prefix/suffix.
 * @param {string} key - Raw API key.
 * @param {number} [visibleChars=4] 
 * @returns {string}
 */
export const maskApiKey = (key, visibleChars = 4) => {
  if (typeof key !== "string" || key.length <= visibleChars * 2) return "****";
  const start = key.slice(0, visibleChars);
  const end = key.slice(-visibleChars);
  return `${start}${"*".repeat(key.length - visibleChars * 2)}${end}`;
};

// ============================================================================
// 8. Safe Local/Session Storage Persistence Adapter
// ============================================================================

export class SanitizedStorageAdapter {
  constructor(storageType = "localStorage", defaultOptions = {}) {
    this.storageType = storageType;
    this.options = { ...DEFAULT_SANITIZATION_OPTIONS, ...defaultOptions };
  }

  get storage() {
    if (typeof window === "undefined") return null;
    return window[this.storageType] || null;
  }

  setItem(key, value) {
    if (!this.storage) return false;
    try {
      const sanitized = sanitizeSessionState(value, this.options);
      this.storage.setItem(key, JSON.stringify(sanitized));
      return true;
    } catch (err) {
      console.error(`[SanitizedStorageAdapter] Failed to save key "${key}":`, err);
      return false;
    }
  }

  getItem(key) {
    if (!this.storage) return null;
    try {
      const raw = this.storage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      console.error(`[SanitizedStorageAdapter] Failed to read key "${key}":`, err);
      return null;
    }
  }

  removeItem(key) {
    if (this.storage) {
      this.storage.removeItem(key);
    }
  }
}