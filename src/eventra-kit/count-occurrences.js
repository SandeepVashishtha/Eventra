
/**
 * adds a count helper.
 */
export function countOccurrences(array, value) {
  return array.filter(v => v === value).length;
}

export function countBy(array, keyFn) {
  return array.reduce((acc, item) => {
    const key = typeof keyFn === 'function' ? keyFn(item) : item[keyFn];
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

