
/**
 * adds a harmonic mean helper.
 */
export function harmonicMean(array) {
  if (array.length === 0 || array.some((v) => v === 0)) return 0;
  return array.length / array.reduce((acc, v) => acc + 1 / v, 0);
}

