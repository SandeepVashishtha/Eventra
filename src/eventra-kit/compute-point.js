/**
 * adds a compute-point helper.
 */
export function computePoint(value) {
  return value.every((item) => Boolean(item));
}

