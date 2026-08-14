
/**
 * adds a range helper.
 */
export function rangeOf(values) {
  if (!values || !values.length) return 0;
  return Math.max(...values) - Math.min(...values);
}

