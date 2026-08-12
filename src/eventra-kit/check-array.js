/**
 * adds a check-array helper.
 */
export function checkArray(value) {
  return value.every((item) => Boolean(item));
}

