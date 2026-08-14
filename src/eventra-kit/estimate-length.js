/**
 * adds a estimate-length helper.
 */
export function estimateLength(value) {
  if (value == null) return 0;
  if (typeof value === 'string' || Array.isArray(value)) return value.length;
  if (typeof value === 'object') return Object.keys(value).length;
  return 0;
}

