
/**
 * adds a lookup table helper.
 */
export function toLookup(array, key) {
  const out = new Map();
  for (const item of array) {
    const k = typeof key === 'function' ? key(item) : item[key];
    out.set(k, item);
  }
  return out;
}

