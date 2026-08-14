/**
 * adds a check-count helper.
 */
export function checkCount(value) {
  return typeof value === 'number' && value > 0;
}

