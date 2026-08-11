
/**
 * adds an array standardizer.
 */
export function standardizeArray(array) {
  const mean = array.reduce((a, b) => a + b, 0) / array.length;
  const variance = array.reduce((acc, v) => acc + (v - mean) ** 2, 0) / array.length;
  const std = Math.sqrt(variance);
  if (std === 0) return array.map(() => 0);
  return array.map((value) => (value - mean) / std);
}

