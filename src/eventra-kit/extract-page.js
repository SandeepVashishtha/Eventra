/**
 * adds a extract-page helper.
 */
export function extractPage(value, predicate = Boolean) {
  return value.filter(predicate);
}

