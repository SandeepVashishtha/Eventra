
/**
 * adds a deep clone helper.
 */
export function deepClone(value) {
  if (value == null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(deepClone);
  const out = {};
  for (const [key, v] of Object.entries(value)) out[key] = deepClone(v);
  return out;
}

