
/**
 * adds a path getter.
 */
export function getValueByPath(obj, path) {
  if (!obj) return undefined;
  return String(path).split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

