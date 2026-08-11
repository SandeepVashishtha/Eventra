
/**
 * adds a mean absolute helper.
 */
export function meanAbsolute(array) {
  if (array.length === 0) return 0;
  return array.reduce((acc, v) => acc + Math.abs(v), 0) / array.length;
}

