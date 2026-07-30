const REDACTED_EMAIL = "[REDACTED_EMAIL]";
const REDACTED_SECRET = "[REDACTED_SECRET]";
const REDACTED_JWT = "[REDACTED_JWT]";
const REDACTED_AUTHORIZATION = "[REDACTED_AUTHORIZATION]";

const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const JWT_PATTERN =
  /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g;
const AUTHORIZATION_PATTERN =
  /\b(authorization\s*[:=]\s*)(bearer|basic|token)\s+["']?[^"',\s}]+["']?/gi;
const BEARER_PATTERN = /\b(bearer\s+)["']?[^"',\s}]+["']?/gi;
const PASSWORD_PATTERN =
  /\b(password|passwd|pwd)\s*[:=]\s*["']?[^"',\s}]+["']?/gi;
const API_KEY_PATTERN =
  /\b(api[-_ ]?key|apikey|x-api-key|client_secret|secret)\s*[:=]\s*["']?[^"',\s}]+["']?/gi;

const SENSITIVE_KEY_PATTERN =
  /(^|[-_\s.])(authorization|password|passwd|pwd|api[-_\s]?key|apikey|x-api-key|access[-_\s]?token|refresh[-_\s]?token|id[-_\s]?token|auth[-_\s]?token|jwt|secret|client[-_\s]?secret|token)([-_\s.]|$)/i;

const redactString = (value) =>
  value
    .replace(AUTHORIZATION_PATTERN, `$1${REDACTED_AUTHORIZATION}`)
    .replace(BEARER_PATTERN, `$1${REDACTED_AUTHORIZATION}`)
    .replace(PASSWORD_PATTERN, `$1=${REDACTED_SECRET}`)
    .replace(API_KEY_PATTERN, `$1=${REDACTED_SECRET}`)
    .replace(JWT_PATTERN, REDACTED_JWT)
    .replace(EMAIL_PATTERN, REDACTED_EMAIL);

const isSensitiveKey = (key) => SENSITIVE_KEY_PATTERN.test(String(key));

const cloneHeaders = (headers, seen) => {
  const result = {};
  seen.set(headers, result);

  headers.forEach((value, key) => {
    result[key] = isSensitiveKey(key)
      ? REDACTED_SECRET
      : redactSensitiveData(value, seen);
  });

  return result;
};

const cloneError = (error, seen) => {
  const redactedError = new Error(redactString(error.message || ""));
  redactedError.name = redactString(error.name || "Error");

  if (error.stack) {
    redactedError.stack = redactString(error.stack);
  }

  seen.set(error, redactedError);

  for (const key of Object.keys(error)) {
    redactedError[key] = isSensitiveKey(key)
      ? REDACTED_SECRET
      : redactSensitiveData(error[key], seen);
  }

  return redactedError;
};

/**
 * Redacts sensitive values from log payloads without mutating the original input.
 *
 * @param {*} value Log message, metadata object, Error, Headers, or any nested value.
 * @param {WeakMap<object, *>} [seen] Tracks circular references during recursion.
 * @returns {*} A redacted copy of the input.
 */
export function redactSensitiveData(value, seen = new WeakMap()) {
  if (typeof value === "string") {
    return redactString(value);
  }

  if (value === null || typeof value !== "object") {
    return value;
  }

  if (seen.has(value)) {
    return seen.get(value);
  }

  if (typeof Headers !== "undefined" && value instanceof Headers) {
    return cloneHeaders(value, seen);
  }

  if (value instanceof Error) {
    return cloneError(value, seen);
  }

  if (Array.isArray(value)) {
    const arrayCopy = [];
    seen.set(value, arrayCopy);
    value.forEach((item, index) => {
      arrayCopy[index] = redactSensitiveData(item, seen);
    });
    return arrayCopy;
  }

  const objectCopy = {};
  seen.set(value, objectCopy);

  for (const [key, nestedValue] of Object.entries(value)) {
    objectCopy[key] = isSensitiveKey(key)
      ? REDACTED_SECRET
      : redactSensitiveData(nestedValue, seen);
  }

  return objectCopy;
}

export const redactionPlaceholders = {
  email: REDACTED_EMAIL,
  secret: REDACTED_SECRET,
  jwt: REDACTED_JWT,
  authorization: REDACTED_AUTHORIZATION,
};
