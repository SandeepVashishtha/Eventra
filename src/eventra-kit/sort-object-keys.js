
/**
 * adds object ordering helpers.
 */
export function sortObjectKeys(obj, comparator) {
  return Object.keys(obj).sort(comparator).reduce((acc, key) => {
    acc[key] = obj[key];
    return acc;
  }, {});
}

