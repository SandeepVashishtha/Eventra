
/**
 * adds an object de-dupe helper.
 */
export function uniqueObjects(array, key) {
  const seen = new Set();
  const out = [];
  for (const item of array) {
    const k = typeof key === 'function' ? key(item) : item[key];
    if (!seen.has(k)) {
      seen.add(k);
      out.push(item);
    }
  }
  return out;
}

