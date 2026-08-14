/**
 * adds a extract-dict helper.
 */
export function extractDict(value) {
  if (value == null) return [];
  if (value instanceof Map) return [...value.values()];
  if (typeof value === 'object') return Object.values(value);
  return [];
}

