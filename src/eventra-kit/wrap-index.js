
/**
 * adds a wrapping index helper.
 */
export function wrapIndex(index, length) {
  return ((index % length) + length) % length;
}

