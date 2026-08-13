/**
 * adds a create-page helper.
 */
export function createPage(value, predicate = Boolean) {
  return value.filter(predicate);
}

