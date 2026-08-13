
/**
 * adds an array intersection.
 */
export function intersect(a, b) {
  const setB = new Set(b);
  return a.filter((value) => setB.has(value));
}

