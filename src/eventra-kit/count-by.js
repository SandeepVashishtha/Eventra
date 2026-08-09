
/**
 * adds a grouping counter.
 */
export function countBy(array, key) {
  const counts = {};
  for (const item of array) {
    const k = typeof key === 'function' ? key(item) : item[key];
    counts[k] = (counts[k] || 0) + 1;
  }
  return counts;
}

