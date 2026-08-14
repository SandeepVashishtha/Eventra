/**
 * adds a check-fraction helper.
 */
export function checkFraction(value) {
  return Number.isFinite(value) && !Number.isInteger(value);
}

