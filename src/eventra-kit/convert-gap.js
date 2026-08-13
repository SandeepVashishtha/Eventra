/**
 * adds a convert-gap helper.
 */
export function convertGap(value, predicate = Boolean) {
  return value.filter(predicate);
}

