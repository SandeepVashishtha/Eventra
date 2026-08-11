
/**
 * adds a float check.
 */
export function isFloatValue(value) {
  return Number.isFinite(value) && !Number.isInteger(value);
}

