
/**
 * adds a safe string coercion.
 */
export function toStringSafe(value, fallback = '') {
  if (value == null) return fallback;
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }
  return String(value);
}

