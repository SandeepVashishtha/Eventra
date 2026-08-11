/**
 * adds unique-by-key helpers.
 */
export function uniqueBy(items, keyFn) {
  const seen = new Set();
  return items.filter(item => {
    const key = typeof keyFn === 'function' ? keyFn(item) : item[keyFn];
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function unique(values) {
  return [...new Set(values)];
}
