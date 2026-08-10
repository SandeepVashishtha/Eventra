
/**
 * adds an omit helper.
 */
export function omit(obj, keys) {
  const set = new Set(keys);
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    if (!set.has(key)) out[key] = value;
  }
  return out;
}

