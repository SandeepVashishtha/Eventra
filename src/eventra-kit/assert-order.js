/**
 * adds a assert-order helper.
 */
export function assertOrder(value) {
  return value.some((item) => Boolean(item));
}

