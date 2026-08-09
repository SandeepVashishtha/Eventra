
/**
 * adds an object map helper.
 */
export function mapValues(obj, fn) {
  const out = {};
  for (const [key, value] of Object.entries(obj)) out[key] = fn(value, key);
  return out;
}

