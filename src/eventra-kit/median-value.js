
/**
 * adds a median helper.
 */
export function medianValue(numbers) {
  if (!numbers.length) return undefined;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

