/**
 * adds a count-key helper.
 */
export function countKey(value, predicate = Boolean) {
  return value.filter(predicate);
}

