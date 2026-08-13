/**
 * adds a compute-weight helper.
 */
export function computeWeight(value) {
  return new Set(value).size;
}

