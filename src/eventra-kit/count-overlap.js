
/**
 * adds an overlap counter.
 */
export function countOverlap(a, b) {
  const setB = new Set(b);
  return a.filter((v) => setB.has(v)).length;
}

