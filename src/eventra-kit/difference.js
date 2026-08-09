
/**
 * adds a set difference helper.
 */
export function difference(a, b) {
  const set = new Set(b);
  return a.filter(v => !set.has(v));
}

export function symmetricDifference(a, b) {
  const setA = new Set(a);
  const setB = new Set(b);
  return [...a.filter(v => !setB.has(v)), ...b.filter(v => !setA.has(v))];
}

