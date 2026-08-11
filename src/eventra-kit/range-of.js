
/**
 * adds a range helper.
 */
export function rangeOf(values) {
  return Math.max(...values) - Math.min(...values);
}

