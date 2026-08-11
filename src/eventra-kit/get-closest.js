
/**
 * adds a nearest-value helper.
 */
export function getClosest(array, target) {
  if (!array.length) return undefined;
  return array.reduce((best, value) =>
    Math.abs(value - target) < Math.abs(best - target) ? value : best
  );
}

