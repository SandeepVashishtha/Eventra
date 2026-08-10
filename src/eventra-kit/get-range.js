
/**
 * adds a min-max range helper.
 */
export function getRange(array) {
  if (!array.length) return 0;
  return Math.max(...array) - Math.min(...array);
}

