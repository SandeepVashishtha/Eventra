
/**
 * adds an exclusion helper.
 */
export function getDifference(a, b) {
  const setB = new Set(b);
  return a.filter((v) => !setB.has(v));
}

