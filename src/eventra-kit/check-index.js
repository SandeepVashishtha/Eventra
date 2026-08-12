/**
 * adds a check-index helper.
 */
export function checkIndex(value) {
  return value.sort((a, b) => b - a);
}

