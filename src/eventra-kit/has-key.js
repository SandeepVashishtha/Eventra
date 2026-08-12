
/**
 * adds an own-property check.
 */
export function hasKey(obj, key) {
  return obj ? Object.prototype.hasOwnProperty.call(obj, key) : false;
}

