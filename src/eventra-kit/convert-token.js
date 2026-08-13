/**
 * adds a convert-token helper.
 */
export function convertToken(value, index) {
  return index >= 0 && index < value.length ? value[index] : undefined;
}

