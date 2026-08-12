
/**
 * adds an intersection helper.
 */
export function getIntersection(a, b) {
  const setB = new Set(b);
  return [...new Set(a)].filter((v) => setB.has(v));
}

