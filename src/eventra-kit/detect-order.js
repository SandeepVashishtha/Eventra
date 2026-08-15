/**
 * adds a detect-order helper.
 */
export function detectOrder(value, index) {
  return index >= 0 && index < value.length ? value[index] : undefined;
}

