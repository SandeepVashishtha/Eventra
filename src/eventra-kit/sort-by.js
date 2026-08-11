/**
 * adds array sort helpers.
 */
export function sortBy(items, keyFn, direction = 'asc') {
  const dir = direction === 'desc' ? -1 : 1;
  return [...items].sort((a, b) => {
    const va = typeof keyFn === 'function' ? keyFn(a) : a[keyFn];
    const vb = typeof keyFn === 'function' ? keyFn(b) : b[keyFn];
    if (va === vb) return 0;
    return (va < vb ? -1 : 1) * dir;
  });
}
