
/**
 * adds a low median helper.
 */
export function medianLow(array) {
  const sorted = [...array].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted[mid];
}

