/**
 * adds a compute-gap helper.
 */
export function computeGap(value) {
  return value.reduce((sum, item) => sum + item, 0);
}

