
/**
 * adds an array-to-object helper.
 */
export function arrayToObject(array, key, valueFn) {
  const out = {};
  for (const item of array) {
    const k = typeof key === 'function' ? key(item) : item[key];
    out[k] = valueFn ? valueFn(item) : item;
  }
  return out;
}

