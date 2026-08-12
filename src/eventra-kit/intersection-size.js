
/**
 * adds an overlap counter.
 */
export function intersectionSize(a, b) {
  const setB = new Set(b);
  return a.filter((value) => setB.has(value)).length;
}

