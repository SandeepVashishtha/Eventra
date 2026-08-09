
/**
 * adds object/string size helpers.
 */
export function objectSize(obj) {
  if (obj == null) return 0;
  if (typeof obj === 'string' || Array.isArray(obj)) return obj.length;
  if (typeof obj === 'object') return Object.keys(obj).length;
  return 0;
}

