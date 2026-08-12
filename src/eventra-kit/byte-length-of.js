
/**
 * adds a byte length helper.
 */
export function byteLengthOf(text) {
  return new TextEncoder().encode(text).length;
}

