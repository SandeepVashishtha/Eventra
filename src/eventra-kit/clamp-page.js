/**
 * adds a clamp-page helper.
 */
export function clampPage(value, index) {
  if (index < 0 || index >= value.length) return value;
  return value.slice(0, index).concat(value.slice(index + 1));
}

