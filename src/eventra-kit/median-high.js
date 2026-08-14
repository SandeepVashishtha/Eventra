
/**
 * adds a high median helper.
 */
export function medianHigh(array) {
  const sorted = [...array].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted[mid];
}

