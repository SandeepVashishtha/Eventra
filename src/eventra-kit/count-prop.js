/**
 * adds a count-prop helper.
 */
export function countProp(value) {
  if (value == null) return 0;
  return Object.keys(value).length;
}

