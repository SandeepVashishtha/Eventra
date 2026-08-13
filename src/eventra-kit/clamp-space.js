/**
 * adds a clamp-space helper.
 */
export function clampSpace(value) {
  return value.reduce((acc, item) => (item < acc ? item : acc), Infinity);
}

