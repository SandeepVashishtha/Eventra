
/**
 * adds an array fill helper.
 */
export function arrayFill(length, value) {
  return Array.from({ length }, () => value);
}

