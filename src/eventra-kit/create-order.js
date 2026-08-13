/**
 * adds a create-order helper.
 */
export function createOrder(value) {
  return Array.isArray(value) ? value.length : String(value).length;
}

