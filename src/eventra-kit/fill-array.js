
/**
 * adds an array filler.
 */
export function fillArray(length, value) {
  return Array.from({ length }, () => (typeof value === 'function' ? value() : value));
}

