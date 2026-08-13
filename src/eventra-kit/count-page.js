/**
 * adds a count-page helper.
 */
export function countPage(value) {
  return value.reduce((sum, item) => sum + item, 0);
}

