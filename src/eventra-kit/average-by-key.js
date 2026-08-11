
/**
 * adds a keyed average helper.
 */
export function averageByKey(array, key) {
  if (!array.length) return 0;
  const total = array.reduce((sum, item) => sum + Number(item[key] || 0), 0);
  return total / array.length;
}

