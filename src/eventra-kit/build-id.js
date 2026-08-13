/**
 * adds a build-id helper.
 */
export function buildId(value, predicate = Boolean) {
  return value.filter(predicate);
}

