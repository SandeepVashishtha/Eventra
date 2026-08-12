
/**
 * adds a percent-difference helper.
 */
export function percentDifference(a, b) {
  if (!a) return 0;
  return ((b - a) / a) * 100;
}

