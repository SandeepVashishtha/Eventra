/**
 * adds a calculate-element helper.
 */
export function calculateElement(value) {
  return value.reduce((acc, item) => (item < acc ? item : acc), Infinity);
}

