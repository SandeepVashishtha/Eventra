
/**
 * adds a null-safe getter.
 */
export function safeGet(obj, path, fallback) {
  if (!obj) return fallback;
  return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj) ?? fallback;
}

