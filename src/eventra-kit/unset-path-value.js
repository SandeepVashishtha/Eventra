
/**
 * adds a nested deleter.
 */
export function unsetPathValue(obj, path) {
  const keys = String(path).split('.');
  const last = keys.pop();
  const target = keys.reduce((acc, key) => (acc ? acc[key] : undefined), obj);
  if (target) delete target[last];
  return obj;
}

