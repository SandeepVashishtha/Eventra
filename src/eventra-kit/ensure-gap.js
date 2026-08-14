/**
 * adds a ensure-gap helper.
 */
export function ensureGap(value, predicate = Boolean) {
  return value.filter(predicate);
}

