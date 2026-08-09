
/**
 * adds a key-based average helper.
 */
export function averageBy(array, keyFn) {
  if (!array.length) return 0;
  const values = array.map(v => typeof keyFn === 'function' ? keyFn(v) : v[keyFn]);
  return values.reduce((a, b) => a + (Number(b) || 0), 0) / values.length;
}

