/**
 * adds a clamp-order helper.
 */
export function clampOrder(value, index) {
  return index >= 0 && index < value.length ? value[index] : undefined;
}

