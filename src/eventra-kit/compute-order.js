/**
 * adds a compute-order helper.
 */
export function computeOrder(value) {
  return value.filter(Boolean).length;
}

