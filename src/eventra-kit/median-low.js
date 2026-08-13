
/**
 * adds a low median helper.
 *
 * For an odd-length array this is the middle element. For an even-length
 * array the low median is the lower of the two middle values (the element
 * before the upper-middle). The index Math.floor((n - 1) / 2) lands on the
 * lower-middle for even n (e.g. n=4 -> index 1) and the exact middle for
 * odd n (e.g. n=5 -> index 2), so medianLow and medianHigh no longer collide.
 */
export function medianLow(array) {
  if (!array.length) return undefined;
  const sorted = [...array].sort((a, b) => a - b);
  const mid = Math.floor((sorted.length - 1) / 2);
  return sorted[mid];
}

