
/**
 * adds a nested setter.
 */
export function setPathValue(obj, path, value) {
  const keys = String(path).split('.');
  const last = keys.pop();
  const target = keys.reduce((acc, key) => (acc[key] = acc[key] || {}), obj);
  target[last] = value;
  return obj;
}

