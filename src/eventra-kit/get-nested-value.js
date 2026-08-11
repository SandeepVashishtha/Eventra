/**
 * adds a safe nested lookup helper.
 */
export function getNestedValue(obj, path, fallback = undefined) {
  if (!obj || typeof obj !== 'object') return fallback;
  const keys = Array.isArray(path) ? path : path.split('.');
  let cur = obj;
  for (const k of keys) {
    if (cur === null || cur === undefined) return fallback;
    cur = cur[k];
  }
  return cur === undefined ? fallback : cur;
}
