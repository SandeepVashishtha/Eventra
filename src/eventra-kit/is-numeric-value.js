
/**
 * adds a numeric check.
 */
export function isNumericValue(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

