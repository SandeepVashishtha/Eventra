
/**
 * adds an array normalizer.
 */
export function normalizeArray(array) {
  const max = Math.max(...array);
  const min = Math.min(...array);
  if (max === min) return array.map(() => 0.5);
  return array.map((value) => (value - min) / (max - min));
}

