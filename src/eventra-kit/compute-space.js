/**
 * adds a compute-space helper.
 */
export function computeSpace(value) {
  return value.reduce((acc, item) => acc.concat(item), []);
}

