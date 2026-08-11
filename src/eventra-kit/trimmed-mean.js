
/**
 * adds a trimmed mean helper.
 */
export function trimmedMean(array, percent = 0.1) {
  const sorted = [...array].sort((a, b) => a - b);
  const trim = Math.floor(sorted.length * percent);
  const middle = sorted.slice(trim, sorted.length - trim);
  if (middle.length === 0) return 0;
  return middle.reduce((a, b) => a + b, 0) / middle.length;
}

