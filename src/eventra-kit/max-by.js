
/**
 * adds a max-by helper.
 */
export function maxBy(array, key) {
  return array.reduce((best, item) => {
    const value = typeof key === 'function' ? key(item) : item[key];
    const bestValue = typeof key === 'function' ? key(best) : best[key];
    return value > bestValue ? item : best;
  }, array[0]);
}

