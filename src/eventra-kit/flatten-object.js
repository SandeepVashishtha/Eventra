
/**
 * adds an object flattener.
 */
export function flattenObject(object, prefix = '') {
  const out = {};
  for (const key in object) {
    const flatKey = prefix ? `${prefix}.${key}` : key;
    if (object[key] && typeof object[key] === 'object' && !Array.isArray(object[key])) {
      Object.assign(out, flattenObject(object[key], flatKey));
    } else {
      out[flatKey] = object[key];
    }
  }
  return out;
}

