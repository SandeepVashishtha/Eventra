
/**
 * adds an index-by helper.
 */
export function keyBy(array, key) {
  const out = {};
  for (const item of array) {
    const k = typeof key === 'function' ? key(item) : item[key];
    out[k] = item;
  }
  return out;
}

