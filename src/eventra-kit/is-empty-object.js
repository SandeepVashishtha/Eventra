
/**
 * adds object emptiness checks.
 */
export function isEmptyObject(obj) {
  return obj == null || (typeof obj === 'object' && !Array.isArray(obj) && Object.keys(obj).length === 0);
}

export function hasKeys(obj) {
  return obj != null && typeof obj === 'object' && Object.keys(obj).length > 0;
}

