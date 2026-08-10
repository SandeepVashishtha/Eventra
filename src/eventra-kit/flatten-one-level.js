
/**
 * adds a shallow flatten helper.
 */
export function flattenOneLevel(array) {
  return array.reduce((acc, item) => acc.concat(Array.isArray(item) ? item : [item]), []);
}

