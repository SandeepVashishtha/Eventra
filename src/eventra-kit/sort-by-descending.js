
/**
 * adds a descending sorter.
 */
export function sortByDescending(array, key) {
  return [...array].sort((a, b) => {
    const av = typeof key === 'function' ? key(a) : a[key];
    const bv = typeof key === 'function' ? key(b) : b[key];
    if (av < bv) return 1;
    if (av > bv) return -1;
    return 0;
  });
}

