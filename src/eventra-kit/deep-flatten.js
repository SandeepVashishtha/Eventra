
/**
 * adds a deep flatten helper.
 */
export function deepFlatten(array) {
  return array.reduce((acc, item) => acc.concat(Array.isArray(item) ? deepFlatten(item) : [item]), []);
}

