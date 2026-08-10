
/**
 * adds a keyed unique helper.
 */
export function getUniqueValues(array, key) {
  const seen = new Set();
  const out = [];
  for (const item of array) {
    const value = typeof key === 'function' ? key(item) : item[key];
    if (!seen.has(value)) {
      seen.add(value);
      out.push(item);
    }
  }
  return out;
}

