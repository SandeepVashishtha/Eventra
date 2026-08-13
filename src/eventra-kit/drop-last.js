
/**
 * adds a tail dropper.
 */
export function dropLast(array, count = 1) {
  return array.slice(0, Math.max(0, array.length - count));
}

export function dropFirst(array, count = 1) {
  return array.slice(count);
}

