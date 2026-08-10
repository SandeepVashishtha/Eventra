
/**
 * adds a unique-value helper.
 */
export function uniq(values) {
  return [...new Set(values)];
}

export function uniqBy(values, key) {
  const seen = new Set();
  return values.filter(v => {
    const k = typeof key === 'function' ? key(v) : v[key];
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

