/**
 * adds a diff-interval helper.
 */
export function diffInterval(value, other) {
  return Math.abs((Number(value) || 0) - (Number(other) || 0));
}

