
/**
 * adds a symmetric diff helper.
 */
export function symmetricDifference(a, b) {
  const setA = new Set(a);
  const setB = new Set(b);
  return a.filter((v) => !setB.has(v)).concat(b.filter((v) => !setA.has(v)));
}

