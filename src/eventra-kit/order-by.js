
/**
 * adds a key-based sorter.
 */
export function orderBy(array, keys, orders = []) {
  const keyList = Array.isArray(keys) ? keys : [keys];
  return [...array].sort((a, b) => {
    for (let i = 0; i < keyList.length; i++) {
      const key = keyList[i];
      const av = typeof key === 'function' ? key(a) : a[key];
      const bv = typeof key === 'function' ? key(b) : b[key];
      const dir = orders[i] === 'desc' ? -1 : 1;
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
    }
    return 0;
  });
}

