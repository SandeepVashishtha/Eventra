/**
 * adds a estimate-map helper.
 */
export function estimateMap(value) {
  if (value instanceof Map) return value.size;
  return value == null ? 0 : Object.keys(value).length;
}

