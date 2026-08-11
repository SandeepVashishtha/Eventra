/**
 * adds object pick/omit helpers.
 */
export function pick(obj, keys) {
  return keys.reduce((acc, k) => {
    if (k in obj) acc[k] = obj[k];
    return acc;
  }, {});
}

export function omit(obj, keys) {
  const set = new Set(keys);
  return Object.keys(obj).reduce((acc, k) => {
    if (!set.has(k)) acc[k] = obj[k];
    return acc;
  }, {});
}
