
/**
 * adds a property sorter.
 */
export function sortByProperty(array, prop, dir = 'asc') {
  const sorted = [...array].sort((a, b) => {
    const av = a[prop]; const bv = b[prop];
    if (av < bv) return -1; if (av > bv) return 1; return 0;
  });
  return dir === 'desc' ? sorted.reverse() : sorted;
}

