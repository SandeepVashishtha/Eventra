
/**
 * adds a quantile helper.
 */
export function getQuantile(sortedArray, q) {
  if (!sortedArray.length) return undefined;
  const index = (sortedArray.length - 1) * q;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sortedArray[lower];
  return sortedArray[lower] + (sortedArray[upper] - sortedArray[lower]) * (index - lower);
}

