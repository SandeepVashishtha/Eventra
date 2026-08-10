
/**
 * adds an object flattener.
 */
export function flattenObjectKeys(obj, prefix = '', separator = '.') {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}${separator}${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(out, flattenObjectKeys(value, newKey, separator));
    } else {
      out[newKey] = value;
    }
  }
  return out;
}

