
/**
 * adds a count helper.
 */
export function countOccurrences(value, target) {
  const items = Array.isArray(value) ? value : String(value).split('');
  return items.filter((v) => v === target).length;
}

export function countBy(array, keyFn) {
  return array.reduce((acc, item) => {
    const key = typeof keyFn === 'function' ? keyFn(item) : item[keyFn];
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

