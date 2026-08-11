
/**
 * adds a key comparator helper.
 */
export function compareBy(key, descending = false) {
  const dir = descending ? -1 : 1;
  return (a, b) => {
    const av = typeof key === 'function' ? key(a) : a[key];
    const bv = typeof key === 'function' ? key(b) : b[key];
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  };
}

