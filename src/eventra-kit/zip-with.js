
/**
 * adds a zipped mapper.
 */
export function zipWith(a, b, fn) {
  const length = Math.min(a.length, b.length);
  return Array.from({ length }, (_, i) => fn(a[i], b[i]));
}

