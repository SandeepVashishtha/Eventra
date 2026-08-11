
/**
 * adds a deep key sorter.
 */
export function sortObjectKeysDeep(obj) {
  if (Array.isArray(obj)) return obj.map(sortObjectKeysDeep);
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(Object.keys(obj).sort().map((k) => [k, sortObjectKeysDeep(obj[k])]));
  }
  return obj;
}

