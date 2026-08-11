
/**
 * adds a running total helper.
 */
export function cumulativeSum(values) {
  let total = 0;
  return values.map(v => (total += Number(v) || 0));
}

