
/**
 * adds a sum-by helper.
 */
export function sumBy(array, key) {
  return array.reduce((acc, item) => {
    const value = typeof key === 'function' ? key(item) : item[key];
    return acc + Number(value || 0);
  }, 0);
}

