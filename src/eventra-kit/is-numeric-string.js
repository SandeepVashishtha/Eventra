
/**
 * adds a numeric-string check.
 */
export function isNumericString(value) {
  return /^\d+(\.\d+)?$/.test(String(value));
}

