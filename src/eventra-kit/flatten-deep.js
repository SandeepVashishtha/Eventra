
/**
 * adds a deep flatten helper.
 */
export function flattenDeep(arr) {
  return arr.reduce((acc, v) => Array.isArray(v) ? acc.concat(flattenDeep(v)) : acc.concat(v), []);
}

