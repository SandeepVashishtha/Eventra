
/**
 * adds a nested getter.
 */
export function getPathValue(obj, path, fallback) {
  const value = String(path).split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
  return value == null ? fallback : value;
}

