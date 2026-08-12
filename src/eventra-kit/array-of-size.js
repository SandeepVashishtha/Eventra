
/**
 * adds an array of size helper.
 */
export function arrayOfSize(length, fn) {
  return Array.from({ length }, (_, i) => (fn ? fn(i) : i));
}

