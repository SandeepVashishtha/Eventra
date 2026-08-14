/**
 * adds a count-map helper.
 */
export function countMap(value) {
  if (value == null) return 0;
  if (value instanceof Map) return value.size;
  if (typeof value === 'object') return Object.keys(value).length;
  return 0;
}

