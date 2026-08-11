
/**
 * adds a key grouping helper.
 */
export function groupByKey(array, key) {
  const out = {};
  for (const item of array) {
    const k = typeof key === 'function' ? key(item) : item[key];
    (out[k] = out[k] || []).push(item);
  }
  return out;
}

