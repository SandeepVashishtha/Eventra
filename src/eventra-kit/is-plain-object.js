/**
 * adds an object type guard.
 */
export function isPlainObject(value) {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export function isObject(value) {
  return value !== null && typeof value === 'object';
}
